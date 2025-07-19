# Use a imagem oficial do Node.js como base
FROM node:20-alpine AS base

# Instale as dependências do pnpm
FROM base AS deps
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./.npmrc* ./
RUN pnpm install --frozen-lockfile

# Build do projeto Next.js
FROM base AS builder
RUN npm install -g pnpm # Instala pnpm no estágio builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Produção - Imagem final
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copia os arquivos de build do estágio 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponha a porta que o Next.js usa
EXPOSE 3000

# Comando para iniciar a aplicação Next.js
CMD ["pnpm", "start"]
