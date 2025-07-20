#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   PARANDO AMBIENTE DE DESENVOLVIMENTO            ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar se o arquivo de PIDs existe
if [ -f "dev-pids.txt" ]; then
  # Ler PIDs do arquivo
  PIDS=$(cat dev-pids.txt)
  
  # Matar processos
  echo -e "${YELLOW}Parando processos...${NC}"
  kill $PIDS 2>/dev/null || true
  
  # Remover arquivo de PIDs
  rm dev-pids.txt
else
  # Tentar encontrar processos por nome
  echo -e "${YELLOW}Arquivo de PIDs não encontrado. Tentando encontrar processos por nome...${NC}"
  
  # Encontrar e matar processos do backend
  BACKEND_PIDS=$(ps aux | grep "python manage.py runserver" | grep -v grep | awk '{print $2}')
  if [ -n "$BACKEND_PIDS" ]; then
    echo -e "${YELLOW}Parando processos do backend...${NC}"
    kill $BACKEND_PIDS 2>/dev/null || true
  fi
  
  # Encontrar e matar processos do frontend
  FRONTEND_PIDS=$(ps aux | grep "npm run dev" | grep -v grep | awk '{print $2}')
  if [ -n "$FRONTEND_PIDS" ]; then
    echo -e "${YELLOW}Parando processos do frontend...${NC}"
    kill $FRONTEND_PIDS 2>/dev/null || true
  fi
fi

# Perguntar se deseja parar o PostgreSQL
echo -e "${YELLOW}Deseja parar o container do PostgreSQL? (s/n)${NC}"
read -r STOP_PG

if [[ "$STOP_PG" =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Parando e removendo container do PostgreSQL...${NC}"
  docker stop postgres-unigate 2>/dev/null || true
  docker rm postgres-unigate 2>/dev/null || true
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Ambiente de desenvolvimento parado!${NC}"
echo -e "${BLUE}==================================================${NC}"