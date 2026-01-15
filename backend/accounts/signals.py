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
            shop = instance.shop_account
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
@receiver(post_save, sender='accounts.User')
def create_customer_account(sender, instance, created, **kwargs):
    from customers.models import GuestUser

    if instance.role != "guest_user":
        return

    if instance.is_superuser:
        return

    if created:
        GuestUser.objects.create(
            user = instance,
            first_name=instance.first_name,
            last_name = instance.last_name,
            email=instance.email,
            phone='',
            street = '',
            city = '',
            zipcode = '', 
        )
    else:
        try:
            guest_user = instance.guest_user
            guest_user.first_name = instance.first_name
            guest_user.last_name = instance.last_name
            guest_user.email = instance.email
            guest_user.save()
        except GuestUser.DoesNotExist:
            GuestUser.objects.create(
                user=instance,
                first_name=instance.first_name,
                last_name=instance.last_name,
                email=instance.email,
                phone='',
                street='',
                city='',
                zipcode='',

            )
