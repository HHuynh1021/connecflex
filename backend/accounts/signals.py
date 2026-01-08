from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify

@receiver(post_save, sender='accounts.User')
def create_shop_account(sender, instance, created, **kwargs):
    from shops.models import Shop
    if instance.role != "shop_admin":
        return
    if instance.role == "guest_user":
        return
    if instance.is_superuser:
        return

    if created:
        Shop.objects.create(
            shop_account=instance,
            email=instance.email,
            name = '',
            street = '',
            zipcode = '',
            phone = '',
            logo = None,

        )
    else:
        try:
            shop = instance.shop_account  # reverse OneToOne
            shop.email = instance.email
            shop.save()
        except Shop.DoesNotExist:
            Shop.objects.create(
                shop_account=instance,
                email=instance.email,
                name='',
                street='',
                zipcode='',
                phone='',
                logo=None,
            )
