# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build client
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S lavcontrol -u 1001

# Copy built application
COPY --from=builder --chown=lavcontrol:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=lavcontrol:nodejs /app/server ./server
COPY --from=builder --chown=lavcontrol:nodejs /app/shared ./shared
COPY --from=builder --chown=lavcontrol:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=lavcontrol:nodejs /app/package*.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Switch to non-root user
USER lavcontrol

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]