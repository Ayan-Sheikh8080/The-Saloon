from rest_framework.routers import DefaultRouter
from marketing.views import MessageTemplateViewSet

router = DefaultRouter()
router.register("templates", MessageTemplateViewSet, basename="message-template")

urlpatterns = router.urls