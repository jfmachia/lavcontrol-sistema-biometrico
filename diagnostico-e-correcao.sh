#!/bin/bash
set -e

echo "🔍 DIAGNÓSTICO E CORREÇÃO LAVCONTROL"
echo "===================================="

echo ""
echo "1️⃣ Verificando Docker Services..."
echo "================================="
docker service ls | grep lavcontrol || echo "❌ Nenhum service encontrado"

echo ""
echo "2️⃣ Status detalhado das réplicas..."
echo "=================================="
docker service ps lavcontrol_lavcontrol --no-trunc 2>/dev/null || echo "❌ Service não existe"

echo ""
echo "3️⃣ Logs da aplicação..."
echo "======================"
docker service logs lavcontrol_lavcontrol --tail 10 2>/dev/null || echo "❌ Sem logs disponíveis"

echo ""
echo "4️⃣ Verificando redes Docker..."
echo "============================="
docker network ls | grep laveagora || echo "❌ Rede laveagora não existe"

echo ""
echo "5️⃣ Testando conectividade local..."
echo "================================="
timeout 5 curl -s http://localhost:5000/health 2>/dev/null && echo "✅ Health check OK" || echo "❌ Aplicação não responde na porta 5000"

echo ""
echo "6️⃣ Verificando Traefik..."
echo "========================"
docker service ls | grep traefik || echo "❌ Traefik não encontrado"

echo ""
echo "🔧 CORREÇÃO AUTOMÁTICA"
echo "======================"

# Para tudo
echo "🛑 Parando service atual..."
docker service rm lavcontrol_lavcontrol 2>/dev/null || true
docker stack rm lavcontrol 2>/dev/null || true
sleep 15

# Verifica se tem a imagem
echo "🐳 Verificando imagem Docker..."
docker images | grep lavcontrol || echo "❌ Imagem não encontrada - será criada"

# Vai para o diretório correto
cd /root/lavcontrol-sistema-biometrico 2>/dev/null || {
    echo "📥 Clonando repositório..."
    cd /root
    git clone https://github.com/jfmachia/lavcontrol-sistema-biometrico.git
    cd lavcontrol-sistema-biometrico
}

# Atualiza código
echo "📥 Atualizando código..."
git pull origin main

# Build completo
echo "📦 Build da aplicação..."
npm ci
npm run build

# Cria imagem Docker
echo "🐳 Criando imagem Docker..."
docker build -t jfmachia/lavcontrol:latest .

# Verifica/cria rede
echo "🔗 Verificando rede..."
docker network ls | grep -q laveagora || docker network create --driver overlay --attachable laveagora

# Cria stack simplificada para debug
echo "📄 Criando stack de debug..."
cat > docker-compose-debug.yml << 'EOF'
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

# Deploy da stack
echo "🚀 Deploy da stack..."
docker stack deploy -c docker-compose-debug.yml lavcontrol

# Aguarda inicialização
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
echo "Logs recentes:"
docker service logs lavcontrol_lavcontrol --tail 5

echo ""
echo "Teste local:"
timeout 10 curl -s http://localhost:5000/health 2>/dev/null && echo "✅ Aplicação funcionando localmente" || echo "❌ Aplicação não responde"

echo ""
echo "Teste HTTPS:"
timeout 10 curl -I https://lavcontrol.deliwise.com.br 2>/dev/null && echo "✅ HTTPS funcionando" || echo "❌ HTTPS não funcionando (aguarde alguns minutos para SSL)"

echo ""
echo "🎯 Se ainda não funcionar, verifique:"
echo "1. Se Traefik está rodando: docker service ls | grep traefik"
echo "2. Se DNS aponta para VPS: nslookup lavcontrol.deliwise.com.br"
echo "3. Teste direto: curl http://IP-DA-VPS:5000/health"