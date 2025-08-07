#!/bin/bash
set -e

echo "🔧 CORREÇÃO COMPLETA DO ERRO VITE"
echo "================================="

# 1. Parar tudo
echo "🛑 Parando services..."
docker stack rm lavcontrol 2>/dev/null || true
docker service rm lavcontrol_lavcontrol 2>/dev/null || true
sleep 10

# 2. Limpeza completa
echo "🧹 Limpeza completa..."
rm -rf node_modules
rm -rf dist
rm -rf .vite
rm -rf client/dist

# 3. Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm cache clean --force
npm ci

# 4. Build limpo com exclusão explícita do Vite
echo "🔨 Build limpo..."
echo "Frontend build..."
npm run build

echo "Backend build com exclusões..."
esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-cartographer \
  --external:@replit/vite-plugin-runtime-error-modal

# Verificar se build funcionou
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo "✅ Build OK"

# 5. Verificar se não há imports do Vite no build
echo "🔍 Verificando imports no build..."
if grep -r "from.*vite" dist/ 2>/dev/null; then
    echo "❌ Ainda há imports do Vite no build!"
    exit 1
fi

echo "✅ Nenhum import do Vite encontrado no build"

# 6. Rebuild da imagem Docker
echo "🐳 Recriando imagem Docker..."
docker build -t jfmachia/lavcontrol:latest . --no-cache

# 7. Verificar/criar rede
echo "🔗 Verificando rede..."
docker network ls | grep -q laveagora || docker network create --driver overlay --attachable laveagora

# 8. Deploy final
echo "📄 Criando stack final..."
cat > docker-compose-fixed.yml << 'EOF'
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
EOF

echo "🚀 Deploy da stack..."
docker stack deploy -c docker-compose-fixed.yml lavcontrol

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
echo "Logs:"
docker service logs lavcontrol_lavcontrol --tail 10

echo ""
echo "Teste local:"
timeout 10 curl -s http://localhost:5000/health 2>/dev/null && echo "✅ Aplicação funcionando" || echo "❌ Ainda com problema"

echo ""
echo "✅ CORREÇÃO CONCLUÍDA!"
echo "URL: https://lavcontrol.deliwise.com.br"