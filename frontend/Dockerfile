# Use a imagem oficial do Node.js como base
FROM node:20-alpine AS base

# Configuração do ambiente
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Instale as dependências do pnpm
FROM base AS deps
WORKDIR /app

# Copie apenas os arquivos necessários para instalar as dependências
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build do projeto Next.js
FROM base AS builder
WORKDIR /app

# Copie as dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construa o aplicativo
RUN pnpm run build

# Produção - Imagem final
FROM base AS runner
WORKDIR /app

# Defina o ambiente como produção
ENV NODE_ENV=production

# Crie um usuário não-root para executar o aplicativo
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copie os arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Defina o usuário para executar o aplicativo
USER nextjs

# Exponha a porta que o Next.js usa
EXPOSE 3000

# Defina a variável de ambiente para o host
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar a aplicação Next.js
CMD ["node", "server.js"]