from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.utils import custom_id


def default_guest_user_id():
    return custom_id(prefix="cus").lower()

class GuestUser(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_guest_user_id,
        editable=False,
        unique=True,
    )
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='guest_user')
    first_name = models.CharField(_("First name"), max_length=150)
    last_name = models.CharField(_("Last name"), max_length=150)
    email = models.EmailField(_("Email address"), unique=True)
    phone = models.CharField(max_length=20)
    street = models.CharField(max_length=255)
    province = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255, null=True, blank=True)
    zipcode = models.CharField(max_length=255)
    country = models.CharField(max_length=255, default='Finland')
    avatar = models.ImageField(upload_to='avatar', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"