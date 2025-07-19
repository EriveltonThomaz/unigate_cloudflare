#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Corrigindo o tema escuro nos modais...${NC}"

# Entrar no diretório frontend
cd frontend || { echo -e "${RED}Diretório frontend não encontrado!${NC}"; exit 1; }

# Corrigir o UserFormModal
echo -e "${GREEN}Corrigindo o UserFormModal...${NC}"
if [ -f "src/components/admin/users/UserFormModal.tsx" ]; then
    # Corrigir o título do modal
    sed -i 's|title = '"'"'Editar Usuário'"'"'|title = user ? '"'"'Editar Usuário'"'"' : '"'"'Adicionar Usuário'"'"'|g' src/components/admin/users/UserFormModal.tsx
    
    # Adicionar classes dark: para o tema escuro
    sed -i 's|bg-card shadow-xl border border-border|bg-card dark:bg-gray-800 shadow-xl border border-border dark:border-gray-700|g' src/components/admin/users/UserFormModal.tsx
    sed -i 's|border-b bg-card|border-b border-border dark:border-gray-700 bg-card dark:bg-gray-800|g' src/components/admin/users/UserFormModal.tsx
    sed -i 's|text-foreground|text-foreground dark:text-white|g' src/components/admin/users/UserFormModal.tsx
    
    echo -e "${GREEN}UserFormModal corrigido.${NC}"
else
    echo -e "${YELLOW}Arquivo src/components/admin/users/UserFormModal.tsx não encontrado.${NC}"
fi

# Corrigir o ManageTenantManagersModal
echo -e "${GREEN}Corrigindo o ManageTenantManagersModal...${NC}"
if [ -f "src/components/admin/tenants/ManageTenantManagersModal.tsx" ]; then
    # Adicionar classes dark: para o tema escuro
    sed -i 's|className="sm:max-w-\[600px\] max-h-\[90vh\] overflow-y-auto"|className="sm:max-w-\[600px\] max-h-\[90vh\] overflow-y-auto bg-white dark:bg-gray-800 text-foreground dark:text-white"|g' src/components/admin/tenants/ManageTenantManagersModal.tsx
    sed -i 's|<DialogTitle>|<DialogTitle className="text-foreground dark:text-white">|g' src/components/admin/tenants/ManageTenantManagersModal.tsx
    sed -i 's|bg-muted p-2|bg-muted dark:bg-gray-700 p-2|g' src/components/admin/tenants/ManageTenantManagersModal.tsx
    sed -i 's|<span>|<span className="text-foreground dark:text-white">|g' src/components/admin/tenants/ManageTenantManagersModal.tsx
    
    echo -e "${GREEN}ManageTenantManagersModal corrigido.${NC}"
else
    echo -e "${YELLOW}Arquivo src/components/admin/tenants/ManageTenantManagersModal.tsx não encontrado.${NC}"
fi

# Remover a pasta .next para limpar o cache
echo -e "${GREEN}Limpando o cache do Next.js...${NC}"
rm -rf .next

# Voltar ao diretório raiz
cd ..

echo -e "${GREEN}Correções aplicadas!${NC}"
echo -e "${YELLOW}Agora você pode iniciar o frontend com:${NC}"
echo -e "cd frontend && npm run dev"