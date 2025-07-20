#!/bin/bash
# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   CHECKING FRONTEND DIRECTORY STRUCTURE          ${NC}"
echo -e "${BLUE}==================================================${NC}"

if [ ! -d "frontend" ]; then
  echo -e "${RED}Frontend directory not found!${NC}"
  echo -e "${YELLOW}Creating frontend directory...${NC}"
  mkdir -p frontend
fi

# Check if package.json exists in frontend directory
if [ ! -f "frontend/package.json" ]; then
  echo -e "${YELLOW}Creating basic package.json in frontend directory...${NC}"
  cat > frontend/package.json << 'EOJ'
{
  "name": "unigate-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.2.3",
    "typescript": "^5.3.3"
  }
}
EOJ
fi

# Create a simple next.config.js
echo -e "${YELLOW}Creating next.config.js...${NC}"
cat > frontend/next.config.js << 'EOC'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
EOC

# Create a simple pages directory with index.js
echo -e "${YELLOW}Creating pages directory with index.js...${NC}"
mkdir -p frontend/pages
cat > frontend/pages/index.js << 'EOI'
import React from "react";

export default function Home() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#0070f3" }}>UniGate Dashboard</h1>
      <p>Welcome to the UniGate Cloudflare Domain Manager.</p>
      <div style={{ marginTop: "2rem" }}>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/admin/" style={{ color: "#0070f3" }}>Admin Dashboard</a></li>
          <li><a href="/api/" style={{ color: "#0070f3" }}>API</a></li>
        </ul>
      </div>
    </div>
  );
}
EOI

# Create a simple public directory
echo -e "${YELLOW}Creating public directory...${NC}"
mkdir -p frontend/public

echo -e "${GREEN}Frontend directory structure created successfully!${NC}"
echo -e "${BLUE}==================================================${NC}"