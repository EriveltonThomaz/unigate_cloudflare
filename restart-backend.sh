#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Reiniciando o backend...${NC}"

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

# Reiniciar o serviço backend
echo -e "${YELLOW}Reiniciando o serviço backend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod restart backend

# Esperar um pouco para o serviço reiniciar
echo -e "${YELLOW}Aguardando o serviço reiniciar...${NC}"
sleep 5

# Verificar o status do serviço
echo -e "${YELLOW}Verificando o status do serviço backend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps backend

# Mostrar os logs do backend
echo -e "${YELLOW}Logs do backend:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=20 backend

echo -e "${GREEN}Reinicialização do backend concluída!${NC}"