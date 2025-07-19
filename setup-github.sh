#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verificando requisitos para envio ao GitHub...${NC}"

# Verificar se o Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git não está instalado. Por favor, instale o Git primeiro.${NC}"
    exit 1
fi

# Verificar se o nome e email do Git estão configurados
git_name=$(git config --global user.name)
git_email=$(git config --global user.email)

if [ -z "$git_name" ] || [ -z "$git_email" ]; then
    echo -e "${RED}Git não está configurado corretamente.${NC}"
    echo -e "${YELLOW}Configure seu nome e email:${NC}"
    echo "git config --global user.name \"Seu Nome\""
    echo "git config --global user.email \"seu.email@exemplo.com\""
    exit 1
fi

echo -e "${GREEN}Git configurado corretamente como: $git_name <$git_email>${NC}"

# Verificar conexão com GitHub (apenas para SSH)
if [[ "$repo_url" == *"git@github.com"* ]]; then
    echo -e "${YELLOW}Verificando conexão SSH com GitHub...${NC}"
    if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo -e "${RED}Não foi possível autenticar com GitHub via SSH.${NC}"
        echo -e "${YELLOW}Verifique se sua chave SSH está configurada:${NC}"
        echo "https://docs.github.com/pt/authentication/connecting-to-github-with-ssh"
        exit 1
    fi
    echo -e "${GREEN}Conexão SSH com GitHub verificada.${NC}"
fi

# Inicializar repositório Git se não existir
if [ ! -d .git ]; then
    echo -e "${GREEN}Inicializando repositório Git...${NC}"
    git init
else
    echo -e "${GREEN}Repositório Git já inicializado.${NC}"
fi

# Adicionar todos os arquivos
echo -e "${GREEN}Adicionando arquivos ao Git...${NC}"
git add .

# Fazer o primeiro commit
echo -e "${GREEN}Criando commit inicial...${NC}"
git commit -m "Versão inicial do projeto UniGate"

# Solicitar URL do repositório GitHub
echo -e "${YELLOW}Digite a URL do seu repositório GitHub (ex: https://github.com/seu-usuario/unigate.git):${NC}"
read repo_url

if [ -z "$repo_url" ]; then
    echo -e "${RED}URL do repositório não fornecida. Saindo...${NC}"
    exit 1
fi

# Adicionar repositório remoto
echo -e "${GREEN}Adicionando repositório remoto...${NC}"
git remote add origin $repo_url

# Configurar branch principal
echo -e "${GREEN}Configurando branch principal como 'main'...${NC}"
git branch -M main

# Enviar para o GitHub
echo -e "${GREEN}Enviando código para o GitHub...${NC}"
git push -u origin main

echo -e "${GREEN}Configuração concluída! O projeto foi enviado para o GitHub.${NC}"
echo -e "${YELLOW}URL do repositório: ${repo_url}${NC}"
