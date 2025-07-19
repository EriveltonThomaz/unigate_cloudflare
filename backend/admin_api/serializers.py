
# backend/admin_api/serializers.py
import json
from rest_framework import serializers
from tenants.models import Tenant
from domains.models import Domain, DNSRecord # Importar DNSRecord
from cloudflare_keys.models import CloudflareKey # Importar o modelo CloudflareKey
from django.contrib.auth import get_user_model
from accounts.models import UserDomainPermission

User = get_user_model()

class NestedDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ['id', 'name', 'proxied']

class TenantManagerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']

class TenantSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    domains = NestedDomainSerializer(many=True, read_only=True)
    managers = TenantManagerSerializer(many=True, read_only=True)

    class Meta:
        model = Tenant
        fields = ['id', 'name', 'cloudflare_email', 'created_at', 'owner_email', 'domains', 'managers']

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField(read_only=True)
    permissions_input = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    email = serializers.EmailField(required=True, allow_blank=False)
    password = serializers.CharField(write_only=True, required=False)  # Adicionado para aceitar senha no validated_data

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role',
            'is_active', 'date_joined', 'permissions', 'permissions_input',
            'password'  # Adicionado password aos fields
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_permissions(self, obj):
        from accounts.models import UserDomainPermission
        from tenants.models import Tenant
        from domains.models import Domain
        # Permissões por domínio
        perms = UserDomainPermission.objects.filter(user=obj)
        permissions = [
            {
                'tenant': perm.domain.tenant.id,
                'tenant_name': perm.domain.tenant.name,
                'domain': perm.domain.id,
                'domain_name': perm.domain.name,
                'allowed_a_record': perm.allowed_a_record.id if perm.allowed_a_record else None,
                'allowed_a_record_name': f'{perm.allowed_a_record.name} ({perm.allowed_a_record.content})' if perm.allowed_a_record else '',
            }
            for perm in perms
        ]
        # Adiciona tenants onde o usuário é gerente, mesmo sem UserDomainPermission
        managed_tenants = obj.managed_tenants.all()
        for tenant in managed_tenants:
            tenant_domains = Domain.objects.filter(tenant=tenant)
            for domain in tenant_domains:
                if not any(p['domain'] == domain.id for p in permissions):
                    permissions.append({
                        'tenant': tenant.id,
                        'tenant_name': tenant.name,
                        'domain': domain.id,
                        'domain_name': domain.name,
                        'allowed_a_record': None,
                        'allowed_a_record_name': '',
                    })
        return permissions

    def validate(self, data):
        import logging
        logger = logging.getLogger('django')
        
        logger.info(f'[UserSerializer:validate] data recebida: {data}')
        logger.info(f'[UserSerializer:validate] email: {data.get("email")}')
        logger.info(f'[UserSerializer:validate] email type: {type(data.get("email"))}')
        
        # Validação específica do email
        email = data.get('email', '').strip() if data.get('email') else None
        if not email:
            logger.error('[UserSerializer:validate] Email está vazio ou None')
            raise serializers.ValidationError({'email': 'Este campo não pode ser em branco.'})
        
        # Validação de formato de email
        import re
        email_pattern = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
        if not email_pattern.match(email):
            logger.error(f'[UserSerializer:validate] Email inválido: {email}')
            raise serializers.ValidationError({'email': 'Email inválido.'})
        
        if not data.get('first_name', '').strip():
            raise serializers.ValidationError({'first_name': 'Nome é obrigatório.'})
        if not data.get('last_name', '').strip():
            raise serializers.ValidationError({'last_name': 'Sobrenome é obrigatório.'})
        return data

    def create(self, validated_data):
        import logging
        logger = logging.getLogger('django')
        
        permissions_input = validated_data.pop('permissions_input', '[]')
        logger.info(f'[UserSerializer:create] permissions_input (raw): {permissions_input}')
        logger.info(f'[UserSerializer:create] permissions_input type: {type(permissions_input)}')
        
        permissions = []
        try:
            if isinstance(permissions_input, list):
                permissions_input = permissions_input[0] if permissions_input else '[]'
                logger.info(f'[UserSerializer:create] permissions_input from list: {permissions_input}')
            permissions = json.loads(permissions_input)
        except json.JSONDecodeError as e:
            logger.error(f'[UserSerializer:create] Erro ao parsear permissions_input: {e}')
            permissions = []
        except Exception as e:
            logger.error(f'[UserSerializer:create] Erro inesperado ao processar permissions_input: {e}')
            permissions = []
        logger.info(f'[UserSerializer:create] permissions (parsed): {permissions}')

        if 'username' not in validated_data or not validated_data.get('username'):
            validated_data['username'] = validated_data['email']
        
        password = validated_data.pop('password', None)
        if isinstance(password, list):
            password = password[0] if password else None
        if not password:
            raise serializers.ValidationError({'password': 'A senha é obrigatória para criar o usuário.'})
        user = User.objects.create_user(**validated_data, password=password)
        self._save_permissions(user, permissions)
        return user

    def update(self, instance, validated_data):
        import logging
        logger = logging.getLogger('django')
        logger.info(f'[UserSerializer:update] validated_data recebido: {validated_data}')
        
        # Extrair permissions_input antes de processar outros dados
        permissions_input = validated_data.pop('permissions_input', '[]')
        permissions = []
        try:
            if isinstance(permissions_input, list):
                permissions_input = permissions_input[0] if permissions_input else '[]'
            permissions = json.loads(permissions_input)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f'[UserSerializer:update] Erro ao processar permissions: {e}')
            permissions = []
        
        # Verificar se o email está sendo alterado para um que já existe
        email = validated_data.get('email')
        if email:
            email = email.strip().lower()  # Normalizar email
            instance_email = instance.email.strip().lower() if instance.email else ''
            
            logger.info(f'[UserSerializer:update] Email normalizado: {email}')
            logger.info(f'[UserSerializer:update] Email atual normalizado: {instance_email}')
            logger.info(f'[UserSerializer:update] Emails são diferentes? {email != instance_email}')
            
            # Só verificar duplicata se o email realmente mudou
            if email != instance_email:
                existing_user = User.objects.filter(email__iexact=email).exclude(pk=instance.pk).first()
                if existing_user:
                    logger.error(f'[UserSerializer:update] Email {email} já existe para usuário ID {existing_user.pk}')
                    raise serializers.ValidationError({'email': 'Já existe um usuário com este email.'})
                else:
                    logger.info(f'[UserSerializer:update] Email {email} está disponível para alteração')
            else:
                logger.info(f'[UserSerializer:update] Email não foi alterado, prosseguindo...')
        
        # Processar senha
        password = validated_data.pop('password', None)
        logger.info(f'[UserSerializer:update] password recebido: {password}')
        if password:
            instance.set_password(password)
            logger.info('[UserSerializer:update] Senha alterada com sucesso!')
        
        # Garantir que is_active seja preservado para usuários comuns editando a si mesmos
        # Se o usuário for comum e estiver editando a si mesmo, não permitir desativar
        request = self.context.get('request')
        if request and request.user.role == 'user' and request.user.id == instance.id:
            # Remover is_active do validated_data para não alterar
            validated_data.pop('is_active', None)
            logger.info('[UserSerializer:update] Usuário comum editando a si mesmo - is_active preservado')
        else:
            # Log do valor de is_active
            is_active = validated_data.get('is_active')
            if is_active is not None:
                logger.info(f'[UserSerializer:update] is_active será definido como: {is_active}')
        
        # Atualizar outros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Salvar permissões se fornecidas
        if permissions:
            self._save_permissions(instance, permissions)
        
        return instance

    def _save_permissions(self, user, permissions):
        import logging
        logger = logging.getLogger('django')
        logger.info(f'[UserSerializer:_save_permissions] user={user.id} email={user.email} permissions={permissions}')
        
        # Se não houver permissões, não faz nada
        if not permissions:
            logger.info(f'[UserSerializer:_save_permissions] Nenhuma permissão fornecida para o usuário {user.email}')
            return
            
        from accounts.models import UserDomainPermission
        from domains.models import Domain, DNSRecord
        from tenants.models import Tenant
        
        # Validar permissões antes de salvar
        valid_permissions = []
        for perm in permissions:
            try:
                tenant_id = int(perm.get('tenant'))
                domain_id = int(perm.get('domain'))
                record_id = int(perm.get('allowed_a_record'))
                
                # Verificar se o tenant existe
                tenant_exists = Tenant.objects.filter(id=tenant_id).exists()
                if not tenant_exists:
                    logger.warning(f'[UserSerializer:_save_permissions] Tenant {tenant_id} não existe')
                    continue
                    
                # Verificar se o domínio existe e pertence ao tenant
                domain_exists = Domain.objects.filter(id=domain_id, tenant_id=tenant_id).exists()
                if not domain_exists:
                    logger.warning(f'[UserSerializer:_save_permissions] Domínio {domain_id} não existe ou não pertence ao tenant {tenant_id}')
                    continue
                    
                # Verificar se o registro existe e pertence ao domínio
                record_exists = DNSRecord.objects.filter(id=record_id, domain_id=domain_id).exists()
                if not record_exists:
                    logger.warning(f'[UserSerializer:_save_permissions] Registro {record_id} não existe ou não pertence ao domínio {domain_id}')
                    continue
                    
                # Se passou por todas as validações, adiciona à lista de permissões válidas
                valid_permissions.append(perm)
                
            except (ValueError, TypeError) as e:
                logger.error(f'[UserSerializer:_save_permissions] Erro ao validar permissão {perm}: {e}')
                continue
        
        # Se não houver permissões válidas, não faz nada
        if not valid_permissions:
            logger.warning(f'[UserSerializer:_save_permissions] Nenhuma permissão válida para o usuário {user.email}')
            return
            
        # Processar permissões válidas
        current_perms = set(UserDomainPermission.objects.filter(user=user).values_list('domain_id', 'allowed_a_record_id'))
        new_perms = set((int(p['domain']), int(p['allowed_a_record'])) for p in valid_permissions)
        
        # Remover permissões que não estão mais na lista
        for domain_id, record_id in current_perms - new_perms:
            UserDomainPermission.objects.filter(user=user, domain_id=domain_id, allowed_a_record_id=record_id).delete()
            logger.info(f'[UserSerializer:_save_permissions] Removida permissão: domínio={domain_id}, registro={record_id}')
        
        # Adicionar novas permissões
        for perm in valid_permissions:
            try:
                obj, created = UserDomainPermission.objects.get_or_create(
                    user=user,
                    domain_id=perm['domain'],
                    allowed_a_record_id=perm['allowed_a_record']
                )
                if created:
                    logger.info(f'[UserSerializer:_save_permissions] Criada permissão: domínio={perm["domain"]}, registro={perm["allowed_a_record"]}')
            except Exception as e:
                logger.error(f'[UserSerializer:_save_permissions] Erro ao criar permissão {perm}: {e}')

class DNSRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DNSRecord
        fields = ['id', 'name', 'record_type', 'content', 'ttl', 'proxied', 'cloudflare_record_id']
        read_only_fields = ['cloudflare_record_id'] # Cloudflare ID é gerado pela API

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        # Se o usuário não for admin, aplicar restrições
        if user and user.role != 'admin':
            record_type = data.get('record_type')
            name = data.get('name')
            content = data.get('content')

            # Usuários comuns só podem gerenciar registros CNAME
            if record_type and record_type.upper() != 'CNAME':
                raise serializers.ValidationError("Usuários comuns só podem gerenciar registros do tipo CNAME.")

            # Validar que é um subdomínio válido
            if name and name.count('.') < 2: # Ex: 'sub.domain.com' tem 2 pontos
                raise serializers.ValidationError("Usuários comuns só podem criar subdomínios.")

            # Validar que o conteúdo do CNAME é fornecido
            if record_type and record_type.upper() == 'CNAME' and not content:
                raise serializers.ValidationError("O conteúdo do registro CNAME é obrigatório.")

        return data

class DomainSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    dns_records = DNSRecordSerializer(many=True, read_only=True) # Aninhar registros DNS
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Domain
        fields = ['id', 'name', 'tenant', 'tenant_name', 'proxied', 'status', 'created_at', 'dns_records', 'cloudflare_zone_id']
        extra_kwargs = {
            'tenant': {'write_only': True}
        }

    def validate(self, data):
        tenant = data.get('tenant') or self.instance.tenant if self.instance else None
        name = data.get('name') or self.instance.name if self.instance else None
        if tenant and name:
            if Domain.objects.filter(tenant=tenant, name=name).exclude(pk=getattr(self.instance, 'pk', None)).exists():
                raise serializers.ValidationError('Já existe um domínio com esse nome para este cliente.')
        return data

class CloudflareKeySerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = CloudflareKey
        fields = ['id', 'email', 'api_key', 'tenant', 'tenant_name', 'created_at']
        extra_kwargs = {
            'api_key': {'write_only': True}, # A chave API é write-only por segurança
            'tenant': {'write_only': True}
        }

class TenantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'cloudflare_api_key', 'cloudflare_email']

class RecentSubdomainSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    tenant_name = serializers.CharField(source='domain.tenant.name', read_only=True)

    class Meta:
        model = DNSRecord
        fields = ['id', 'name', 'record_type', 'content', 'created_at', 'domain_name', 'tenant_name']

class UserDomainPermissionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    allowed_a_record_name = serializers.SerializerMethodField()

    class Meta:
        model = UserDomainPermission
        fields = ['id', 'user', 'user_name', 'domain', 'domain_name', 'allowed_a_record', 'allowed_a_record_name']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        import logging
        logger = logging.getLogger('django')
        logger.info(f'[UserDomainPermissionSerializer] id={instance.id} user={instance.user_id} domain={instance.domain_id} allowed_a_record={instance.allowed_a_record_id}')
        return data

    def get_allowed_a_record_name(self, obj):
        if obj.allowed_a_record:
            return f"{obj.allowed_a_record.name} ({obj.allowed_a_record.content})"
        return ''

    def validate_user(self, value):
        if not User.objects.filter(id=value.id, role='user').exists():
            raise serializers.ValidationError("Usuário inválido ou não é do tipo 'user'.")
        return value

    def validate(self, data):
        # allowed_a_record obrigatório
        if not data.get('allowed_a_record'):
            raise serializers.ValidationError({'allowed_a_record': 'Selecione um registro A/AAAA válido.'})
        # O registro deve pertencer ao domínio selecionado
        if data.get('domain') and data.get('allowed_a_record'):
            if data['allowed_a_record'].domain_id != data['domain'].id:
                raise serializers.ValidationError({'allowed_a_record': 'O registro não pertence ao domínio selecionado.'})
        return data
