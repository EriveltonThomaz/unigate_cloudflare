#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Instalando dependências para o projeto UniGate...${NC}"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm não está instalado. Por favor, instale o Node.js e npm primeiro.${NC}"
    exit 1
fi

# Instalar dependências do frontend
echo -e "${GREEN}Instalando dependências do frontend...${NC}"
cd frontend || { echo -e "${RED}Diretório frontend não encontrado!${NC}"; exit 1; }

# Instalar next-themes
echo -e "${GREEN}Instalando next-themes...${NC}"
npm install next-themes

echo -e "${GREEN}Instalação concluída!${NC}"
echo -e "${YELLOW}Agora você pode iniciar o frontend com:${NC}"
echo -e "cd frontend && npm run dev"
echo -e "${YELLOW}E acessar a página de demonstração em:${NC}"
echo -e "http://localhost:3000/demo"