from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from customers.models import Customer
from customers.serializers import CustomerSerializer
from customers.retention import get_customers_due_for_rebooking


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

    @action(detail=False, methods=["get"], url_path="due-for-rebooking")
    def due_for_rebooking(self, request):
        salon = request.user.profile.salon
        results = get_customers_due_for_rebooking(salon)

        template_id = request.query_params.get("template")
        if template_id:
            from marketing.models import MessageTemplate
            try:
                template = MessageTemplate.objects.get(id=template_id, salon=salon)
                for r in results:
                    customer = Customer.objects.get(id=r["customer_id"])
                    r["draft_message"] = template.render(customer)
            except MessageTemplate.DoesNotExist:
                pass

        return Response(results)