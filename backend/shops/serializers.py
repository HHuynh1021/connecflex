from decimal import Decimal
from itertools import count

from rest_framework import serializers

from customers.serializers import GuestUserSerializer
from shops.models import ProductCategory, ProductProperty, ProductPropertyValue, Shop, Product, ProductImage, OrderProduct

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'
        read_only_fields = ('id',)
class ProductPropertySerializer(serializers.ModelSerializer):
    """
    Serializer for ProductProperty model with values array.
    Example: {
        "id": "prop-123",
        "name": "Color",
        "values": ["red", "blue", "black", "white"],
        "description": "Available colors",
        "created_at": "2026-01-22T10:00:00Z"
    }
    """
    class Meta:
        model = ProductProperty
        fields = ['id', 'name', 'values', 'description', 'created_at']
        read_only_fields = ('id', 'created_at')
    
    def validate_values(self, value):
        """Ensure values is a list and contains no empty strings"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Values must be a list")
        # Filter out empty strings
        cleaned_values = [v.strip() for v in value if v and v.strip()]
        if not cleaned_values:
            raise serializers.ValidationError("Values list cannot be empty")
        return cleaned_values

class ShopSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        # fields = (
        #     "id", "name", "email", "street", "province", "city",
        #     "state", "zipcode", "country", "phone", "description",
        #     "industry", "logo", "banner", "template", "address",
        # )
        fields = "__all__"
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
        fields = "__all__"


class ProductPropertyValueSerializer(serializers.ModelSerializer):
    property_id = serializers.CharField(source='property.id', read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)
    
    class Meta:
        model = ProductPropertyValue
        fields = ['id', 'property_id', 'property_name', 'value']
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    shop_name = serializers.SerializerMethodField()
    shop_address = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    shop_city = serializers.SerializerMethodField()
    current_price = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    new_price = serializers.SerializerMethodField()
    # Properties with custom values
    property_values = ProductPropertyValueSerializer(many=True, read_only=True)
    properties_input = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of {property_id: 'id', value: 'custom value'}"
    )
    category = serializers.PrimaryKeyRelatedField(many=True, queryset=ProductCategory.objects.all())
    
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ('id',)
    
    def get_new_price(self, obj):
        """Return 0 if discount is expired, otherwise return actual new_price"""
        if obj.is_discount_expired():
            return 0
        return float(obj.new_price) if obj.new_price else 0
    def get_shop_name(self, obj):
        return obj.shop_id.name
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.media:
            return primary_image.media.url
        first_image = obj.images.first()
        if first_image and first_image.media:
            return first_image.media.url
        return None

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
        # Use new_price field and check if discount is still valid
        if obj.new_price and obj.new_price > 0 and not obj.is_discount_expired():
            if obj.price > obj.new_price:
                return float(obj.price - obj.new_price)
        return 0

    def get_shop_city(self, obj):
        return obj.shop_id.city

    def get_current_price(self, obj):
        return float(obj.current_price)
    
    def create(self, validated_data):
        """Handle creating product with categories and properties"""
        categories = validated_data.pop('category', [])
        properties_input = validated_data.pop('properties_input', [])
        
        # Create the product
        product = Product.objects.create(**validated_data)
        
        # Add categories
        if categories:
            product.category.set(categories)
        
        # Add property values
        if properties_input:
            from shops.models import ProductPropertyValue, ProductProperty
            for prop_data in properties_input:
                property_id = prop_data.get('property_id')
                value = prop_data.get('value')
                if property_id and value:
                    try:
                        prop = ProductProperty.objects.get(id=property_id)
                        ProductPropertyValue.objects.create(
                            product=product,
                            property=prop,
                            value=value
                        )
                    except ProductProperty.DoesNotExist:
                        pass
        
        return product
    
    def update(self, instance, validated_data):
        """Handle updating product with categories and properties"""
        categories = validated_data.pop('category', None)
        properties_input = validated_data.pop('properties_input', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update many-to-many relationships if provided
        if categories is not None:
            instance.category.set(categories)
        
        # Update property values
        if properties_input is not None:
            from shops.models import ProductPropertyValue, ProductProperty
            # Clear existing property values
            instance.property_values.all().delete()
            # Add new property values
            for prop_data in properties_input:
                property_id = prop_data.get('property_id')
                value = prop_data.get('value')
                if property_id and value:
                    try:
                        prop = ProductProperty.objects.get(id=property_id)
                        ProductPropertyValue.objects.create(
                            product=instance,
                            property=prop,
                            value=value
                        )
                    except ProductProperty.DoesNotExist:
                        pass
        
        return instance


# Orderserializer

class OrderSerializer(serializers.ModelSerializer):
    shop_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_property = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    currency_unit = serializers.SerializerMethodField()
    customer_address = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    # monthly_sales = serializers.SerializerMethodField()
    monthly_sales = serializers.ReadOnlyField()
    class Meta:
        model = OrderProduct
        fields = "__all__"
        read_only_fields = ('id',)


    def get_shop_name(self, obj):
        return obj.shop.name if obj.shop else None

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def get_customer_name(self, obj):
        return obj.customer.get_full_name if obj.customer else None

    def get_total_price(self, obj):
        return obj.order_total
    def get_currency_unit(self, obj):
        return obj.product.currency_unit

    def get_customer_address(self, obj):
        address = [
            obj.customer.street,
            obj.customer.city,
            obj.customer.province,
            obj.customer.state,
            obj.customer.zipcode,
            obj.customer.country,
        ]
        return ", ".join(filter(None, address))

    def get_product_property(self, obj):
        exclude_fields = ['id','shop_id', 'price', 'new_price', 'updated_at', 'discount_end_at', 'currency_unit', 'created_at']
        fields = [
            f for f in obj.product._meta.fields
            if not f.name.startswith('_') and f.name not in exclude_fields
        ]

        properties = []
        for field in fields:
            value = getattr(obj.product, field.name)
            if value:
                # Capitalize field name nicely
                label = field.name.replace('_', ' ').title()
                properties.append(f"{label}: {value}")

        return "\n".join(properties)

    def get_customer_phone(self, obj):
        if obj.customer.phone:
            return obj.customer.phone
    def get_customer_email(self, obj):
        if obj.customer.email:
            return obj.customer.email
    # def get_monthly_sales(self, obj):
    #     from django.db.models import Sum
    #     from datetime import datetime
    #
    #     if obj.order_status == 'Completed':
    #         order_date = obj.order_date
    #         monthly_sales = OrderProduct.objects.filter(
    #             shop=obj.shop,
    #             order_status='Completed',
    #             order_date__year=order_date.year,
    #             order_date__month=order_date.month
    #         ).aggregate(total=Sum('order_total'))['total'] or 0
    #         return monthly_sales
    #     return 0


