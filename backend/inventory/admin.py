from django.contrib import admin
from inventory.models import Product, InventoryTransaction


class InventoryTransactionInline(admin.TabularInline):
    model = InventoryTransaction
    extra = 0
    readonly_fields = ["created_at"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "salon", "stock_quantity", "reorder_level", "is_active")
    list_filter = ("salon", "is_active")
    search_fields = ("name", "sku")
    inlines = [InventoryTransactionInline]