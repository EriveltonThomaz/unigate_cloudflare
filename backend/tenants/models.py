from django.db import models
from django.conf import settings

class Tenant(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_tenants'
    )
    managers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='managed_tenants',
        blank=True
    )
    name = models.CharField(max_length=100)
    cloudflare_api_key = models.CharField(max_length=100)
    cloudflare_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
