from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
from rest_framework import serializers
from .models import User

class UserCreateSerializer(DjoserUserCreateSerializer):
    # Explicitly define shop_name field
    shop_name = serializers.CharField(
        required=False, 
        allow_blank=True, 
        allow_null=True
    )
    
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = (
            'id',
            'email',
            'password',
            'first_name',
            'last_name',
            'role',
        )
        read_only_fields = ('id',)
    
    def validate(self, attrs):
        # Validate that shop_admin role has shop_name
        role = attrs.get('role')
        shop_name = attrs.get('shop_name')
        
        if role == User.SHOP_ADMIN and not shop_name:
            raise serializers.ValidationError({
                'shop_name': 'Shop name is required for shop admin users.'
            })
        
        # IMPORTANT: Don't call super().validate() as it might strip shop_name
        # Instead, do minimal validation
        return attrs
    
    def create(self, validated_data):
        # Create user directly with all fields
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
