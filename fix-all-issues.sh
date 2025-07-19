#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Corrigindo todos os problemas do projeto...${NC}"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm não está instalado. Por favor, instale o Node.js e npm primeiro.${NC}"
    exit 1
fi

# Entrar no diretório frontend
cd frontend || { echo -e "${RED}Diretório frontend não encontrado!${NC}"; exit 1; }

# Instalar next-themes se ainda não estiver instalado
echo -e "${GREEN}Verificando se next-themes está instalado...${NC}"
if ! grep -q "next-themes" package.json; then
    echo -e "${GREEN}Instalando next-themes...${NC}"
    npm install next-themes
else
    echo -e "${GREEN}next-themes já está instalado.${NC}"
fi

# Criar diretório de imagens se não existir
echo -e "${GREEN}Verificando diretório de imagens...${NC}"
mkdir -p public/images

# Verificar se o arquivo de imagem existe
if [ ! -f "public/images/iconeuniatende.png" ]; then
    echo -e "${YELLOW}Criando um arquivo de imagem placeholder...${NC}"
    # Criar um arquivo de imagem vazio (1x1 pixel)
    echo -e "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 -d > public/images/iconeuniatende.png
fi

# Remover a pasta .next para limpar o cache
echo -e "${GREEN}Limpando o cache do Next.js...${NC}"
rm -rf .next

# Corrigir o arquivo demo/page.tsx
echo -e "${GREEN}Corrigindo o arquivo demo/page.tsx...${NC}"
cat > src/app/demo/page.tsx << 'EOL'
'use client';

import React from 'react';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Redirecionando...
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Por favor, acesse a página de demonstração simplificada:
        </p>
        
        <Link href="/demo-simple" className="text-blue-500 hover:underline">
          Ir para a página de demonstração
        </Link>
      </div>
    </div>
  );
}
EOL

# Voltar ao diretório raiz
cd ..

echo -e "${GREEN}Correções aplicadas!${NC}"
echo -e "${YELLOW}Agora você pode iniciar o frontend com:${NC}"
echo -e "cd frontend && npm run dev"
echo -e "${YELLOW}E acessar a página de demonstração em:${NC}"
echo -e "http://localhost:3000/demo-simple"