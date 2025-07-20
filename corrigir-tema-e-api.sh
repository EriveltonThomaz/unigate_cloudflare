#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CORREÇÃO DO TEMA ESCURO E API                  ${NC}"
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

# Passo 3: Corrigir o arquivo DNSRecordsClientPage.tsx
echo -e "${YELLOW}Passo 3: Corrigindo o arquivo DNSRecordsClientPage.tsx...${NC}"
DNS_RECORDS_FILE="src/app/admin/domains/[domainId]/dnsrecords/DNSRecordsClientPage.tsx"
if [ -f "$DNS_RECORDS_FILE" ]; then
  # Substituir a importação do api
  sed -i "s/import api from '@\/services\/api';/import api from '@\/services\/api.js';/" "$DNS_RECORDS_FILE"
  echo -e "${GREEN}Importação do api corrigida no arquivo DNSRecordsClientPage.tsx${NC}"
fi

# Passo 4: Criar o arquivo api.js se não existir
echo -e "${YELLOW}Passo 4: Criando arquivo api.js...${NC}"
mkdir -p src/services
cat > src/services/api.js << 'EOA'
import axios from 'axios';
import Cookies from 'js-cookie';

// Cria uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    // Tenta obter o token do cookie primeiro, depois do localStorage
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Se for erro 401 (não autorizado), limpa o token e redireciona para login
    if (error.response && error.response.status === 401) {
      // Verifica se não estamos já na página de login para evitar loop
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
EOA

# Passo 5: Atualizar o next.config.js para permitir origens de desenvolvimento
echo -e "${YELLOW}Passo 5: Atualizando next.config.js...${NC}"
cat > next.config.js << 'EOC'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Para Next.js 14.2.30, configuração de origens permitidas para desenvolvimento
  experimental: {
    allowedDevOrigins: [
      "http://192.168.34.19:3000", 
      "http://localhost:3000", 
      "http://192.168.34.65:3000",
      "http://127.0.0.1:3000",
      "192.168.34.65"
    ],
  },
  // Adiciona suporte para exportação standalone
  output: 'standalone',
  // Configurações de CORS para desenvolvimento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Configuração para garantir que o tema escuro funcione corretamente
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig;
EOC

# Passo 6: Verificar se o tema escuro está configurado corretamente
echo -e "${YELLOW}Passo 6: Verificando configuração do tema escuro...${NC}"
if ! grep -q "darkMode:" tailwind.config.js; then
  echo -e "${YELLOW}Atualizando tailwind.config.js...${NC}"
  sed -i "s/module.exports = {/module.exports = {\n  darkMode: ['class'],/" tailwind.config.js
fi

# Passo 7: Atualizar o arquivo de estilos globais para garantir que o tema escuro funcione
echo -e "${YELLOW}Passo 7: Atualizando estilos globais...${NC}"
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

# Passo 8: Reiniciar o servidor Next.js
echo -e "${YELLOW}Passo 8: Reiniciando o servidor Next.js...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
cd ..

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Correção do tema escuro e API concluída!${NC}"
echo -e "${GREEN}Frontend reiniciado com PID $FRONTEND_PID${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost:3000/${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Para verificar os logs do frontend:${NC}"
echo -e "${YELLOW}tail -f frontend/frontend.log${NC}"
echo -e "${BLUE}==================================================${NC}"