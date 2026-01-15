from rest_framework import serializers
from customers.models import GuestUser
from datetime import date

class GuestUserSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    birth_date = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()

    class Meta:
        model = GuestUser
        fields = "__all__"
        read_only_fields = ('id',)
    
    def get_address(self, obj):
        address = [
            obj.street,
            obj.city,
            obj.province,
            obj.state,
            obj.zipcode,
            obj.country,
        ]
        return ", ".join(filter(None, address))
    def get_contact(self, obj):
        contact = [
            obj.email,
            obj.phone,
        ]
        return ", ".join(filter(None,contact))

    def get_full_name(self, obj):
        return obj.get_full_name
    
    def get_birth_date(self, obj):
        today = date.today()
        birth_date = obj.date_of_birth
        if birth_date is None:
            return None
        age = age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        if age >= 18:
            return birth_date
        else:
            raise serializers.ValidationError("User must be at least 18 years old.")