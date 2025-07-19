# Remoção do Botão "Gerenciar Permissões"

## Problema Identificado

O botão "Gerenciar Permissões" na página de usuários era redundante e causava confusão na interface, pois:

1. Já existe uma tabela completa de permissões na parte inferior da página que mostra todas as permissões de usuários por domínio
2. Cada permissão já pode ser editada ou excluída diretamente na tabela através dos botões de ação
3. O botão "Gerenciar Permissões" apenas abria o mesmo modal (UserDomainPermissionFormModal) que é usado para editar permissões individuais
4. A interface já tem uma maneira clara de adicionar novas permissões através da edição de usuários existentes

## Solução Implementada

Removemos o botão "Gerenciar Permissões" do cabeçalho da página de usuários, mantendo apenas o botão "Adicionar Usuário".

```diff
// frontend/src/components/admin/users/UserPageClient.tsx
        <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-5 w-5" />
          Adicionar Usuário
        </Button>
-       <Button onClick={() => setIsPermissionModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 ml-2">
-         <Shield className="mr-2 h-5 w-5" />
-         Gerenciar Permissões
-       </Button>
```

## Benefícios

1. **Interface mais limpa**: Menos botões no cabeçalho da página, tornando a interface mais focada
2. **Fluxo de trabalho mais claro**: Agora está mais claro que as permissões são gerenciadas diretamente na tabela de permissões
3. **Redução de redundância**: Eliminamos uma forma duplicada de acessar a mesma funcionalidade
4. **Consistência**: Mantém o padrão de editar permissões diretamente na tabela, como é feito com os usuários

## Observação

O código para abrir o modal de permissões foi mantido no componente, pois ainda é necessário para editar permissões existentes através da tabela. Apenas o botão adicional no cabeçalho foi removido.