from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

# Create your models here.
class CustomerManager(BaseUserManager):
    """Manager for Customer model"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular customer"""
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Override to prevent superuser creation
        Customers should never be superusers
        """
        raise NotImplementedError('Customer accounts cannot be superusers')

class GuestUser(AbstractBaseUser):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_guest_user_id,
        editable=False,
        unique=True,
    )
    first_name = models.CharField(_("First name"), max_length=150)
    last_name = models.CharField(_("Last name"), max_length=150)
    email = models.EmailField(_("Email address"), unique=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    street = models.CharField(max_length=255)
    province = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    zipcode = models.CharField(max_length=255)
    country = models.CharField(max_length=255, default='Finland')
    avatar = models.ImageField(upload_to='avatar', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = CustomerManager()

    class Meta:
        verbose_name = "customer"
        verbose_name_plural = "customers"
    
    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()
    
    @property
    def is_superuser(self):
        """Customers are never superusers"""
        return False
    
    def has_perm(self, perm, obj=None):
        """Customers have no permissions"""
        return False
    
    def has_perms(self, perm_list, obj=None):
        """Customers have no permissions"""
        return False
    
    def has_module_perms(self, app_label):
        """Customers have no module permissions"""
        return False