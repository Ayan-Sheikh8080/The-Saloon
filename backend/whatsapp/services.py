import logging

import requests
from django.conf import settings

from whatsapp.messages import build_appointment_confirmation, build_appointment_reminder

logger = logging.getLogger(__name__)


class WhatsAppError(Exception):
    """Raised when a WhatsApp Cloud API request fails."""


def _get_whatsapp_settings():
    access_token = getattr(settings, "WHATSAPP_ACCESS_TOKEN", "")
    phone_number_id = getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", "")
    api_version = getattr(settings, "WHATSAPP_API_VERSION", "")

    missing = []
    if not access_token:
        missing.append("WHATSAPP_ACCESS_TOKEN")
    if not phone_number_id:
        missing.append("WHATSAPP_PHONE_NUMBER_ID")
    if not api_version:
        missing.append("WHATSAPP_API_VERSION")

    if missing:
        raise WhatsAppError(
            "Missing WhatsApp settings: " + ", ".join(missing)
        )

    return access_token, phone_number_id, api_version


def _normalize_phone_number(phone_number):
    """Return a WhatsApp-compatible phone number string.

    The number should preferably already be stored in international format,
    e.g. +923001234567. A Pakistani local number such as 03001234567 is
    converted automatically to +923001234567.
    """
    phone = (phone_number or "").strip()
    if not phone:
        raise WhatsAppError("Customer does not have a phone number.")

    phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")

    if phone.startswith("00"):
        phone = "+" + phone[2:]
    elif phone.startswith("0"):
        phone = "+92" + phone[1:]

    if phone.startswith("+"):
        phone = phone[1:]

    if not phone.isdigit():
        raise WhatsAppError("Customer phone number contains invalid characters.")

    return phone


def send_whatsapp_message(phone_number, message):
    """Send a plain text WhatsApp message through Meta Cloud API."""
    access_token, phone_number_id, api_version = _get_whatsapp_settings()
    recipient = _normalize_phone_number(phone_number)

    url = (
        f"https://graph.facebook.com/"
        f"{api_version}/{phone_number_id}/messages"
    )

    payload = {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message,
        },
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=15,
        )
    except requests.RequestException as exc:
        raise WhatsAppError(f"Could not connect to WhatsApp API: {exc}") from exc

    if not response.ok:
        try:
            error_data = response.json()
        except ValueError:
            error_data = response.text

        raise WhatsAppError(
            f"WhatsApp API returned HTTP {response.status_code}: {error_data}"
        )

    try:
        return response.json()
    except ValueError:
        return {"raw_response": response.text}


def send_appointment_confirmation(appointment):
    """Send the appointment confirmation to the customer's WhatsApp number."""
    message = build_appointment_confirmation(appointment)
    return send_whatsapp_message(appointment.customer.phone, message)



def send_appointment_reminder(appointment):
    """Send the upcoming appointment reminder to the customer's WhatsApp number."""
    message = build_appointment_reminder(appointment)
    return send_whatsapp_message(appointment.customer.phone, message)
