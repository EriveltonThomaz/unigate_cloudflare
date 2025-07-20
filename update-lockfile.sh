#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Atualizando o arquivo pnpm-lock.yaml...${NC}"

# Verificar se o diretório frontend existe
if [ ! -d "frontend" ]; then
    echo -e "${RED}Diretório frontend não encontrado!${NC}"
    exit 1
fi

# Entrar no diretório frontend
cd frontend || { echo -e "${RED}Não foi possível entrar no diretório frontend!${NC}"; exit 1; }

# Verificar se o pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm não está instalado. Instalando...${NC}"
    npm install -g pnpm
fi

# Fazer backup do arquivo package.json e pnpm-lock.yaml
echo -e "${GREEN}Fazendo backup dos arquivos originais...${NC}"
cp package.json package.json.bak
cp pnpm-lock.yaml pnpm-lock.yaml.bak

# Atualizar o lockfile
echo -e "${GREEN}Atualizando o lockfile...${NC}"
pnpm install

echo -e "${GREEN}Lockfile atualizado com sucesso!${NC}"
echo -e "${YELLOW}Agora você pode construir a imagem Docker com:${NC}"
echo -e "docker build -t unigate-frontend:latest ."