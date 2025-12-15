from rest_framework import serializers

from shops.models import Shop, Product, Category


class ShopSerializer(serializers.Serializer):
    class Meta:
        model = Shop
        fields = '__all__'
        read_only_fields = ('id',)
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('id',)
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('id',)