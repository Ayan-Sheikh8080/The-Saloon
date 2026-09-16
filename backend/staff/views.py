from rest_framework import viewsets, permissions
from staff.models import Staff
from staff.serializers import StaffSerializer


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        user_salon = self.request.user.profile.salon
        queryset = Staff.objects.filter(salon=user_salon)

        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(title__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(salon=self.request.user.profile.salon)