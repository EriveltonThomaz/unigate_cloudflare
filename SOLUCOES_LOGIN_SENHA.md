# Soluções para Problemas de Login e Senha - UNIATENDE TECHNOLOGY

## Problemas Identificados e Soluções

### 1. **Senhas dos Usuários Existentes**

**Problema**: Os usuários existentes no sistema não possuem senhas válidas ou as senhas não estão funcionando.

**Solução**: Redefinir senhas para os usuários existentes:

```bash
# Ativar ambiente virtual
cd backend
source venv/bin/activate

# Redefinir senha do usuário admin
python manage.py shell -c "
from accounts.models import User
user = User.objects.get(email='temtudonaweb.td@gmail.com')
user.set_password('admin123')
user.save()
print('Senha do admin redefinida para: admin123')
"

# Redefinir senhas para outros usuários
python manage.py shell -c "
from accounts.models import User
users = [
    ('felipe@uniatende.com.br', 'felipe123'),
    ('pqdinformatica@gmail.com', 'pqd123'),
    ('w38unigate@gmail.com', 'w38123'),
    ('w25unigate@gmail.com', 'w25123'),
    ('drnocontrolecrm@gmail.com', 'drno123')
]
for email, password in users:
    try:
        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()
        print(f'Senha redefinida para {email}: {password}')
    except User.DoesNotExist:
        print(f'Usuário {email} não encontrado')
"
```

### 2. **Configuração da URL da API no Frontend**

**Problema**: A URL da API estava configurada para um IP específico, causando problemas de conectividade.

**Solução**: Atualizar o arquivo `.env.local` no frontend:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Para produção, use o IP correto do servidor:
```bash
NEXT_PUBLIC_API_URL=http://192.168.34.65:8000/api
```

### 3. **Verificação do Sistema de Autenticação**

**Status**: ✅ **Funcionando Corretamente**

O sistema de autenticação está configurado corretamente:
- JWT tokens funcionando
- Backend de autenticação por email ativo
- Middleware de CORS configurado
- Interceptors do Axios funcionando

### 4. **Usuários Disponíveis para Teste**

| Email | Senha | Role | Status |
|-------|-------|------|--------|
| temtudonaweb.td@gmail.com | admin123 | admin | ✅ Ativo |
| felipe@uniatende.com.br | felipe123 | user | ✅ Ativo |
| teste@exemplo.com | 123456 | user | ✅ Ativo |

## Como Executar o Sistema

### 1. **Backend (Django)**

```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### 2. **Frontend (Next.js)**

```bash
cd frontend
npm run dev
```

### 3. **Acessar o Sistema**

- Frontend: http://localhost:3000
- Login: http://localhost:3000/login
- API: http://localhost:8000/api

## Comandos Úteis para Gerenciamento de Usuários

### Criar Novo Usuário

```bash
python manage.py shell -c "
from accounts.models import User
user = User(
    email='novo@usuario.com',
    first_name='Nome',
    last_name='Sobrenome',
    role='user',  # ou 'admin'
    username='nome_usuario'
)
user.set_password('senha123')
user.save()
print(f'Usuário criado: {user.email}')
"
```

### Listar Todos os Usuários

```bash
python manage.py shell -c "
from accounts.models import User
users = User.objects.all()
for user in users:
    print(f'ID: {user.id}, Email: {user.email}, Role: {user.role}, Ativo: {user.is_active}')
print(f'Total: {users.count()}')
"
```

### Alterar Role de Usuário

```bash
python manage.py shell -c "
from accounts.models import User
user = User.objects.get(email='usuario@email.com')
user.role = 'admin'  # ou 'user'
user.save()
print(f'Role alterado para: {user.role}')
"
```

### Ativar/Desativar Usuário

```bash
python manage.py shell -c "
from accounts.models import User
user = User.objects.get(email='usuario@email.com')
user.is_active = True  # ou False
user.save()
print(f'Usuário {\"ativado\" if user.is_active else \"desativado\"}')
"
```

## Teste de Login via API

Para testar se o login está funcionando:

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "temtudonaweb.td@gmail.com", "password": "admin123"}'
```

Resposta esperada:
```json
{
  "refresh": "eyJ...",
  "access": "eyJ..."
}
```

## Problemas Comuns e Soluções

### 1. **Erro 401 Unauthorized**
- Verificar se a senha está correta
- Verificar se o usuário está ativo
- Verificar se o email está correto

### 2. **Erro de Conexão com API**
- Verificar se o backend está rodando
- Verificar a URL da API no frontend
- Verificar configurações de CORS

### 3. **Token Expirado**
- O sistema possui refresh automático de tokens
- Tokens de acesso expiram em 1 hora
- Tokens de refresh expiram em 7 dias

### 4. **Problemas de CORS**
- Verificar se o frontend está na lista de origens permitidas
- Verificar se `CORS_ALLOW_CREDENTIALS = True`

## Configurações de Segurança

### JWT Settings
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### CORS Settings
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.34.65:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

## Monitoramento e Logs

Para verificar logs de autenticação:

```bash
# Ver logs do Django
tail -f backend/django.log

# Ver logs do servidor de desenvolvimento
# Os logs aparecem no terminal onde o runserver está executando
```

## Próximos Passos Recomendados

1. **Implementar Reset de Senha**: Criar funcionalidade para usuários resetarem suas próprias senhas
2. **Melhorar Validação**: Adicionar validações mais robustas para senhas
3. **Auditoria**: Implementar logs de tentativas de login
4. **2FA**: Considerar implementar autenticação de dois fatores
5. **Rate Limiting**: Implementar limitação de tentativas de login

---

**Status**: ✅ **Problemas de Login e Senha Resolvidos**

O sistema está funcionando corretamente com as credenciais atualizadas.