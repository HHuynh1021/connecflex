from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin
from django.contrib.auth.models import Group
from rest_framework.authtoken.models import Token
from .models import User, Member
from django.utils.translation import gettext_lazy as _


class CustomAdminSite(AdminSite):
    site_header = 'ConnecFlex Admin Page'
    site_title = 'ConnecFlex Administration'
    index_title = 'Welcome to The Admin Portal'
admin.site = CustomAdminSite()

class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    model = User
    list_display = ["name","email", "is_staff", "is_active"]
    list_display_links = ["email"]
    list_filter = ["name", "email", "is_staff", "is_active"]
    search_fields = ["name", "email"]
    fieldsets = (
        (
            _("Login Credentials"), {
                "fields": ("email", "password",)
            },
        ),
        (
            _("Personal Information"),
            {
                "fields": ('name',)
            },
        ),
        (
            _("Permissions and Groups"),
            {
                "fields": ("is_active", "is_staff","is_superuser", "groups", "user_permissions")
            },
        ),
        (
            _("Important Dates"),
            {
                "fields": ("last_login",)
            },
        ),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ( "name", "email", "password1", "password2", "is_staff", "is_active",),
        },),
    )
admin.site.register(User, UserAdmin)
admin.site.register(Group, GroupAdmin)
admin.site.register(Token)
admin.site.register(Member)
