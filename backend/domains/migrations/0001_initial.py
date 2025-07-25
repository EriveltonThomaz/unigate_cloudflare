# Generated by Django 5.2.4 on 2025-07-07 01:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('tenants', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Domain',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('proxied', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='domains', to='tenants.tenant')),
            ],
        ),
        migrations.CreateModel(
            name='DNSRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('record_type', models.CharField(choices=[('A', 'A'), ('AAAA', 'AAAA'), ('CNAME', 'CNAME'), ('MX', 'MX'), ('TXT', 'TXT')], max_length=10)),
                ('content', models.TextField()),
                ('ttl', models.IntegerField(default=3600)),
                ('proxied', models.BooleanField(default=False)),
                ('cloudflare_record_id', models.CharField(blank=True, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('domain', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dns_records', to='domains.domain')),
            ],
        ),
    ]
