# backend/admin_api/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, serializers
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from tenants.models import Tenant
from domains.models import Domain
from cloudflare_keys.models import CloudflareKey
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from domains.models import Domain
import datetime
from accounts.models import UserDomainPermission
from domains.models import DNSRecord
from rest_framework.decorators import action
import re

from .serializers import TenantSerializer, UserSerializer, DomainSerializer, CloudflareKeySerializer, TenantCreateSerializer, TenantManagerSerializer, RecentSubdomainSerializer, DNSRecordSerializer, UserDomainPermissionSerializer
from .permissions import IsAdminUser
from cloudflare_api.services import CloudflareService, CloudflareAPIError
from domains.models import Domain, DNSRecord

User = get_user_model()

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff or getattr(request.user, 'role', None) == 'admin'

class TenantCreateAPIView(generics.CreateAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Associa o usuário logado ao novo tenant como proprietário
        instance = serializer.save(owner=self.request.user)
        
        # Tenta buscar e criar domínios e registros DNS da Cloudflare
        try:
            service = CloudflareService(instance.cloudflare_api_key, instance.cloudflare_email)
            zones = service.get_zones()
            for zone in zones:
                domain_obj = Domain.objects.create(
                    tenant=instance,
                    name=zone['name'],
                    proxied=zone['proxied'] if 'proxied' in zone else False # Cloudflare API pode não retornar 'proxied' para todos os tipos
                )
                # Agora busca os registros DNS para esta zona
                dns_records = service.get_dns_records(zone['id'])
                for record in dns_records:
                    DNSRecord.objects.create(
                        domain=domain_obj,
                        name=record['name'],
                        record_type=record['type'],
                        content=record['content'],
                        ttl=record['ttl'],
                        proxied=record['proxied'] if 'proxied' in record else False,
                        cloudflare_record_id=record['id']
                    )
        except CloudflareAPIError as e:
            # Erro silencioso
            pass
        except Exception as e:
            # Erro silencioso
            pass

        return instance

class TenantListCreateView(generics.ListCreateAPIView):
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Tenant.objects.all().order_by('name')
        else:
            # Retorna apenas os tenants que o usuário gerencia
            return user.managed_tenants.all().order_by('name')

    def create(self, request, *args, **kwargs):
        # Apenas admins podem criar tenants
        if request.user.role != 'admin':
            return Response({'error': 'Apenas administradores podem criar clientes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        if user.role == 'admin':
            # Admins see all stats
            total_tenants = Tenant.objects.count()
            total_domains = Domain.objects.count()
            total_users = User.objects.count()
        else:
            # Regular users see stats for tenants they manage
            managed_tenants_ids = user.managed_tenants.values_list('id', flat=True)
            total_tenants = user.managed_tenants.count()
            total_domains = Domain.objects.filter(tenant__id__in=managed_tenants_ids).count()
            total_users = User.objects.filter(managed_tenants__id__in=managed_tenants_ids).count()

        return Response({
            'totalTenants': total_tenants,
            'totalDomains': total_domains,
            'totalUsers': total_users,
        })

class RecentTenantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Busca os 5 tenants mais recentes, ordenando pelo ID (assumindo que IDs maiores são mais recentes)
        recent_tenants = Tenant.objects.all().order_by('-created_at')[:5]
        serializer = TenantSerializer(recent_tenants, many=True)
        return Response(serializer.data)

class RecentSubdomainsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        if user.role == 'admin':
            # Admins see all recent CNAME records
            recent_subdomains = DNSRecord.objects.filter(record_type='CNAME').order_by('-created_at')[:5]
        else:
            # Regular users see recent CNAME records for tenants they manage
            managed_tenants_ids = user.managed_tenants.values_list('id', flat=True)
            recent_subdomains = DNSRecord.objects.filter(
                record_type='CNAME',
                domain__tenant__id__in=managed_tenants_ids
            ).order_by('-created_at')[:5]

        serializer = RecentSubdomainSerializer(recent_subdomains, many=True)
        return Response(serializer.data)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger('django')
        
        # Logs detalhados para debug
        logger.info(f'[UserListCreateView:create] Content-Type: {request.content_type}')
        logger.info(f'[UserListCreateView:create] request.data: {request.data}')
        logger.info(f'[UserListCreateView:create] request.POST: {request.POST}')
        logger.info(f'[UserListCreateView:create] request.FILES: {request.FILES}')
        
        # Logs adicionais para debug do FormData
        logger.info(f'[UserListCreateView:create] request.data type: {type(request.data)}')
        logger.info(f'[UserListCreateView:create] request.data keys: {list(request.data.keys()) if hasattr(request.data, "keys") else "No keys"}')
        
        # Se for FormData, verificar campos específicos
        if 'multipart/form-data' in request.content_type:
            logger.info(f'[UserListCreateView:create] email from POST: {request.POST.get("email")}')
            logger.info(f'[UserListCreateView:create] email from data: {request.data.get("email")}')
            logger.info(f'[UserListCreateView:create] first_name from POST: {request.POST.get("first_name")}')
            logger.info(f'[UserListCreateView:create] first_name from data: {request.data.get("first_name")}')
        
        return super().create(request, *args, **kwargs)

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class DNSRecordView(generics.ListCreateAPIView):
    serializer_class = DNSRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        domain_id = self.kwargs.get('domain_id')
        
        if user.role == 'admin':
            # Admins podem ver todos os registros DNS
            if domain_id:
                return DNSRecord.objects.filter(domain_id=domain_id).order_by('name')
            return DNSRecord.objects.all().order_by('name')
        else:
            # Usuários comuns podem ver apenas registros dos tenants que gerenciam
            managed_tenants_ids = user.managed_tenants.values_list('id', flat=True)
            queryset = DNSRecord.objects.filter(domain__tenant__id__in=managed_tenants_ids)
            
            if domain_id:
                queryset = queryset.filter(domain_id=domain_id)
            
            return queryset.order_by('name')

    def get(self, request, *args, **kwargs):
        user = self.request.user
        domain_id = self.kwargs.get('domain_id')

        if not domain_id:
            return Response({'error': 'O domain_id é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            domain = Domain.objects.get(id=domain_id)
        except Domain.DoesNotExist:
            return Response({'error': 'Domínio não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Verificar permissão
        if user.role != 'admin':
            # Permite se for gerente do tenant
            if domain.tenant not in user.managed_tenants.all():
                return Response({'error': 'Você não tem permissão para ver os registros deste domínio.'}, status=status.HTTP_403_FORBIDDEN)

        # Sincronizar registros da Cloudflare
        try:
            service = CloudflareService(domain.tenant.cloudflare_api_key, domain.tenant.cloudflare_email)
            cf_records = service.get_dns_records(domain.cloudflare_zone_id)
            for record_data in cf_records:
                # Apenas CNAMEs são de interesse para o usuário comum
                if record_data['type'] == 'CNAME':
                    DNSRecord.objects.update_or_create(
                        cloudflare_record_id=record_data['id'],
                        domain=domain,
                        defaults={
                            'name': record_data['name'],
                            'record_type': record_data['type'],
                            'content': record_data['content'],
                            'ttl': record_data['ttl'],
                            'proxied': record_data.get('proxied', False),
                            'created_by': user, # Opcional: atribuir ao usuário que fez a sincronização
                        }
                    )
        except CloudflareAPIError as e:
            # Se falhar, continuar com os dados locais
            pass
        except Exception as e:
            # Erro silencioso
            pass

        # Filtrar registros para o usuário
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'admin':
            # Usuários comuns só podem criar registros CNAME
            if serializer.validated_data.get('record_type', '').upper() != 'CNAME':
                raise serializers.ValidationError("Usuários comuns só podem criar registros do tipo CNAME.")
        
        serializer.save()

class DNSRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DNSRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return DNSRecord.objects.all()
        else:
            # Usuários comuns podem ver apenas registros dos tenants que gerenciam
            managed_tenants_ids = user.managed_tenants.values_list('id', flat=True)
            return DNSRecord.objects.filter(domain__tenant__id__in=managed_tenants_ids)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        if user.role != 'admin':
            # Usuários comuns só podem editar registros CNAME
            if instance.record_type != 'CNAME':
                raise serializers.ValidationError("Usuários comuns só podem editar registros do tipo CNAME.")
            
            # Validar que o novo tipo também seja CNAME
            if serializer.validated_data.get('record_type', instance.record_type) != 'CNAME':
                raise serializers.ValidationError("Usuários comuns só podem editar registros do tipo CNAME.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role != 'admin':
            # Usuários comuns só podem excluir registros CNAME
            if instance.record_type != 'CNAME':
                raise serializers.ValidationError("Usuários comuns só podem excluir registros do tipo CNAME.")
        
        instance.delete()

class DomainListCreateView(generics.ListCreateAPIView):
    serializer_class = DomainSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Domain.objects.all().order_by('-created_at')
        else:
            # Retorna apenas os domínios dos tenants que o usuário gerencia
            managed_tenants_ids = user.managed_tenants.values_list('id', flat=True)
            return Domain.objects.filter(tenant__id__in=managed_tenants_ids).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'admin':
            # Para usuários comuns, garantir que o tipo de registro seja CNAME
            if serializer.validated_data.get('record_type', '').upper() != 'CNAME':
                raise serializers.ValidationError("Usuários comuns só podem criar registros do tipo CNAME.")
            # Assumir que o domínio raiz já existe e pertence ao tenant
            # A validação mais robusta do subdomínio já está no serializer

        serializer.save()

class DomainRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DomainSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Domain.objects.all()
        else:
            managed_tenants_ids = user.managed_tenants.values_list('id', flat=True)
            return Domain.objects.filter(tenant__id__in=managed_tenants_ids)

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        if user.role != 'admin':
            # Para usuários comuns, permitir atualização apenas de CNAMEs e campos específicos
            if instance.dns_records.filter(record_type='CNAME').exists(): # Verifica se tem CNAME
                # Permitir apenas a atualização de 'content' e 'proxied'
                allowed_fields = ['name', 'proxied'] # name para subdomínio, proxied para proxy
                for field in serializer.validated_data:
                    if field not in allowed_fields:
                        raise serializers.ValidationError(f"Usuários comuns não podem editar o campo '{field}'.")
            else:
                raise serializers.ValidationError("Usuários comuns só podem editar registros do tipo CNAME.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role != 'admin':
            # Para usuários comuns, permitir exclusão apenas de CNAMEs
            if not instance.dns_records.filter(record_type='CNAME').exists():
                raise serializers.ValidationError("Usuários comuns só podem excluir registros do tipo CNAME.")
        instance.delete()

class CloudflareKeyListCreateView(generics.ListCreateAPIView):
    queryset = CloudflareKey.objects.all().order_by('-created_at')
    serializer_class = CloudflareKeySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class CloudflareKeyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CloudflareKey.objects.all()
    serializer_class = CloudflareKeySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Se um ID for fornecido no corpo da requisição e o usuário for admin, use esse ID
        if self.request.method in ['PUT', 'PATCH'] and self.request.user.role == 'admin':
            user_id = self.request.data.get('id')
            if user_id:
                try:
                    return User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass
        
        # Caso contrário, retorna o próprio usuário
        return self.request.user

class TenantRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tenant = self.get_object()
        user = request.user
        # Permite GET se for admin ou gerente do tenant
        if user.role == 'admin' or tenant.managers.filter(id=user.id).exists():
            serializer = self.get_serializer(tenant)
            return Response(serializer.data)
        return Response({'detail': 'Você não tem permissão para acessar este cliente.'}, status=status.HTTP_403_FORBIDDEN)

    def put(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'detail': 'Apenas administradores podem editar clientes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().put(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'detail': 'Apenas administradores podem editar clientes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().patch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'detail': 'Apenas administradores podem excluir clientes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().delete(request, *args, **kwargs)

class TenantManagerView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, tenant_pk):
        tenant = generics.get_object_or_404(Tenant, pk=tenant_pk)
        serializer = TenantManagerSerializer(tenant.managers.all(), many=True)
        return Response(serializer.data)

    def post(self, request, tenant_pk):
        tenant = generics.get_object_or_404(Tenant, pk=tenant_pk)
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        user_to_add = generics.get_object_or_404(User, pk=user_id)
        tenant.managers.add(user_to_add)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, tenant_pk, user_pk):
        tenant = generics.get_object_or_404(Tenant, pk=tenant_pk)
        user_to_remove = generics.get_object_or_404(User, pk=user_pk)
        tenant.managers.remove(user_to_remove)
        return Response(status=status.HTTP_204_NO_CONTENT)

class TenantDomainListView(generics.ListAPIView):
    serializer_class = DomainSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tenant_pk = self.kwargs['tenant_pk']
        user = self.request.user

        # Ensure the user has access to this tenant
        if user.role == 'admin':
            return Domain.objects.filter(tenant__pk=tenant_pk).order_by('-created_at')
        else:
            # Check if the user manages this specific tenant
            if not user.managed_tenants.filter(pk=tenant_pk).exists():
                raise serializers.ValidationError("Você não tem permissão para acessar os domínios deste cliente.")
            return Domain.objects.filter(tenant__pk=tenant_pk).order_by('-created_at')

class DomainSubdomainListView(generics.ListAPIView):
    serializer_class = RecentSubdomainSerializer # Reusing this serializer for now
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        domain_pk = self.kwargs['domain_pk']
        user = self.request.user

        domain = generics.get_object_or_404(Domain, pk=domain_pk)

        # Check if the user has access to this domain's tenant
        if user.role != 'admin' and not user.managed_tenants.filter(pk=domain.tenant.pk).exists():
            raise serializers.ValidationError("Você não tem permissão para acessar os subdomínios deste domínio.")

        return DNSRecord.objects.filter(domain=domain, record_type='CNAME').order_by('name')

class DomainSubdomainCreateView(generics.CreateAPIView):
    serializer_class = RecentSubdomainSerializer # Reusing this serializer for now
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        domain_pk = self.kwargs['domain_pk']
        user = self.request.user

        domain = generics.get_object_or_404(Domain, pk=domain_pk)

        # Check if the user has access to this domain's tenant
        if user.role != 'admin' and not user.managed_tenants.filter(pk=domain.tenant.pk).exists():
            raise serializers.ValidationError("Você não tem permissão para criar subdomínios neste domínio.")

        # Ensure it's a CNAME record
        if serializer.validated_data.get('record_type', '').upper() != 'CNAME':
            raise serializers.ValidationError("Apenas registros CNAME podem ser criados por esta rota.")

        serializer.save(domain=domain)

class TenantSyncDomainsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tenant_pk):
        user = request.user
        try:
            tenant = Tenant.objects.get(pk=tenant_pk)
        except Tenant.DoesNotExist:
            return Response({'error': 'Tenant não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Permitir apenas admins ou managers do tenant
        if user.role != 'admin' and user not in tenant.managers.all():
            return Response({'error': 'Permissão negada.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            service = CloudflareService(tenant.cloudflare_api_key, tenant.cloudflare_email)
            zones = service.get_zones()
        except CloudflareAPIError as e:
            return Response({'error': f'Erro ao conectar com a Cloudflare: {e}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Erro inesperado: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Atualizar domínios locais: sobrescrever lista
        existing_domains = {d.name: d for d in Domain.objects.filter(tenant=tenant)}
        domains_created = 0
        domains_updated = 0
        cloudflare_domain_names = set()
        for zone in zones:
            name = zone['name']
            status_val = zone.get('status', 'active')
            cloudflare_domain_names.add(name)
            if name in existing_domains:
                domain = existing_domains[name]
                updated = False
                if domain.proxied != zone.get('proxied', False):
                    domain.proxied = zone.get('proxied', False)
                    updated = True
                if domain.status != status_val:
                    domain.status = status_val
                    updated = True
                if domain.cloudflare_zone_id != zone['id']:
                    domain.cloudflare_zone_id = zone['id']
                    updated = True
                if updated:
                    domain.save()
                    domains_updated += 1
            else:
                Domain.objects.create(
                    tenant=tenant,
                    name=name,
                    cloudflare_zone_id=zone['id'],
                    proxied=zone.get('proxied', False),
                    status=status_val
                )
                domains_created += 1
        # Remover domínios locais que não existem mais na Cloudflare
        for name, domain in existing_domains.items():
            if name not in cloudflare_domain_names:
                domain.delete()
        return Response({
            'message': f'Sincronização concluída. {domains_created} domínios criados, {domains_updated} atualizados.',
            'total_domains': len(zones)
        })

class DNSRecordCloudflareView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, domain_id):
        """Lista todos os registros DNS reais da Cloudflare para o domínio."""
        try:
            domain = Domain.objects.get(pk=domain_id)
            tenant = domain.tenant
            service = CloudflareService(tenant.cloudflare_api_key, tenant.cloudflare_email)
            records = service.get_dns_records(domain.cloudflare_zone_id)
            # Atualiza o cache local (opcional: pode ser async ou otimizado)
            for record in records:
                DNSRecord.objects.update_or_create(
                    cloudflare_record_id=record['id'],
                    domain=domain,
                    defaults={
                        'name': record['name'],
                        'record_type': record['type'],
                        'content': record['content'],
                        'ttl': record['ttl'],
                        'proxied': record.get('proxied', False),
                    }
                )
            return Response(records)
        except Domain.DoesNotExist:
            return Response({'error': 'Domínio não encontrado.'}, status=404)
        except CloudflareAPIError as e:
            return Response({'error': str(e)}, status=400)

    def post(self, request, domain_id):
        """Cria um registro DNS na Cloudflare e salva no banco local."""
        try:
            domain = Domain.objects.get(pk=domain_id)
            tenant = domain.tenant
            data = request.data
            # Garantir que o campo 'type' esteja presente
            if 'type' not in data or not data['type']:
                if 'record_type' in data and data['record_type']:
                    data['type'] = data['record_type']
            service = CloudflareService(tenant.cloudflare_api_key, tenant.cloudflare_email)
            record = service.create_dns_record(domain.cloudflare_zone_id, data)
            # Salva no banco local
            DNSRecord.objects.create(
                domain=domain,
                name=record['name'],
                record_type=record['type'],
                content=record['content'],
                ttl=record['ttl'],
                proxied=record.get('proxied', False),
                cloudflare_record_id=record['id']
            )
            return Response(record, status=201)
        except Domain.DoesNotExist:
            return Response({'error': 'Domínio não encontrado.'}, status=404)
        except CloudflareAPIError as e:
            return Response({'error': str(e)}, status=400)

    def put(self, request, domain_id, record_id):
        """Atualiza um registro DNS na Cloudflare e no banco local."""
        try:
            domain = Domain.objects.get(pk=domain_id)
            tenant = domain.tenant
            data = request.data
            service = CloudflareService(tenant.cloudflare_api_key, tenant.cloudflare_email)
            record = service.update_dns_record(domain.cloudflare_zone_id, record_id, data)
            # Atualiza no banco local
            DNSRecord.objects.filter(domain=domain, cloudflare_record_id=record_id).update(
                name=record['name'],
                record_type=record['type'],
                content=record['content'],
                ttl=record['ttl'],
                proxied=record.get('proxied', False)
            )
            return Response(record)
        except Domain.DoesNotExist:
            return Response({'error': 'Domínio não encontrado.'}, status=404)
        except CloudflareAPIError as e:
            return Response({'error': str(e)}, status=400)

    def delete(self, request, domain_id, record_id):
        """Remove um registro DNS da Cloudflare e do banco local."""
        try:
            domain = Domain.objects.get(pk=domain_id)
            tenant = domain.tenant
            # Busca o registro local para pegar o cloudflare_record_id
            record = DNSRecord.objects.get(domain=domain, cloudflare_record_id=record_id)
            service = CloudflareService(tenant.cloudflare_api_key, tenant.cloudflare_email)
            service.delete_dns_record(domain.cloudflare_zone_id, record_id)
            record.delete()
            return Response({'message': 'Registro DNS removido com sucesso.'})
        except Domain.DoesNotExist:
            return Response({'error': 'Domínio não encontrado.'}, status=404)
        except DNSRecord.DoesNotExist:
            return Response({'error': 'Registro DNS não encontrado.'}, status=404)
        except CloudflareAPIError as e:
            return Response({'error': str(e)}, status=400)

class DomainAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, domain_id):
        try:
            domain = Domain.objects.get(pk=domain_id)
            # Supondo que você armazene o zone_id da Cloudflare no modelo Domain
            zone_id = getattr(domain, 'cloudflare_zone_id', None)
            if not zone_id:
                return Response({'error': 'Zone ID não encontrado para este domínio.'}, status=400)
            api_token = "SEU_TOKEN_CLOUDFLARE"  # Troque pelo token correto
            date = datetime.date.today().isoformat()

            query = '''
            query {
              viewer {
                zones(filter: { zoneTag: "%s" }) {
                  httpRequests1dGroups(filter: { date: "%s" }, limit: 1) {
                    uniq {
                      uniques
                    }
                  }
                }
              }
            }
            ''' % (zone_id, date)

            headers = {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json"
            }
            response = requests.post(
                "https://api.cloudflare.com/client/v4/graphql",
                json={"query": query},
                headers=headers
            )
            data = response.json()
            uniques = (
                data["data"]["viewer"]["zones"][0]["httpRequests1dGroups"][0]["uniq"]["uniques"]
                if data.get("data") else 0
            )
            return Response({"uniques": uniques})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class ARecordListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, domain_id):
        try:
            domain = Domain.objects.get(pk=domain_id)
            tenant = domain.tenant
            if not domain.cloudflare_zone_id:
                return Response({'error': 'Domínio não possui Zone ID da Cloudflare.'}, status=status.HTTP_400_BAD_REQUEST)

            # Sincroniza registros A/AAAA da Cloudflare com o banco local
            service = CloudflareService(tenant.cloudflare_api_key, tenant.cloudflare_email)
            cf_records = service.get_a_aaaa_records(domain.cloudflare_zone_id)
            for record in cf_records:
                DNSRecord.objects.update_or_create(
                    cloudflare_record_id=record['id'],
                    domain=domain,
                    defaults={
                        'name': record['name'],
                        'record_type': record['type'],
                        'content': record['content'],
                        'ttl': record['ttl'],
                        'proxied': record.get('proxied', False),
                    }
                )
            # Agora retorna os registros do banco local
            a_aaaa_records = DNSRecord.objects.filter(domain=domain, record_type__in=["A", "AAAA"])
            from .serializers import DNSRecordSerializer
            serializer = DNSRecordSerializer(a_aaaa_records, many=True)
            return Response(serializer.data)
        except Domain.DoesNotExist:
            return Response({'error': 'Domínio não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Erro inesperado: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DNSRecordCustomListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, domain_id):
        user = request.user
        try:
            domain = Domain.objects.get(id=domain_id)
        except Domain.DoesNotExist:
            return Response({'error': 'Domínio não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Administradores podem ver todos os registros do domínio.
        if user.role == 'admin':
            registros = DNSRecord.objects.filter(domain_id=domain_id)
            serializer = DNSRecordSerializer(registros, many=True)
            return Response(serializer.data)

        # Lógica para usuários não-administradores
        # 1. Sincroniza os registros da Cloudflare para garantir que os dados locais estejam atualizados.
        if domain.cloudflare_zone_id:
            try:
                tenant = domain.tenant
                service = CloudflareService(tenant.cloudflare_api_key, tenant.cloudflare_email)
                cf_records = service.get_dns_records(domain.cloudflare_zone_id)
                for record in cf_records:
                    DNSRecord.objects.update_or_create(
                        cloudflare_record_id=record['id'],
                        domain=domain,
                        defaults={
                            'name': record['name'],
                            'record_type': record['type'],
                            'content': record['content'],
                            'ttl': record['ttl'],
                            'proxied': record.get('proxied', False),
                        }
                    )
            except Exception as e:
                # Erro silencioso
                pass

        # 2. Busca a permissão específica do usuário para o registro A/AAAA neste domínio.
        try:
            permission = UserDomainPermission.objects.get(user=user, domain=domain)
            allowed_a_record = permission.allowed_a_record
        except UserDomainPermission.DoesNotExist:
            # Se o usuário não tem permissão, retorna uma lista vazia.
            return Response([], status=status.HTTP_200_OK)

        if not allowed_a_record:
            return Response([], status=status.HTTP_200_OK)

        # 3. Filtra os CNAMEs que apontam para o registro A/AAAA permitido.
        target_fqdn = allowed_a_record.name

        def normalize_name(name):
            return name.lower().rstrip('.')

        normalized_target = normalize_name(target_fqdn)
        
        all_cnames_for_domain = DNSRecord.objects.filter(domain_id=domain_id, record_type='CNAME')
        
        related_cnames = [
            cname for cname in all_cnames_for_domain 
            if normalize_name(cname.content) == normalized_target
        ]

        # 4. Monta a lista final apenas com os CNAMEs relacionados.
        final_records = related_cnames
        
        serializer = DNSRecordSerializer(final_records, many=True)
        return Response(serializer.data)

class UserDomainPermissionListCreateView(generics.ListCreateAPIView):
    queryset = UserDomainPermission.objects.all()
    serializer_class = UserDomainPermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class UserDomainPermissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserDomainPermission.objects.all()
    serializer_class = UserDomainPermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]


