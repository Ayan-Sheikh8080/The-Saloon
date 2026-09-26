from datetime import date, timedelta
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from loyalty.models import MembershipPlan, CustomerMembership
from loyalty.serializers import MembershipPlanSerializer, CustomerMembershipSerializer
from loyalty.services import get_loyalty_balance
from customers.models import Customer


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class MembershipPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipPlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        return MembershipPlan.objects.filter(salon=self.request.user.profile.salon)

    def perform_create(self, serializer):
        serializer.save(salon=self.request.user.profile.salon)


class CustomerMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerMembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        salon = self.request.user.profile.salon
        return CustomerMembership.objects.filter(customer__salon=salon)

    def create(self, request, *args, **kwargs):
        salon = request.user.profile.salon
        customer_id = request.data.get("customer")
        plan_id = request.data.get("plan")

        try:
            customer = Customer.objects.get(id=customer_id, salon=salon)
            plan = MembershipPlan.objects.get(id=plan_id, salon=salon)
        except (Customer.DoesNotExist, MembershipPlan.DoesNotExist):
            return Response(
                {"detail": "Invalid customer or plan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership = CustomerMembership.objects.create(
            customer=customer,
            plan=plan,
            expires_at=date.today() + timedelta(days=plan.duration_days),
        )

        return Response(
            CustomerMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )


class CustomerLoyaltyView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def retrieve(self, request, pk=None):
        salon = request.user.profile.salon
        try:
            customer = Customer.objects.get(id=pk, salon=salon)
        except Customer.DoesNotExist:
            return Response(
                {"detail": "Customer not found."}, status=status.HTTP_404_NOT_FOUND
            )

        from loyalty.models import LoyaltyTransaction
        from loyalty.serializers import LoyaltyTransactionSerializer

        balance = get_loyalty_balance(customer)
        transactions = LoyaltyTransaction.objects.filter(customer=customer)[:20]

        return Response({
            "customer_id": customer.id,
            "balance": balance,
            "transactions": LoyaltyTransactionSerializer(transactions, many=True).data,
        })

    @action(detail=True, methods=["post"], url_path="redeem")
    def redeem(self, request, pk=None):
        salon = request.user.profile.salon
        try:
            customer = Customer.objects.get(id=pk, salon=salon)
        except Customer.DoesNotExist:
            return Response(
                {"detail": "Customer not found."}, status=status.HTTP_404_NOT_FOUND
            )

        points_to_redeem = request.data.get("points")
        if not points_to_redeem:
            return Response(
                {"detail": "points is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        points_to_redeem = int(points_to_redeem)
        balance = get_loyalty_balance(customer)

        if points_to_redeem > balance:
            return Response(
                {"detail": "Insufficient points balance."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from loyalty.models import LoyaltyTransaction
        LoyaltyTransaction.objects.create(
            customer=customer,
            points_delta=-points_to_redeem,
            reason="redeemed",
            notes=request.data.get("notes", ""),
        )

        return Response({"balance": get_loyalty_balance(customer)})