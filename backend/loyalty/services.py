from decimal import Decimal
from django.db.models import Sum
from loyalty.models import LoyaltyTransaction

POINTS_PER_RUPEE = Decimal("0.1")  # 1 point per Rs. 10 spent


def get_loyalty_balance(customer):
    result = LoyaltyTransaction.objects.filter(customer=customer).aggregate(
        total=Sum("points_delta")
    )
    return result["total"] or 0


def award_points_for_sale(sale):
    """
    Called when a sale is marked paid. Awards points based on
    the sale total. Idempotent — won't double-award if called
    again for the same sale.
    """
    already_awarded = LoyaltyTransaction.objects.filter(
        sale=sale, reason="earned"
    ).exists()
    if already_awarded:
        return

    points = int(sale.total * POINTS_PER_RUPEE)
    if points <= 0:
        return

    LoyaltyTransaction.objects.create(
        customer=sale.customer,
        sale=sale,
        points_delta=points,
        reason="earned",
        notes=f"Earned from Sale #{sale.id}",
    )