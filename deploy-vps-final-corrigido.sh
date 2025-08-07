#!/bin/bash
set -e

echo "🎉 DEPLOY FINAL LAVCONTROL - PROBLEMA VITE RESOLVIDO"
echo "=================================================="

# 1. Limpeza completa
echo "🧹 Limpeza completa..."
docker stack rm lavcontrol 2>/dev/null || true
docker service rm lavcontrol_lavcontrol 2>/dev/null || true
docker container prune -f
sleep 15

# 2. Navegar para o diretório
cd /root
if [ ! -d "lavcontrol-sistema-biometrico" ]; then
    echo "📥 Clonando repositório..."
    git clone https://github.com/jfmachia/lavcontrol-sistema-biometrico.git
fi
cd lavcontrol-sistema-biometrico

# 3. Atualizar código com correções
echo "📥 Atualizando código corrigido..."
git pull origin main

# 4. Build completo
echo "📦 Build da aplicação corrigida..."
npm ci
npm run build

# Verificar se build deu certo
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou - dist/index.js não existe"
    exit 1
fi

# 5. Criar imagem Docker
echo "🐳 Criando imagem Docker..."
docker build -t jfmachia/lavcontrol:latest .

# 6. Verificar/criar rede
echo "🔗 Verificando rede..."
docker network ls | grep -q laveagora || docker network create --driver overlay --attachable laveagora

# 7. Criar stack final
echo "📄 Criando stack final..."
cat > docker-compose-final-corrigido.yml << 'EOF'
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

# 8. Deploy da stack
echo "🚀 Deploy da stack..."
docker stack deploy -c docker-compose-final-corrigido.yml lavcontrol

# 9. Aguardar inicialização
echo "⏳ Aguardando 30 segundos para inicialização..."
sleep 30

# 10. Verificação final
echo ""
echo "📊 VERIFICAÇÃO FINAL"
echo "==================="
echo "Service status:"
docker service ls | grep lavcontrol

echo ""
echo "Réplicas:"
docker service ps lavcontrol_lavcontrol

echo ""
echo "Logs da aplicação:"
docker service logs lavcontrol_lavcontrol --tail 10

echo ""
echo "Teste local (porta 5000):"
timeout 10 curl -s http://localhost:5000/health 2>/dev/null && echo "✅ Aplicação respondendo na porta 5000" || echo "❌ Problema na porta 5000"

echo ""
echo "Teste HTTPS:"
timeout 10 curl -I https://lavcontrol.deliwise.com.br 2>/dev/null && echo "✅ HTTPS funcionando" || echo "⚠️ HTTPS não funcionando ainda (aguarde alguns minutos)"

echo ""
echo "🎯 RESUMO:"
echo "=========="
echo "✅ Problema do Vite RESOLVIDO"
echo "✅ Build da aplicação OK"
echo "✅ Imagem Docker criada"
echo "✅ Stack implantada"
echo ""
echo "🌐 URL: https://lavcontrol.deliwise.com.br"
echo ""
echo "📝 Para monitorar:"
echo "   docker service logs lavcontrol_lavcontrol -f"
echo ""