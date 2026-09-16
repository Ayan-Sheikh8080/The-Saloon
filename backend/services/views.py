from rest_framework import viewsets, permissions
from services.models import Service
from services.serializers import ServiceSerializer


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        user_salon = self.request.user.profile.salon
        queryset = Service.objects.filter(salon=user_salon)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset

    def perform_create(self, serializer):
        serializer.save(salon=self.request.user.profile.salon)