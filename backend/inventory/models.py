from django.db import models
from salons.models import Salon


class Product(models.Model):
    salon = models.ForeignKey(
        Salon, on_delete=models.CASCADE, related_name="products"
    )
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_level = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    @property
    def stock_quantity(self):
        result = self.transactions.aggregate(
            total=models.Sum("quantity_delta")
        )
        return result["total"] or 0

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.reorder_level

    def __str__(self):
        return f"{self.name} @ {self.salon.name}"


class InventoryTransaction(models.Model):
    REASON_CHOICES = [
        ("received", "Stock Received"),
        ("used", "Used in Service"),
        ("sold", "Sold"),
        ("correction", "Manual Correction"),
        ("damaged", "Damaged/Lost"),
    ]

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="transactions"
    )
    quantity_delta = models.IntegerField(
        help_text="Positive for stock in, negative for stock out"
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    notes = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name}: {self.quantity_delta:+d} ({self.reason})"