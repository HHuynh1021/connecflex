from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin, AbstractBaseUser
from django.utils.translation import gettext_lazy as _
from .management import CustomUserManager
from core.utils import custom_id

# Create your models here.
def default_account_id():
    return custom_id().lower()
class User(AbstractBaseUser, PermissionsMixin):
    id = models.CharField(
        primary_key=True,
        max_length=25,
        default=default_account_id,
        editable=False,
        unique=True,
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(_("Email address"), unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    objects = CustomUserManager()

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
    def __str__(self):
        return self.name

class Member(models.Model):
    OWNER = 'owner'
    MANAGER = 'manager'
    STAFF = 'staff'
    ROLE_CHOICES = [
        (OWNER, 'Owner'),
        (MANAGER, 'Manager'),
        (STAFF, 'Staff'),
    ]
    id = models.CharField(
        primary_key=True,
        max_length=25,
        default=default_account_id,
        editable=False,
        unique=True,
    )
    first_name = models.CharField(_("First name"), max_length=150)
    last_name = models.CharField(_("Last name"), max_length=150)
    email = models.EmailField(_("Email address"), unique=True)
    shop = models.ForeignKey('shops.Shop', on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=100, choices=ROLE_CHOICES, default=STAFF)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    class Meta:
        unique_together = ('email', 'shop', 'role')

    def __str__(self):
        return self.member_full_name
    @property
    def member_full_name(self):
        return f'{self.first_name} {self.last_name}'