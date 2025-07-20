#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   RECONSTRUINDO FRONTEND REAL DO PROJETO          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se o Docker está em modo Swarm
if ! docker info | grep -q "Swarm: active"; then
    echo -e "${RED}Docker não está em modo Swarm. Execute ./deploy-local.sh primeiro.${NC}"
    exit 1
fi

# Remover stack anterior
echo -e "${YELLOW}Removendo stack anterior...${NC}"
docker stack rm unigate-local

# Aguardar remoção dos serviços
echo -e "${YELLOW}Aguardando remoção dos serviços (5 segundos)...${NC}"
sleep 5

# Reconstruir o frontend
echo -e "${YELLOW}Reconstruindo o frontend real...${NC}"
docker-compose -f docker-compose.swarm.local.yml build frontend

# Implantar stack
echo -e "${YELLOW}Implantando stack local...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Verificar status
echo -e "${YELLOW}Verificando status dos serviços...${NC}"
docker stack services unigate-local

# Aguardar serviços iniciarem
echo -e "${YELLOW}Aguardando serviços iniciarem (15 segundos)...${NC}"
sleep 15

# Verificar status final
echo -e "${YELLOW}Verificando status final dos serviços...${NC}"
docker stack services unigate-local

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Reconstrução do frontend real concluída!${NC}"
echo -e "${GREEN}Você pode acessar o frontend em: http://localhost/${NC}"
echo -e "${GREEN}Você pode acessar o admin em: http://localhost/admin/${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Lembre-se de executar:${NC}"
echo -e "${GREEN}./create-superuser.sh${NC}"
echo -e "${GREEN}./collect-static.sh${NC}"
echo -e "${BLUE}==================================================${NC}"