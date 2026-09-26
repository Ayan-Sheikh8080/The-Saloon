from django.contrib import admin
from loyalty.models import LoyaltyTransaction, MembershipPlan, CustomerMembership


@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ("customer", "points_delta", "reason", "created_at")
    list_filter = ("reason",)


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "salon", "discount_percent", "duration_days", "is_active")
    list_filter = ("salon", "is_active")


@admin.register(CustomerMembership)
class CustomerMembershipAdmin(admin.ModelAdmin):
    list_display = ("customer", "plan", "started_at", "expires_at")