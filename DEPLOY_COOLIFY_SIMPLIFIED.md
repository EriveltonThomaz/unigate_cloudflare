# Deploy Simplificado no Coolify

Este guia explica como fazer o deploy do projeto UniGate no Coolify de forma simplificada, evitando problemas de formatação e build.

## Pré-requisitos

- Conta no Coolify
- Repositório Git com o código do projeto
- Servidor com Docker instalado

## Preparação para Deploy

### 1. Configuração para Desenvolvimento

Para testar localmente antes do deploy:

```bash
# Execute o script de desenvolvimento
./run-dev.sh
```

Este script:
1. Cria um arquivo .env com valores padrão
2. Constrói as imagens Docker usando o Dockerfile.dev
3. Inicia os serviços usando docker-compose.dev.yml
4. Inicializa o banco de dados e cria um superusuário

### 2. Preparação para Deploy no Coolify

Para o deploy no Coolify, você tem duas opções:

#### Opção 1: Deploy com Build Separado

1. Construa o frontend localmente:
   ```bash
   cd frontend
   pnpm install
   pnpm run build
   ```

2. Copie a pasta `.next` para um novo repositório Git
3. Configure o Coolify para usar um Dockerfile simples que apenas serve os arquivos estáticos

#### Opção 2: Deploy com Modo de Desenvolvimento

1. Configure o Coolify para usar o `docker-compose.dev.yml`
2. Isso iniciará o frontend em modo de desenvolvimento (mais lento, mas evita problemas de build)

## Configuração no Coolify

### 1. Adicionar Novo Projeto

1. Faça login no Coolify
2. Clique em "Add New" > "Application"
3. Selecione "Docker Compose" como tipo de aplicação
4. Conecte ao seu repositório Git
5. Especifique o arquivo `docker-compose.dev.yml` como arquivo de composição

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

**Frontend:**
- `NEXT_PUBLIC_API_URL`: URL da API (ex: "https://api.seu-dominio.com/api")
- `NODE_ENV`: "development" (para evitar problemas de build)

**Superusuário:**
- `DJANGO_SUPERUSER_USERNAME`: Nome de usuário do superusuário
- `DJANGO_SUPERUSER_EMAIL`: Email do superusuário
- `DJANGO_SUPERUSER_PASSWORD`: Senha do superusuário

### 3. Configurar Domínios

1. Configure o domínio para o frontend (ex: "seu-dominio.com")
2. Configure o domínio para o backend (ex: "api.seu-dominio.com")

## Deploy

1. Clique em "Deploy" para iniciar o processo de deploy
2. Após o deploy do banco de dados e backend, execute o serviço `init_backend` para inicializar o banco de dados

## Verificação

Após o deploy, verifique:

1. Frontend: Acesse seu domínio (ex: "https://seu-dominio.com")
2. Backend: Acesse a API (ex: "https://api.seu-dominio.com/api")
3. Admin Django: Acesse o painel admin (ex: "https://api.seu-dominio.com/admin")

## Solução de Problemas

### Erro de Build do Frontend

Se continuar enfrentando erros de build no frontend:

1. Considere usar a opção de deploy com build separado
2. Ou mantenha o frontend em modo de desenvolvimento (mais lento, mas funcional)

### Erro de Conexão com o Banco de Dados

Se o backend não conseguir se conectar ao banco de dados:

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique se o serviço do banco de dados está em execução

### Erro de CORS

Se encontrar erros de CORS:

1. Verifique se `CORS_ALLOWED_ORIGINS` inclui o domínio do frontend
2. Verifique se o frontend está usando a URL correta para a API