from django.utils import timezone


def build_appointment_confirmation(appointment):
    """Build the WhatsApp confirmation message for an appointment."""
    local_start = timezone.localtime(appointment.start_at)
    local_end = timezone.localtime(appointment.end_at)

    customer_name = appointment.customer.name
    salon_name = appointment.salon.name
    service_name = appointment.service.name
    staff_name = appointment.staff.name

    date_text = local_start.strftime("%A, %d %B %Y")
    time_text = f"{local_start.strftime('%I:%M %p')} - {local_end.strftime('%I:%M %p')}"

    return (
        f"Hello {customer_name}! 👋\n\n"
        f"Your appointment at {salon_name} has been confirmed.\n\n"
        f"📅 Date: {date_text}\n"
        f"🕒 Time: {time_text}\n"
        f"💇 Service: {service_name}\n"
        f"👤 Staff: {staff_name}\n\n"
        "Thank you for choosing us! We look forward to seeing you."
    )



def build_appointment_reminder(appointment):
    """Build the WhatsApp reminder message for an upcoming appointment."""
    local_start = timezone.localtime(appointment.start_at)
    local_end = timezone.localtime(appointment.end_at)

    customer_name = appointment.customer.name
    salon_name = appointment.salon.name
    service_name = appointment.service.name
    staff_name = appointment.staff.name

    date_text = local_start.strftime("%A, %d %B %Y")
    time_text = f"{local_start.strftime('%I:%M %p')} - {local_end.strftime('%I:%M %p')}"

    return (
        f"Hello {customer_name}! 👋\n\n"
        f"This is a reminder about your appointment at {salon_name}.\n\n"
        f"📅 Date: {date_text}\n"
        f"🕒 Time: {time_text}\n"
        f"💇 Service: {service_name}\n"
        f"👤 Staff: {staff_name}\n\n"
        "We look forward to seeing you! If you need to cancel or reschedule, "
        "please contact the salon."
    )
