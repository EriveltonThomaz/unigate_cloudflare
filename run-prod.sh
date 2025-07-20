#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando serviços em produção...${NC}"

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

# Iniciar os serviços
echo -e "${GREEN}Iniciando os serviços em produção...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Verificar se os serviços estão em execução
echo -e "${GREEN}Verificando se os serviços estão em execução...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps

# Perguntar se deseja inicializar o banco de dados
read -p "Deseja inicializar o banco de dados e criar um superusuário? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Inicializando o banco de dados...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.prod --profile init up init_backend
fi

echo -e "${GREEN}Serviços em produção iniciados com sucesso!${NC}"
echo -e "${YELLOW}Acesse a aplicação em:${NC}"
echo -e "http://localhost (ou seu domínio configurado)"
echo -e "${YELLOW}Acesse o painel de administração em:${NC}"
echo -e "http://localhost/admin (ou seu domínio configurado/admin)"