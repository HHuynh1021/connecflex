from decimal import Decimal

from rest_framework import serializers
from shops.models import Shop, Product, ProductImage, OrderProduct


class ShopSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = (
            "id", "name", "email", "street", "province", "city",
            "state", "zipcode", "country", "phone", "description",
            "industry", "logo", "banner", "template", "address",
        )
        read_only_fields = ('id',)

    def get_address(self, obj):
        # Build address string, filtering out None/empty values
        address_parts = [
            obj.street,
            obj.city,
            obj.province,
            obj.state,
            obj.zipcode,
            obj.country,
        ]
        # Filter out None and empty strings, then join with comma
        return ", ".join(filter(None, address_parts))


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'product_id', 'is_primary', 'order', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    shop_name = serializers.SerializerMethodField()
    shop_address = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    shop_city = serializers.SerializerMethodField()
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ('id',)

    def get_shop_name(self, obj):
        return obj.shop_id.name

    def get_shop_address(self, obj):
        if not obj.shop_id:
            return None
        address_parts = [
            obj.shop_id.street,
            obj.shop_id.city,
            obj.shop_id.province,
            obj.shop_id.state,
            obj.shop_id.zipcode,
            obj.shop_id.country,
        ]
        return ", ".join(filter(None, address_parts))

    def get_discount(self, obj):
        current_price = obj.current_new_price
        if current_price > 0 and obj.price > current_price:
            return obj.price - current_price
        return 0

    def get_shop_city(self, obj):
        return obj.shop_id.city

    def get_current_price(self, obj):
        return obj.current_new_price


# Orderserializer

class OrderSerializer(serializers.ModelSerializer):
    shop_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = "__all__"
        read_only_fields = ('id',)

    def get_shop_name(self, obj):
        return obj.shop.name if obj.shop else None

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_customer_name(self, obj):
        return obj.customer.full_name if obj.customer else None

    def get_total_price(self, obj):
        return obj.order_total