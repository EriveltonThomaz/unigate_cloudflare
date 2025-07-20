#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Variáveis globais
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
SERVICES=("db" "backend" "frontend" "nginx")

# Função para exibir o cabeçalho
show_header() {
    clear
    echo -e "${BLUE}${BOLD}================================================${NC}"
    echo -e "${BLUE}${BOLD}   UNIGATE - MONITOR DE SERVIÇOS EM PRODUÇÃO    ${NC}"
    echo -e "${BLUE}${BOLD}================================================${NC}"
    echo ""
}

# Função para verificar pré-requisitos
check_prerequisites() {
    # Verificar se o Docker está instalado
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
        exit 1
    fi

    # Verificar se o Docker Compose está instalado
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.${NC}"
        exit 1
    fi

    # Verificar se o arquivo .env.prod existe
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}Arquivo $ENV_FILE não encontrado. Execute o script build-prod.sh primeiro.${NC}"
        exit 1
    fi
}

# Função para verificar status dos serviços
check_services_status() {
    echo -e "${GREEN}${BOLD}Status dos serviços:${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps
    
    echo -e "\n${GREEN}${BOLD}Verificando saúde dos serviços:${NC}"
    for service in "${SERVICES[@]}"; do
        container_id=$(docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps -q $service 2>/dev/null)
        if [ -z "$container_id" ]; then
            echo -e "  ${service}: ${RED}Não está em execução${NC}"
            continue
        fi
        
        status=$(docker inspect --format='{{.State.Status}}' $container_id 2>/dev/null)
        health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $container_id 2>/dev/null)
        
        if [ "$status" == "running" ]; then
            if [ "$health" == "healthy" ] || [ "$health" == "N/A" ]; then
                echo -e "  ${service}: ${GREEN}Ativo${NC} (Status: $status, Saúde: $health)"
            else
                echo -e "  ${service}: ${YELLOW}Ativo mas com problemas${NC} (Status: $status, Saúde: $health)"
            fi
        else
            echo -e "  ${service}: ${RED}Inativo${NC} (Status: $status)"
        fi
    done
    
    echo -e "\nPressione Enter para continuar..."
    read
}

# Função para verificar logs dos serviços
check_services_logs() {
    local lines=${1:-10}
    
    for service in "${SERVICES[@]}"; do
        echo -e "\n${YELLOW}${BOLD}Logs do $service (últimas $lines linhas):${NC}"
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs --tail=$lines $service
        echo -e "${BLUE}----------------------------------------${NC}"
    done
    
    echo -e "\nPressione Enter para continuar..."
    read
}

# Função para verificar uso de recursos
check_resources_usage() {
    echo -e "${GREEN}${BOLD}Uso de recursos:${NC}"
    docker stats --no-stream $(docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps -q)
    
    echo -e "\n${GREEN}${BOLD}Uso de disco:${NC}"
    echo -e "${YELLOW}Volumes Docker:${NC}"
    docker system df -v | grep -A 10 "VOLUME NAME"
    
    echo -e "\n${YELLOW}Espaço em disco do sistema:${NC}"
    df -h | grep -E "(Filesystem|/$|/var)"
    
    echo -e "\nPressione Enter para continuar..."
    read
}

# Função para verificar conectividade entre serviços
check_connectivity() {
    echo -e "${GREEN}${BOLD}Verificando conectividade entre serviços:${NC}"
    
    # Verificar conectividade do backend para o banco de dados
    echo -e "\n${YELLOW}Conectividade Backend -> Database:${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T backend sh -c "nc -zv db 5432" || echo -e "${RED}Falha na conexão${NC}"
    
    # Verificar conectividade do frontend para o backend
    echo -e "\n${YELLOW}Conectividade Frontend -> Backend:${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T frontend sh -c "curl -s -o /dev/null -w '%{http_code}' http://backend:8000/api/" || echo -e "${RED}Falha na conexão${NC}"
    
    # Verificar conectividade do nginx para o frontend e backend
    echo -e "\n${YELLOW}Conectividade Nginx -> Frontend:${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T nginx sh -c "curl -s -o /dev/null -w '%{http_code}' http://frontend:3000/" || echo -e "${RED}Falha na conexão${NC}"
    
    echo -e "\n${YELLOW}Conectividade Nginx -> Backend:${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T nginx sh -c "curl -s -o /dev/null -w '%{http_code}' http://backend:8000/api/" || echo -e "${RED}Falha na conexão${NC}"
    
    echo -e "\nPressione Enter para continuar..."
    read
}

