from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from inventory.models import Product, InventoryTransaction
from inventory.serializers import ProductSerializer, InventoryTransactionSerializer


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        user_salon = self.request.user.profile.salon
        queryset = Product.objects.filter(salon=user_salon)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)

        low_stock = self.request.query_params.get("low_stock")
        if low_stock == "true":
            ids = [p.id for p in queryset if p.is_low_stock]
            queryset = queryset.filter(id__in=ids)

        return queryset

    def perform_create(self, serializer):
        product = serializer.save(salon=self.request.user.profile.salon)
        initial_qty = self.request.data.get("initial_quantity")
        if initial_qty:
            InventoryTransaction.objects.create(
                product=product,
                quantity_delta=int(initial_qty),
                reason="received",
                notes="Initial stock",
                created_by=self.request.user,
            )

    @action(detail=True, methods=["get", "post"], url_path="transactions")
    def transactions(self, request, pk=None):
        product = self.get_object()

        if request.method == "GET":
            txns = product.transactions.all()
            return Response(InventoryTransactionSerializer(txns, many=True).data)

        # POST — record a stock adjustment
        quantity_delta = request.data.get("quantity_delta")
        reason = request.data.get("reason")

        if quantity_delta is None or not reason:
            return Response(
                {"detail": "quantity_delta and reason are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        txn = InventoryTransaction.objects.create(
            product=product,
            quantity_delta=int(quantity_delta),
            reason=reason,
            notes=request.data.get("notes", ""),
            created_by=request.user,
        )

        return Response(
            InventoryTransactionSerializer(txn).data,
            status=status.HTTP_201_CREATED,
        )