#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

# Fazer o commit inicial
echo -e "${GREEN}Criando commit inicial...${NC}"
read -p "Digite a mensagem do commit (ou pressione Enter para usar 'Versão inicial do projeto UniGate'): " commit_message
commit_message=${commit_message:-"Versão inicial do projeto UniGate"}
git commit -m "$commit_message"

# Solicitar URL do repositório GitHub
echo -e "${YELLOW}Digite a URL do seu repositório GitHub (ex: https://github.com/seu-usuario/unigate.git):${NC}"
read repo_url

if [ -z "$repo_url" ]; then
    echo -e "${RED}URL do repositório não fornecida. Saindo...${NC}"
    exit 1
fi

# Adicionar repositório remoto
echo -e "${GREEN}Adicionando repositório remoto...${NC}"
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}Remoto 'origin' já existe. Deseja substituí-lo? (s/n)${NC}"
    read replace_remote
    if [[ $replace_remote == "s" || $replace_remote == "S" ]]; then
        git remote remove origin
        git remote add origin $repo_url
    fi
else
    git remote add origin $repo_url
fi

# Perguntar sobre branch ou tag
echo -e "${BLUE}O que você deseja fazer?${NC}"
echo "1) Usar a branch 'main' (padrão)"
echo "2) Criar uma nova branch"
echo "3) Criar uma tag"
read -p "Escolha uma opção (1-3): " branch_option

case $branch_option in
    1)
        # Configurar branch principal como main
        echo -e "${GREEN}Configurando branch principal como 'main'...${NC}"
        git branch -M main
        
        # Enviar para o GitHub
        echo -e "${GREEN}Enviando código para o GitHub (branch main)...${NC}"
        git push -u origin main
        ;;
    2)
        # Criar nova branch
        read -p "Digite o nome da nova branch: " branch_name
        if [ -z "$branch_name" ]; then
            echo -e "${RED}Nome da branch não fornecido. Usando 'main'.${NC}"
            branch_name="main"
        fi
        
        echo -e "${GREEN}Criando e configurando branch '$branch_name'...${NC}"
        git branch -M $branch_name
        
        # Enviar para o GitHub
        echo -e "${GREEN}Enviando código para o GitHub (branch $branch_name)...${NC}"
        git push -u origin $branch_name
        ;;
    3)
        # Criar tag
        read -p "Digite o nome da tag (ex: v1.0.0): " tag_name
        if [ -z "$tag_name" ]; then
            echo -e "${RED}Nome da tag não fornecido. Saindo...${NC}"
            exit 1
        fi
        
        read -p "Digite uma mensagem para a tag (opcional): " tag_message
        
        echo -e "${GREEN}Criando tag '$tag_name'...${NC}"
        if [ -z "$tag_message" ]; then
            git tag $tag_name
        else
            git tag -a $tag_name -m "$tag_message"
        fi
        
        # Configurar branch principal como main (necessário para o push)
        git branch -M main
        
        # Enviar a tag para o GitHub
        echo -e "${GREEN}Enviando tag para o GitHub...${NC}"
        git push origin $tag_name
        
        # Enviar também a branch main
        echo -e "${GREEN}Enviando código para o GitHub (branch main)...${NC}"
        git push -u origin main
        ;;
    *)
        echo -e "${RED}Opção inválida. Usando 'main' como padrão.${NC}"
        git branch -M main
        git push -u origin main
        ;;
esac

echo -e "${GREEN}Configuração concluída! O projeto foi enviado para o GitHub.${NC}"
echo -e "${YELLOW}URL do repositório: ${repo_url}${NC}"