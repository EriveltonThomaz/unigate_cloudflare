from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import CloudflareAPIKey, UserDomainPermission
from domains.models import Domain

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email' # Define email como campo de autenticação

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = getattr(user, 'role', '')
        token['name'] = f"{user.first_name} {user.last_name}"
        token['is_superuser'] = user.is_superuser
        return token

    def validate(self, attrs):
        # O campo 'email' já será passado como 'username' para o super().validate
        # Não precisamos mais da validação manual de email/senha aqui
        data = super().validate({
            self.username_field: attrs[self.username_field],
            'password': attrs['password']
        })
        return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'password', 'is_active', 'is_superuser', 'avatar']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        avatar = validated_data.pop('avatar', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        if avatar is not None:
            instance.avatar = avatar
        instance.save()
        return instance

class CloudflareAPIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = CloudflareAPIKey
        fields = ['id', 'name', 'api_key', 'email', 'is_active', 'created_at']
        extra_kwargs = {'api_key': {'write_only': True}}

class UserDomainPermissionSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserDomainPermission
        fields = ['id', 'user', 'domain', 'user_email', 'domain_name', 'created_at']
