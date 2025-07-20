#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   SOLUÇÃO COM PÁGINA ESTÁTICA                    ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Passo 1: Criar Dockerfile para servir página estática
echo -e "${YELLOW}Passo 1: Criando Dockerfile para servir página estática...${NC}"
cat > frontend/Dockerfile.static << 'EOD'
# Usar nginx como servidor web leve
FROM nginx:alpine

# Copiar a página HTML estática
COPY ./public/index.html /usr/share/nginx/html/index.html

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

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
EOD

# Passo 2: Atualizar docker-compose para usar o Dockerfile estático
echo -e "${YELLOW}Passo 2: Atualizando docker-compose.swarm.local.yml...${NC}"
sed -i '/frontend:/,/image:/ s/dockerfile: Dockerfile.prod/dockerfile: Dockerfile.static/g' docker-compose.swarm.local.yml
echo -e "${GREEN}Docker-compose atualizado para usar o Dockerfile estático${NC}"

# Passo 3: Remover stack existente
echo -e "${YELLOW}Passo 3: Removendo stack anterior...${NC}"
docker stack rm unigate-local

# Aguardar remoção dos serviços
echo -e "${YELLOW}Aguardando remoção dos serviços (15 segundos)...${NC}"
sleep 15

# Passo 4: Construir imagens
echo -e "${YELLOW}Passo 4: Construindo imagens...${NC}"
# Construir imagem do frontend explicitamente
echo -e "${YELLOW}Construindo imagem do frontend...${NC}"
docker build -t unigate-frontend:prod -f frontend/Dockerfile.static frontend/

# Passo 5: Implantar stack
echo -e "${YELLOW}Passo 5: Implantando stack...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Aguardar início dos serviços
echo -e "${YELLOW}Aguardando início dos serviços (20 segundos)...${NC}"
sleep 20

# Passo 6: Verificar status dos serviços
echo -e "${YELLOW}Passo 6: Verificando status dos serviços...${NC}"
docker stack services unigate-local

# Passo 7: Criar superusuário
echo -e "${YELLOW}Passo 7: Criando superusuário...${NC}"
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
  docker exec -it $BACKEND_CONTAINER python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
User.objects.filter(username='${USERNAME}').delete();
User.objects.create_superuser('${USERNAME}', '${EMAIL}', '${PASSWORD}');
print('Superusuário criado com sucesso!');
"
  
  # Passo 8: Coletar arquivos estáticos
  echo -e "${YELLOW}Passo 8: Coletando arquivos estáticos...${NC}"
  docker exec -it $BACKEND_CONTAINER python manage.py collectstatic --noinput
  echo -e "${GREEN}Arquivos estáticos coletados com sucesso!${NC}"
  
  # Passo 9: Definir permissões para arquivos estáticos
  echo -e "${YELLOW}Passo 9: Definindo permissões para arquivos estáticos...${NC}"
  docker exec -it $BACKEND_CONTAINER chmod -R 755 /app/staticfiles
  echo -e "${GREEN}Permissões definidas com sucesso!${NC}"
else
  echo -e "${RED}Container do backend não encontrado. Criação de superusuário e coleta de arquivos estáticos ignorados.${NC}"
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Implantação com página estática concluída!${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "${GREEN}- Frontend: http://localhost/${NC}"
echo -e "${GREEN}- Admin: http://localhost/admin/${NC}"
echo -e "${GREEN}  Usuário: admin${NC}"
echo -e "${GREEN}  Senha: admin${NC}"
echo -e "${BLUE}==================================================${NC}"