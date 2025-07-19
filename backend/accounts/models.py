from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('user', 'Usuário'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)  # Novo campo para foto de perfil
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class CloudflareAPIKey(models.Model):
    name = models.CharField(max_length=100)
    api_key = models.CharField(max_length=255)
    email = models.EmailField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.email}"

class UserDomainPermission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    domain = models.ForeignKey('domains.Domain', on_delete=models.CASCADE)
    allowed_a_record = models.ForeignKey(
        'domains.DNSRecord',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'record_type__in': ['A', 'AAAA']},
        related_name='allowed_for_permissions',
        help_text='Registro A/AAAA que o usuário pode visualizar neste domínio.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'domain', 'allowed_a_record']
    
    def __str__(self):
        return f"{self.user.email} - {self.domain.name}"
