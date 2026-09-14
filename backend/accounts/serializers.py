from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from salons.models import Salon
from accounts.models import UserProfile


class RegisterSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    # Salon fields
    salon_name = serializers.CharField(max_length=255)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        salon = Salon.objects.create(
            name=validated_data["salon_name"],
            owner=user,
            email=validated_data["email"],
        )

        profile = UserProfile.objects.create(
            user=user,
            salon=salon,
            role="owner",
        )

        return profile