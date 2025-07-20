#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando o ambiente de desenvolvimento...${NC}"

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

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cat > .env << EOL
# Banco de dados
POSTGRES_DB=mydatabase
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword

# Backend
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://frontend:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development

# Superusuário
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=adminpassword
EOL
fi

# Construir as imagens
echo -e "${GREEN}Construindo as imagens Docker...${NC}"
docker-compose -f docker-compose.dev.yml build

# Iniciar os serviços
echo -e "${GREEN}Iniciando os serviços...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Inicializar o banco de dados
echo -e "${GREEN}Inicializando o banco de dados...${NC}"
docker-compose -f docker-compose.dev.yml --profile init up init_backend

echo -e "${GREEN}Ambiente de desenvolvimento iniciado com sucesso!${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Backend: http://localhost:8000${NC}"
echo -e "${YELLOW}API: http://localhost:8000/api${NC}"
echo -e "${YELLOW}Admin: http://localhost:8000/admin${NC}"
echo -e "${YELLOW}Credenciais de admin: admin / adminpassword${NC}"