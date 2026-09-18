from datetime import date
from django.db.models import Sum, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from customers.models import Customer
from appointments.models import Appointment
from sales.models import Sale


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get(self, request):
        salon = request.user.profile.salon
        today = date.today()

        today_sales = Sale.objects.filter(
            salon=salon, status="paid", created_at__date=today
        )
        today_revenue = sum(s.total for s in today_sales)

        today_appointments = Appointment.objects.filter(
            salon=salon, start_at__date=today
        ).exclude(status__in=["cancelled", "no_show"])

        total_customers = Customer.objects.filter(salon=salon).count()

        recent_appointments = Appointment.objects.filter(
            salon=salon
        ).order_by("-start_at")[:5]

        return Response({
            "today_revenue": str(today_revenue),
            "today_appointment_count": today_appointments.count(),
            "total_customers": total_customers,
            "recent_appointments": [
                {
                    "id": a.id,
                    "customer_name": a.customer.name,
                    "service_name": a.service.name,
                    "staff_name": a.staff.name,
                    "start_at": a.start_at.isoformat(),
                    "status": a.status,
                }
                for a in recent_appointments
            ],
        })