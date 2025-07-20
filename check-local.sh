#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   VERIFICAÇÃO DO AMBIENTE LOCAL DOCKER SWARM     ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar serviços do Traefik
echo -e "${YELLOW}Verificando serviços do Traefik...${NC}"
docker stack services traefik

# Verificar serviços do UniGate
echo -e "\n${YELLOW}Verificando serviços do UniGate...${NC}"
docker stack services unigate-local

# Verificar contêineres em execução
echo -e "\n${YELLOW}Verificando contêineres em execução...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar imagens disponíveis
echo -e "\n${YELLOW}Verificando imagens disponíveis...${NC}"
docker images | grep -E 'unigate|traefik'

# Verificar redes
echo -e "\n${YELLOW}Verificando redes...${NC}"
docker network ls | grep -E 'traefik|unigate'

# Verificar volumes
echo -e "\n${YELLOW}Verificando volumes...${NC}"
docker volume ls | grep -E 'traefik|unigate'

# Verificar logs do Traefik
echo -e "\n${YELLOW}Logs do Traefik (últimas 10 linhas):${NC}"
TRAEFIK_CONTAINER=$(docker ps -q -f name=traefik)
if [ -n "$TRAEFIK_CONTAINER" ]; then
    docker logs --tail 10 $TRAEFIK_CONTAINER
else
    echo -e "${RED}Contêiner do Traefik não encontrado.${NC}"
fi

# Verificar logs do Backend
echo -e "\n${YELLOW}Logs do Backend (últimas 10 linhas):${NC}"
BACKEND_CONTAINER=$(docker ps -q -f name=unigate-local_backend)
if [ -n "$BACKEND_CONTAINER" ]; then
    docker logs --tail 10 $BACKEND_CONTAINER
else
    echo -e "${RED}Contêiner do Backend não encontrado.${NC}"
fi

# Verificar logs do Frontend
echo -e "\n${YELLOW}Logs do Frontend (últimas 10 linhas):${NC}"
FRONTEND_CONTAINER=$(docker ps -q -f name=unigate-local_frontend)
if [ -n "$FRONTEND_CONTAINER" ]; then
    docker logs --tail 10 $FRONTEND_CONTAINER
else
    echo -e "${RED}Contêiner do Frontend não encontrado.${NC}"
fi

# Verificar acessibilidade dos serviços
echo -e "\n${YELLOW}Verificando acessibilidade dos serviços...${NC}"

# Verificar Traefik Dashboard
echo -e "\n${YELLOW}Verificando Traefik Dashboard:${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/dashboard/ | grep -q "200\|401"; then
    echo -e "${GREEN}Traefik Dashboard está acessível!${NC}"
else
    echo -e "${RED}Traefik Dashboard não está acessível.${NC}"
fi

# Verificar Frontend
echo -e "\n${YELLOW}Verificando Frontend:${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200"; then
    echo -e "${GREEN}Frontend está acessível!${NC}"
else
    echo -e "${RED}Frontend não está acessível.${NC}"
fi

# Verificar Backend API
echo -e "\n${YELLOW}Verificando Backend API:${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/ | grep -q "200\|404"; then
    echo -e "${GREEN}Backend API está acessível!${NC}"
else
    echo -e "${RED}Backend API não está acessível.${NC}"
fi

# Verificar Admin
echo -e "\n${YELLOW}Verificando Admin:${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost/admin/ | grep -q "200\|302"; then
    echo -e "${GREEN}Admin está acessível!${NC}"
else
    echo -e "${RED}Admin não está acessível.${NC}"
fi

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${GREEN}Verificação concluída!${NC}"
echo -e "${BLUE}==================================================${NC}"