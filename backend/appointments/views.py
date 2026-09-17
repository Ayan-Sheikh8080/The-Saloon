from datetime import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from appointments.availability import get_available_slots, is_slot_available
from staff.models import Staff
from services.models import Service


class IsSalonMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile")


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsSalonMember]

    def get_queryset(self):
        user_salon = self.request.user.profile.salon
        queryset = Appointment.objects.filter(salon=user_salon)

        date_param = self.request.query_params.get("date")
        if date_param:
            queryset = queryset.filter(start_at__date=date_param)

        staff_param = self.request.query_params.get("staff")
        if staff_param:
            queryset = queryset.filter(staff_id=staff_param)

        return queryset

    def create(self, request, *args, **kwargs):
        salon = request.user.profile.salon
        staff_id = request.data.get("staff")
        service_id = request.data.get("service")
        start_at_raw = request.data.get("start_at")

        if not all([staff_id, service_id, start_at_raw]):
            return Response(
                {"detail": "staff, service, and start_at are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            staff = Staff.objects.get(id=staff_id, salon=salon)
            service = Service.objects.get(id=service_id, salon=salon)
        except (Staff.DoesNotExist, Service.DoesNotExist):
            return Response(
                {"detail": "Invalid staff or service."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start_at = datetime.fromisoformat(start_at_raw)
        from datetime import timedelta
        end_at = start_at + timedelta(minutes=service.duration_minutes)

        # Final re-check before booking — closes the race-condition gap
        if not is_slot_available(staff, start_at, end_at):
            return Response(
                {"detail": "This time slot is no longer available."},
                status=status.HTTP_409_CONFLICT,
            )

        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(salon=salon, end_at=end_at)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="availability")
    def availability(self, request):
        salon = request.user.profile.salon
        staff_id = request.query_params.get("staff")
        service_id = request.query_params.get("service")
        date_str = request.query_params.get("date")

        if not all([staff_id, service_id, date_str]):
            return Response(
                {"detail": "staff, service, and date query params are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            staff = Staff.objects.get(id=staff_id, salon=salon)
            service = Service.objects.get(id=service_id, salon=salon)
        except (Staff.DoesNotExist, Service.DoesNotExist):
            return Response(
                {"detail": "Invalid staff or service."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        date = parse_date(date_str)
        if not date:
            return Response(
                {"detail": "date must be in YYYY-MM-DD format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slots = get_available_slots(salon, staff, service, date)
        return Response({"slots": [s.isoformat() for s in slots]})