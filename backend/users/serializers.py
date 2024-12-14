from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer class to serialize CustomUser model.
    """
    posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = CustomUser
        fields = ("id", "first_name", "last_name", "email", 'posts', 'is_staff')

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer class to serialize registration requests and create a new user.
    """
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ("id", "first_name", "last_name", "email", "password", "confirm_password")
        extra_kwargs = {"password": {"write_only": True}}
    
    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        try:
            validate_password(data["password"])
        except Exception as e:
            raise ValidationError({"password": list(e.messages)})
        
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return CustomUser.objects.create_user(**validated_data)
    
class UserLoginSerializer(serializers.Serializer):
    """
    Serializer class to authenticate users with email and password.
    """
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")
    
class UserLogoutSerializer(serializers.Serializer):
    """
    Serializer class to logout user.
    """
    refresh = serializers.CharField()

    def validate(self, data):
        try:
            RefreshToken(data['refresh'])
        except Exception:
            # raise serializers.ValidationError("Invalid or expired refresh token.")
            data['valid'] = False
            return data

        data['valid'] = True
        return data
