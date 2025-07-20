#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Implantando stack no Docker Swarm...${NC}"

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

# Verificar se o arquivo .env.prod existe
if [ ! -f ".env.prod" ]; then
    echo -e "${RED}Arquivo .env.prod não encontrado. Execute o script build-prod.sh primeiro.${NC}"
    exit 1
fi

# Construir imagens
echo -e "${YELLOW}Construindo imagens...${NC}"
docker-compose -f docker-compose.prod.yml build backend frontend

# Verificar se o Traefik está em execução
if ! docker service ls | grep -q "traefik"; then
    echo -e "${YELLOW}Traefik não está em execução. Deseja implantar o Traefik? (y/n)${NC}"
    read deploy_traefik
    if [[ $deploy_traefik == "y" || $deploy_traefik == "Y" ]]; then
        echo -e "${YELLOW}Implantando Traefik...${NC}"
        
        # Criar diretório para armazenar certificados
        mkdir -p ./traefik/acme
        
        # Criar arquivo de configuração do Traefik
        cat > ./traefik/traefik.yml << EOF
api:
  dashboard: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@unigate.com.br
      storage: /etc/traefik/acme/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    swarmMode: true
    exposedByDefault: false
    network: traefik-public
EOF
        
        # Implantar Traefik
        docker service create \
            --name traefik \
            --constraint=node.role==manager \
            --publish 80:80 \
            --publish 443:443 \
            --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
            --mount type=bind,source=$(pwd)/traefik/traefik.yml,target=/etc/traefik/traefik.yml \
            --mount type=bind,source=$(pwd)/traefik/acme,target=/etc/traefik/acme \
            --network traefik-public \
            --label "traefik.enable=true" \
            --label "traefik.http.routers.traefik.rule=Host(\`traefik.unigate.com.br\`)" \
            --label "traefik.http.routers.traefik.entrypoints=websecure" \
            --label "traefik.http.routers.traefik.tls=true" \
            --label "traefik.http.routers.traefik.tls.certresolver=letsencrypt" \
            --label "traefik.http.routers.traefik.service=api@internal" \
            --label "traefik.http.services.traefik.loadbalancer.server.port=8080" \
            --label "traefik.http.middlewares.traefik-auth.basicauth.users=admin:$$apr1$$ruca84Hq$$QW.dMzNxHzFGMu2YCIqVT0" \
            --label "traefik.http.routers.traefik.middlewares=traefik-auth" \
            traefik:v2.10
    fi
fi

# Implantar stack
echo -e "${YELLOW}Implantando stack...${NC}"
docker stack deploy -c docker-compose.swarm.yml unigate

# Verificar status
echo -e "${YELLOW}Verificando status dos serviços...${NC}"
docker stack services unigate

echo -e "${GREEN}Implantação concluída!${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: https://unigate.com.br${NC}"
echo -e "${GREEN}- Backend API: https://api.unigate.com.br${NC}"
echo -e "${GREEN}- Admin: https://unigate.com.br/admin${NC}"
echo -e "${GREEN}- Traefik Dashboard: https://traefik.unigate.com.br${NC}"