from rest_framework import viewsets, permissions
from customers.models import Customer
from customers.serializers import CustomerSerializer


class IsSalonMember(permissions.BasePermission):
    """
    Only allow access to users who have a UserProfile
    (i.e. belong to a salon). Blocks stray superusers/staff
    accounts with no profile from hitting these endpoints.
    """

    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        # THE CORE TENANT ISOLATION RULE:
        # Only ever return customers belonging to the logged-in
        # user's own salon. No exceptions, no query params can
        # override this.
        user_salon = self.request.user.profile.salon
        queryset = Customer.objects.filter(salon=user_salon)

        # Optional search/filter by name or phone
        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(phone__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        # THE OTHER HALF OF TENANT ISOLATION:
        # Force the salon to be the logged-in user's salon,
        # regardless of what (if anything) the client sent.
        serializer.save(salon=self.request.user.profile.salon)