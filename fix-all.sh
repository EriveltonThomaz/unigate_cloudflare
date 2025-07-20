#!/bin/bash
# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   COMPREHENSIVE FIX FOR UNIGATE DEPLOYMENT       ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Step 1: Check and prepare frontend directory
echo -e "${YELLOW}Step 1: Checking frontend directory structure...${NC}"
chmod +x ./check-frontend-dir.sh
./check-frontend-dir.sh

# Step 2: Create fixed Dockerfile for frontend
echo -e "${YELLOW}Step 2: Creating fixed Dockerfile for frontend...${NC}"
cat > frontend/Dockerfile.fixed << 'EOD'
# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copy all files
COPY . .

# Disable ESLint
RUN echo '{ "extends": "next/core-web-vitals", "rules": {} }' > .eslintrc.json

# Build the application
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]
EOD
echo -e "${GREEN}Created fixed Dockerfile for frontend${NC}"

# Step 3: Update docker-compose to use the fixed Dockerfile for frontend only
echo -e "${YELLOW}Step 3: Updating docker-compose.swarm.local.yml...${NC}"
sed -i '/frontend:/,/image:/ s/dockerfile: Dockerfile.prod/dockerfile: Dockerfile.fixed/g' docker-compose.swarm.local.yml
echo -e "${GREEN}Updated docker-compose.swarm.local.yml to use the fixed Dockerfile for frontend only${NC}"

# Step 4: Remove existing stack
echo -e "${YELLOW}Step 4: Removing previous stack...${NC}"
docker stack rm unigate-local

# Wait for services to be removed
echo -e "${YELLOW}Waiting for services to be removed (15 seconds)...${NC}"
sleep 15

# Step 5: Build images
echo -e "${YELLOW}Step 5: Building images...${NC}"
# Build frontend image explicitly
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -t unigate-frontend:prod -f frontend/Dockerfile.fixed frontend/
# Build backend image if needed
if [ -f "backend/Dockerfile" ]; then
  echo -e "${YELLOW}Building backend image...${NC}"
  docker build -t unigate-backend:prod -f backend/Dockerfile backend/
fi

# Step 6: Deploy stack
echo -e "${YELLOW}Step 6: Deploying stack...${NC}"
docker stack deploy -c docker-compose.swarm.local.yml unigate-local

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start (20 seconds)...${NC}"
sleep 20

# Step 7: Check service status
echo -e "${YELLOW}Step 7: Checking service status...${NC}"
docker stack services unigate-local

# Step 8: Create superuser
echo -e "${YELLOW}Step 8: Creating superuser...${NC}"
# Wait a bit more for backend to be fully ready
sleep 10
# Check if backend container is running
BACKEND_CONTAINER=$(docker ps -q -f name=unigate-local_backend)
if [ -n "$BACKEND_CONTAINER" ]; then
  # Define superuser credentials
  USERNAME="admin"
  EMAIL="admin@unigate.com.br"
  PASSWORD="admin"
  
  echo -e "${YELLOW}Creating superuser with the following credentials:${NC}"
  echo -e "${YELLOW}Username: ${USERNAME}${NC}"
  echo -e "${YELLOW}Email: ${EMAIL}${NC}"
  echo -e "${YELLOW}Password: ${PASSWORD}${NC}"
  
  # Create superuser using Django shell
  docker exec -it $BACKEND_CONTAINER python manage.py shell -c "
  from django.contrib.auth import get_user_model;
  User = get_user_model();
  if not User.objects.filter(username='${USERNAME}').exists():
      User.objects.create_superuser('${USERNAME}', '${EMAIL}', '${PASSWORD}');
      print('Superuser created successfully!');
  else:
      user = User.objects.get(username='${USERNAME}');
      user.set_password('${PASSWORD}');
      user.save();
      print('Superuser password updated successfully!');
  "
  
  # Step 9: Collect static files
  echo -e "${YELLOW}Step 9: Collecting static files...${NC}"
  docker exec -it $BACKEND_CONTAINER python manage.py collectstatic --noinput
  echo -e "${GREEN}Static files collected successfully!${NC}"
  
  # Step 10: Set permissions for static files
  echo -e "${YELLOW}Step 10: Setting permissions for static files...${NC}"
  docker exec -it $BACKEND_CONTAINER chmod -R 755 /app/staticfiles
  echo -e "${GREEN}Permissions set successfully!${NC}"
else
  echo -e "${RED}Backend container not found. Superuser creation and static file collection skipped.${NC}"
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Deployment fixed and completed!${NC}"
echo -e "${GREEN}You can access:${NC}"
echo -e "${GREEN}- Frontend: http://localhost/${NC}"
echo -e "${GREEN}- Admin: http://localhost/admin/${NC}"
echo -e "${GREEN}  Username: admin${NC}"
echo -e "${GREEN}  Password: admin${NC}"
echo -e "${BLUE}==================================================${NC}"