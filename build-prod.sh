#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Construindo imagens para produção...${NC}"

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

# Criar arquivo .env.prod se não existir
if [ ! -f ".env.prod" ]; then
    echo -e "${YELLOW}Criando arquivo .env.prod...${NC}"
    cat > .env.prod << EOL
# Banco de dados
POSTGRES_DB=mydatabase
POSTGRES_USER=myuser
POSTGRES_PASSWORD=StrongPassword123!
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Backend
DEBUG=False
SECRET_KEY=$(openssl rand -hex 32)
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production

# Superusuário
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=StrongAdminPassword123!
EOL
    echo -e "${GREEN}Arquivo .env.prod criado. Por favor, edite-o com suas configurações de produção.${NC}"
    echo -e "${YELLOW}IMPORTANTE: Altere as senhas e outras configurações sensíveis antes de continuar.${NC}"
    exit 0
fi

# Verificar se o usuário editou o arquivo .env.prod
read -p "Você já editou o arquivo .env.prod com suas configurações de produção? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Por favor, edite o arquivo .env.prod antes de continuar.${NC}"
    exit 0
fi

# Construir as imagens
echo -e "${GREEN}Construindo as imagens Docker para produção...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod build

echo -e "${GREEN}Imagens de produção construídas com sucesso!${NC}"
echo -e "${YELLOW}Para iniciar os serviços em produção:${NC}"
echo -e "docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d"
echo -e "${YELLOW}Para inicializar o banco de dados e criar um superusuário:${NC}"
echo -e "docker-compose -f docker-compose.prod.yml --env-file .env.prod --profile init up init_backend"