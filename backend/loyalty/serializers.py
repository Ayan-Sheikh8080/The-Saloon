from rest_framework import serializers
from loyalty.models import LoyaltyTransaction, MembershipPlan, CustomerMembership


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTransaction
        fields = ["id", "sale", "points_delta", "reason", "notes", "created_at"]
        read_only_fields = ["id", "created_at"]


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = [
            "id", "salon", "name", "description", "discount_percent",
            "duration_days", "price", "is_active", "created_at",
        ]
        read_only_fields = ["id", "salon", "created_at"]


class CustomerMembershipSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = CustomerMembership
        fields = [
            "id", "customer", "customer_name", "plan", "plan_name",
            "started_at", "expires_at", "is_active",
        ]
        read_only_fields = ["id", "started_at", "expires_at"]