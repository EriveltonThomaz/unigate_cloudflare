#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Limpando recursos Docker não utilizados...${NC}"

# Parar todos os contêineres em execução
echo -e "${YELLOW}Parando todos os contêineres em execução...${NC}"
docker stop $(docker ps -q) 2>/dev/null || true

# Remover contêineres parados
echo -e "${YELLOW}Removendo contêineres parados...${NC}"
docker container prune -f

# Remover imagens não utilizadas
echo -e "${YELLOW}Removendo imagens não utilizadas...${NC}"
docker image prune -a -f

# Remover volumes não utilizados
echo -e "${YELLOW}Removendo volumes não utilizados...${NC}"
docker volume prune -f

# Remover redes não utilizadas
echo -e "${YELLOW}Removendo redes não utilizadas...${NC}"
docker network prune -f

# Remover cache de build
echo -e "${YELLOW}Removendo cache de build...${NC}"
docker builder prune -a -f

# Verificar espaço em disco
echo -e "${YELLOW}Espaço em disco após limpeza:${NC}"
df -h /

echo -e "${GREEN}Limpeza concluída!${NC}"