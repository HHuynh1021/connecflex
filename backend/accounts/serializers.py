from djoser.serializers import UserCreateSerializer
from rest_framework import serializers
from .models import Member
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name')
        read_only_fields = ('id',)
class MemberUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('id',)
    def validate_role(self, value):
        if value not in Member.ROLE_CHOICES:
            raise serializers.ValidationError('Invalid role')
        return value.lower()