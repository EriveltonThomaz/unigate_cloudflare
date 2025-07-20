#!/bin/bash
# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   REBUILDING WITH FIXED CONFIGURATION            ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check frontend directory structure
echo -e "${YELLOW}Checking frontend directory structure...${NC}"
chmod +x ./check-frontend-dir.sh
./check-frontend-dir.sh

# Apply frontend fix
echo -e "${YELLOW}Applying frontend fix...${NC}"
chmod +x ./fix-frontend.sh
./fix-frontend.sh

# Remove stack
echo -e "${YELLOW}Removing previous stack...${NC}"
docker stack rm unigate-local

# Wait for services to be removed
echo -e "${YELLOW}Waiting for services to be removed (10 seconds)...${NC}"
sleep 10

# Build images
echo -e "${YELLOW}Building images...${NC}"
# Build frontend image explicitly
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -t unigate-frontend:prod -f frontend/Dockerfile.fixed frontend/
# Build backend image
echo -e "${YELLOW}Building backend image...${NC}"
docker-compose -f docker-compose.swarm.local.yml build backend

# Deploy stack
echo -e "${YELLOW}Deploying stack...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start (20 seconds)...${NC}"
sleep 20

# Check service status
echo -e "${YELLOW}Checking service status...${NC}"
docker stack services unigate-local

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Rebuild completed!${NC}"
echo -e "${GREEN}You can access:${NC}"
echo -e "${GREEN}- Frontend: http://localhost/${NC}"
echo -e "${GREEN}- Admin: http://localhost/admin/${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Run ./fix-superuser.sh to create a superuser${NC}"
echo -e "${YELLOW}Run ./collect-static.sh to collect static files${NC}"
echo -e "${BLUE}==================================================${NC}"