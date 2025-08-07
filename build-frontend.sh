#!/bin/bash
set -e

echo "🎨 BUILD FRONTEND LAVCONTROL PARA N8N"
echo "========================================"

# 1. Limpeza
echo "🧹 Limpando arquivos antigos..."
rm -rf node_modules
rm -rf dist
rm -rf client/dist

# 2. Copiar package.json do frontend
echo "📰 Configurando package.json para frontend..."
cp package-frontend.json package.json
cp vite.config-frontend.ts vite.config.ts

# 3. Instalar dependências do frontend apenas
echo "📦 Instalando dependências do frontend..."
npm cache clean --force
npm install

# 4. Verificar arquivo .env
if [ ! -f ".env" ]; then
    echo "⚠️ Criando .env a partir do exemplo..."
    cp .env.example .env
    echo "❗ IMPORTANTE: Edite o arquivo .env com suas URLs do n8n!"
fi

# 5. Build do frontend
echo "🔨 Fazendo build do frontend..."
npm run build

# 6. Verificar se o build funcionou
if [ ! -d "dist" ]; then
    echo "❌ Build falhou! Pasta dist não foi criada."
    exit 1
fi

echo "✅ Build do frontend concluído!"
echo "=====================================" 
echo "💼 Arquivos estáticos gerados em: ./dist"
echo "🌐 Para testar localmente: npm run preview"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure suas URLs do n8n no arquivo .env"
echo "2. Implemente os webhooks no n8n conforme documentação"
echo "3. Faça deploy dos arquivos da pasta 'dist' no seu servidor web"
echo ""
echo "🔗 URLs que o n8n precisa implementar:"
echo "   /auth/login (POST)"
echo "   /auth/register (POST)"
echo "   /auth/user (GET)"
echo "   /users (GET, POST, PUT, DELETE)"
echo "   /stores (GET, POST, PUT, DELETE)"
echo "   /devices (GET, POST, PUT, DELETE)"
echo "   /clients (GET, POST, PUT, DELETE)"
echo "   /access-logs (GET, POST)"
echo "   /alerts (GET, POST, PUT)"
echo "   /dashboard/stats (GET)"
echo "   /dashboard/traffic-chart (GET)"
echo "   /dashboard/wave-chart (GET)"
echo "   /device/command (POST)"
echo ""