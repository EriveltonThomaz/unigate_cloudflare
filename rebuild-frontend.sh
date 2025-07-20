#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Reconstruindo o frontend com a versão simplificada...${NC}"

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

# Parar o serviço frontend
echo -e "${YELLOW}Parando o serviço frontend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod stop frontend

# Remover o contêiner frontend
echo -e "${YELLOW}Removendo o contêiner frontend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod rm -f frontend

# Reconstruir a imagem do frontend
echo -e "${YELLOW}Reconstruindo a imagem do frontend com Dockerfile.simple...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache frontend

# Iniciar o serviço frontend
echo -e "${YELLOW}Iniciando o serviço frontend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d frontend

# Verificar o status do serviço
echo -e "${YELLOW}Verificando o status do serviço frontend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps frontend

# Mostrar os logs do frontend
echo -e "${YELLOW}Logs do frontend:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=20 frontend

# Esperar um pouco para o serviço iniciar completamente
echo -e "${YELLOW}Aguardando o serviço iniciar completamente...${NC}"
sleep 5

# Verificar se o frontend está acessível
echo -e "${YELLOW}Verificando se o frontend está acessível...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
    echo -e "${GREEN}Frontend está acessível!${NC}"
else
    echo -e "${RED}Frontend não está acessível. Verificando logs...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.prod logs frontend
fi

# Verificar se o backend está acessível através do frontend
echo -e "${YELLOW}Verificando se o backend está acessível através do frontend...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/ | grep -q "200\|302"; then
    echo -e "${GREEN}Backend está acessível através do frontend!${NC}"
else
    echo -e "${RED}Backend não está acessível através do frontend. Verificando conectividade...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.prod exec frontend curl -s -I http://backend:8000/admin/
fi

echo -e "${GREEN}Reconstrução do frontend concluída!${NC}"
echo -e "${GREEN}O frontend agora está em modo de manutenção com uma página estática.${NC}"
echo -e "${GREEN}Você ainda pode acessar o painel de administração em /admin${NC}"