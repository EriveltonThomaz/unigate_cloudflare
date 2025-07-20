#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CRIANDO SUPERUSUÁRIO PARA O DJANGO ADMIN       ${NC}"
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
    echo -e "${RED}Container do backend não encontrado. Execute ./deploy-local.sh primeiro.${NC}"
    exit 1
fi

# Definir credenciais do superusuário
USERNAME="admin"
EMAIL="admin@unigate.com.br"
PASSWORD="admin"

# Criar superusuário
echo -e "${YELLOW}Criando superusuário com as seguintes credenciais:${NC}"
echo -e "${YELLOW}Usuário: ${USERNAME}${NC}"
echo -e "${YELLOW}Email: ${EMAIL}${NC}"
echo -e "${YELLOW}Senha: ${PASSWORD}${NC}"

# Executar comando para criar superusuário usando shell Python
docker exec -it $BACKEND_CONTAINER python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='${USERNAME}').delete(); User.objects.create_superuser('${USERNAME}', '${EMAIL}', '${PASSWORD}'); print('Superusuário criado com sucesso!');"

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Agora você pode acessar o painel de administração em:${NC}"
echo -e "${GREEN}http://localhost/admin/${NC}"
echo -e "${GREEN}Usuário: ${USERNAME}${NC}"
echo -e "${GREEN}Senha: ${PASSWORD}${NC}"
echo -e "${BLUE}==================================================${NC}"
