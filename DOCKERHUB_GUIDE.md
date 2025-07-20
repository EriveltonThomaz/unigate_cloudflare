# Guia para Enviar Imagens para o Docker Hub em Modo Privado

Este guia explica como enviar as imagens do projeto UniGate para o Docker Hub em modo privado.

## Pré-requisitos

- Docker instalado
- Conta no Docker Hub
- Projeto UniGate construído

## Método 1: Usando o Script Automatizado

O script `push-to-dockerhub.sh` automatiza todo o processo de envio das imagens para o Docker Hub em modo privado.

### Passo 1: Execute o Script

```bash
./push-to-dockerhub.sh
```

### Passo 2: Forneça as Informações Solicitadas

O script solicitará:
- Nome de usuário do Docker Hub
- Senha do Docker Hub
- Tag para as imagens (opcional, padrão: latest)

### Passo 3: Verifique o Resultado

O script irá:
1. Fazer login no Docker Hub
2. Construir as imagens
3. Tagear as imagens
4. Criar repositórios privados (se necessário)
5. Enviar as imagens para o Docker Hub
6. Salvar as variáveis de ambiente em `.env.dockerhub`

## Método 2: Processo Manual

Se preferir fazer o processo manualmente, siga estes passos:

### Passo 1: Faça Login no Docker Hub

```bash
docker login
```

### Passo 2: Construa as Imagens

```bash
docker-compose -f docker-compose.prod.yml build backend frontend
```

### Passo 3: Crie Repositórios Privados no Docker Hub

1. Acesse [Docker Hub](https://hub.docker.com/)
2. Clique em "Create Repository"
3. Digite o nome do repositório (ex: cloudflare-backend)
4. Selecione "Private"
5. Clique em "Create"
6. Repita para o segundo repositório (ex: cloudflare-frontend)

### Passo 4: Tagear as Imagens

```bash
docker tag unigate-backend:prod seu-usuario/cloudflare-backend:latest
docker tag unigate-frontend:simple seu-usuario/cloudflare-frontend:latest
```

### Passo 5: Enviar as Imagens

```bash
docker push seu-usuario/cloudflare-backend:latest
docker push seu-usuario/cloudflare-frontend:latest
```

### Passo 6: Logout do Docker Hub

```bash
docker logout
```

## Usando as Imagens do Docker Hub

### Atualizar as Variáveis de Ambiente

Crie um arquivo `.env.dockerhub` com as seguintes variáveis:

```bash
DOCKER_USERNAME=seu-usuario
TAG=latest
```

### Implantar com Docker Swarm

```bash
# Carregar variáveis de ambiente
source .env.dockerhub

# Implantar stack
docker stack deploy -c docker-compose.swarm.yml unigate
```

## Notas Importantes

- **Segurança**: Nunca compartilhe suas credenciais do Docker Hub
- **Limites**: Contas gratuitas do Docker Hub têm limite de repositórios privados
- **Custos**: Verifique os custos associados a repositórios privados no Docker Hub
- **Alternativas**: Considere usar um registro privado como Harbor ou GitLab Container Registry para projetos maiores