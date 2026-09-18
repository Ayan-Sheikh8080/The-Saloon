from django.db import models
from salons.models import Salon
from customers.models import Customer
from appointments.models import Appointment
from services.models import Service


class Sale(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("paid", "Paid"),
        ("void", "Void"),
    ]

    salon = models.ForeignKey(
        Salon, on_delete=models.CASCADE, related_name="sales"
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="sales"
    )
    appointment = models.ForeignKey(
        Appointment, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="sales"
    )
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())

    @property
    def total(self):
        return self.subtotal - self.discount

    @property
    def amount_paid(self):
        return sum(p.amount for p in self.payments.all())

    def __str__(self):
        return f"Sale #{self.id} — {self.customer.name}"


class SaleItem(models.Model):
    sale = models.ForeignKey(
        Sale, on_delete=models.CASCADE, related_name="items"
    )
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True,
        related_name="sale_items"
    )
    description = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def line_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.description} x{self.quantity}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("other", "Other"),
    ]

    sale = models.ForeignKey(
        Sale, on_delete=models.CASCADE, related_name="payments"
    )
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method} — {self.amount}"