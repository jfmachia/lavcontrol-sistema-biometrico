# 🔧 SOLUÇÃO RÁPIDA - Erro "vite: not found"

## ❌ **Problema Identificado**
O Dockerfile na VPS está desatualizado e não instala as devDependencies necessárias para o build.

## ✅ **SOLUÇÃO IMEDIATA**

### **1. Atualizar o código na VPS**
```bash
cd ~/lavcontrol-sistema-biometrico
git pull origin main
```

### **2. Executar o script de build automático**
```bash
chmod +x build-vps.sh
./build-vps.sh
```

### **OU fazer manualmente:**

```bash
# 1. Build da aplicação local primeiro
npm ci
npm run build

# 2. Build da imagem Docker
docker build -t jfmachia/lavcontrol:latest .
```

## 🎯 **O que foi corrigido**

**❌ ANTES (erro):**
```dockerfile
RUN npm ci --only=production  # ❌ Sem devDependencies (vite, esbuild)
```

**✅ AGORA (funciona):**
```dockerfile
RUN npm ci --include=dev  # ✅ Com todas as dependências
```

## 📋 **Arquivos atualizados**
- ✅ **Dockerfile** - Corrigido para instalar devDependencies
- ✅ **build-vps.sh** - Script automático para VPS
- ✅ **Health check** - Adicionado para Docker Swarm

## 🚀 **Após executar os comandos acima**

1. **Imagem será criada com sucesso**
2. **Deploy no Portainer funcionará**
3. **https://lavcontrol.deliwise.com.br** estará online

---

**🎉 Pronto! O erro "vite: not found" será resolvido.**