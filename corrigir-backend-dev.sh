#!/bin/bash
# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CORREÇÃO DO BACKEND PARA AMBIENTE DEV          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Entrar no diretório do backend
cd backend

# Passo 1: Verificar se o ambiente virtual existe
echo -e "${YELLOW}Passo 1: Verificando ambiente virtual...${NC}"
if [ ! -d "venv" ]; then
  echo -e "${YELLOW}Criando ambiente virtual...${NC}"
  python -m venv venv
fi

# Passo 2: Ativar ambiente virtual
echo -e "${YELLOW}Passo 2: Ativando ambiente virtual...${NC}"
source venv/bin/activate

# Passo 3: Instalar dependências
echo -e "${YELLOW}Passo 3: Instalando dependências...${NC}"
pip install -r requirements.txt

# Passo 4: Verificar se o arquivo .env existe
echo -e "${YELLOW}Passo 4: Verificando arquivo .env...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Criando arquivo .env padrão...${NC}"
  cat > .env << 'EOE'
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://postgres:postgres@localhost:5432/unigate
DJANGO_SETTINGS_MODULE=config.settings
EOE
fi

# Passo 5: Executar migrações
echo -e "${YELLOW}Passo 5: Executando migrações...${NC}"
python manage.py migrate

# Passo 6: Criar superusuário
echo -e "${YELLOW}Passo 6: Criando superusuário...${NC}"
echo -e "${YELLOW}Usuário: admin${NC}"
echo -e "${YELLOW}Email: admin@unigate.com.br${NC}"
echo -e "${YELLOW}Senha: admin${NC}"

# Criar superusuário usando shell Python
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
User.objects.filter(username='admin').delete();
User.objects.create_superuser('admin', 'admin@unigate.com.br', 'admin');
print('Superusuário criado com sucesso!');
"

# Passo 7: Coletar arquivos estáticos
echo -e "${YELLOW}Passo 7: Coletando arquivos estáticos...${NC}"
python manage.py collectstatic --noinput

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Correção do backend concluída!${NC}"
echo -e "${GREEN}Agora você pode executar:${NC}"
echo -e "${GREEN}cd backend${NC}"
echo -e "${GREEN}source venv/bin/activate${NC}"
echo -e "${GREEN}python manage.py runserver${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Acesse o admin em: http://localhost:8000/admin/${NC}"
echo -e "${YELLOW}Usuário: admin${NC}"
echo -e "${YELLOW}Senha: admin${NC}"
echo -e "${BLUE}==================================================${NC}"