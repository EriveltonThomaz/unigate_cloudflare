#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Corrigindo o tema escuro em todas as páginas...${NC}"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm não está instalado. Por favor, instale o Node.js e npm primeiro.${NC}"
    exit 1
fi

# Entrar no diretório frontend
cd frontend || { echo -e "${RED}Diretório frontend não encontrado!${NC}"; exit 1; }

# Instalar next-themes se ainda não estiver instalado
echo -e "${GREEN}Verificando se next-themes está instalado...${NC}"
if ! grep -q "next-themes" package.json; then
    echo -e "${GREEN}Instalando next-themes...${NC}"
    npm install next-themes
else
    echo -e "${GREEN}next-themes já está instalado.${NC}"
fi

# Criar diretório de imagens se não existir
echo -e "${GREEN}Verificando diretório de imagens...${NC}"
mkdir -p public/images

# Verificar se o arquivo de imagem existe
if [ ! -f "public/images/iconeuniatende.png" ]; then
    echo -e "${YELLOW}Criando um arquivo de imagem placeholder...${NC}"
    # Criar um arquivo de imagem vazio (1x1 pixel)
    echo -e "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 -d > public/images/iconeuniatende.png
fi

# Corrigir o layout de admin para usar o mesmo Sidebar do dashboard
echo -e "${GREEN}Corrigindo o layout de admin para usar o mesmo Sidebar...${NC}"
if [ -f "src/app/admin/layout.tsx" ]; then
    # Substituir a importação do Sidebar
    sed -i 's|import Sidebar from '"'"'@/components/admin/Sidebar'"'"';|import Sidebar from '"'"'@/components/Layout/Sidebar'"'"';|g' src/app/admin/layout.tsx
    echo -e "${GREEN}Layout de admin atualizado para usar o mesmo Sidebar do dashboard.${NC}"
else
    echo -e "${YELLOW}Arquivo src/app/admin/layout.tsx não encontrado.${NC}"
fi

# Remover a pasta .next para limpar o cache
echo -e "${GREEN}Limpando o cache do Next.js...${NC}"
rm -rf .next

# Voltar ao diretório raiz
cd ..

echo -e "${GREEN}Correções aplicadas!${NC}"
echo -e "${YELLOW}Agora você pode iniciar o frontend com:${NC}"
echo -e "cd frontend && npm run dev"
echo -e "${YELLOW}E acessar o dashboard em:${NC}"
echo -e "http://localhost:3000/dashboard"
echo -e "${YELLOW}Ou a página de demonstração em:${NC}"
echo -e "http://localhost:3000/demo-simple"