from django.db import models
from core.utils import (custom_id)

# Create your models here.
def default_shop_id():
    return custom_id(prefix="shop")
class Shop(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=25,
        default=default_shop_id,
        editable=False,
        unique=True,
    )
    shop_account = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='shop_account')
    name = models.CharField(max_length=26)
    street = models.CharField(max_length=255)
    province = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    zipcode = models.CharField(max_length=255)
    country = models.CharField(max_length=255, default='Finland')
    phone = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    description = models.TextField(blank=True, null=True)
    industry = models.CharField(max_length=255, default='Retail')
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    def __str__(self):
        return self.name

class Product(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=25,
        default=default_shop_id,
        editable=False,
        unique=True,
    )
    name = models.CharField(max_length=255)
    product_image = models.ImageField(upload_to='products/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.CharField(max_length=100, default='Other')
    def __str__(self):
        return self.name