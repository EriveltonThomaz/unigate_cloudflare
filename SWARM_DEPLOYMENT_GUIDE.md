# Guia de Implantação para Docker Swarm

Este guia explica como implantar o projeto UniGate em um ambiente Docker Swarm com Traefik como proxy reverso.

## Pré-requisitos

- Docker em modo Swarm
- Banco de dados PostgreSQL externo
- Domínios configurados (unigate.com.br, api.unigate.com.br, traefik.unigate.com.br)
- Acesso à porta 80 e 443 para o Let's Encrypt

## Configuração do Ambiente

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env.prod` com suas configurações:

```bash
# Banco de dados
POSTGRES_DB=cloudflare_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_HOST=seu_host_postgres
POSTGRES_PORT=5432

# Backend
DEBUG=False
SECRET_KEY=sua_chave_secreta
ALLOWED_HOSTS=localhost,127.0.0.1,backend,frontend,*.unigate.com.br
CORS_ALLOWED_ORIGINS=https://unigate.com.br

# Frontend
NEXT_PUBLIC_API_URL=https://api.unigate.com.br/api
NODE_ENV=production

# Superusuário
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@unigate.com.br
DJANGO_SUPERUSER_PASSWORD=senha_segura_admin
```

### 2. Construir Imagens

Construa as imagens do backend e frontend:

```bash
docker-compose -f docker-compose.prod.yml build backend frontend
```

### 3. Implantar no Swarm

Execute o script de implantação:

```bash
./deploy-swarm.sh
```

Este script:
1. Verifica se o Docker está em modo Swarm
2. Cria a rede traefik-public se não existir
3. Implanta o Traefik se necessário
4. Implanta o stack UniGate

### 4. Verificar Status

Verifique o status dos serviços:

```bash
docker stack services unigate
```

### 5. Inicializar o Banco de Dados

Para inicializar o banco de dados e criar um superusuário:

```bash
docker service create --name init-backend \
  --env-file .env.prod \
  --network traefik-public \
  unigate-backend:prod \
  sh -c "python manage.py migrate && \
         echo \"from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('${DJANGO_SUPERUSER_USERNAME}', '${DJANGO_SUPERUSER_EMAIL}', '${DJANGO_SUPERUSER_PASSWORD}') if not User.objects.filter(username='${DJANGO_SUPERUSER_USERNAME}').exists() else print('Superuser already exists')\" | python manage.py shell"
```

## Arquitetura

### Componentes

- **Traefik**: Proxy reverso e balanceador de carga
- **Backend**: API Django com 2 réplicas
- **Frontend**: Interface de usuário com 2 réplicas
- **PostgreSQL**: Banco de dados externo

### Roteamento

- **Frontend**: https://unigate.com.br
- **Backend API**: https://api.unigate.com.br
- **Admin**: https://unigate.com.br/admin
- **Traefik Dashboard**: https://traefik.unigate.com.br

## Escalabilidade

Para escalar os serviços:

```bash
docker service scale unigate_backend=4
docker service scale unigate_frontend=4
```

## Monitoramento

Para monitorar os logs:

```bash
docker service logs unigate_backend
docker service logs unigate_frontend
```

## Atualização

Para atualizar os serviços:

1. Construa novas imagens:
   ```bash
   docker-compose -f docker-compose.prod.yml build backend frontend
   ```

2. Atualize os serviços:
   ```bash
   docker service update --image unigate-backend:prod unigate_backend
   docker service update --image unigate-frontend:simple unigate_frontend
   ```

## Solução de Problemas

### Erro de Conexão com o Banco de Dados

Verifique se o banco de dados PostgreSQL está acessível:

```bash
docker exec -it $(docker ps -q -f name=unigate_backend) sh -c "nc -zv $POSTGRES_HOST $POSTGRES_PORT"
```

### Erro de Certificado SSL

Verifique os logs do Traefik:

```bash
docker service logs traefik
```

### Serviços não Acessíveis

Verifique se os serviços estão em execução:

```bash
docker stack ps unigate
```