# from rest_framework import serializers
# from shops.models import Shop, Product, ProductImage

# class ShopSerializer(serializers.ModelSerializer):
#     address = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Shop
#         fields = (
#             "id", "name", "email", "street", "province", "city", 
#             "state", "zipcode", "country", "phone", "description", 
#             "industry", "logo", "banner", "template", "address",
#         )
#         read_only_fields = ('id',)
    
#     def get_address(self, obj):
#         # Build address string, filtering out None/empty values
#         address_parts = [
#             obj.street,
#             obj.city,
#             obj.province,
#             obj.state,
#             obj.zipcode,
#             obj.country,
#         ]
#         # Filter out None and empty strings, then join with comma
#         return ", ".join(filter(None, address_parts))

# class ProductImageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductImage
#         fields = ['id', 'image', 'is_primary', 'order', 'created_at']
#         # Removed 'product_id' from fields as it's not needed for nested serialization

# class ProductSerializer(serializers.ModelSerializer):
#     images = ProductImageSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = Product
#         fields = [
#             'id',
#             'name',
#             'shop_id',
#             'description',
#             'price',
#             'category',
#             'images',
#             'created_at',
#             'updated_at'
#         ]
#         read_only_fields = ('id',)

from rest_framework import serializers
from shops.models import Shop, Product, ProductImage

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
        # product_id is the foreign key field name in the model

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'shop_id',
            'description',
            'price',
            'category',
            'images',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('id',)