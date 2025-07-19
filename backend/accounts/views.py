from django.shortcuts import render
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import CloudflareAPIKey, UserDomainPermission

from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer, 
    CloudflareAPIKeySerializer,
    UserDomainPermissionSerializer
)
from domains.models import Domain
import requests

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class StatsView(APIView):
    permission_classes = [permissions.AllowAny] # Permitir acesso sem autenticação para a página inicial

    def get(self, request):
        data = {
            "managed_domains": "200+",
            "subdomains_created": "45K",
            "requests_monitored": "78M",
        }
        return Response(data)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class CloudflareAPIKeyViewSet(viewsets.ModelViewSet):
    queryset = CloudflareAPIKey.objects.all()
    serializer_class = CloudflareAPIKeySerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class UserDomainPermissionViewSet(viewsets.ModelViewSet):
    queryset = UserDomainPermission.objects.all()
    serializer_class = UserDomainPermissionSerializer
    permission_classes = [IsAdminUser]

@api_view(['POST'])
@permission_classes([IsAdminUser])
def sync_domains_from_cloudflare(request):
    """Sincroniza domínios da Cloudflare usando uma API Key"""
    api_key_id = request.data.get('api_key_id')
    
    try:
        cf_api = CloudflareAPIKey.objects.get(id=api_key_id, is_active=True)
    except CloudflareAPIKey.DoesNotExist:
        return Response({'error': 'API Key não encontrada'}, status=400)
    
    headers = {
        'X-Auth-Email': cf_api.email,
        'X-Auth-Key': cf_api.api_key,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get('https://api.cloudflare.com/client/v4/zones', headers=headers)
        data = response.json()
        
        if not data.get('success'):
            return Response({'error': 'Erro ao conectar com Cloudflare'}, status=400)
        
        domains_created = 0
        for zone in data['result']:
            domain, created = Domain.objects.get_or_create(
                cloudflare_zone_id=zone['id'],
                defaults={
                    'name': zone['name'],
                    'tenant_id': 1  # Ajuste conforme sua lógica de tenant
                }
            )
            if created:
                domains_created += 1
        
        return Response({
            'message': f'{domains_created} novos domínios sincronizados',
            'total_domains': len(data['result'])
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_domains(request):
    """Retorna os domínios que o usuário pode gerenciar"""
    if request.user.role == 'admin':
        domains = Domain.objects.all()
    else:
        permissions = UserDomainPermission.objects.filter(user=request.user)
        domains = [perm.domain for perm in permissions]
    
    domain_data = []
    for domain in domains:
        domain_data.append({
            'id': domain.id,
            'name': domain.name,
            'cloudflare_zone_id': domain.cloudflare_zone_id,
            'created_at': domain.created_at
        })
    
    return Response({'domains': domain_data})
