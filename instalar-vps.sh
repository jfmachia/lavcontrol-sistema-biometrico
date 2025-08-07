#!/bin/bash
set -e

echo "🚀 INSTALAÇÃO COMPLETA LAVCONTROL VPS"
echo "===================================="

# 1. Ir para diretório root
cd /root

# 2. Baixar/atualizar código
echo "📥 Baixando código..."
if [ -d "lavcontrol-sistema-biometrico" ]; then
    cd lavcontrol-sistema-biometrico
    git pull origin main
else
    git clone https://github.com/jfmachia/lavcontrol-sistema-biometrico.git
    cd lavcontrol-sistema-biometrico
fi

# 3. Instalar dependências e build
echo "📦 Instalando dependências..."
npm ci

echo "🔨 Fazendo build..."
npm run build

# 4. Criar imagem Docker
echo "🐳 Criando imagem Docker..."
docker build -t jfmachia/lavcontrol:latest .

# 5. Parar tudo que está rodando
echo "🛑 Parando services existentes..."
docker stack rm lavcontrol 2>/dev/null || true
sleep 15

# 6. Criar rede se não existir
echo "🔗 Verificando rede..."
docker network ls | grep -q laveagora || docker network create --driver overlay --attachable laveagora

# 7. Criar arquivo docker-compose
echo "📄 Criando configuração..."
cat > docker-compose-vps-final.yml << 'EOF'
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
      resources:
          limits:
            cpus: '1'
            memory: 512M
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

# 8. Deploy
echo "🚀 Fazendo deploy..."
docker stack deploy -c docker-compose-vps-final.yml lavcontrol

# 9. Aguardar e verificar
echo "⏳ Aguardando inicialização..."
sleep 45

echo ""
echo "📊 STATUS FINAL:"
echo "================"
docker service ls | grep lavcontrol
echo ""
echo "📝 LOGS:"
echo "========"
docker service logs lavcontrol_lavcontrol --tail 5
echo ""
echo "✅ PRONTO! Acesse: https://lavcontrol.deliwise.com.br"
echo ""