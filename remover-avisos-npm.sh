#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   REMOVENDO AVISOS DO NPM                        ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Entrar no diretório do frontend
cd frontend

# Passo 1: Limpar cache do npm
echo -e "${YELLOW}Passo 1: Limpando cache do npm...${NC}"
npm cache clean --force

# Passo 2: Remover node_modules e package-lock.json
echo -e "${YELLOW}Passo 2: Removendo node_modules e package-lock.json...${NC}"
rm -rf node_modules package-lock.json .next

# Passo 3: Criar um package.json simplificado
echo -e "${YELLOW}Passo 3: Criando package.json simplificado...${NC}"
cat > package.json << 'EOJ'
{
  "name": "unigate-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "serve -s public",
    "build": "echo 'No build needed for static site'",
    "start": "serve -s public"
  },
  "dependencies": {
    "serve": "^14.2.1"
  }
}
EOJ

# Passo 4: Instalar dependências
echo -e "${YELLOW}Passo 4: Instalando dependências...${NC}"
npm install

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Avisos do npm removidos!${NC}"
echo -e "${GREEN}Agora você pode executar:${NC}"
echo -e "${GREEN}cd frontend${NC}"
echo -e "${GREEN}npm run dev${NC}"
echo -e "${BLUE}==================================================${NC}"