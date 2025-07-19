# 🛠️ Correções Finais - Permissões para Gerentes

## 🔍 Problema Identificado e Solução

### ✅ **Permissões Apenas para Gerentes de Clientes**

**Problema**: As permissões estavam sendo exibidas para qualquer usuário existente, mesmo que não fosse gerente de nenhum cliente.

**Requisito**: As permissões só devem ser habilitadas para usuários que são gerentes de algum cliente, mesmo após a criação do usuário.

**Solução Aplicada**:

1. **Nova Função para Verificar Gerentes**:
```typescript
// Verifica se um usuário é gerente de algum tenant
export const isUserManagerOfAnyTenant = async (userId: string): Promise<boolean> => {
  try {
    const tenants = await getTenantsClient();
    
    // Verifica se o usuário é gerente de algum tenant
    for (const tenant of tenants) {
      const managers = await getTenantManagersClient(tenant.id);
      if (managers.some(manager => manager.id === userId)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar se o usuário é gerente:', error);
    return false;
  }
};
```

2. **Estado para Controlar se o Usuário é Gerente**:
```typescript
const [isUserManager, setIsUserManager] = useState<boolean>(false);
```

3. **Verificação ao Carregar o Usuário**:
```typescript
// Verificar se o usuário é gerente de algum tenant
const checkIfUserIsManager = async () => {
  const isManager = await isUserManagerOfAnyTenant(user.id);
  setIsUserManager(isManager);
  console.log(`[UserFormModal] Usuário ${user.id} é gerente: ${isManager}`);
  
  // Só carrega permissões se o usuário for gerente
  if (isManager && Array.isArray((user as any).permissions)) {
    // Carregar permissões...
  } else {
    setPermissions([]);
  }
};

checkIfUserIsManager();
```

4. **Condição para Exibir Permissões**:
```jsx
{/* Seção de permissões - apenas para usuários existentes, que são gerentes e quando admin está logado */}
{user && isCurrentUserAdmin && isUserManager && (
  <div className="mt-6">
    <h3 className="font-bold mb-2">Permissões de Domínio</h3>
    {/* Interface de permissões */}
  </div>
)}

{/* Mensagem para usuários existentes que não são gerentes */}
{user && isCurrentUserAdmin && !isUserManager && (
  <div className="mt-6">
    <h3 className="font-bold mb-2">Permissões de Domínio</h3>
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Permissões desativadas.</strong> Este usuário não é gerente de nenhum cliente. Vá para a seção de Clientes e adicione-o como gerente de um cliente para habilitar permissões.
          </p>
        </div>
      </div>
    </div>
  </div>
)}
```

5. **Condição para Enviar Permissões**:
```typescript
// Apenas enviar permissões para usuários existentes (não para novos)
// e apenas se for admin editando E o usuário for gerente de algum cliente
const isAdmin = currentUser?.role === 'admin';
if (user && isAdmin && isUserManager && permissions.length > 0) {
  const validPermissions = permissions
    .filter(perm => perm.tenantId && perm.domainId && perm.allowedARecords[0])
    .map(perm => ({
      tenant: perm.tenantId,
      domain: perm.domainId,
      allowed_a_record: perm.allowedARecords[0],
    }));
    
  form.append('permissions_input', JSON.stringify(validPermissions));
}
```

6. **Validação de Permissões**:
```typescript
// Validação de permissões para usuários existentes que são gerentes
const isAdmin = currentUser?.role === 'admin';
if (user && isAdmin && isUserManager && formData.role === 'user' && permissions.length === 0) {
  toast.warning('Recomendamos adicionar pelo menos uma permissão de domínio para este usuário. Você poderá adicionar mais permissões através do gerenciamento de clientes.');
}
```

7. **Botão de Salvar**:
```jsx
<Button 
  type="submit" 
  disabled={isSaving || (user && isCurrentUserAdmin && isUserManager && hasIncompletePermissions)} 
  className="bg-green-600 hover:bg-green-700"
>
  {isSaving ? 'Salvando...' : 'Salvar'}
</Button>
```

## 🚀 Fluxo de Trabalho Correto

### Para Criar um Novo Usuário:
1. Acesse Admin → Usuários
2. Clique em "Novo Usuário"
3. Preencha os dados básicos (nome, email, senha)
4. Salve o usuário (sem permissões)
5. Vá para Admin → Clientes
6. Selecione um cliente e clique em "Gerenciar Gerentes"
7. Adicione o usuário como gerente do cliente

### Para Editar um Usuário Existente:
1. Acesse Admin → Usuários
2. Clique em "Editar" no usuário desejado
3. Se o usuário for gerente de algum cliente, verá a seção de permissões
4. Se o usuário não for gerente, verá uma mensagem informativa
5. Salve as alterações

## 📋 Benefícios das Correções

1. **Fluxo de trabalho claro**: Usuários entendem que precisam ser gerentes para ter permissões
2. **Interface adaptativa**: Mostra informações relevantes com base no status do usuário
3. **Prevenção de erros**: Evita configurações inválidas de permissões
4. **Feedback informativo**: Mensagens claras sobre o que fazer para habilitar permissões

---

**✅ Sistema Pronto para Uso!**

Todas as correções foram implementadas e o sistema está funcionando conforme esperado. Os usuários agora têm uma experiência mais clara e intuitiva ao gerenciar usuários e permissões.

*Data: 18/07/2025 - 05:00*