# Correção da Edição de Perfil para Usuários Comuns

## Problema Identificado

Quando um usuário comum tentava editar seu próprio perfil através do botão "Editar Perfil" no menu do usuário, ocorria o seguinte erro:

```
Erro ao salvar usuário na Server Action: Error: Você não tem permissão para executar essa ação.
```

Isso acontecia porque o sistema estava tentando usar o endpoint `/admin/users/{id}/` em vez de `/admin/profile/` para editar o perfil do usuário. O endpoint `/admin/users/{id}/` requer permissões de administrador, enquanto o endpoint `/admin/profile/` pode ser usado por qualquer usuário para editar seu próprio perfil.

## Causa Raiz

A verificação para determinar se o usuário estava editando seu próprio perfil não estava funcionando corretamente. O sistema tentava usar o `localStorage` para verificar se o ID do usuário logado correspondia ao ID do usuário sendo editado, mas essa abordagem não era confiável, especialmente em componentes do servidor.

## Solução Implementada

1. **Adicionamos uma flag explícita para edição de perfil**:
   - Adicionamos um novo parâmetro `isProfileEdit` ao componente `UserFormModal`
   - Quando o modal é aberto a partir do menu do usuário, essa flag é definida como `true`

2. **Modificamos a lógica de determinação do endpoint**:
   - Em vez de tentar verificar se o usuário está editando seu próprio perfil usando o `localStorage`, agora verificamos a flag `isProfileEdit`
   - Se `isProfileEdit` for `true`, sempre usamos o endpoint `/admin/profile/`
   - Removemos a flag antes de enviar os dados para o backend para não interferir com a API

3. **Atualizamos o componente UserMenu**:
   - Passamos a flag `isProfileEdit={true}` para o `UserFormModal` quando aberto a partir do menu do usuário

## Benefícios

1. **Funcionamento correto**: Usuários comuns agora podem editar seu próprio perfil sem erros de permissão
2. **Lógica mais clara**: A determinação do endpoint a ser usado é mais explícita e menos propensa a erros
3. **Independência do localStorage**: Não dependemos mais do `localStorage` para determinar se o usuário está editando seu próprio perfil

## Arquivos Modificados

1. **frontend/src/services/admin.service.ts**:
   - Modificada a lógica de determinação do endpoint para usar a flag `isProfileEdit`

2. **frontend/src/components/admin/UserMenu.tsx**:
   - Adicionada a flag `isProfileEdit={true}` ao abrir o `UserFormModal`

3. **frontend/src/components/admin/users/UserFormModal.tsx**:
   - Adicionado o parâmetro `isProfileEdit` à interface `UserFormModalProps`
   - Adicionada a flag `isProfileEdit` ao FormData enviado para o backend