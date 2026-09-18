from rest_framework import serializers
from inventory.models import Product, InventoryTransaction


class InventoryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryTransaction
        fields = ["id", "quantity_delta", "reason", "notes", "created_by", "created_at"]
        read_only_fields = ["id", "created_by", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "salon", "name", "sku", "price", "cost",
            "reorder_level", "is_active", "stock_quantity", "is_low_stock",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "salon", "created_at", "updated_at"]