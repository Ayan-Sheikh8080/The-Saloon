from django.db import models
from salons.models import Salon


class MessageTemplate(models.Model):
    salon = models.ForeignKey(
        Salon, on_delete=models.CASCADE, related_name="message_templates"
    )
    name = models.CharField(max_length=255)
    body = models.TextField(
        help_text="Use {customer_name} and {salon_name} as placeholders."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def render(self, customer):
        return self.body.format(
            customer_name=customer.name,
            salon_name=self.salon.name,
        )

    def __str__(self):
        return self.name