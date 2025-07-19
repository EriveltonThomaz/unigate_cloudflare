#!/bin/bash

# Cria diretórios principais
mkdir -p components/Auth
mkdir -p components/Dashboard
mkdir -p components/UI
mkdir -p pages/domains
mkdir -p pages/users
mkdir -p services
mkdir -p contexts
mkdir -p utils

# Cria arquivos iniciais de exemplo
touch components/Auth/LoginForm.tsx
touch components/Auth/RegisterForm.tsx
touch components/Dashboard/DomainList.tsx
touch components/Dashboard/UserList.tsx
touch components/Dashboard/ApiKeyForm.tsx
touch components/UI/Button.tsx
touch components/UI/Modal.tsx
touch components/UI/Toast.tsx
touch pages/login.tsx
touch pages/register.tsx
touch pages/dashboard.tsx
touch pages/domains/[id].tsx
touch pages/users/[id].tsx
touch services/api.ts
touch services/auth.ts
touch contexts/AuthContext.tsx
touch contexts/RoleContext.tsx
touch utils/rbac.ts

echo "Estrutura de diretórios e arquivos iniciais criada com sucesso!"
