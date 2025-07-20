#!/bin/bash
# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CREATING DJANGO SUPERUSER                      ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if services are running
echo -e "${YELLOW}Checking if services are running...${NC}"
BACKEND_CONTAINER=$(docker ps -q -f name=unigate-local_backend)

if [ -z "$BACKEND_CONTAINER" ]; then
    echo -e "${RED}Backend container not found. Run ./deploy-local.sh first.${NC}"
    exit 1
fi

# Define superuser credentials
USERNAME="admin"
EMAIL="admin@unigate.com.br"
PASSWORD="admin"

# Create superuser
echo -e "${YELLOW}Creating superuser with the following credentials:${NC}"
echo -e "${YELLOW}Username: ${USERNAME}${NC}"
echo -e "${YELLOW}Email: ${EMAIL}${NC}"
echo -e "${YELLOW}Password: ${PASSWORD}${NC}"

# Execute command to create superuser - fixed to use manage.py directly
docker exec -it $BACKEND_CONTAINER python manage.py createsuperuser --noinput --email=$EMAIL

# Set the password
docker exec -it $BACKEND_CONTAINER python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
user = User.objects.get(username='${USERNAME}');
user.set_password('${PASSWORD}');
user.save();
print('Superuser password set successfully!');
"

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Now you can access the admin panel at:${NC}"
echo -e "${GREEN}http://localhost/admin/${NC}"
echo -e "${GREEN}Username: ${USERNAME}${NC}"
echo -e "${GREEN}Password: ${PASSWORD}${NC}"
echo -e "${BLUE}==================================================${NC}"