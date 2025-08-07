#!/bin/bash
set -e

echo "🏗️  Iniciando build para Docker..."

# Build do frontend
echo "📦 Construindo frontend..."
npm run build

# Build do backend para formato ESM standalone
echo "🚀 Construindo backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=server/index.js

echo "✅ Build Docker concluído!"
echo ""
echo "Arquivos criados:"
echo "  - client/dist/ (frontend buildado)"  
echo "  - server/index.js (backend bundled)"
echo ""
echo "Para buildar a imagem Docker:"
echo "  docker build -t jfmachia/lavcontrol:latest ."
echo ""
echo "Para rodar localmente:"
echo "  docker run -p 5000:5000 --env-file .env.local jfmachia/lavcontrol:latest"