#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   LIMPEZA COMPLETA DO AMBIENTE LOCAL DOCKER SWARM ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Remover stacks
echo -e "${YELLOW}Removendo stacks...${NC}"
docker stack rm traefik unigate-local

# Aguardar remoção dos serviços
echo -e "${YELLOW}Aguardando remoção dos serviços (10 segundos)...${NC}"
sleep 10

# Remover contêineres parados
echo -e "${YELLOW}Removendo contêineres parados...${NC}"
docker container prune -f

# Remover volumes não utilizados
echo -e "${YELLOW}Removendo volumes não utilizados...${NC}"
docker volume prune -f

# Remover redes não utilizadas
echo -e "${YELLOW}Removendo redes não utilizadas...${NC}"
docker network prune -f

# Remover imagens específicas
echo -e "${YELLOW}Removendo imagens específicas...${NC}"
docker rmi unigate-backend:prod unigate-frontend:simple 2>/dev/null || true

# Verificar status
echo -e "${YELLOW}Verificando status atual...${NC}"
echo -e "${YELLOW}Contêineres em execução:${NC}"
docker ps
echo -e "${YELLOW}Redes:${NC}"
docker network ls
echo -e "${YELLOW}Volumes:${NC}"
docker volume ls

echo -e "${GREEN}Limpeza concluída!${NC}"
echo -e "${GREEN}Agora você pode executar ./deploy-local.sh para implantar um ambiente limpo.${NC}"