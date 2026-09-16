from django.contrib import admin
from staff.models import Staff


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "salon", "is_active", "created_at")
    list_filter = ("salon", "is_active")
    search_fields = ("name", "email", "phone")