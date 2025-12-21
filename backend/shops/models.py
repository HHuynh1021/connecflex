from django.db import models
from core.utils import (custom_id)

# Create your models here.
def default_shop_id():
    return custom_id(prefix="shop").lower()
class Shop(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
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
    banner = models.ImageField(upload_to='banners/', blank=True, null=True)
    template = models.CharField(max_length=100, default="template-1")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.name} - {self.template} - {self.id}"

class Product(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_shop_id,
        editable=False,
        unique=True,
    )
    name = models.CharField(max_length=255)
    shop_id = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.CharField(max_length=255, default='Other')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.name} - {self.id}"
class ProductImage(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_shop_id,
        editable=False,
        unique=True,
    )
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['order', '-is_primary', 'updated_at', 'created_at']

