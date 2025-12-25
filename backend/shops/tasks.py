# tasks.py
# tasks.py
from celery import shared_task
from django.utils import timezone
from shops.models import Product

@shared_task
def clear_expired_discounts():
    """Clear expired product discounts"""
    updated = Product.objects.filter(
        discount_end_at__lt=timezone.now(),
        new_price__gt=0
    ).update(
        new_price=0,
        discount_end_at=None
    )
    
    return f'Cleared {updated} expired discounts'