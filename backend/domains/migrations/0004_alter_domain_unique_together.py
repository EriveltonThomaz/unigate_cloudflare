# Generated by Django 5.2.4 on 2025-07-12 13:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('domains', '0003_domain_cloudflare_zone_id'),
        ('tenants', '0004_alter_tenant_owner'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='domain',
            unique_together={('tenant', 'name')},
        ),
    ]
