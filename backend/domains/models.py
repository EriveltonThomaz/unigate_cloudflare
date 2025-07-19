from django.db import models
from tenants.models import Tenant
from django.conf import settings

class Domain(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='domains')
    name = models.CharField(max_length=255)
    proxied = models.BooleanField(default=True)
    status = models.CharField(max_length=32, default='active')  # status real da Cloudflare
    created_at = models.DateTimeField(auto_now_add=True)
    cloudflare_zone_id = models.CharField(max_length=64, blank=True, null=True)  # Adicionado para integração Cloudflare

    class Meta:
        unique_together = ('tenant', 'name')

    def __str__(self):
        return self.name

class DNSRecord(models.Model):
    RECORD_TYPES = [
        ('A', 'A'),
        ('AAAA', 'AAAA'),
        ('CNAME', 'CNAME'),
        ('MX', 'MX'),
        ('TXT', 'TXT'),
    ]
    
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='dns_records')
    name = models.CharField(max_length=255)  # ex: "www", "api", "@"
    record_type = models.CharField(max_length=10, choices=RECORD_TYPES)
    content = models.TextField()  # ex: "192.168.1.1", "example.com"
    ttl = models.IntegerField(default=3600)
    proxied = models.BooleanField(default=False)
    priority = models.IntegerField(null=True, blank=True) # Para registros MX
    cloudflare_record_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}.{self.domain.name} ({self.record_type})"
