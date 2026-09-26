from django.db import models
from customers.models import Customer
from sales.models import Sale


class LoyaltyTransaction(models.Model):
    REASON_CHOICES = [
        ("earned", "Earned from Purchase"),
        ("redeemed", "Redeemed for Discount"),
        ("adjustment", "Manual Adjustment"),
        ("expired", "Expired"),
    ]

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="loyalty_transactions"
    )
    sale = models.ForeignKey(
        Sale, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="loyalty_transactions"
    )
    points_delta = models.IntegerField(
        help_text="Positive for earned/adjustment in, negative for redeemed/expired"
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.customer.name}: {self.points_delta:+d} ({self.reason})"


class MembershipPlan(models.Model):
    salon = models.ForeignKey(
        "salons.Salon", on_delete=models.CASCADE, related_name="membership_plans"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    duration_days = models.PositiveIntegerField(default=180)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} @ {self.salon.name}"


class CustomerMembership(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="memberships"
    )
    plan = models.ForeignKey(
        MembershipPlan, on_delete=models.CASCADE, related_name="customer_memberships"
    )
    started_at = models.DateField(auto_now_add=True)
    expires_at = models.DateField()

    class Meta:
        ordering = ["-started_at"]

    @property
    def is_active(self):
        from datetime import date
        return self.expires_at >= date.today()

    def __str__(self):
        return f"{self.customer.name} — {self.plan.name}"