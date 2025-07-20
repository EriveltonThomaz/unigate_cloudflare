#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CORREÇÃO DA AUTENTICAÇÃO                       ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Passo 1: Verificar se o backend está em execução
echo -e "${YELLOW}Passo 1: Verificando se o backend está em execução...${NC}"
if ! curl -s http://localhost:8000/api/health-check/ > /dev/null; then
  echo -e "${RED}O backend não está acessível. Verifique se ele está em execução na porta 8000.${NC}"
  echo -e "${YELLOW}Iniciando o backend...${NC}"
  cd backend
  source venv/bin/activate
  python manage.py runserver 0.0.0.0:8000 > backend.log 2>&1 &
  BACKEND_PID=$!
  echo $BACKEND_PID > backend.pid
  cd ..
  echo -e "${GREEN}Backend iniciado com PID $BACKEND_PID${NC}"
  echo -e "${YELLOW}Aguardando o backend iniciar (10 segundos)...${NC}"
  sleep 10
fi

# Passo 2: Verificar as rotas de autenticação do backend
echo -e "${YELLOW}Passo 2: Verificando rotas de autenticação do backend...${NC}"
TOKEN_ROUTE=$(curl -s http://localhost:8000/api/token/ | grep -c "token")
AUTH_TOKEN_ROUTE=$(curl -s http://localhost:8000/api/auth/token/ | grep -c "token")

if [ "$TOKEN_ROUTE" -gt 0 ]; then
  echo -e "${GREEN}Rota /api/token/ está disponível${NC}"
  TOKEN_URL="/api/token/"
elif [ "$AUTH_TOKEN_ROUTE" -gt 0 ]; then
  echo -e "${GREEN}Rota /api/auth/token/ está disponível${NC}"
  TOKEN_URL="/api/auth/token/"
else
  echo -e "${RED}Nenhuma rota de autenticação encontrada. Usando /api/token/ como padrão.${NC}"
  TOKEN_URL="/api/token/"
fi

# Passo 3: Atualizar o arquivo .env.local
echo -e "${YELLOW}Passo 3: Atualizando arquivo .env.local...${NC}"
cat > frontend/.env.local << EOE
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Configurações de ambiente
NODE_ENV=development

# Configurações de autenticação
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_TOKEN_URL=${TOKEN_URL}

# Configurações de tema
NEXT_PUBLIC_DEFAULT_THEME=light

# Configurações de análise
NEXT_PUBLIC_ANALYTICS_ENABLED=false

# Desabilitar telemetria do Next.js
NEXT_TELEMETRY_DISABLED=1

# Configurações de CORS
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
EOE

# Passo 4: Atualizar o AuthContext.tsx
echo -e "${YELLOW}Passo 4: Atualizando AuthContext.tsx...${NC}"
sed -i "s|const response = await axios.post(\`\${API_URL}/token/\`|const tokenUrl = process.env.NEXT_PUBLIC_AUTH_TOKEN_URL || '/token/'; const response = await axios.post(\`\${API_URL}\${tokenUrl}\`|g" frontend/src/contexts/AuthContext.tsx

# Passo 5: Reiniciar o frontend
echo -e "${YELLOW}Passo 5: Reiniciando o frontend...${NC}"
if [ -f "frontend.pid" ]; then
  FRONTEND_PID=$(cat frontend.pid)
  kill $FRONTEND_PID 2>/dev/null || true
  rm frontend.pid
fi

cd frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
cd ..

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Correção da autenticação concluída!${NC}"
echo -e "${GREEN}Frontend reiniciado com PID $FRONTEND_PID${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost:3000/${NC}"
echo -e "${GREEN}- Backend: http://localhost:8000/${NC}"
echo -e "${GREEN}- Admin: http://localhost:8000/admin/${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Para verificar os logs do frontend:${NC}"
echo -e "${YELLOW}tail -f frontend/frontend.log${NC}"
echo -e "${YELLOW}Para verificar os logs do backend:${NC}"
echo -e "${YELLOW}tail -f backend/backend.log${NC}"
echo -e "${BLUE}==================================================${NC}"