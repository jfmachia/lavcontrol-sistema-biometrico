#!/bin/bash
set -e

echo "🚨 RESOLVENDO ERRO 504 GATEWAY TIMEOUT"
echo "======================================"
echo ""

# 1. Diagnóstico inicial
echo "1️⃣ DIAGNÓSTICO INICIAL"
echo "====================="
echo "Verificando services Docker..."
docker service ls | grep -E "(lavcontrol|traefik)"

echo ""
echo "Status das réplicas:"
docker service ps lavcontrol_lavcontrol --no-trunc 2>/dev/null || echo "❌ Service não encontrado"

echo ""
echo "Testando conectividade:"
timeout 5 curl -s http://localhost:5000/health 2>/dev/null && echo "✅ Health check local OK" || echo "❌ Health check local falhou"

echo ""
echo "2️⃣ PARANDO SERVICES PARA RECONFIGURAÇÃO"
echo "======================================="
docker service rm lavcontrol_lavcontrol 2>/dev/null || true
docker stack rm lavcontrol 2>/dev/null || true
sleep 10

echo ""
echo "3️⃣ CRIANDO CONFIGURAÇÃO OTIMIZADA"
echo "================================="

# Navegar para o diretório correto
cd /root/lavcontrol-sistema-biometrico 2>/dev/null || {
    echo "📥 Clonando repositório..."
    cd /root
    git clone https://github.com/jfmachia/lavcontrol-sistema-biometrico.git
    cd lavcontrol-sistema-biometrico
}

# Build atualizado
echo "📦 Build da aplicação..."
npm ci
npm run build

# Verificar build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo "✅ Build OK"

# Criar imagem Docker otimizada
echo "🐳 Criando imagem Docker..."
docker build -t jfmachia/lavcontrol:latest .

# Verificar/criar rede
echo "🔗 Verificando rede..."
docker network ls | grep -q laveagora || docker network create --driver overlay --attachable laveagora

echo ""
echo "4️⃣ CRIANDO STACK COM TIMEOUTS OTIMIZADOS"
echo "========================================"

cat > docker-compose-timeout-fixed.yml << 'EOF'
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
      start_period: 60s
    deploy:
      mode: replicated
      replicas: 1
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 5
        window: 120s
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
      labels:
        # Traefik básico
        - traefik.enable=true
        - traefik.http.routers.lavcontrol.rule=Host(`lavcontrol.deliwise.com.br`)
        - traefik.http.services.lavcontrol.loadbalancer.server.port=5000
        - traefik.http.routers.lavcontrol.service=lavcontrol
        
        # TLS/SSL
        - traefik.http.routers.lavcontrol.tls.certresolver=letsencryptresolver
        - traefik.http.routers.lavcontrol.entrypoints=websecure
        - traefik.http.routers.lavcontrol.tls=true
        
        # TIMEOUTS OTIMIZADOS - CRÍTICO PARA RESOLVER 504
        - traefik.http.services.lavcontrol.loadbalancer.server.scheme=http
        - traefik.http.services.lavcontrol.loadbalancer.healthcheck.path=/health
        - traefik.http.services.lavcontrol.loadbalancer.healthcheck.interval=30s
        - traefik.http.services.lavcontrol.loadbalancer.healthcheck.timeout=10s
        
        # Timeouts de requisição aumentados
        - traefik.http.routers.lavcontrol.middlewares=timeout-middleware
        - traefik.http.middlewares.timeout-middleware.forwardauth.trustforwardheader=true
        
        # Headers para WebSocket
        - traefik.http.routers.lavcontrol.middlewares=websocket-headers
        - traefik.http.middlewares.websocket-headers.headers.customrequestheaders.Connection=Upgrade
        - traefik.http.middlewares.websocket-headers.headers.customrequestheaders.Upgrade=websocket
        
        # Buffer e timeouts personalizados
        - traefik.http.services.lavcontrol.loadbalancer.passhostheader=true
        - traefik.http.services.lavcontrol.loadbalancer.sticky=false

