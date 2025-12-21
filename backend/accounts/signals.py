from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify

@receiver(post_save, sender='accounts.User')
def create_shop_account(sender, instance, created, **kwargs):
    from shops.models import Shop  # local import to avoid circular import
    if not instance.is_superuser:
        if created:
            Shop.objects.create(
                shop_account=instance,
                name=instance.name,
                email=instance.email,
                street='',        # optional default
                zipcode='',       # optional default
                phone='',         # optional default
                logo=None,        # optional default
            )
        else:
            try:
                shop = instance.shop_account  # reverse OneToOne
                shop.name = instance.name
                shop.email = instance.email
                shop.save()
            except Shop.DoesNotExist:
                # fallback: create if missing
                Shop.objects.create(
                    shop_account=instance,
                    name=instance.name,
                    email=instance.email,
                    street='',
                    zipcode='',
                    phone='',
                    logo=None,
                )
