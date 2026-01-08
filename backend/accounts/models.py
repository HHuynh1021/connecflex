#
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin, AbstractBaseUser
from django.utils.translation import gettext_lazy as _
from .management import CustomUserManager
from core.utils import custom_id

# Create your models here.
def default_account_id():
    return custom_id(prefix="acc").lower()
def default_guest_user_id():
    return custom_id(prefix="cus").lower()



class User(AbstractBaseUser, PermissionsMixin):
    ADMIN = 'admin'
    SHOP_ADMIN = 'shop_admin'
    GUEST_USER = 'guest_user'
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (SHOP_ADMIN, 'Shop Admin'),
        (GUEST_USER, 'Guest User'),
    ]
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_account_id,
        editable=False,
        unique=True,
    )
    first_name = models.CharField(_("First name"), max_length=150)
    last_name = models.CharField(_("Last name"), max_length=150)
    email = models.EmailField(_("Email address"), unique=True)
    role = models.CharField(_("Role"),max_length=100, choices=ROLE_CHOICES, default=GUEST_USER)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["first_name", "last_name", "role"]
    objects = CustomUserManager()

    
        
    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return f"{self.role} - {self.first_name} {self.last_name}"


    @property
    def is_admin(self):
        return self.role == self.ADMIN
    @property
    def is_shop_admin(self):
        return self.role == self.SHOP_ADMIN

    @property
    def is_guest(self):
        return self.role == self.GUEST_USER

    def get_shop_name(self):
        if self.role == self.SHOP_ADMIN:
            return self.shop_name
        return None

    def save(self, *args, **kwargs):
        if not getattr(self, '_skip_validation', False):
            self.full_clean()
        super().save(*args, **kwargs)
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
        

