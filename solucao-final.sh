#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   SOLUÇÃO FINAL PARA IMPLANTAÇÃO DO UNIGATE      ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Passo 1: Criar uma página HTML estática simples
echo -e "${YELLOW}Passo 1: Criando página HTML estática simples...${NC}"
mkdir -p frontend/public
cat > frontend/public/index.html << 'EOH'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniGate Dashboard</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        h1 {
            color: #0070f3;
        }
        a {
            color: #0070f3;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .card {
            border: 1px solid #eaeaea;
            border-radius: 10px;
            padding: 1.5rem;
            margin-top: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        ul {
            padding-left: 1.5rem;
        }
        li {
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <h1>UniGate Dashboard</h1>
    <p>Bem-vindo ao Gerenciador de Domínios Cloudflare UniGate.</p>
    
    <div class="card">
        <h2>Links Rápidos</h2>
        <ul>
            <li><a href="/admin/">Painel de Administração</a></li>
            <li><a href="/api/">API</a></li>
        </ul>
    </div>
</body>
</html>
EOH

# Passo 2: Criar um Dockerfile extremamente simplificado para o frontend
echo -e "${YELLOW}Passo 2: Criando Dockerfile extremamente simplificado para o frontend...${NC}"
cat > frontend/Dockerfile.static << 'EOD'
# Usar nginx como servidor web leve
FROM nginx:alpine

# Copiar a página HTML estática
COPY ./public/index.html /usr/share/nginx/html/index.html

# Expor porta 80
EXPOSE 80

# Configuração do nginx para redirecionar rotas para o backend
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /admin/ { \
        proxy_pass http://backend:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /api/ { \
        proxy_pass http://backend:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /static/ { \
        proxy_pass http://backend:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
EOD

# Passo 3: Atualizar docker-compose para usar o Dockerfile estático
echo -e "${YELLOW}Passo 3: Atualizando docker-compose.swarm.local.yml...${NC}"
sed -i '/frontend:/,/image:/ s/dockerfile: Dockerfile.simple/dockerfile: Dockerfile.static/g' docker-compose.swarm.local.yml
echo -e "${GREEN}Docker-compose atualizado para usar o Dockerfile estático${NC}"

# Passo 4: Remover stack existente
echo -e "${YELLOW}Passo 4: Removendo stack anterior...${NC}"
docker stack rm unigate-local

# Aguardar remoção dos serviços
echo -e "${YELLOW}Aguardando remoção dos serviços (15 segundos)...${NC}"
sleep 15

# Passo 5: Construir imagens
echo -e "${YELLOW}Passo 5: Construindo imagens...${NC}"
# Construir imagem do frontend explicitamente
echo -e "${YELLOW}Construindo imagem do frontend...${NC}"
docker build -t unigate-frontend:prod -f frontend/Dockerfile.static frontend/

# Passo 6: Implantar stack
echo -e "${YELLOW}Passo 6: Implantando stack...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Aguardar início dos serviços
echo -e "${YELLOW}Aguardando início dos serviços (20 segundos)...${NC}"
sleep 20

# Passo 7: Verificar status dos serviços
echo -e "${YELLOW}Passo 7: Verificando status dos serviços...${NC}"
docker stack services unigate-local

# Passo 8: Criar superusuário
echo -e "${YELLOW}Passo 8: Criando superusuário...${NC}"
# Aguardar um pouco mais para o backend estar totalmente pronto
sleep 10
# Verificar se o container do backend está em execução
BACKEND_CONTAINER=$(docker ps -q -f name=unigate-local_backend)
if [ -n "$BACKEND_CONTAINER" ]; then
  # Definir credenciais do superusuário
  USERNAME="admin"
  EMAIL="admin@unigate.com.br"
  PASSWORD="admin"
  
  echo -e "${YELLOW}Criando superusuário com as seguintes credenciais:${NC}"
  echo -e "${YELLOW}Usuário: ${USERNAME}${NC}"
  echo -e "${YELLOW}Email: ${EMAIL}${NC}"
  echo -e "${YELLOW}Senha: ${PASSWORD}${NC}"
  
  # Criar superusuário usando shell Python
  docker exec -it $BACKEND_CONTAINER python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='${USERNAME}').delete(); User.objects.create_superuser('${USERNAME}', '${EMAIL}', '${PASSWORD}'); print('Superusuário criado com sucesso!');"
  
  # Passo 9: Coletar arquivos estáticos
  echo -e "${YELLOW}Passo 9: Coletando arquivos estáticos...${NC}"
  docker exec -it $BACKEND_CONTAINER python manage.py collectstatic --noinput
  echo -e "${GREEN}Arquivos estáticos coletados com sucesso!${NC}"
  
  # Passo 10: Definir permissões para arquivos estáticos
  echo -e "${YELLOW}Passo 10: Definindo permissões para arquivos estáticos...${NC}"
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