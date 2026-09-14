from django.db import models
from django.contrib.auth.models import User
from salons.models import Salon


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    salon = models.ForeignKey(
        Salon,
        on_delete=models.CASCADE,
        related_name="members"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.role}) @ {self.salon.name}"