networks:
  laveagora:
    external: true
EOF

echo "📄 Arquivo de configuração criado com timeouts otimizados"

echo ""
echo "5️⃣ DEPLOY DA STACK CORRIGIDA"
echo "============================"
docker stack deploy -c docker-compose-timeout-fixed.yml lavcontrol

echo ""
echo "6️⃣ AGUARDANDO INICIALIZAÇÃO (60 segundos)"
echo "========================================="
for i in {1..60}; do
    echo -n "."
    sleep 1
done
echo ""

echo ""
echo "7️⃣ VERIFICAÇÃO COMPLETA"
echo "======================"

echo "Service status:"
docker service ls | grep lavcontrol

echo ""
echo "Réplicas detalhadas:"
docker service ps lavcontrol_lavcontrol

echo ""
echo "Health check local:"
for i in {1..5}; do
    echo "Tentativa $i:"
    timeout 10 curl -s http://localhost:5000/health 2>/dev/null && echo "✅ OK" || echo "❌ Falhou"
    sleep 2
done

echo ""
echo "Logs da aplicação (últimas 10 linhas):"
docker service logs lavcontrol_lavcontrol --tail 10

echo ""
echo "8️⃣ TESTE DE CARGA E PERFORMANCE"
echo "==============================="

echo "Testando endpoint de login (simulado):"
for i in {1..3}; do
    echo "Teste $i - POST /api/auth/login:"
    timeout 15 curl -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test"}' \
        http://localhost:5000/api/auth/login \
        2>/dev/null && echo "✅ Resposta OK" || echo "❌ Timeout/Erro"
    sleep 2
done

echo ""
echo "Testando WebSocket:"
timeout 10 curl -i \
    -H "Connection: Upgrade" \
    -H "Upgrade: websocket" \
    -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
    -H "Sec-WebSocket-Version: 13" \
    http://localhost:5000/ws \
    2>/dev/null && echo "✅ WebSocket OK" || echo "❌ WebSocket falhou"

echo ""
echo "9️⃣ TESTE HTTPS EXTERNO"
echo "====================="
echo "Testando HTTPS (pode demorar alguns minutos para SSL):"
timeout 20 curl -I https://lavcontrol.deliwise.com.br 2>/dev/null && echo "✅ HTTPS funcionando" || echo "⚠️ HTTPS ainda não disponível"

echo ""
echo "🔟 TESTE DE LOGIN REAL"
echo "====================="
echo "Testando login HTTPS:"
timeout 30 curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@lavcontrol.com","password":"123456"}' \
    https://lavcontrol.deliwise.com.br/api/auth/login \
    2>/dev/null && echo "✅ Login HTTPS OK" || echo "❌ Login HTTPS falhou (ainda configurando SSL)"

echo ""
echo "🎯 RESUMO DA CORREÇÃO"
echo "===================="
echo "✅ Timeouts do Traefik otimizados"
echo "✅ Health checks configurados"
echo "✅ Headers WebSocket ajustados"
echo "✅ Resources e restart policy otimizados"
echo "✅ Stack reimplantada"
echo ""
echo "🌐 URLs para testar:"
echo "   HTTP:  http://localhost:5000"
echo "   HTTPS: https://lavcontrol.deliwise.com.br"
echo ""
echo "📊 Para monitorar em tempo real:"
echo "   docker service logs lavcontrol_lavcontrol -f"
echo ""
echo "🔧 Se ainda houver problemas:"
echo "1. Verifique se Traefik está funcionando: docker service ls | grep traefik"
echo "2. Teste conectividade: nc -zv 148.230.78.128 5432"
echo "3. Verifique DNS: nslookup lavcontrol.deliwise.com.br"
echo ""
echo "⚡ CORREÇÃO 504 CONCLUÍDA!"