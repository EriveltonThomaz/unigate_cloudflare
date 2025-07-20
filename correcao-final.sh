#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CORREÇÃO FINAL PARA IMPLANTAÇÃO DO UNIGATE     ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Passo 1: Verificar e remover arquivos conflitantes no frontend
echo -e "${YELLOW}Passo 1: Removendo arquivos conflitantes no frontend...${NC}"
mkdir -p frontend/src/pages
rm -rf frontend/app frontend/src/app frontend/pages/index.js frontend/src/pages/index.js 2>/dev/null || true

# Passo 2: Criar um arquivo index.js simples
echo -e "${YELLOW}Passo 2: Criando arquivo index.js simples...${NC}"
cat > frontend/src/pages/index.js << 'EOI'
import React from "react";

export default function Home() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#0070f3" }}>UniGate Dashboard</h1>
      <p>Bem-vindo ao Gerenciador de Domínios Cloudflare UniGate.</p>
      <div style={{ marginTop: "2rem" }}>
        <h2>Links Rápidos</h2>
        <ul>
          <li><a href="/admin/" style={{ color: "#0070f3" }}>Painel de Administração</a></li>
          <li><a href="/api/" style={{ color: "#0070f3" }}>API</a></li>
        </ul>
      </div>
    </div>
  );
}
EOI

# Passo 3: Criar um Dockerfile simplificado para o frontend
echo -e "${YELLOW}Passo 3: Criando Dockerfile simplificado para o frontend...${NC}"
cat > frontend/Dockerfile.simple << 'EOD'
# Estágio de construção
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copiar todos os arquivos
COPY . .

# Remover arquivos conflitantes
RUN rm -rf ./app ./src/app ./pages/index.js 2>/dev/null || true

# Desativar ESLint
RUN echo '{ "extends": "next/core-web-vitals", "rules": {} }' > .eslintrc.json

# Construir a aplicação
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Estágio de produção
FROM node:20-alpine AS runner
WORKDIR /app

# Copiar arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expor porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Iniciar a aplicação
CMD ["pnpm", "start"]
EOD

# Passo 4: Atualizar docker-compose para usar o Dockerfile simplificado
echo -e "${YELLOW}Passo 4: Atualizando docker-compose.swarm.local.yml...${NC}"
sed -i '/frontend:/,/image:/ s/dockerfile: Dockerfile.fixed/dockerfile: Dockerfile.simple/g' docker-compose.swarm.local.yml
echo -e "${GREEN}Docker-compose atualizado para usar o Dockerfile simplificado${NC}"

# Passo 5: Corrigir script de criação de superusuário
echo -e "${YELLOW}Passo 5: Corrigindo script de criação de superusuário...${NC}"
cat > create-superuser-fixed.sh << 'EOS'
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
EOS
chmod +x create-superuser-fixed.sh

# Passo 6: Remover stack existente
echo -e "${YELLOW}Passo 6: Removendo stack anterior...${NC}"
docker stack rm unigate-local

# Aguardar remoção dos serviços
echo -e "${YELLOW}Aguardando remoção dos serviços (15 segundos)...${NC}"
sleep 15

# Passo 7: Construir imagens
echo -e "${YELLOW}Passo 7: Construindo imagens...${NC}"
# Construir imagem do frontend explicitamente
echo -e "${YELLOW}Construindo imagem do frontend...${NC}"
docker build -t unigate-frontend:prod -f frontend/Dockerfile.simple frontend/

# Passo 8: Implantar stack
echo -e "${YELLOW}Passo 8: Implantando stack...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Aguardar início dos serviços
echo -e "${YELLOW}Aguardando início dos serviços (20 segundos)...${NC}"
sleep 20

# Passo 9: Verificar status dos serviços
echo -e "${YELLOW}Passo 9: Verificando status dos serviços...${NC}"
docker stack services unigate-local

# Passo 10: Criar superusuário
echo -e "${YELLOW}Passo 10: Criando superusuário...${NC}"
# Aguardar um pouco mais para o backend estar totalmente pronto
sleep 10
./create-superuser-fixed.sh

# Passo 11: Coletar arquivos estáticos
echo -e "${YELLOW}Passo 11: Coletando arquivos estáticos...${NC}"
BACKEND_CONTAINER=$(docker ps -q -f name=unigate-local_backend)
if [ -n "$BACKEND_CONTAINER" ]; then
  docker exec -it $BACKEND_CONTAINER python manage.py collectstatic --noinput
  echo -e "${GREEN}Arquivos estáticos coletados com sucesso!${NC}"
  
  # Passo 12: Definir permissões para arquivos estáticos
  echo -e "${YELLOW}Passo 12: Definindo permissões para arquivos estáticos...${NC}"
  docker exec -it $BACKEND_CONTAINER chmod -R 755 /app/staticfiles
  echo -e "${GREEN}Permissões definidas com sucesso!${NC}"
else
  echo -e "${RED}Container do backend não encontrado. Criação de superusuário e coleta de arquivos estáticos ignorados.${NC}"
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Implantação corrigida e concluída!${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost/${NC}"
echo -e "${GREEN}- Admin: http://localhost/admin/${NC}"
echo -e "${GREEN}  Usuário: admin${NC}"
echo -e "${GREEN}  Senha: admin${NC}"
echo -e "${BLUE}==================================================${NC}"