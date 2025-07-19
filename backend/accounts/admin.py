# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CloudflareAPIKey, UserDomainPermission

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {'fields': ('role',)}),
    )

@admin.register(CloudflareAPIKey)
class CloudflareAPIKeyAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'created_by', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']

@admin.register(UserDomainPermission)
class UserDomainPermissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'domain', 'created_at']
    list_filter = ['created_at']
