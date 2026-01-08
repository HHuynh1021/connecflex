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

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')

        # Normalize and validate email
        email = self.normalize_email(email)
        self.email_validator(email)

        # Extract fields from extra_fields (NOT from positional args)
        first_name = extra_fields.pop('first_name', '')
        last_name = extra_fields.pop('last_name', '')
        role = extra_fields.pop('role', '')

        # Validate required fields
        if not first_name:
            raise ValueError('First name is required')
        if not last_name:
            raise ValueError('Last name is required')

        extra_fields.setdefault('is_active', False)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)

        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            **extra_fields
        )
        # Set password
        if password:
            user.set_password(password)

        # Skip validation in save method
        user._skip_validation = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('first_name', 'Admin')
        extra_fields.setdefault('last_name', 'User')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        if extra_fields.get('is_active') is not True:
            raise ValueError('Superuser must have is_active=True.')
        if extra_fields.get('role') != 'admin':
            raise ValueError('Superuser must have role=admin.')

        return self.create_user(email, password, **extra_fields)

    # def create_superuser(self,first_name, last_name, email, password=None, **extra_fields):
    #     """
    #     Create a staff/admin user (not a customer superuser).
    #     """
    #     extra_fields.setdefault('is_staff', True)
    #     extra_fields.setdefault('is_superuser', True)
    #     extra_fields.setdefault('is_active', True)
    #
    #     if extra_fields.get('is_staff') is not True:
    #         raise ValueError('Superuser must have is_staff=True.')
    #     if extra_fields.get('is_superuser') is not True:
    #         raise ValueError('Superuser must have is_superuser=True.')
    #     if not password:
    #         raise ValueError('Password is required')
    #     if email:
    #         email = self.normalize_email(email)
    #         self.email_validator(email)
    #     else:
    #         raise ValueError('Admin user: Email is required')
    #     user = self.create_user(first_name, last_name, email, password, **extra_fields)
    #     user.save()
    #
    #     return user
