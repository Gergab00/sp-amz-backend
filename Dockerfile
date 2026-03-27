# ===========================
# Stage 1: Build
# ===========================
FROM node:20-alpine AS builder

WORKDIR /app

# Habilitar pnpm con Corepack para respetar pnpm-lock.yaml
RUN corepack enable

# Copiar archivos mínimos para instalación reproducible
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias exactas según lockfile
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar aplicación TypeScript
RUN pnpm run build

# Dejar solo dependencias de producción
RUN pnpm prune --prod

# ===========================
# Stage 2: Production
# ===========================
FROM node:20-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar node_modules y build desde stage anterior
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main.js"]
