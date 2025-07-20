#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CORREÇÃO DA PÁGINA INICIAL DO CLIENTE          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Passo 1: Reiniciar o servidor Next.js
echo -e "${YELLOW}Passo 1: Parando o servidor Next.js...${NC}"
if [ -f "frontend.pid" ]; then
  FRONTEND_PID=$(cat frontend.pid)
  kill $FRONTEND_PID 2>/dev/null || true
  rm frontend.pid
else
  # Tentar encontrar processos por nome
  FRONTEND_PIDS=$(ps aux | grep "npm run dev" | grep -v grep | awk '{print $2}')
  if [ -n "$FRONTEND_PIDS" ]; then
    echo -e "${YELLOW}Parando processos do frontend...${NC}"
    kill $FRONTEND_PIDS 2>/dev/null || true
  fi
fi

# Passo 2: Limpar o cache do Next.js
echo -e "${YELLOW}Passo 2: Limpando o cache do Next.js...${NC}"
cd frontend
rm -rf .next
rm -rf node_modules/.cache

# Passo 3: Verificar se o tema escuro está configurado corretamente
echo -e "${YELLOW}Passo 3: Verificando configuração do tema escuro...${NC}"
if ! grep -q "darkMode:" tailwind.config.js; then
  echo -e "${YELLOW}Atualizando tailwind.config.js...${NC}"
  sed -i "s/module.exports = {/module.exports = {\n  darkMode: ['class'],/" tailwind.config.js
fi

# Passo 4: Atualizar o arquivo de estilos globais para garantir que o tema escuro funcione
echo -e "${YELLOW}Passo 4: Atualizando estilos globais...${NC}"
if [ -f "src/styles/globals.css" ]; then
  if ! grep -q ":root.dark" src/styles/globals.css; then
    cat >> src/styles/globals.css << 'EOG'

/* Tema escuro */
:root.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 142.1 70.6% 45.3%;
  --primary-foreground: 144.9 80.4% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 142.4 71.8% 29.2%;
}
EOG
  fi
fi

# Passo 5: Reiniciar o servidor Next.js
echo -e "${YELLOW}Passo 5: Reiniciando o servidor Next.js...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
cd ..

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Correção da página inicial do cliente concluída!${NC}"
echo -e "${GREEN}Frontend reiniciado com PID $FRONTEND_PID${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost:3000/${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Para verificar os logs do frontend:${NC}"
echo -e "${YELLOW}tail -f frontend/frontend.log${NC}"
echo -e "${BLUE}==================================================${NC}"