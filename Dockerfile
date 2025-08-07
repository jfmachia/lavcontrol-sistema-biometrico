# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# ⛏️ Instala TODAS as dependências (dev + production) para o build
RUN npm ci --include=dev

# Copia todo o código fonte
COPY . .

# ⚙️ Build da aplicação (frontend + backend)
RUN npm run build

# Etapa final (produção)

FROM node:20-alpine AS production

# Instala init leve
RUN apk add --no-cache dumb-init

# Cria usuário sem privilégios
RUN addgroup -g 1001 -S nodejs && adduser -S lavcontrol -u 1001

WORKDIR /app

# Copia package.json para instalar apenas dependências de produção
COPY --from=builder /app/package*.json ./

# Instala apenas dependências de produção na imagem final
RUN npm ci --only=production && npm cache clean --force

# Copia os arquivos buildados
COPY --from=builder /app/dist ./dist

# Expõe a porta da aplicação
EXPOSE 5000

# Configura health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Muda para usuário sem privilégios
USER lavcontrol

# Usa dumb-init para evitar problemas com sinais
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicialização
CMD ["node", "dist/index.js"]