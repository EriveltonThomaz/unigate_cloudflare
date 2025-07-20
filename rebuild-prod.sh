#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Reconstruindo imagens de produção...${NC}"

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

# Criar diretórios necessários
echo -e "${YELLOW}Criando diretórios necessários...${NC}"
# Verificar se os diretórios existem e criar se necessário
if [ ! -d "./nginx/www" ]; then
    echo -e "${YELLOW}Criando diretório nginx/www...${NC}"
    mkdir -p ./nginx/www || sudo mkdir -p ./nginx/www
    # Ajustar permissões
    [ -d "./nginx/www" ] && (sudo chown -R $USER:$USER ./nginx/www || true)
fi

if [ ! -d "./nginx/www/static" ]; then
    echo -e "${YELLOW}Criando diretório nginx/www/static...${NC}"
    mkdir -p ./nginx/www/static || sudo mkdir -p ./nginx/www/static
    # Ajustar permissões
    [ -d "./nginx/www/static" ] && (sudo chown -R $USER:$USER ./nginx/www/static || true)
fi

if [ ! -d "./nginx/www/media" ]; then
    echo -e "${YELLOW}Criando diretório nginx/www/media...${NC}"
    mkdir -p ./nginx/www/media || sudo mkdir -p ./nginx/www/media
    # Ajustar permissões
    [ -d "./nginx/www/media" ] && (sudo chown -R $USER:$USER ./nginx/www/media || true)
fi

if [ ! -d "./nginx/ssl" ]; then
    echo -e "${YELLOW}Criando diretório nginx/ssl...${NC}"
    mkdir -p ./nginx/ssl || sudo mkdir -p ./nginx/ssl
    # Ajustar permissões
    [ -d "./nginx/ssl" ] && (sudo chown -R $USER:$USER ./nginx/ssl || true)
fi

# Parar os serviços em execução
echo -e "${YELLOW}Parando serviços em execução...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod down

# Remover volumes antigos (opcional)
echo -e "${YELLOW}Removendo volumes antigos...${NC}"
docker volume rm $(docker volume ls -q | grep -E "static_volume|media_volume") 2>/dev/null || true

# Reconstruir as imagens
echo -e "${YELLOW}Reconstruindo imagens...${NC}"
echo -e "${YELLOW}Reconstruindo backend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache backend
echo -e "${YELLOW}Reconstruindo frontend...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache frontend

# Iniciar os serviços
echo -e "${YELLOW}Iniciando serviços...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Esperar um pouco para os serviços iniciarem
echo -e "${YELLOW}Aguardando serviços iniciarem...${NC}"
sleep 10

# Coletar arquivos estáticos do Django
echo -e "${YELLOW}Coletando arquivos estáticos do Django...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend python manage.py collectstatic --noinput || echo -e "${RED}Falha ao coletar arquivos estáticos. Tentando novamente...${NC}"

# Copiar arquivos estáticos para o diretório do Nginx
echo -e "${YELLOW}Copiando arquivos estáticos para o Nginx...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend sh -c "cp -r /app/staticfiles/* /app/staticfiles/" || echo -e "${RED}Falha ao copiar arquivos estáticos.${NC}"

# Ajustar permissões dos volumes
echo -e "${YELLOW}Ajustando permissões dos volumes...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend sh -c "chmod -R 755 /app/staticfiles /app/media" || echo -e "${RED}Falha ao ajustar permissões.${NC}"

# Verificar se os serviços estão em execução
echo -e "${YELLOW}Verificando status dos serviços...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps

# Perguntar se deseja inicializar o banco de dados
read -p "Deseja inicializar o banco de dados e criar um superusuário? (y/n) " init_db
if [[ $init_db == "y" || $init_db == "Y" ]]; then
    echo -e "${YELLOW}Inicializando o banco de dados...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.prod --profile init up init_backend
fi

echo -e "${GREEN}Reconstrução concluída!${NC}"
echo -e "${GREEN}Acesse a aplicação em:${NC}"
echo -e "http://localhost (ou seu domínio configurado)"
echo -e "${GREEN}Acesse o painel de administração em:${NC}"
echo -e "http://localhost/admin (ou seu domínio configurado/admin)"