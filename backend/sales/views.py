from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from sales.models import Sale, SaleItem, Payment
from sales.serializers import SaleSerializer
from appointments.models import Appointment


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        user_salon = self.request.user.profile.salon
        queryset = Sale.objects.filter(salon=user_salon)

        date_param = self.request.query_params.get("date")
        if date_param:
            queryset = queryset.filter(created_at__date=date_param)

        return queryset

    @action(detail=False, methods=["post"], url_path="from-appointment")
    def from_appointment(self, request):
        """
        Create a Sale pre-filled from a completed appointment's
        service. This is the main entry point into checkout.
        """
        salon = request.user.profile.salon
        appointment_id = request.data.get("appointment")

        try:
            appointment = Appointment.objects.get(id=appointment_id, salon=salon)
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        existing = Sale.objects.filter(appointment=appointment).first()
        if existing:
            return Response(
                SaleSerializer(existing).data, status=status.HTTP_200_OK
            )

        sale = Sale.objects.create(
            salon=salon,
            customer=appointment.customer,
            appointment=appointment,
        )
        SaleItem.objects.create(
            sale=sale,
            service=appointment.service,
            description=appointment.service.name,
            price=appointment.service.price,
            quantity=1,
        )

        return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="pay")
    def pay(self, request, pk=None):
        """
        Record a payment against this sale. If total payments
        now cover the sale total, mark it paid.
        """
        sale = self.get_object()
        method = request.data.get("method")
        amount_raw = request.data.get("amount")

        if not method or not amount_raw:
            return Response(
                {"detail": "method and amount are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(str(amount_raw))
        except Exception:
            return Response(
                {"detail": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST
            )

        Payment.objects.create(sale=sale, method=method, amount=amount)

        if sale.amount_paid >= sale.total:
            sale.status = "paid"
            sale.save()

        return Response(SaleSerializer(sale).data)

    def get_queryset_for_object(self):
        return self.get_queryset()