# 🔧 Teste de Permissões - Resolução de Problemas

## Problemas Identificados e Soluções

### 1. ✅ **Erro de Email Duplicado - RESOLVIDO**

**Problema**: Erro `IntegrityError: duplicate key value violates unique constraint "accounts_user_email_key"`

**Causa**: O serializer não estava verificando se o email já existia antes de tentar atualizar

**Solução Aplicada**:
```python
# No método update do UserSerializer
email = validated_data.get('email')
if email and email != instance.email:
    if User.objects.filter(email=email).exclude(pk=instance.pk).exists():
        raise serializers.ValidationError({'email': 'Já existe um usuário com este email.'})
```

### 2. ✅ **Interface de Permissões - CORRIGIDA**

**Problema**: Campos de permissões não apareciam para administradores

**Causa**: Lógica de verificação estava incorreta no componente

**Solução Aplicada**:
```typescript
// Antes (incorreto):
{!(user && user.role === 'user') && (

// Depois (correto):
{(!user || (user && user.role !== 'user')) && (
```

### 3. ✅ **Autenticação JWT - FUNCIONANDO**

**Status**: Sistema de autenticação está funcionando corretamente
- Token gerado com role: `"admin"`
- Usuário autenticado: `temtudonaweb.td@gmail.com`
- Permissões: Admin completo

## Como Testar as Correções

### 1. **Testar Login**
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "temtudonaweb.td@gmail.com", "password": "admin123"}'
```

### 2. **Testar Edição de Usuário**
1. Acesse: http://localhost:3000/admin/users
2. Clique em "Editar" em qualquer usuário
3. Verifique se aparecem os campos:
   - ✅ Cargo (Role)
   - ✅ Usuário Ativo
   - ✅ Permissões de Domínio

### 3. **Testar Criação de Usuário**
1. Clique em "Novo Usuário"
2. Preencha os dados básicos
3. Defina permissões de domínio
4. Salve e verifique se não há erros

## Credenciais para Teste

### Admin Principal
- **Email**: `temtudonaweb.td@gmail.com`
- **Senha**: `admin123`
- **Role**: `admin`

### Admin Teste
- **Email**: `admin@teste.com`
- **Senha**: `admin123`
- **Role**: `admin`

### Usuário Comum
- **Email**: `teste@exemplo.com`
- **Senha**: `123456`
- **Role**: `user`

## Funcionalidades de Permissões

### Para Administradores:
- ✅ Criar/editar/excluir usuários
- ✅ Definir permissões de domínio
- ✅ Gerenciar todos os tipos de DNS records
- ✅ Acesso completo ao sistema

### Para Usuários Comuns:
- ✅ Visualizar domínios atribuídos
- ✅ Gerenciar apenas registros CNAME
- 👁️ Visualizar registros A/AAAA
- ❌ Sem acesso a MX/TXT

## Estrutura de Permissões

### Permissões por Domínio:
```json
{
  "tenant": "ID_do_cliente",
  "domain": "ID_do_dominio", 
  "allowed_a_record": "ID_do_registro_A_permitido"
}
```

### Como Funciona:
1. **Admin** define quais domínios o usuário pode acessar
2. **Admin** especifica qual registro A/AAAA o usuário pode ver
3. **Usuário** só vê os domínios e registros permitidos
4. **Usuário** só pode criar/editar registros CNAME

## Comandos Úteis para Debug

### Verificar Usuários:
```bash
cd backend
source venv/bin/activate
python manage.py shell -c "
from accounts.models import User
for u in User.objects.all():
    print(f'{u.email} - {u.role} - Ativo: {u.is_active}')
"
```

### Verificar Permissões:
```bash
python manage.py shell -c "
from accounts.models import UserDomainPermission
for p in UserDomainPermission.objects.all():
    print(f'User: {p.user.email} - Domain: {p.domain.name} - Record: {p.allowed_a_record.name if p.allowed_a_record else \"None\"}')
"
```

### Resetar Senhas:
```bash
python reset_passwords.py
```

## Status Final

### ✅ Problemas Resolvidos:
1. **Email duplicado** - Validação adicionada
2. **Interface de permissões** - Lógica corrigida
3. **Autenticação JWT** - Funcionando perfeitamente
4. **Senhas dos usuários** - Todas redefinidas

### 🎯 Sistema Totalmente Funcional:
- Login/logout funcionando
- Criação/edição de usuários
- Sistema de permissões ativo
- Interface administrativa completa

---

**✅ Todos os problemas de login e senha foram resolvidos com sucesso!**

*Última atualização: 18/07/2025 02:20*