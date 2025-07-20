#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CONFIGURAÇÃO DO AMBIENTE DE DESENVOLVIMENTO    ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Passo 1: Corrigir frontend
echo -e "${YELLOW}Passo 1: Corrigindo frontend...${NC}"
./corrigir-frontend-dev.sh

# Passo 2: Corrigir backend
echo -e "${YELLOW}Passo 2: Corrigindo backend...${NC}"
./corrigir-backend-dev.sh

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Configuração do ambiente de desenvolvimento concluída!${NC}"
echo -e "${GREEN}Agora você pode executar:${NC}"
echo -e "${GREEN}./executar-dev.sh${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Para parar os serviços posteriormente, execute:${NC}"
echo -e "${YELLOW}./parar-dev.sh${NC}"
echo -e "${BLUE}==================================================${NC}"