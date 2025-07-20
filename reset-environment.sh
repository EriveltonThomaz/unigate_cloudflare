#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Reiniciando todo o ambiente...${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.${NC}"
    exit 1
fi

# Verificar se o arquivo .env.prod existe
if [ ! -f ".env.prod" ]; then
    echo -e "${RED}Arquivo .env.prod não encontrado. Execute o script build-prod.sh primeiro.${NC}"
    exit 1
fi

# Parar todos os serviços
echo -e "${YELLOW}Parando todos os serviços...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod down

# Remover volumes (opcional)
read -p "Deseja remover os volumes? (y/n) " remove_volumes
if [[ $remove_volumes == "y" || $remove_volumes == "Y" ]]; then
    echo -e "${YELLOW}Removendo volumes...${NC}"
    docker volume rm $(docker volume ls -q | grep -E "kiro-v12-cloudflare-multitenant-app") 2>/dev/null || true
fi

# Iniciar os serviços novamente
echo -e "${YELLOW}Iniciando os serviços...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Esperar um pouco para os serviços iniciarem
echo -e "${YELLOW}Aguardando os serviços iniciarem...${NC}"
sleep 10

# Verificar o status dos serviços
echo -e "${YELLOW}Verificando o status dos serviços...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps

# Verificar se o frontend está acessível
echo -e "${YELLOW}Verificando se o frontend está acessível...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
    echo -e "${GREEN}Frontend está acessível!${NC}"
else
    echo -e "${RED}Frontend não está acessível. Verificando logs...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.prod logs frontend
fi

# Verificar se o backend está acessível
echo -e "${YELLOW}Verificando se o backend está acessível...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/ | grep -q "200\|302"; then
    echo -e "${GREEN}Backend está acessível!${NC}"
else
    echo -e "${RED}Backend não está acessível. Verificando logs...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.prod logs backend
fi

echo -e "${GREEN}Reinicialização do ambiente concluída!${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}- Backend: http://localhost:8000${NC}"
echo -e "${GREEN}- Admin: http://localhost:3000/admin${NC}"