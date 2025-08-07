#!/bin/bash
set -e

# Configurações
DOCKER_REGISTRY="jfmachia"  # Altere para seu registry
IMAGE_NAME="lavcontrol"
VERSION="${1:-latest}"

echo "🏗️  Construindo imagem Docker..."

# Build da imagem
docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION} .

# Tag latest se não for especificado
if [ "$VERSION" != "latest" ]; then
    docker tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
fi

echo "🚀 Enviando imagem para registry..."

# Push das imagens
docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}

if [ "$VERSION" != "latest" ]; then
    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
fi

echo "✅ Imagem ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION} enviada com sucesso!"
echo ""
echo "🔧 Para deploiar no Docker Swarm:"
echo "   1. Faça login no Portainer"
echo "   2. Vá em Stacks -> Add stack"
echo "   3. Cole o conteúdo do docker-compose.yml"
echo "   4. Configure as variáveis de ambiente:"
echo "      - DOMAIN=seudominio.com"
echo "      - JWT_SECRET=sua-chave-jwt-super-segura"
echo "      - SESSION_SECRET=sua-chave-sessao-super-segura"
echo "   5. Deploy a stack"
echo ""
echo "🌐 A aplicação ficará disponível em: https://lavcontrol.seudominio.com"