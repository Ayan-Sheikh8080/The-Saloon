from django.db import models
from django.core.exceptions import ValidationError
from salons.models import Salon
from customers.models import Customer
from staff.models import Staff
from services.models import Service


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("checked_in", "Checked In"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("no_show", "No Show"),
    ]

    salon = models.ForeignKey(
        Salon, on_delete=models.CASCADE, related_name="appointments"
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="appointments"
    )
    staff = models.ForeignKey(
        Staff, on_delete=models.CASCADE, related_name="appointments"
    )
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name="appointments"
    )
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at"]

    def clean(self):
        if self.end_at <= self.start_at:
            raise ValidationError("End time must be after start time.")

    def __str__(self):
        return f"{self.customer.name} with {self.staff.name} @ {self.start_at}"