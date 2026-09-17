from django.db import models
from django.contrib.auth.models import User


class Salon(models.Model):
    name = models.CharField(max_length=255)
    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="owned_salon"
    )
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    opening_time = models.TimeField(default="09:00")
    closing_time = models.TimeField(default="21:00")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name