from rest_framework import viewsets, permissions
from marketing.models import MessageTemplate
from marketing.serializers import MessageTemplateSerializer


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class MessageTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = MessageTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        return MessageTemplate.objects.filter(salon=self.request.user.profile.salon)

    def perform_create(self, serializer):
        serializer.save(salon=self.request.user.profile.salon)