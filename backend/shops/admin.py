from django.contrib import admin
from .models import Shop, Category, Product


# Register your models here.
admin.site.register(Shop)
admin.site.register(Category)
admin.site.register(Product)