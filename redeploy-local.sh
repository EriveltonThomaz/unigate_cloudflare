#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   REIMPLANTAÇÃO DOS SERVIÇOS LOCAIS              ${NC}"
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

# Verificar se as imagens existem
if ! docker image inspect unigate-backend:prod &>/dev/null || ! docker image inspect unigate-frontend:simple &>/dev/null; then
    echo -e "${RED}Imagens não encontradas. Execute ./deploy-local.sh primeiro.${NC}"
    exit 1
fi

# Verificar se a rede traefik-public existe
if ! docker network ls | grep -q "traefik-public"; then
    echo -e "${RED}Rede traefik-public não encontrada. Execute ./deploy-local.sh primeiro.${NC}"
    exit 1
fi

# Remover stack anterior
echo -e "${YELLOW}Removendo stack anterior...${NC}"
docker stack rm unigate-local

# Aguardar remoção dos serviços
echo -e "${YELLOW}Aguardando remoção dos serviços (5 segundos)...${NC}"
sleep 5

# Reconstruir o frontend
echo -e "${YELLOW}Reconstruindo o frontend...${NC}"
docker-compose -f docker-compose.swarm.local.yml build frontend

# Implantar stack
echo -e "${YELLOW}Implantando stack local...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Verificar status
echo -e "${YELLOW}Verificando status dos serviços...${NC}"
docker stack services unigate-local

# Aguardar serviços iniciarem
echo -e "${YELLOW}Aguardando serviços iniciarem (10 segundos)...${NC}"
sleep 10

# Verificar status final
echo -e "${YELLOW}Verificando status final dos serviços...${NC}"
docker stack services unigate-local

# Informar sobre os próximos passos
echo -e "${YELLOW}Para criar um superusuário com credenciais simples, execute:${NC}"
echo -e "${GREEN}./create-superuser.sh${NC}"

echo -e "${YELLOW}Para coletar arquivos estáticos, execute:${NC}"
echo -e "${GREEN}./collect-static.sh${NC}"

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Reimplantação concluída!${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost${NC}"
echo -e "${GREEN}- Backend API: http://localhost/api${NC}"
echo -e "${GREEN}- Admin: http://localhost/admin${NC}"
echo -e "${GREEN}- Traefik Dashboard: http://localhost:8080/dashboard/${NC}"
echo -e "${BLUE}==================================================${NC}"