from django.contrib import admin
from appointments.models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("customer", "staff", "service", "start_at", "status", "salon")
    list_filter = ("salon", "status", "staff")
    search_fields = ("customer__name", "staff__name")