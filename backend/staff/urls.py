from rest_framework.routers import DefaultRouter
from staff.views import StaffViewSet

router = DefaultRouter()
router.register("", StaffViewSet, basename="staff")

urlpatterns = router.urls