# Função para verificar certificados SSL
check_ssl_certificates() {
    echo -e "${GREEN}${BOLD}Verificando certificados SSL:${NC}"
    
    if [ -d "./nginx/ssl" ]; then
        echo -e "${YELLOW}Certificados encontrados:${NC}"
        ls -la ./nginx/ssl
        
        # Verificar validade dos certificados
        for cert in ./nginx/ssl/*.crt ./nginx/ssl/*.pem; do
            if [ -f "$cert" ]; then
                echo -e "\n${YELLOW}Informações do certificado: $cert${NC}"
                openssl x509 -in "$cert" -text -noout | grep -E "Subject:|Issuer:|Not Before:|Not After :|DNS:"
            fi
        done
    else
        echo -e "${YELLOW}Diretório de certificados SSL não encontrado.${NC}"
    fi
    
    echo -e "\nPressione Enter para continuar..."
    read
}

# Função para reiniciar serviços
restart_service() {
    show_header
    echo -e "${GREEN}${BOLD}Reiniciar Serviços${NC}"
    echo -e "${YELLOW}Selecione o serviço para reiniciar:${NC}"
    echo -e "  1) Banco de Dados (db)"
    echo -e "  2) Backend"
    echo -e "  3) Frontend"
    echo -e "  4) Nginx"
    echo -e "  5) Todos os serviços"
    echo -e "  0) Voltar"
    
    read -p "Opção: " option
    
    case $option in
        1)
            echo -e "${YELLOW}Reiniciando banco de dados...${NC}"
            docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart db
            ;;
        2)
            echo -e "${YELLOW}Reiniciando backend...${NC}"
            docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart backend
            ;;
        3)
            echo -e "${YELLOW}Reiniciando frontend...${NC}"
            docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart frontend
            ;;
        4)
            echo -e "${YELLOW}Reiniciando nginx...${NC}"
            docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart nginx
            ;;
        5)
            echo -e "${YELLOW}Reiniciando todos os serviços...${NC}"
            docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}Opção inválida!${NC}"
            ;;
    esac
    
    echo -e "\n${GREEN}Operação concluída!${NC}"
    echo -e "\nPressione Enter para continuar..."
    read
}

# Função para executar comandos personalizados
run_custom_command() {
    show_header
    echo -e "${GREEN}${BOLD}Executar Comando Personalizado${NC}"
    echo -e "${YELLOW}Selecione o serviço:${NC}"
    echo -e "  1) Banco de Dados (db)"
    echo -e "  2) Backend"
    echo -e "  3) Frontend"
    echo -e "  4) Nginx"
    echo -e "  0) Voltar"
    
    read -p "Opção: " service_option
    
    if [ "$service_option" == "0" ]; then
        return
    fi
    
    case $service_option in
        1) service="db" ;;
        2) service="backend" ;;
        3) service="frontend" ;;
        4) service="nginx" ;;
        *) 
            echo -e "${RED}Opção inválida!${NC}"
            echo -e "\nPressione Enter para continuar..."
            read
            return
            ;;
    esac
    
    read -p "Digite o comando a ser executado no serviço $service: " command
    
    echo -e "${YELLOW}Executando comando no serviço $service...${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec $service sh -c "$command"
    
    echo -e "\n${GREEN}Comando executado!${NC}"
    echo -e "\nPressione Enter para continuar..."
    read
}

# Função para fazer backup do banco de dados
backup_database() {
    show_header
    echo -e "${GREEN}${BOLD}Backup do Banco de Dados${NC}"
    
    # Criar diretório de backup se não existir
    mkdir -p ./backups
    
    # Nome do arquivo de backup com timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="./backups/db_backup_$timestamp.sql"
    
    echo -e "${YELLOW}Criando backup do banco de dados...${NC}"
    
    # Obter variáveis do ambiente
    source $ENV_FILE
    DB_NAME=${POSTGRES_DB:-mydatabase}
    DB_USER=${POSTGRES_USER:-myuser}
    
    # Executar o backup
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T db pg_dump -U $DB_USER $DB_NAME > $backup_file
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Backup criado com sucesso: $backup_file${NC}"
        echo -e "${YELLOW}Tamanho do backup:${NC} $(du -h $backup_file | cut -f1)"
    else
        echo -e "${RED}Falha ao criar backup!${NC}"
    fi
    
    echo -e "\nPressione Enter para continuar..."
    read
}

# Menu principal
main_menu() {
    while true; do
        show_header
        echo -e "${GREEN}${BOLD}MENU PRINCIPAL${NC}"
        echo -e "  1) Verificar status dos serviços"
        echo -e "  2) Verificar logs dos serviços"
        echo -e "  3) Verificar uso de recursos"
        echo -e "  4) Verificar conectividade entre serviços"
        echo -e "  5) Verificar certificados SSL"
        echo -e "  6) Reiniciar serviços"
        echo -e "  7) Executar comando personalizado"
        echo -e "  8) Fazer backup do banco de dados"
        echo -e "  0) Sair"
        
        read -p "Escolha uma opção: " option
        
        case $option in
            1) 
                show_header
                check_services_status 
                ;;
            2) 
                show_header
                read -p "Quantas linhas de log deseja ver? [10]: " lines
                lines=${lines:-10}
                check_services_logs $lines 
                ;;
            3) 
                show_header
                check_resources_usage 
                ;;
            4) 
                show_header
                check_connectivity 
                ;;
            5) 
                show_header
                check_ssl_certificates 
                ;;
            6) 
                restart_service 
                ;;
            7) 
                run_custom_command 
                ;;
            8) 
                backup_database 
                ;;
            0) 
                echo -e "${GREEN}Saindo...${NC}"
                exit 0 
                ;;
            *) 
                echo -e "${RED}Opção inválida!${NC}"
                sleep 1
                ;;
        esac
    done
}

# Iniciar o script
check_prerequisites
main_menu