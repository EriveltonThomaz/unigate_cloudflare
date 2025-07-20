#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Enviando imagens para o Docker Hub em modo privado...${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Solicitar credenciais do Docker Hub
read -p "Digite seu nome de usuário do Docker Hub: " DOCKER_USERNAME
read -s -p "Digite sua senha do Docker Hub: " DOCKER_PASSWORD
echo ""

# Definir a tag para as imagens
read -p "Digite a tag para as imagens (padrão: latest): " TAG
TAG=${TAG:-latest}

# Login no Docker Hub
echo -e "${YELLOW}Fazendo login no Docker Hub...${NC}"
echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}Falha ao fazer login no Docker Hub. Verifique suas credenciais.${NC}"
    exit 1
fi

# Construir imagens
echo -e "${YELLOW}Construindo imagens...${NC}"
docker-compose -f docker-compose.prod.yml build backend frontend

# Tagear imagens
echo -e "${YELLOW}Tageando imagens...${NC}"
docker tag unigate-backend:prod $DOCKER_USERNAME/cloudflare-backend:$TAG
docker tag unigate-frontend:simple $DOCKER_USERNAME/cloudflare-frontend:$TAG

# Criar repositórios privados (se não existirem)
echo -e "${YELLOW}Criando repositórios privados (se não existirem)...${NC}"

# Função para criar repositório privado
create_private_repo() {
    local repo_name=$1
    
    # Verificar se o repositório já existe
    if curl -s -H "Authorization: Bearer $DOCKER_TOKEN" "https://hub.docker.com/v2/repositories/$DOCKER_USERNAME/$repo_name/" | grep -q "not found"; then
        echo -e "${YELLOW}Criando repositório privado $DOCKER_USERNAME/$repo_name...${NC}"
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $DOCKER_TOKEN" \
            -d '{"namespace":"'$DOCKER_USERNAME'","name":"'$repo_name'","is_private":true}' \
            "https://hub.docker.com/v2/repositories/"
    else
        echo -e "${GREEN}Repositório $DOCKER_USERNAME/$repo_name já existe.${NC}"
    fi
}

# Obter token de acesso
DOCKER_TOKEN=$(curl -s -H "Content-Type: application/json" -d '{"username": "'$DOCKER_USERNAME'", "password": "'$DOCKER_PASSWORD'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)

if [ -z "$DOCKER_TOKEN" ] || [ "$DOCKER_TOKEN" == "null" ]; then
    echo -e "${YELLOW}Não foi possível obter token de acesso. Pulando criação de repositórios.${NC}"
else
    create_private_repo "cloudflare-backend"
    create_private_repo "cloudflare-frontend"
fi

# Enviar imagens para o Docker Hub
echo -e "${YELLOW}Enviando imagens para o Docker Hub...${NC}"
docker push $DOCKER_USERNAME/cloudflare-backend:$TAG
docker push $DOCKER_USERNAME/cloudflare-frontend:$TAG

# Verificar se o envio foi bem-sucedido
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Imagens enviadas com sucesso para o Docker Hub!${NC}"
    echo -e "${GREEN}Repositórios:${NC}"
    echo -e "${GREEN}- $DOCKER_USERNAME/cloudflare-backend:$TAG${NC}"
    echo -e "${GREEN}- $DOCKER_USERNAME/cloudflare-frontend:$TAG${NC}"
    
    # Salvar as variáveis de ambiente para uso posterior
    echo "DOCKER_USERNAME=$DOCKER_USERNAME" > .env.dockerhub
    echo "TAG=$TAG" >> .env.dockerhub
    echo -e "${GREEN}Variáveis de ambiente salvas em .env.dockerhub${NC}"
else
    echo -e "${RED}Falha ao enviar imagens para o Docker Hub.${NC}"
fi

# Logout do Docker Hub
docker logout