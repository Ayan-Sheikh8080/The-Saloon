from rest_framework import serializers
from sales.models import Sale, SaleItem, Payment


class SaleItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = SaleItem
        fields = ["id", "service", "description", "price", "quantity", "line_total"]
        read_only_fields = ["id"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "method", "amount", "created_at"]
        read_only_fields = ["id", "created_at"]


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    items = SaleItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id", "salon", "customer", "customer_name", "appointment",
            "discount", "status", "items", "payments",
            "subtotal", "total", "amount_paid",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "salon", "status", "created_at", "updated_at"]