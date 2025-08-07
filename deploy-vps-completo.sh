#!/bin/bash
set -e

echo "🚀 DEPLOY LAVCONTROL VPS - SCRIPT COMPLETO"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Atualizar código do GitHub
log_info "📥 Atualizando código do GitHub..."
if [ -d "/root/lavcontrol-sistema-biometrico" ]; then
    cd /root/lavcontrol-sistema-biometrico
    git pull origin main
else
    log_warn "Diretório não encontrado. Clonando repositório..."
    cd /root
    git clone https://github.com/jfmachia/lavcontrol-sistema-biometrico.git
    cd lavcontrol-sistema-biometrico
fi

# 2. Fazer build da aplicação
log_info "📦 Fazendo build da aplicação..."
npm ci
npm run build

# 3. Build da imagem Docker
log_info "🐳 Construindo imagem Docker..."
docker build -t jfmachia/lavcontrol:latest .

# 4. Parar stack existente (se houver)
log_info "🛑 Parando stack existente..."
docker stack rm lavcontrol 2>/dev/null || true
sleep 10

# 5. Verificar/criar rede
log_info "🔗 Verificando rede laveagora..."
if ! docker network ls | grep -q laveagora; then
    log_warn "Criando rede laveagora..."
    docker network create --driver overlay --attachable laveagora
fi

# 6. Deploy da nova stack
log_info "🚀 Fazendo deploy da stack..."
cat > docker-compose-deploy.yml << 'EOF'
version: "3.7"
services:  
  lavcontrol:
    image: jfmachia/lavcontrol:latest
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
      replicas: 2
      placement:
          constraints:
            - node.role == manager
      resources:
          limits:
            cpus: '1'
            memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      labels:
          - traefik.enable=true
          - traefik.http.routers.lavcontrol.rule=Host(`lavcontrol.deliwise.com.br`)
          - traefik.http.services.lavcontrol.loadbalancer.server.port=5000
          - traefik.http.routers.lavcontrol.service=lavcontrol
          - traefik.http.routers.lavcontrol.tls.certresolver=letsencryptresolver
          - traefik.http.routers.lavcontrol.entrypoints=websecure
          - traefik.http.routers.lavcontrol.tls=true
          - traefik.http.routers.lavcontrol.middlewares=lavcontrol-headers
          - traefik.http.middlewares.lavcontrol-headers.headers.customrequestheaders.X-Forwarded-Proto=https
          - traefik.http.middlewares.lavcontrol-headers.headers.framedeny=true
          - traefik.http.middlewares.lavcontrol-headers.headers.contenttypenosniff=true
          - traefik.http.middlewares.lavcontrol-headers.headers.browserxssfilter=true
    
networks:
  laveagora:
    name: laveagora
    external: true
EOF

docker stack deploy -c docker-compose-deploy.yml lavcontrol

# 7. Verificar deploy
log_info "🔍 Verificando deploy..."
sleep 15

# Status do service
echo ""
log_info "📊 Status do service:"
docker service ls | grep lavcontrol

echo ""
log_info "📋 Detalhes das replicas:"
docker service ps lavcontrol_lavcontrol

# 8. Teste de conectividade
log_info "🧪 Testando conectividade..."
sleep 10

echo ""
log_info "🔗 Teste local (health check):"
timeout 10 curl -s http://localhost:5000/health 2>/dev/null || log_warn "Health check local falhou"

echo ""
log_info "🌐 Teste HTTPS:"
timeout 10 curl -I https://lavcontrol.deliwise.com.br 2>/dev/null || log_warn "Teste HTTPS falhou (pode levar alguns minutos para SSL)"

# 9. Logs finais
echo ""
log_info "📝 Últimos logs da aplicação:"
docker service logs lavcontrol_lavcontrol --tail 10

echo ""
echo "========================="
log_info "✅ DEPLOY CONCLUÍDO!"
echo "========================="
echo ""
echo "🔗 URL: https://lavcontrol.deliwise.com.br"
echo ""
echo "📊 Para monitorar:"
echo "   docker service logs lavcontrol_lavcontrol -f"
echo ""
echo "🔄 Para verificar status:"
echo "   docker service ps lavcontrol_lavcontrol"
echo ""