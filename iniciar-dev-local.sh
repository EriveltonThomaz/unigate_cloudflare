#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   INICIANDO AMBIENTE DE DESENVOLVIMENTO LOCAL    ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar se o PostgreSQL está em execução
echo -e "${YELLOW}Verificando se o PostgreSQL está em execução...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo -e "${RED}PostgreSQL não está em execução. Iniciando com Docker...${NC}"
  docker run --name postgres-unigate -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=unigate -p 5432:5432 -d postgres:16-alpine
  
  # Aguardar o PostgreSQL iniciar
  echo -e "${YELLOW}Aguardando PostgreSQL iniciar (10 segundos)...${NC}"
  sleep 10
else
  echo -e "${GREEN}PostgreSQL já está em execução.${NC}"
fi

# Iniciar backend em segundo plano
echo -e "${YELLOW}Iniciando backend...${NC}"
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Iniciar frontend em segundo plano
echo -e "${YELLOW}Iniciando frontend...${NC}"
cd frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Ambiente de desenvolvimento local iniciado!${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000/${NC}"
echo -e "${GREEN}Backend: http://localhost:8000/${NC}"
echo -e "${GREEN}Admin: http://localhost:8000/admin/${NC}"
echo -e "${GREEN}  Usuário: admin${NC}"
echo -e "${GREEN}  Senha: admin${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Para parar os serviços, execute:${NC}"
echo -e "${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo -e "${BLUE}==================================================${NC}"

# Salvar PIDs para referência futura
echo "$BACKEND_PID $FRONTEND_PID" > dev-local-pids.txt