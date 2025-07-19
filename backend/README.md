# Backend - UNIATENDE TECHNOLOGY

## Visão Geral

O backend do sistema UNIATENDE TECHNOLOGY é desenvolvido em Django 5.2 com Django REST Framework, fornecendo uma API RESTful robusta para gerenciamento de domínios e subdomínios via Cloudflare.

## Arquitetura

### Tecnologias
- **Django 5.2**: Framework web principal
- **Django REST Framework**: API RESTful
- **PostgreSQL**: Banco de dados principal
- **JWT**: Autenticação via djangorestframework-simplejwt
- **Python 3.11+**: Linguagem de programação

### Estrutura de Apps

```
backend/
├── accounts/           # Autenticação e usuários
├── admin_api/         # API de administração
├── cloudflare_api/    # Integração Cloudflare
├── cloudflare_keys/   # Gerenciamento de chaves API
├── core/              # Configurações centrais
├── domains/           # Modelos de domínios
└── tenants/           # Modelos de tenants
```

## Modelos de Dados

### User (Usuário)
```python
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    managed_tenants = models.ManyToManyField('Tenant', related_name='managers')
```

### Tenant (Cliente)
```python
class Tenant(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    managers = models.ManyToManyField(User, related_name='managed_tenants')
    name = models.CharField(max_length=100)
    cloudflare_api_key = models.CharField(max_length=100)
    cloudflare_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
```

### Domain (Domínio)
```python
class Domain(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    proxied = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### DNSRecord (Registro DNS)
```python
class DNSRecord(models.Model):
    RECORD_TYPES = [
        ('A', 'A'),
        ('AAAA', 'AAAA'),
        ('CNAME', 'CNAME'),
        ('MX', 'MX'),
        ('TXT', 'TXT'),
    ]
    
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    record_type = models.CharField(max_length=10, choices=RECORD_TYPES)
    content = models.TextField()
    ttl = models.IntegerField(default=3600)
    proxied = models.BooleanField(default=False)
    cloudflare_record_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

## Sistema de Permissões

### Roles de Usuário
- **admin**: Acesso total ao sistema
- **member**: Usuário comum com restrições

### Permissões por Tipo de Registro DNS

| Tipo | Admin | Member |
|------|-------|--------|
| A    | ✅ CRUD | 👁️ Apenas visualização |
| AAAA | ✅ CRUD | 👁️ Apenas visualização |
| CNAME| ✅ CRUD | ✅ CRUD |
| MX   | ✅ CRUD | ❌ Sem acesso |
| TXT  | ✅ CRUD | ❌ Sem acesso |

## API Endpoints

### Autenticação
```
POST /auth/token/           # Login
POST /auth/token/refresh/   # Refresh token
GET  /auth/me/             # Perfil do usuário
GET  /auth/stats/          # Estatísticas gerais
```

### Administração
```
GET    /admin/dashboard-stats/           # Estatísticas do dashboard
GET    /admin/recent-tenants/            # Clientes recentes
GET    /admin/recent-subdomains/         # Subdomínios recentes
GET    /admin/users/                     # Lista de usuários
POST   /admin/users/                     # Criar usuário
PUT    /admin/users/{id}/                # Atualizar usuário
DELETE /admin/users/{id}/                # Excluir usuário
```

### Gerenciamento de Clientes
```
GET    /admin/tenants/                   # Lista de clientes
POST   /admin/tenants/create/            # Criar cliente
PUT    /admin/tenants/{id}/              # Atualizar cliente
DELETE /admin/tenants/{id}/              # Excluir cliente
GET    /admin/tenants/{id}/managers/     # Gerentes do cliente
POST   /admin/tenants/{id}/managers/     # Adicionar gerente
DELETE /admin/tenants/{id}/managers/{user_id}/ # Remover gerente
```

### Gerenciamento de Domínios
```
GET    /admin/domains/                   # Lista de domínios
POST   /admin/domains/                   # Criar domínio
PUT    /admin/domains/{id}/              # Atualizar domínio
DELETE /admin/domains/{id}/              # Excluir domínio
GET    /admin/tenants/{id}/domains/      # Domínios de um cliente
```

### Gerenciamento de DNS Records
```
GET    /admin/dns-records/               # Lista de registros DNS
POST   /admin/dns-records/               # Criar registro DNS
GET    /admin/dns-records/{id}/          # Detalhes do registro
PUT    /admin/dns-records/{id}/          # Atualizar registro DNS
DELETE /admin/dns-records/{id}/          # Excluir registro DNS
GET    /admin/domains/{id}/dns-records/  # Registros de um domínio
```

## Serializers

### Validações Customizadas
```python
class DNSRecordSerializer(serializers.ModelSerializer):
    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        if user and user.role != 'admin':
            record_type = data.get('record_type')
            if record_type and record_type.upper() != 'CNAME':
                raise serializers.ValidationError(
                    "Usuários comuns só podem gerenciar registros do tipo CNAME."
                )
        return data
```

## Integração Cloudflare

### Serviços
```python
# cloudflare_api/services.py
def get_zones(api_key, email):
    """Lista todas as zonas da Cloudflare"""
    
def get_dns_records(zone_id, api_key, email):
    """Lista registros DNS de uma zona"""
    
def create_dns_record(zone_id, api_key, email, record_type, name, content, ttl=1, proxied=False):
    """Cria um novo registro DNS"""
    
def delete_dns_record(zone_id, record_id, api_key, email):
    """Deleta um registro DNS"""
```

### Configuração
```python
# settings.py
CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4'
CLOUDFLARE_DEFAULT_TTL = 3600
```

## Segurança

### Autenticação JWT
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### Permissões Customizadas
```python
# admin_api/permissions.py
class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'
```

### Validação de Dados
- Sanitização automática de inputs
- Validação de tipos de registro DNS
- Verificação de propriedade de recursos
- Proteção contra SQL injection

## Configuração

### Variáveis de Ambiente
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Cloudflare
CLOUDFLARE_API_URL=https://api.cloudflare.com/client/v4
CLOUDFLARE_DEFAULT_TTL=3600
```

### Instalação
```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Executar servidor
python manage.py runserver
```

## Testes

### Executar Testes
```bash
# Todos os testes
python manage.py test

# Testes específicos
python manage.py test admin_api.tests
python manage.py test domains.tests
```

### Cobertura de Testes
```bash
# Instalar coverage
pip install coverage

# Executar com coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## Deploy

### Produção
```bash
# Configurações de produção
DEBUG=False
ALLOWED_HOSTS=your-domain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## Monitoramento

### Logs
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Health Checks
```python
# admin_api/views.py
class HealthCheckView(APIView):
    def get(self, request):
        return Response({'status': 'healthy'})
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Execute os testes
6. Faça commit das mudanças
7. Abra um Pull Request

## Licença

Este projeto está sob a licença ISC. 