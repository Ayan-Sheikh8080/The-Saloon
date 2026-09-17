from datetime import datetime, timedelta, time
from django.utils import timezone
from appointments.models import Appointment

BUFFER_MINUTES = 10
SLOT_INTERVAL_MINUTES = 15


def get_available_slots(salon, staff, service, date):
    """
    Returns a list of available start datetimes for a given
    salon, staff member, service, and date.

    Logic:
    1. Build the salon's business-hours window for that date.
    2. Walk forward in SLOT_INTERVAL_MINUTES steps.
    3. For each candidate start time, check it doesn't overlap
       any existing appointment for that staff member (with buffer).
    4. Return every slot that passes.
    """
    duration = timedelta(minutes=service.duration_minutes)
    buffer = timedelta(minutes=BUFFER_MINUTES)

    day_start = timezone.make_aware(
        datetime.combine(date, salon.opening_time)
    )
    day_end = timezone.make_aware(
        datetime.combine(date, salon.closing_time)
    )

    existing = Appointment.objects.filter(
        staff=staff,
        start_at__date=date,
    ).exclude(status__in=["cancelled", "no_show"])

    busy_windows = [
        (appt.start_at - buffer, appt.end_at + buffer) for appt in existing
    ]

    slots = []
    candidate = day_start
    step = timedelta(minutes=SLOT_INTERVAL_MINUTES)

    while candidate + duration <= day_end:
        candidate_end = candidate + duration

        conflict = any(
            candidate < busy_end and candidate_end > busy_start
            for busy_start, busy_end in busy_windows
        )

        if not conflict:
            slots.append(candidate)

        candidate += step

    return slots


def is_slot_available(staff, start_at, end_at, exclude_appointment_id=None):
    """
    Re-check that a specific start/end window is still free for
    this staff member. Called immediately before creating an
    appointment, to catch race conditions from the list-then-book gap.
    """
    buffer = timedelta(minutes=BUFFER_MINUTES)

    conflicts = Appointment.objects.filter(
        staff=staff,
    ).exclude(
        status__in=["cancelled", "no_show"]
    ).filter(
        start_at__lt=end_at + buffer,
        end_at__gt=start_at - buffer,
    )

    if exclude_appointment_id:
        conflicts = conflicts.exclude(id=exclude_appointment_id)

    return not conflicts.exists()