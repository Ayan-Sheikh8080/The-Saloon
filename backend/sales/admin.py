from django.contrib import admin
from sales.models import Sale, SaleItem, Payment


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "salon", "status", "total", "created_at")
    list_filter = ("salon", "status")
    inlines = [SaleItemInline, PaymentInline]