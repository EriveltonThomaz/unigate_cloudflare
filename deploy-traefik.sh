#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Implantando Traefik no Docker Swarm...${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se o Docker está em modo Swarm
if ! docker info | grep -q "Swarm: active"; then
    echo -e "${YELLOW}Docker não está em modo Swarm. Inicializando Swarm...${NC}"
    docker swarm init || {
        echo -e "${RED}Falha ao inicializar o Swarm. Por favor, inicialize manualmente.${NC}"
        exit 1
    }
fi

# Verificar se a rede traefik-public existe
if ! docker network ls | grep -q "traefik-public"; then
    echo -e "${YELLOW}Criando rede traefik-public...${NC}"
    docker network create --driver=overlay --attachable traefik-public
fi

# Implantar Traefik
echo -e "${YELLOW}Implantando Traefik...${NC}"
docker stack deploy -c docker-compose.traefik.yml traefik

# Verificar status
echo -e "${YELLOW}Verificando status do Traefik...${NC}"
docker stack services traefik

echo -e "${GREEN}Implantação do Traefik concluída!${NC}"
echo -e "${GREEN}Você pode acessar o dashboard do Traefik em: https://traefik.unigate.com.br${NC}"
echo -e "${GREEN}Usuário: admin, Senha: admin${NC}"