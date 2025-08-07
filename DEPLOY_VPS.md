# 🚀 Deploy LavControl na VPS

Stack configurada seguindo o padrão da sua VPS com pgadmin.

## 📋 **Pré-requisitos**

1. ✅ Rede `laveagora` já existente
2. ✅ Traefik configurado com `letsencryptresolver`
3. ✅ Imagem Docker do LavControl no registry

## 🔧 **Passo a Passo**

### 1️⃣ **Build e Push da Imagem**
```bash
# Build da aplicação
./scripts/docker-build.sh

# Build e push da imagem
./scripts/build-and-push.sh latest
```

### 2️⃣ **Configure as Secrets (Importante!)**
Edite o arquivo `docker-compose-vps.yml` e substitua:

```yaml
## TROQUE ESTAS CHAVES POR VALORES SEGUROS:
- JWT_SECRET=sua-chave-jwt-super-segura-de-32-caracteres-minimo-aqui
- SESSION_SECRET=sua-chave-sessao-super-segura-de-32-caracteres-minimo-aqui
```

### 3️⃣ **Deploy no Portainer**

1. **Acesse Portainer** da sua VPS
2. **Stacks** → **Add stack** 
3. **Name**: `lavcontrol`
4. **Cole o conteúdo** de `docker-compose-vps.yml`
5. **Deploy stack**

## 🌍 **URL Final**

**https://lavcontrol.deliwise.com.br**

## ⚙️ **Configurações da Stack**

### **Recursos:**
- **Replicas**: 2 instâncias
- **CPU**: 1 core por instância  
- **Memory**: 512MB por instância
- **Restart**: Auto restart on failure

### **Rede:**
- **Network**: `laveagora` (mesma do pgadmin)
- **External**: true (usa rede existente)

### **SSL/HTTPS:**
- **Certresolver**: `letsencryptresolver` (mesmo do pgadmin)
- **Entrypoint**: `websecure` 
- **Auto SSL**: Via Let's Encrypt

### **Database:**
- **PostgreSQL**: `148.230.78.128:5432` (mesmo banco da VPS)
- **Credenciais**: Já configuradas no ambiente

## 🔍 **Verificar Deploy**

### **Logs da aplicação:**
```bash
docker service logs lavcontrol_lavcontrol
```

### **Status do service:**
```bash
docker service ps lavcontrol_lavcontrol
```

### **Testar aplicação:**
```bash
curl https://lavcontrol.deliwise.com.br/health
```

## 🔒 **Segurança Configurada**

- ✅ Headers de segurança (XSS protection, etc.)
- ✅ HTTPS obrigatório
- ✅ Certificado SSL automático
- ✅ JWT e Session secrets
- ✅ CORS configurado

## 🐛 **Troubleshooting**

**🚫 Service não inicia:**
- Verifique se a imagem existe: `docker image ls | grep lavcontrol`
- Verifique os logs: `docker service logs lavcontrol_lavcontrol`

**🚫 SSL não funciona:**
- Confirme que `lavcontrol.deliwise.com.br` aponta para a VPS
- Aguarde alguns minutos para geração do certificado

**🚫 Aplicação não responde:**
- Verifique health check: `curl https://lavcontrol.deliwise.com.br/health`
- Confirme se PostgreSQL está acessível da aplicação

---

**✅ Após o deploy, sua aplicação LavControl estará rodando em:**
**https://lavcontrol.deliwise.com.br**

Mesma infraestrutura e padrão do seu pgadmin! 🎯