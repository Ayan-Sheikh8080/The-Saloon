from rest_framework.routers import DefaultRouter
from django.urls import path
from loyalty.views import MembershipPlanViewSet, CustomerMembershipViewSet, CustomerLoyaltyView

router = DefaultRouter()
router.register("plans", MembershipPlanViewSet, basename="membership-plan")
router.register("memberships", CustomerMembershipViewSet, basename="customer-membership")

urlpatterns = router.urls + [
    path("customers/<int:pk>/loyalty/", CustomerLoyaltyView.as_view({"get": "retrieve"}), name="customer-loyalty"),
    path("customers/<int:pk>/loyalty/redeem/", CustomerLoyaltyView.as_view({"post": "redeem"}), name="customer-loyalty-redeem"),
]