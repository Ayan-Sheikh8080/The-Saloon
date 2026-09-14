from django.contrib import admin
from customers.models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "salon", "phone", "email", "created_at")
    list_filter = ("salon",)
    search_fields = ("name", "phone", "email")