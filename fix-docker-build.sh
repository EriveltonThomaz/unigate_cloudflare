#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Corrigindo problemas de build do Docker...${NC}"

# Verificar se os arquivos existem
if [ ! -f "frontend/Dockerfile.fixed" ] || [ ! -f "frontend/Dockerfile.simple" ] || [ ! -f "frontend/next.config.js.fixed" ] || [ ! -f "docker-compose.yml.fixed" ]; then
    echo -e "${RED}Arquivos de correção não encontrados!${NC}"
    exit 1
fi

# Fazer backup dos arquivos originais
echo -e "${GREEN}Fazendo backup dos arquivos originais...${NC}"
cp frontend/Dockerfile frontend/Dockerfile.bak
cp frontend/next.config.js frontend/next.config.js.bak
cp docker-compose.yml docker-compose.yml.bak

# Perguntar qual versão do Dockerfile usar
echo -e "${YELLOW}Qual versão do Dockerfile você deseja usar?${NC}"
echo -e "1) Versão otimizada (requer Docker BuildKit)"
echo -e "2) Versão simples (compatível com Docker padrão)"
read -p "Escolha (1/2): " dockerfile_choice

if [ "$dockerfile_choice" = "1" ]; then
    echo -e "${GREEN}Usando Dockerfile otimizado...${NC}"
    cp frontend/Dockerfile.fixed frontend/Dockerfile
else
    echo -e "${GREEN}Usando Dockerfile simples...${NC}"
    cp frontend/Dockerfile.simple frontend/Dockerfile
fi

# Aplicar as outras correções
echo -e "${GREEN}Aplicando outras correções...${NC}"
cp frontend/next.config.js.fixed frontend/next.config.js
cp docker-compose.yml.fixed docker-compose.yml

# Atualizar o arquivo pnpm-lock.yaml
echo -e "${GREEN}Atualizando o arquivo pnpm-lock.yaml...${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"
cd frontend && pnpm install && cd ..

echo -e "${GREEN}Correções aplicadas com sucesso!${NC}"
echo -e "${YELLOW}Agora você pode construir as imagens Docker com:${NC}"
echo -e "docker-compose build"
echo -e "${YELLOW}E iniciar os serviços com:${NC}"
echo -e "docker-compose up -d"
echo -e "${YELLOW}Para inicializar o banco de dados e criar um superusuário:${NC}"
echo -e "docker-compose --profile init up init_backend"