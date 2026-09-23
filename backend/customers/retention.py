from datetime import date
from django.db.models import Avg, F
from django.db.models.functions import TruncDate
from appointments.models import Appointment


def get_customer_retention_info(customer):
    """
    Returns retention stats for a single customer, or None if
    they don't have enough history to calculate an interval.
    """
    completed = Appointment.objects.filter(
        customer=customer, status="completed"
    ).order_by("start_at")

    if completed.count() < 2:
        return None

    visit_dates = [a.start_at.date() for a in completed]
    intervals = [
        (visit_dates[i] - visit_dates[i - 1]).days
        for i in range(1, len(visit_dates))
    ]
    avg_interval = sum(intervals) / len(intervals)

    last_visit = visit_dates[-1]
    days_since_last_visit = (date.today() - last_visit).days

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "last_visit": last_visit.isoformat(),
        "days_since_last_visit": days_since_last_visit,
        "average_interval_days": round(avg_interval, 1),
        "is_due": days_since_last_visit >= avg_interval,
        "days_overdue": max(0, round(days_since_last_visit - avg_interval)),
    }


def get_customers_due_for_rebooking(salon):
    """
    Returns retention info for every customer in the salon who
    has enough history and is currently overdue, sorted by
    most-overdue first.
    """
    from customers.models import Customer

    customers = Customer.objects.filter(salon=salon)
    results = []

    for customer in customers:
        info = get_customer_retention_info(customer)
        if info and info["is_due"]:
            results.append(info)

    results.sort(key=lambda r: r["days_overdue"], reverse=True)
    return results