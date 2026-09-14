from django.contrib import admin
from salons.models import Salon


@admin.register(Salon)
class SalonAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    search_fields = ("name", "owner__username")