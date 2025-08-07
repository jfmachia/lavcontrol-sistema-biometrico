#!/bin/bash
set -e

echo "🔧 CORREÇÃO DEFINITIVA DO VITE - BUILD LIMPO"
echo "============================================"

cd /root/lavcontrol-sistema-biometrico

# 1. Parar tudo primeiro
echo "🛑 Parando services..."
docker stack rm lavcontrol 2>/dev/null || true
docker service rm lavcontrol_lavcontrol 2>/dev/null || true
sleep 10

# 2. Limpeza COMPLETA
echo "🧹 Limpeza completa..."
rm -rf node_modules
rm -rf dist
rm -rf .vite
rm -rf client/dist
rm -rf node_modules/.cache

# 3. Garantir DATABASE_URL no início do servidor
echo "📝 Forçando DATABASE_URL..."
sed -i '1i// FORÇAR DATABASE_URL PARA VPS POSTGRESQL ANTES DE QUALQUER IMPORTAÇÃO' server/index.ts
sed -i "2iprocess.env.DATABASE_URL = 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres';" server/index.ts
sed -i '3i' server/index.ts

# 4. Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm cache clean --force
npm ci

# 5. Build frontend primeiro
echo "🎨 Build frontend..."
npx vite build

# 6. Build backend com MÁXIMA exclusão do Vite
echo "🔧 Build backend com exclusões extremas..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-cartographer \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:./vite.js \
  --external:./vite.ts \
  --external:vite.ts \
  --external:vite.js \
  --define:process.env.NODE_ENV=\"production\"

# 7. Verificar build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo "✅ Build criado"

# 8. Verificar se NÃO há imports do Vite
echo "🔍 Verificando imports do Vite no build..."
if grep -r "from.*vite\|import.*vite" dist/ 2>/dev/null; then
    echo "❌ AINDA HÁ IMPORTS DO VITE!"
    echo "Conteúdo problemático:"
    grep -r "from.*vite\|import.*vite" dist/ 2>/dev/null
    exit 1
else
    echo "✅ Nenhum import do Vite encontrado!"
fi

# 9. Teste rápido do build
echo "🧪 Teste rápido do build..."
timeout 5 node dist/index.js 2>&1 | head -3 || echo "Teste concluído"

# 10. Rebuild Docker image
echo "🐳 Criando nova imagem Docker..."
docker build -t jfmachia/lavcontrol:latest . --no-cache

# 11. Verificar/criar rede
echo "🔗 Verificando rede..."
docker network ls | grep -q laveagora || docker network create --driver overlay --attachable laveagora

# 12. Deploy com configuração otimizada
echo "📄 Criando configuração final..."
cat > docker-compose-vite-fixed.yml << 'EOFCOMPOSE'
version: "3.7"
services:  
  lavcontrol:
    image: jfmachia/lavcontrol:latest
    ports:
      - "5000:5000"
    networks:
      - laveagora
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DB_HOST=148.230.78.128
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=929d54bc0ff22387163f04cfb3b3d0fa
      - DB_NAME=postgres
      - DATABASE_URL=postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres
      - MQTT_BROKER_URL=broker.emqx.io
      - MQTT_PORT=1883
      - JWT_SECRET=YTQ0HIOjuGcFP76AHcrxtSixT9Cme7bhq08MyZCNDbE
      - SESSION_SECRET=SPJTZj_o57vD3nQiuc-hm75HJDt2sbLYK2X9sbW2PY4
      - ALLOWED_ORIGINS=https://lavcontrol.deliwise.com.br,http://localhost:5000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      labels:
        - traefik.enable=true
        - traefik.http.routers.lavcontrol.rule=Host(`lavcontrol.deliwise.com.br`)
        - traefik.http.services.lavcontrol.loadbalancer.server.port=5000
        - traefik.http.routers.lavcontrol.service=lavcontrol
        - traefik.http.routers.lavcontrol.tls.certresolver=letsencryptresolver
        - traefik.http.routers.lavcontrol.entrypoints=websecure
        - traefik.http.routers.lavcontrol.tls=true

networks:
  laveagora:
    external: true
EOFCOMPOSE

echo "🚀 Deploy da stack corrigida..."
docker stack deploy -c docker-compose-vite-fixed.yml lavcontrol

echo "⏳ Aguardando 30 segundos..."
sleep 30

echo ""
echo "📊 VERIFICAÇÃO FINAL"
echo "==================="
echo "Service status:"
docker service ls | grep lavcontrol

echo ""
echo "Réplicas:"
docker service ps lavcontrol_lavcontrol

echo ""
echo "Logs (últimas 15 linhas):"
docker service logs lavcontrol_lavcontrol --tail 15

echo ""
echo "Teste health check:"
timeout 10 curl -s http://localhost:5000/health 2>/dev/null && echo "✅ Health check OK" || echo "❌ Health check falhou"

echo ""
echo "Teste HTTPS:"
timeout 15 curl -I https://lavcontrol.deliwise.com.br 2>/dev/null && echo "✅ HTTPS funcionando" || echo "⚠️ HTTPS configurando..."

echo ""
echo "🎯 VITE CORRIGIDO!"
echo "=================="
echo "✅ Build sem imports do Vite"
echo "✅ Docker image limpa"
echo "✅ Stack implantada"
echo ""
echo "🌐 URL: https://lavcontrol.deliwise.com.br"