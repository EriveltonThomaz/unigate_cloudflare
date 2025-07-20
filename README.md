# UniGate - Gerenciador de Domínios Cloudflare

Sistema para gerenciamento de domínios e registros DNS no Cloudflare, com suporte a múltiplos tenants.

## Ambientes de Implantação

Este projeto suporta diferentes ambientes de implantação:

### 1. Desenvolvimento Local com Docker Compose

Para desenvolvimento local com Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up
```

### 2. Produção com Docker Compose

Para ambiente de produção com Docker Compose:

```bash
./build-prod.sh
./run-prod.sh
```

### 3. Teste Local com Docker Swarm

Para testar localmente com Docker Swarm:

```bash
# Implantar ambiente local com Traefik
./deploy-local.sh

# Verificar status do ambiente local
./check-local.sh
```

### 4. Produção com Docker Swarm

Para ambiente de produção com Docker Swarm:

```bash
# Implantar Traefik
./deploy-traefik.sh

# Enviar imagens para o Docker Hub
./push-to-dockerhub.sh

# Implantar stack
./deploy-swarm.sh
```

## Monitoramento e Manutenção

### Verificar Status dos Serviços

```bash
# Para ambiente Docker Compose
./check-status.sh

# Para ambiente Docker Swarm local
./check-local.sh
```

### Reconstruir Frontend

```bash
./rebuild-frontend.sh
```

### Reiniciar Backend

```bash
./restart-backend.sh
```

### Enviar Imagens para Docker Hub

```bash
./push-to-dockerhub.sh
```

## Documentação

- [Guia de Produção](PRODUCTION_GUIDE.md)
- [Guia de Implantação no Swarm](SWARM_DEPLOYMENT_GUIDE.md)
- [Guia do Docker Hub](DOCKERHUB_GUIDE.md)

## Domínios

### Ambiente de Produção
- Frontend: https://cloudflare.unigate.com.br
- Backend API: https://cloudflare.api.unigate.com.br
- Traefik Dashboard: https://cloudflare.tfk.unigate.com.br

### Ambiente Local
- Frontend: http://localhost
- Backend API: http://localhost/api
- Admin: http://localhost/admin
- Traefik Dashboard: http://localhost:8080/dashboard/

## Credenciais Padrão

### Ambiente Local
- **Admin Django**: admin / admin
- **Traefik Dashboard**: admin / admin

### Ambiente de Produção
- As credenciais são definidas no arquivo `.env.prod`