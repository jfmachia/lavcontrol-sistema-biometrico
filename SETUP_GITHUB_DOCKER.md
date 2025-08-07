# 🐳 Setup GitHub Actions + Docker Hub

Para automatizar o build e push da imagem Docker usando GitHub Actions.

## 🔧 **1. Configurar Secrets no GitHub**

1. **Vá no seu repositório**: https://github.com/jfmachia/lavcontrol-sistema-biometrico
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** e adicione:

### **DOCKER_USERNAME**
- **Name**: `DOCKER_USERNAME`
- **Secret**: `jfmachia` (seu username do Docker Hub)

### **DOCKER_PASSWORD**
- **Name**: `DOCKER_PASSWORD`  
- **Secret**: `sua-senha-do-docker-hub` (ou Access Token)

> **💡 Dica**: Recomendo usar um **Access Token** em vez da senha:
> 1. Docker Hub → **Account Settings** → **Security** → **New Access Token**
> 2. Nome: `GitHub Actions`
> 3. Permissions: **Read, Write, Delete**
> 4. Use o token gerado como DOCKER_PASSWORD

## 🚀 **2. Executar o Build**

Após configurar as secrets:

1. **Faça um commit** no GitHub (qualquer alteração)
2. **Push para main/master**
3. **GitHub Actions será executado automaticamente**
4. **Acompanhe em**: Actions tab do repositório

## ✅ **3. Resultado Esperado**

Após o sucesso do workflow:
- ✅ Imagem `jfmachia/lavcontrol:latest` disponível no Docker Hub
- ✅ Stack no Portainer funcionará sem o erro "No such image"

## 🔍 **4. Verificar se Funcionou**

```bash
# Verificar se a imagem existe
docker pull jfmachia/lavcontrol:latest
```

Ou visite: https://hub.docker.com/r/jfmachia/lavcontrol

## 🔄 **5. Deploy Automático**

Sempre que você fizer push para a branch main:
1. GitHub Actions executa automaticamente
2. Build da aplicação
3. Build da imagem Docker  
4. Push para Docker Hub
5. Tag `latest` sempre atualizada

---

**🎯 Depois disso, sua stack no Portainer funcionará perfeitamente!**