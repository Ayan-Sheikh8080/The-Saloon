from django.contrib import admin
from services.models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "duration_minutes", "salon", "is_active")
    list_filter = ("salon", "is_active", "category")
    search_fields = ("name", "category")