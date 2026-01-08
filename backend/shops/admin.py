from django.contrib import admin
from .models import Shop, Product, ProductImage, ProductRating, OrderProduct

# Register your models here.
admin.site.register(Shop)
admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(ProductRating)
admin.site.register(OrderProduct)