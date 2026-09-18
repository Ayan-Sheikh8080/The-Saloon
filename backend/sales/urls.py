from rest_framework.routers import DefaultRouter
from sales.views import SaleViewSet

router = DefaultRouter()
router.register("", SaleViewSet, basename="sale")

urlpatterns = router.urls