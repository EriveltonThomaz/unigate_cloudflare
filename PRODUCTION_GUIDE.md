# Guia de Produção para UniGate

Este guia explica como construir e executar o projeto UniGate em um ambiente de produção.

## Pré-requisitos

- Docker e Docker Compose instalados
- Servidor Linux com pelo menos 4GB de RAM e 2 CPUs
- Domínio configurado (opcional, mas recomendado)
- Certificados SSL (opcional, mas recomendado)

## Preparação para Produção

### 1. Construir Imagens de Produção

Execute o script de construção de imagens de produção:

```bash
./build-prod.sh
```

Este script:
1. Cria um arquivo `.env.prod` com valores padrão (se não existir)
2. Solicita que você edite o arquivo com suas configurações de produção
3. Constrói as imagens Docker otimizadas para produção

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.prod` com suas configurações de produção:

```bash
# Banco de dados
POSTGRES_DB=mydatabase
POSTGRES_USER=myuser
POSTGRES_PASSWORD=StrongPassword123!
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Backend
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production

# Superusuário
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=StrongAdminPassword123!
```

### 3. Configurar Nginx (Opcional)

Se você estiver usando seu próprio domínio e certificados SSL:

1. Edite o arquivo `nginx/conf/default.conf` para configurar seu domínio
2. Coloque seus certificados SSL em `nginx/ssl/`
3. Descomente a seção HTTPS no arquivo de configuração do Nginx

## Iniciar Serviços em Produção

Execute o script para iniciar os serviços em produção:

```bash
./run-prod.sh
```

Este script:
1. Inicia todos os serviços definidos no `docker-compose.prod.yml`
2. Verifica se os serviços estão em execução
3. Pergunta se você deseja inicializar o banco de dados e criar um superusuário

## Verificação

Após iniciar os serviços, verifique:

1. Frontend: Acesse `http://localhost` ou seu domínio configurado
2. Backend: Acesse `http://localhost/api` ou seu domínio configurado/api
3. Admin Django: Acesse `http://localhost/admin` ou seu domínio configurado/admin

## Monitoramento e Manutenção

### Logs

Para ver os logs dos serviços:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f
```

Para ver os logs de um serviço específico:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f [service_name]
```

### Backup do Banco de Dados

Para fazer backup do banco de dados:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod exec db pg_dump -U myuser mydatabase > backup.sql
```

### Restauração do Banco de Dados

Para restaurar o banco de dados a partir de um backup:

```bash
cat backup.sql | docker-compose -f docker-compose.prod.yml --env-file .env.prod exec -T db psql -U myuser -d mydatabase
```

### Atualização

Para atualizar os serviços com novas versões:

1. Pare os serviços:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod down
   ```

2. Reconstrua as imagens:
   ```bash
   ./build-prod.sh
   ```

3. Inicie os serviços novamente:
   ```bash
   ./run-prod.sh
   ```

## Reconstrução e Solução de Problemas

### Reconstruir Serviços

Se você encontrar problemas com os serviços em produção, pode usar o script de reconstrução:

```bash
./rebuild-prod.sh
```

Este script:
1. Cria os diretórios necessários para arquivos estáticos e mídia
2. Para os serviços em execução
3. Remove volumes antigos (opcional)
4. Reconstrói as imagens Docker sem usar cache
5. Inicia os serviços novamente
6. Coleta arquivos estáticos do Django
7. Oferece a opção de inicializar o banco de dados

### Monitoramento de Serviços

Para monitorar o status dos serviços, use o script de verificação:

```bash
./check-status.sh
```

Este script fornece um menu interativo para:
1. Verificar o status dos serviços
2. Verificar logs dos serviços
3. Verificar uso de recursos
4. Verificar conectividade entre serviços
5. Verificar certificados SSL
6. Reiniciar serviços
7. Executar comandos personalizados
8. Fazer backup do banco de dados

### Problemas Comuns e Soluções

#### Erro de Conexão com o Banco de Dados

Se o backend não conseguir se conectar ao banco de dados:

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique se o serviço do banco de dados está em execução:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod ps db
   ```
3. Use o script `check-status.sh` para verificar a conectividade entre serviços

#### Arquivos Estáticos Não Encontrados

Se os arquivos estáticos do Django (CSS, JS) não estiverem sendo carregados:

1. Verifique se os volumes estão montados corretamente:
   ```bash
   docker volume ls | grep static_volume
   ```
2. Execute a coleta de arquivos estáticos manualmente:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod exec backend python manage.py collectstatic --noinput
   ```
3. Verifique se o Nginx está configurado para servir os arquivos estáticos do diretório correto

#### Erro no Build do Frontend

Se o frontend falhar durante o build:

1. Verifique os logs do build:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod logs frontend
   ```
2. Se houver erros de formatação ou ESLint, considere desativar essas verificações durante o build
3. Aumente a memória disponível para o Node.js durante o build:
   ```
   NODE_OPTIONS="--max-old-space-size=4096"
   ```

#### Erro de CORS

Se encontrar erros de CORS:

1. Verifique se `CORS_ALLOWED_ORIGINS` inclui o domínio do frontend
2. Verifique se o frontend está usando a URL correta para a API

#### Erro de Certificado SSL

Se encontrar erros relacionados a certificados SSL:

1. Verifique se os certificados estão no diretório correto (`nginx/ssl/`)
2. Verifique se os nomes dos arquivos correspondem aos configurados no Nginx
3. Verifique se os certificados são válidos:
   ```bash
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   ```