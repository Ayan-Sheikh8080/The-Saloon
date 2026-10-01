import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from appointments.models import Appointment
from whatsapp.services import WhatsAppError, send_appointment_reminder

logger = logging.getLogger(__name__)


@shared_task(name="whatsapp.tasks.send_due_appointment_reminders")
def send_due_appointment_reminders():
   
    now = timezone.now()
    window_start = now + timedelta(hours=23, minutes=55)
    window_end = now + timedelta(hours=24, minutes=5)

    appointments = (
        Appointment.objects
        .filter(
            start_at__gte=window_start,
            start_at__lte=window_end,
            status__in=["pending", "confirmed"],
            reminder_sent_at__isnull=True,
        )
        .select_related("customer", "salon", "service", "staff")
        .order_by("start_at")
    )

    sent_count = 0

    for appointment in appointments:
        if not appointment.customer.phone:
            logger.warning(
                "Skipping WhatsApp reminder for appointment %s: customer has no phone number.",
                appointment.id,
            )
            continue

        try:
            send_appointment_reminder(appointment)
        except WhatsAppError:
            logger.exception(
                "WhatsApp reminder failed for appointment %s.",
                appointment.id,
            )
            continue
        except Exception:
            logger.exception(
                "Unexpected error while sending reminder for appointment %s.",
                appointment.id,
            )
            continue

        updated = Appointment.objects.filter(
            pk=appointment.pk,
            reminder_sent_at__isnull=True,
        ).update(reminder_sent_at=timezone.now())

        if updated:
            sent_count += 1

    logger.info("Appointment reminder task completed. Sent: %s", sent_count)
    return {"sent": sent_count}


@shared_task(name="whatsapp.tasks.send_appointment_reminder_now")
def send_appointment_reminder_now(appointment_id):
    """Send one appointment reminder immediately; useful for testing."""
    try:
        appointment = (
            Appointment.objects
            .select_related("customer", "salon", "service", "staff")
            .get(pk=appointment_id)
        )
    except Appointment.DoesNotExist:
        logger.warning("Appointment %s does not exist.", appointment_id)
        return {"sent": False, "reason": "appointment_not_found"}

    if appointment.status in ["cancelled", "no_show"]:
        return {"sent": False, "reason": "appointment_not_active"}

    if not appointment.customer.phone:
        return {"sent": False, "reason": "customer_has_no_phone"}

    send_appointment_reminder(appointment)
    Appointment.objects.filter(pk=appointment.pk).update(
        reminder_sent_at=timezone.now()
    )
    return {"sent": True, "appointment_id": appointment.id}
