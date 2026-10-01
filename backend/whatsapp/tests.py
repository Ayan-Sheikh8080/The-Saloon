from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from django.contrib.auth.models import User

from appointments.models import Appointment
from customers.models import Customer
from salons.models import Salon
from services.models import Service
from staff.models import Staff
from whatsapp.messages import build_appointment_confirmation
from whatsapp.services import _normalize_phone_number, send_appointment_confirmation


class WhatsAppServiceTests(TestCase):
    def test_normalize_pakistani_local_number(self):
        self.assertEqual(
            _normalize_phone_number("0300-1234567"),
            "923001234567",
        )

    def test_normalize_international_number(self):
        self.assertEqual(
            _normalize_phone_number("+923001234567"),
            "923001234567",
        )

    @patch("whatsapp.services.send_whatsapp_message")
    def test_appointment_confirmation_uses_customer_phone(self, mock_send):
        user = User.objects.create_user(username="salon-owner", password="testpass123")
        salon = Salon.objects.create(name="Test Salon", owner=user)
        customer = Customer.objects.create(
            salon=salon,
            name="Ali Khan",
            phone="03001234567",
        )
        staff = Staff.objects.create(salon=salon, name="Sara")
        service = Service.objects.create(
            salon=salon,
            name="Haircut",
            price=1000,
            duration_minutes=60,
        )
        start = timezone.now()
        appointment = Appointment.objects.create(
            salon=salon,
            customer=customer,
            staff=staff,
            service=service,
            start_at=start,
            end_at=start + timedelta(minutes=60),
        )

        send_appointment_confirmation(appointment)

        mock_send.assert_called_once()
        args = mock_send.call_args.args
        self.assertEqual(args[0], "03001234567")
        self.assertIn("Test Salon", args[1])
        self.assertIn("Haircut", args[1])
