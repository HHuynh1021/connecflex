from django.core.exceptions import ValidationError
from django.core.serializers import serialize
from django.db import models, IntegrityError
from django.contrib.postgres.fields import ArrayField
from core.utils import (custom_id)
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import transaction

def default_shop_id():
    return custom_id(prefix="shop").lower()

def default_product_id():
    return custom_id(prefix="prod").lower()

def default_product_image_id():
    return custom_id(prefix="img").lower()

def default_rating_id():
    return custom_id(prefix="rat").lower()

def default_order_id():
    return custom_id(prefix="ord").lower()
def default_category_id():
    return custom_id(prefix="cat").lower()
def default_property_id():
    return custom_id(prefix="pro").lower()

class ProductCategory(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_category_id,  # ✅ Fixed - was using default_shop_id
        editable=False,
        unique=True,
    )
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Product Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class ProductProperty(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_property_id,  # ✅ Fixed - was using default_shop_id
        editable=False,
        unique=True,
    )
    name = models.CharField(max_length=255, unique=True)
    values = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Product Properties"
        ordering = ['name']

    def __str__(self):
        return self.name

class Shop(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_shop_id,
        editable=False,
        unique=True,
    )
    shop_account = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='shop_account')
    name = models.CharField(max_length=255)
    street = models.CharField(max_length=255)
    province = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    zipcode = models.CharField(max_length=255)
    country = models.CharField(max_length=255, default='Finland')
    phone = models.CharField(max_length=25)
    email = models.EmailField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ManyToManyField(ProductCategory, related_name='shops')
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    banner = models.ImageField(upload_to='banners/', blank=True, null=True)
    media = models.FileField(upload_to='shop_media/', blank=True, null=True)
    template = models.CharField(max_length=100, default="Template-1")
    policy = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def average_rating(self):
        # Warning: N+1 risk in lists → prefer annotation in views
        ratings = self.shop_ratings.all()
        if not ratings.exists():
            return 0.0
        return round(sum(r.rating for r in ratings) / ratings.count(), 1)

    @property
    def rating_count(self):
        return self.shop_ratings.count()

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
    quantity = models.PositiveIntegerField(default=0)
    new_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_end_at = models.DateTimeField(null=True, blank=True)
    currency_unit = models.CharField(max_length=5, default="EUR")
    condition = models.CharField(max_length=20, blank=True, null=True)
    category = models.ManyToManyField(ProductCategory, related_name='products')
    properties = ArrayField(models.JSONField(), blank=True, default=list)
    warranty = models.CharField(max_length=50, blank=True, null=True)
    delivery_term = models.TextField(blank=True, null=True)
    refund = models.BooleanField(default=False)
    refund_policy = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def is_discount_expired(self):
        if self.discount_end_at is None:
            return True
        return timezone.now() > self.discount_end_at
    
    def is_discount_active(self):
        """Check if discount is currently active"""
        return (
            self.new_price > 0 and
            not self.is_discount_expired()
        )
    
    def get_current_price(self):
        if self.is_discount_active():
            return self.new_price
        return self.price
    
    def expire_discount_if_needed(self):
        """Clear discount if it has expired"""
        if self.is_discount_expired() and self.new_price is not None:
            self.new_price = 0
            self.discount_end_at = None
            self.save(update_fields=['new_price', 'discount_end_at', 'updated_at'])
    
    def save(self, *args, **kwargs):
        """Override save to auto-expire discount if needed"""
        # Auto-clear expired discount before saving
        if self.is_discount_expired() and self.new_price is not None:
            self.new_price = 0
            self.discount_end_at = None
        
        super().save(*args, **kwargs)
    
    @property
    def current_price(self):
        """Property to get current price (use this in templates/serializers)"""
        return self.get_current_price()
    
    @property
    def has_discount(self):
        """Check if product currently has an active discount"""
        return self.is_discount_active()
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if not self.is_discount_active() or self.price == 0:
            return 0
        return round(((self.price - self.new_price) / self.price) * 100)
    
    @property
    def savings(self):
        """Calculate money saved with discount"""
        if not self.is_discount_active():
            return 0
        return self.price - self.new_price
    
    @property
    def average_rating(self):
        """Get average rating for product"""
        ratings = self.product_ratings.all()
        if not ratings.exists():
            return 0.0
        return round(sum(r.rating for r in ratings) / ratings.count(), 1)
    
    @property
    def rating_count(self):
        """Get total number of ratings"""
        return self.product_ratings.count()
    
    def __str__(self):
        return f"{self.name} - {self.id}"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['discount_end_at']),
            models.Index(fields=['created_at']),
        ]

