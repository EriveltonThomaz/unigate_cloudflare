# 🔐 Credenciais do Sistema UNIATENDE TECHNOLOGY

## ✅ Status: PROBLEMAS DE LOGIN RESOLVIDOS

Todos os problemas de login e senha foram identificados e corrigidos com sucesso.

## 👥 Usuários Disponíveis

### 🔑 Administradores
| Email | Senha | Nome | Status |
|-------|-------|------|--------|
| temtudonaweb.td@gmail.com | `admin123` | Erivelton Thomaz | ✅ Ativo |
| admin@teste.com | `admin123` | Admin Teste | ✅ Ativo |

### 👤 Usuários Comuns
| Email | Senha | Nome | Status |
|-------|-------|------|--------|
| felipe@uniatende.com.br | `felipe123` | Felipe Martins | ✅ Ativo |
| w38unigate@gmail.com | `w38123` | Gabriel NanoClick | ✅ Ativo |
| w25unigate@gmail.com | `w25123` | Gabriel Martins | ✅ Ativo |
| drnocontrolecrm@gmail.com | `drno123` | Gabriel Oliveira | ✅ Ativo |
| pqdinformatica@gmail.com | `pqd123` | Gabriel Silva | ✅ Ativo |
| teste@exemplo.com | `123456` | Usuário Teste | ✅ Ativo |

## 🚀 Como Acessar o Sistema

### 1. Iniciar o Backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### 2. Iniciar o Frontend
```bash
cd frontend
npm run dev
```

### 3. Acessar a Aplicação
- **URL**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **API**: http://localhost:8000/api

## 🔧 Problemas Resolvidos

### ✅ 1. Senhas Inválidas
- **Problema**: Usuários não conseguiam fazer login
- **Causa**: Senhas não estavam definidas corretamente
- **Solução**: Redefinidas todas as senhas usando hash seguro

### ✅ 2. Configuração da API
- **Problema**: Frontend não conectava com o backend
- **Causa**: URL da API incorreta no arquivo `.env.local`
- **Solução**: Atualizada para `http://localhost:8000/api`

### ✅ 3. Autenticação JWT
- **Status**: Funcionando perfeitamente
- **Tokens**: Access (1h) e Refresh (7 dias)
- **Renovação**: Automática via interceptors

## 🧪 Teste Rápido de Login

```bash
# Testar login via API
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teste.com", "password": "admin123"}'
```

**Resposta esperada**: Tokens JWT válidos

## 🛠️ Ferramentas de Gerenciamento

### Script de Reset de Senhas
```bash
cd backend
source venv/bin/activate
python reset_passwords.py
```

### Comandos Django Úteis
```bash
# Listar usuários
python manage.py shell -c "from accounts.models import User; [print(f'{u.email} - {u.role}') for u in User.objects.all()]"

# Criar novo usuário
python manage.py shell -c "
from accounts.models import User
user = User(email='novo@email.com', first_name='Nome', last_name='Sobrenome', role='user', username='username')
user.set_password('senha123')
user.save()
"

# Alterar senha
python manage.py shell -c "
from accounts.models import User
user = User.objects.get(email='email@usuario.com')
user.set_password('nova_senha')
user.save()
"
```

## 🔒 Configurações de Segurança

### JWT Settings
- **Access Token**: 1 hora de validade
- **Refresh Token**: 7 dias de validade
- **Rotação**: Automática
- **Blacklist**: Ativo após rotação

### CORS Settings
- **Origens Permitidas**: localhost:3000, 127.0.0.1:3000
- **Credenciais**: Permitidas
- **Headers**: Authorization, Content-Type

### Autenticação
- **Método**: Email + Senha
- **Backend**: EmailBackend personalizado
- **Hash**: Django padrão (PBKDF2)

## 📊 Permissões por Role

### Admin
- ✅ Acesso total ao sistema
- ✅ Gerenciar usuários
- ✅ Gerenciar clientes (tenants)
- ✅ Todos os tipos de DNS records

### User
- ✅ Visualizar clientes atribuídos
- ✅ Visualizar domínios
- ✅ Gerenciar apenas registros CNAME
- 👁️ Visualizar registros A/AAAA
- ❌ Sem acesso a MX/TXT

## 🌐 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Aplicação principal |
| Login | http://localhost:3000/login | Página de login |
| Dashboard | http://localhost:3000/dashboard | Painel principal |
| Admin | http://localhost:3000/admin | Painel administrativo |
| API | http://localhost:8000/api | API REST |
| Docs API | http://localhost:8000/api/schema/swagger-ui/ | Documentação |

## 🚨 Próximos Passos Recomendados

1. **Implementar Reset de Senha por Email**
2. **Adicionar Validação de Força de Senha**
3. **Implementar Logs de Auditoria**
4. **Configurar Rate Limiting**
5. **Adicionar 2FA (Opcional)**

## 📞 Suporte

Para problemas adicionais:
1. Verificar logs do Django no terminal
2. Verificar console do navegador (F12)
3. Testar login via API diretamente
4. Executar script de reset de senhas

---

**✅ Sistema 100% Funcional - Problemas de Login Resolvidos**

*Última atualização: 18/07/2025 02:05*