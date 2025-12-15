from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def email_validator(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError(_('Invalid email address'))
    def create_user(self, name, email, password, **extra_fields):
        if not name:
            raise ValueError('First name is required')
        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError('Email is required')
        user = self.model(
            name=name,
            email=email,
            **extra_fields
        )
        user.set_password(password)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_staff', False)
        user.save()
        return user
    def create_superuser(self, name, email, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if not password:
            raise ValueError('Password is required for superuser')
        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError('Admin User: Email is required')
        user = self.create_user(name, email, password, **extra_fields)
        user.save()
        return user