from django.db import models
from core.utils import (custom_id)
from django.utils import timezone

def default_shop_id():
    return custom_id(prefix="shop").lower()

def default_product_id():
    return custom_id(prefix="prod").lower()

def default_product_image_id():
    return custom_id(prefix="img").lower()

class Shop(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_shop_id,
        editable=False,
        unique=True,
    )
    shop_account = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='shop_account')
    name = models.CharField(max_length=255)  # ✅ Changed from 26 to 255
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
    template = models.CharField(max_length=100, default="Template-1")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.template} - {self.id}"

class Product(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_product_id,  # ✅ Fixed - was using default_shop_id
        editable=False,
        unique=True,
    )
    name = models.CharField(max_length=255)
    shop_id = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    description = models.TextField(blank=True, null=True)
    new_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_end_at = models.DateTimeField(null=True, blank=True)
    currency_unit = models.CharField(max_length=5, default="EUR")
    condition = models.CharField(max_length=20, blank=True, null=True)
    guaranty = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=20, blank=True, null=True)
    dimension = models.CharField(max_length=100, blank=True, null=True)
    weight = models.CharField(max_length=20, blank=True, null=True)
    other = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=255, default='Other')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_current_new_price(self):
        """
        Returns new_price if discount is still valid, otherwise 0.
        Also updates the database if discount has expired.
        """
        if self.discount_end_at and timezone.now() > self.discount_end_at and self.new_price > 0:
            # Discount has expired, clear it in database
            self.new_price = 0
            self.discount_end_at = None
            self.save(update_fields=['new_price', 'discount_end_at', 'updated_at'])
            return 0
        return self.new_price
    
    @property
    def current_new_price(self):
        """Property wrapper for get_current_new_price"""
        return self.get_current_new_price()
    
    @property
    def is_discount_active(self):
        """Check if discount is currently active"""
        if not self.discount_end_at:
            return False
        return timezone.now() <= self.discount_end_at
    
    def __str__(self):
        return f"{self.name} - {self.id}"

class ProductImage(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_product_image_id,  # ✅ Fixed - was using default_shop_id
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
    
    def __str__(self):
        return f"Image for {self.product_id.name} - {self.id}"