class ProductImage(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_product_image_id,  # ✅ Fixed - was using default_shop_id
        editable=False,
        unique=True,
    )
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    media = models.FileField(upload_to='product_media/')
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-is_primary', 'updated_at', 'created_at']

    def __str__(self):
        return f"Image for {self.product_id.name} - {self.id}"

class ProductRating(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_rating_id,
        editable=False,
        unique=True,
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_ratings')
    guest_user = models.ForeignKey('customers.GuestUser', on_delete=models.CASCADE, related_name='product_ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(null=True, blank=True)

class ShopRating(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_rating_id,
        editable=False,
        unique=True,
    )
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='shop_ratings')
    guest_user = models.ForeignKey('customers.GuestUser', on_delete=models.CASCADE, related_name='shop_ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(null=True, blank=True)

class GuestUserRating(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_rating_id,
        editable=False,
        unique=True,
    )
    guest_user = models.ForeignKey('customers.GuestUser', on_delete=models.CASCADE, related_name='user_ratings')
    shop = models.ForeignKey('shops.Shop', on_delete=models.CASCADE, related_name='user_ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(null=True, blank=True)

class OrderProduct(models.Model):
    PENDING = 'Pending'
    CANCELLED = 'Cancelled'
    PROCESSING = 'Processing'
    SHIPPED = 'Shipped'
    COMPLETED = 'Completed'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (CANCELLED, 'Cancelled'),
        (PROCESSING, 'Processing'),
        (SHIPPED, 'Shipped'),
        (COMPLETED, 'Completed'),
    ]

    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_order_id,
        editable=False,
        unique=True,
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='orders')
    customer = models.ForeignKey('customers.GuestUser', on_delete=models.CASCADE, related_name='orders')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=1)
    order_number = models.CharField(max_length=255)
    order_status = models.CharField(max_length=11, choices=STATUS_CHOICES, default=PENDING)
    order_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    note = models.TextField(blank=True, null=True)
    order_date = models.DateTimeField(auto_now_add=True)
    order_updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order_number} {self.product.name} - {self.customer.email} - {self.order_status}"

    def clean(self):
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1.")

    def _generate_order_number(self):
        """Generate a unique order number"""
        import random
        import string
        from datetime import datetime
        
        # Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20260122-A1B2C)
        date_str = datetime.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        return f"ORD-{date_str}-{random_str}"

    ALLOWED_TRANSITIONS = {
        PENDING: {PROCESSING, SHIPPED, COMPLETED, CANCELLED},
        PROCESSING: {SHIPPED, COMPLETED, CANCELLED},
        SHIPPED: {COMPLETED, CANCELLED},
        COMPLETED: set(),
        CANCELLED: set(),
    }

    def save(self, *args, **kwargs):
        self.full_clean()

        with transaction.atomic():
            product = Product.objects.select_for_update().get(pk=self.product.pk)

            # Check if this is an update (object exists in DB) or create (new object)
            is_update = self.pk and OrderProduct.objects.filter(pk=self.pk).exists()

            if is_update:  # UPDATE
                previous = OrderProduct.objects.select_for_update().get(pk=self.pk)

                if previous.quantity != self.quantity:
                    raise ValidationError("Cannot change quantity after creation.")

                if self.order_status != previous.order_status:
                    allowed = self.ALLOWED_TRANSITIONS.get(previous.order_status, set())
                    if self.order_status not in allowed:
                        raise ValidationError(f"Invalid status change: {previous.order_status} → {self.order_status}")

                if previous.order_status != self.CANCELLED and self.order_status == self.CANCELLED:
                    product.quantity += previous.quantity
                    product.save(update_fields=['quantity', 'updated_at'])

            else:  # CREATE
                if self.order_status == self.CANCELLED:
                    raise ValidationError("Cannot create cancelled order.")

                if product.quantity < self.quantity:
                    raise ValidationError(f"Only {product.quantity} in stock.")

                product.expire_discount_if_needed()
                self.unit_price = product.get_current_price()
                self.order_number = self._generate_order_number()
                self.order_total = self.unit_price * self.quantity

                product.quantity -= self.quantity
                product.save(update_fields=['quantity', 'new_price', 'discount_end_at', 'updated_at'])

            try:
                super().save(*args, **kwargs)
            except IntegrityError as e:
                if 'order_number' in str(e):
                    self.order_number = self._generate_order_number()
                    super().save(*args, **kwargs)
                else:
                    raise

    @property
    def monthly_sales(self):
        """Calculate total sales for the month of this order"""
        if self.order_status == 'Completed':
            return OrderProduct.objects.filter(
                shop=self.shop,
                order_status='Completed',
                order_date__year=self.order_date.year,
                order_date__month=self.order_date.month
            ).aggregate(total=models.Sum('order_total'))['total'] or 0
        return 0

    @property
    def total(self):
        return self.unit_price * self.quantity