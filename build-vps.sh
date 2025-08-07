#!/bin/bash
set -e

echo "🚀 Build LavControl para VPS"
echo "=================================="

# Atualiza código do GitHub
echo "📥 Atualizando código do GitHub..."
git pull origin main

# Build da aplicação (se necessário)
echo "📦 Verificando build da aplicação..."
if [ ! -d "dist" ]; then
    echo "⚙️ Fazendo build da aplicação..."
    npm ci
    npm run build
fi

# Build da imagem Docker
echo "🐳 Construindo imagem Docker..."
docker build -t jfmachia/lavcontrol:latest .

# Verifica se deu certo
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "🔧 Para fazer deploy no Portainer:"
    echo "1. Portainer → Stacks → lavcontrol"
    echo "2. Update the stack"
    echo "3. ✅ Pronto!"
    echo ""
    echo "🔍 Para verificar:"
    echo "   docker images | grep lavcontrol"
else
    echo "❌ Erro no build da imagem Docker"
    exit 1
fi