#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   IMPLANTAÇÃO LOCAL COM DOCKER SWARM E TRAEFIK   ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se o Docker está em modo Swarm
if ! docker info | grep -q "Swarm: active"; then
    echo -e "${YELLOW}Docker não está em modo Swarm. Inicializando Swarm...${NC}"
    docker swarm init || {
        echo -e "${RED}Falha ao inicializar o Swarm. Por favor, inicialize manualmente.${NC}"
        exit 1
    }
    echo -e "${GREEN}Docker Swarm inicializado com sucesso!${NC}"
fi

# Verificar se a rede traefik-public existe
if ! docker network ls | grep -q "traefik-public"; then
    echo -e "${YELLOW}Criando rede traefik-public...${NC}"
    docker network create --driver=overlay --attachable traefik-public
    echo -e "${GREEN}Rede traefik-public criada com sucesso!${NC}"
fi

# Limpar ambiente anterior
echo -e "${YELLOW}Deseja limpar o ambiente anterior? (y/n)${NC}"
read clean_env
if [[ $clean_env == "y" || $clean_env == "Y" ]]; then
    echo -e "${YELLOW}Removendo stacks anteriores...${NC}"
    docker stack rm traefik unigate-local
    
    echo -e "${YELLOW}Aguardando remoção dos serviços...${NC}"
    sleep 10
    
    echo -e "${YELLOW}Removendo volumes não utilizados...${NC}"
    docker volume prune -f
fi

# Verificar se o Traefik está em execução
if ! docker service ls | grep -q "traefik"; then
    echo -e "${YELLOW}Implantando Traefik...${NC}"
    docker stack deploy -c docker-compose.traefik.yml traefik
    
    # Aguardar o Traefik iniciar
    echo -e "${YELLOW}Aguardando o Traefik iniciar...${NC}"
    sleep 10
    
    echo -e "${GREEN}Traefik implantado com sucesso!${NC}"
fi

# Construir imagens localmente
echo -e "${YELLOW}Construindo imagens localmente...${NC}"
docker-compose -f docker-compose.swarm.local.yml build backend frontend
echo -e "${GREEN}Imagens construídas com sucesso!${NC}"

# Implantar stack
echo -e "${YELLOW}Implantando stack local...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Verificar status
echo -e "${YELLOW}Verificando status dos serviços...${NC}"
docker stack services unigate-local

# Aguardar serviços iniciarem
echo -e "${YELLOW}Aguardando serviços iniciarem (15 segundos)...${NC}"
sleep 15

# Inicializar o banco de dados
echo -e "${YELLOW}Deseja inicializar o banco de dados? (y/n)${NC}"
read init_db
if [[ $init_db == "y" || $init_db == "Y" ]]; then
    echo -e "${YELLOW}Inicializando o banco de dados...${NC}"
    
    # Obter o ID do contêiner do banco de dados
    DB_CONTAINER=$(docker ps -q -f name=unigate-local_db)
    
    if [ -z "$DB_CONTAINER" ]; then
        echo -e "${RED}Contêiner do banco de dados não encontrado. Tentando criar serviço temporário...${NC}"
        
        docker service create --name init-backend-local \
            --network traefik-public \
            --env-file .env.prod \
            --env POSTGRES_HOST=db \
            --env DEBUG=True \
            unigate-backend:prod \
            sh -c "python manage.py migrate && \
                   echo \"from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@unigate.com.br', 'admin') if not User.objects.filter(username='admin').exists() else print('Superuser already exists')\" | python manage.py shell"
        
        # Aguardar a inicialização do banco de dados
        echo -e "${YELLOW}Aguardando a inicialização do banco de dados...${NC}"
        sleep 10
        
        # Remover o serviço de inicialização
        docker service rm init-backend-local
    else
        echo -e "${GREEN}Contêiner do banco de dados encontrado: $DB_CONTAINER${NC}"
        
        # Obter o ID do contêiner do backend
        BACKEND_CONTAINER=$(docker ps -q -f name=unigate-local_backend)
        
        if [ -z "$BACKEND_CONTAINER" ]; then
            echo -e "${RED}Contêiner do backend não encontrado.${NC}"
        else
            echo -e "${GREEN}Contêiner do backend encontrado: $BACKEND_CONTAINER${NC}"
            echo -e "${YELLOW}Executando migrações...${NC}"
            
            docker exec $BACKEND_CONTAINER python manage.py migrate
            
            echo -e "${YELLOW}Criando superusuário...${NC}"
            docker exec -it $BACKEND_CONTAINER sh -c "echo \"from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@unigate.com.br', 'admin') if not User.objects.filter(username='admin').exists() else print('Superuser already exists')\" | python manage.py shell"
        fi
    fi
fi

# Verificar status final
echo -e "${YELLOW}Verificando status final dos serviços...${NC}"
docker stack services unigate-local

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Implantação local concluída!${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost${NC}"
echo -e "${GREEN}- Backend API: http://localhost/api${NC}"
echo -e "${GREEN}- Admin: http://localhost/admin${NC}"
echo -e "${GREEN}- Traefik Dashboard: http://localhost:8080/dashboard/${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Credenciais de acesso:${NC}"
echo -e "${YELLOW}- Admin: admin / admin${NC}"
echo -e "${YELLOW}- Traefik Dashboard: admin / admin${NC}"
echo -e "${BLUE}==================================================${NC}"