#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   COLETANDO ARQUIVOS ESTÁTICOS DO DJANGO          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se os serviços estão em execução
echo -e "${YELLOW}Verificando se os serviços estão em execução...${NC}"
BACKEND_CONTAINER=$(docker ps -q -f name=unigate-local_backend)

if [ -z "$BACKEND_CONTAINER" ]; then
    echo -e "${RED}Contêiner do backend não encontrado. Execute ./deploy-local.sh primeiro.${NC}"
    exit 1
fi

# Coletar arquivos estáticos
echo -e "${YELLOW}Coletando arquivos estáticos...${NC}"
docker exec $BACKEND_CONTAINER python manage.py collectstatic --noinput

# Verificar se a coleta foi bem-sucedida
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Arquivos estáticos coletados com sucesso!${NC}"
else
    echo -e "${RED}Falha ao coletar arquivos estáticos.${NC}"
    exit 1
fi

# Verificar permissões dos arquivos estáticos
echo -e "${YELLOW}Ajustando permissões dos arquivos estáticos...${NC}"
docker exec $BACKEND_CONTAINER chmod -R 755 /app/staticfiles

# Reiniciar o frontend para garantir que ele tenha acesso aos arquivos estáticos
echo -e "${YELLOW}Reiniciando o frontend...${NC}"
docker service update --force unigate-local_frontend

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Arquivos estáticos coletados e configurados!${NC}"
echo -e "${GREEN}Agora você pode acessar o painel de administração com estilos.${NC}"
echo -e "${BLUE}==================================================${NC}"