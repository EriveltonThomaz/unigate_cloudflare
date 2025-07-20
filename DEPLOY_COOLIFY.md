# Deploy no Coolify

Este guia explica como fazer o deploy do projeto UniGate no Coolify.

## Pré-requisitos

- Conta no Coolify
- Repositório Git com o código do projeto
- Servidor com Docker instalado

## Preparação para Deploy

Antes de fazer o deploy no Coolify, execute o script de correção para garantir que o projeto esteja pronto para build:

```bash
./fix-docker-build.sh
```

Este script fará:
1. Backup dos arquivos originais
2. Correção do Dockerfile do frontend
3. Atualização do next.config.js para suportar exportação standalone
4. Atualização do docker-compose.yml com configurações otimizadas

## Configuração no Coolify

### 1. Adicionar Novo Projeto

1. Faça login no Coolify
2. Clique em "Add New" > "Application"
3. Selecione "Docker Compose" como tipo de aplicação
4. Conecte ao seu repositório Git

### 2. Configurar Variáveis de Ambiente

Configure as seguintes variáveis de ambiente:

**Banco de Dados:**
- `POSTGRES_DB`: Nome do banco de dados
- `POSTGRES_USER`: Usuário do banco de dados
- `POSTGRES_PASSWORD`: Senha do banco de dados

**Backend:**
- `DEBUG`: "False" para produção
- `SECRET_KEY`: Chave secreta para o Django
- `ALLOWED_HOSTS`: Lista de hosts permitidos (ex: "seu-dominio.com,www.seu-dominio.com")
- `CORS_ALLOWED_ORIGINS`: Origens permitidas para CORS (ex: "https://seu-dominio.com")
- `CLOUDFLARE_API_TOKEN`: Token da API Cloudflare
- `CLOUDFLARE_ACCOUNT_ID`: ID da conta Cloudflare

**Frontend:**
- `NEXT_PUBLIC_API_URL`: URL da API (ex: "https://api.seu-dominio.com/api")
- `NODE_ENV`: "production"

**Superusuário:**
- `DJANGO_SUPERUSER_USERNAME`: Nome de usuário do superusuário
- `DJANGO_SUPERUSER_EMAIL`: Email do superusuário
- `DJANGO_SUPERUSER_PASSWORD`: Senha do superusuário

### 3. Configurar Domínios

1. Configure o domínio para o frontend (ex: "seu-dominio.com")
2. Configure o domínio para o backend (ex: "api.seu-dominio.com")

### 4. Configurar Portas

- Frontend: 3000
- Backend: 8000

### 5. Configurar Volumes Persistentes

- Banco de dados: `/var/lib/postgresql/data/`

## Deploy

1. Clique em "Deploy" para iniciar o processo de build e deploy
2. Após o deploy do banco de dados e backend, execute o serviço `init_backend` para inicializar o banco de dados:
   ```bash
   docker-compose --profile init up init_backend
   ```

## Verificação

Após o deploy, verifique:

1. Frontend: Acesse seu domínio (ex: "https://seu-dominio.com")
2. Backend: Acesse a API (ex: "https://api.seu-dominio.com/api")
3. Admin Django: Acesse o painel admin (ex: "https://api.seu-dominio.com/admin")

## Solução de Problemas

### Erro de Build do Frontend

Se encontrar erros de build no frontend, verifique:

1. **Problema com pnpm-lock.yaml**: Se encontrar o erro `ERR_PNPM_OUTDATED_LOCKFILE`, use o Dockerfile simples que não usa o flag `--frozen-lockfile`:
   ```bash
   # No script fix-docker-build.sh, escolha a opção 2
   ./fix-docker-build.sh
   # Escolha: 2
   ```

2. **Problemas com BuildKit**: Se encontrar erros relacionados ao BuildKit (como `--mount=type=cache`), use o Dockerfile simples que não depende de recursos avançados do Docker.

3. **Versões incompatíveis**: Verifique se as versões no package.json e pnpm-lock.yaml estão sincronizadas. Você pode atualizar o lockfile com:
   ```bash
   cd frontend
   pnpm install
   cd ..
   ```

4. Verifique se o next.config.js foi atualizado para incluir `output: 'standalone'`

5. Consulte os logs de build no Coolify para identificar problemas específicos

### Erro de Conexão com o Banco de Dados

Se o backend não conseguir se conectar ao banco de dados:

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique se o serviço do banco de dados está em execução
3. Verifique se o banco de dados foi inicializado corretamente

### Erro de CORS

Se encontrar erros de CORS:

1. Verifique se `CORS_ALLOWED_ORIGINS` inclui o domínio do frontend
2. Verifique se o frontend está usando a URL correta para a API

## Manutenção

### Backup do Banco de Dados

Configure backups automáticos para o banco de dados:

1. No Coolify, vá para o serviço do banco de dados
2. Configure backups automáticos (diários, semanais, etc.)
3. Defina um local seguro para armazenar os backups

### Monitoramento

Configure monitoramento para sua aplicação:

1. No Coolify, ative o monitoramento para os serviços
2. Configure alertas para CPU, memória e disco
3. Configure notificações para eventos importantes (ex: serviço parado)