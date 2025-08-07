# 🐳 LavControl - Deploy Docker Swarm + Traefik

Guia completo para deployar o LavControl em Docker Swarm via Portainer com Traefik.

## 🚀 Passo a Passo Completo

### 1. 📦 Build e Push da Imagem

```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh

# Build da aplicação
./scripts/docker-build.sh

# Build e push da imagem Docker
./scripts/build-and-push.sh latest
```

### 2. 🌐 Configurar Traefik (se não tiver)

**No Portainer:**
1. Vá em **Stacks** → **Add stack**
2. Nome: `traefik`
3. Cole o conteúdo do arquivo `traefik-stack.yml`
4. Configure as **Environment Variables**:

```env
DOMAIN=seudominio.com
ACME_EMAIL=seu-email@exemplo.com
TRAEFIK_AUTH=admin:$2y$10$mF/RCxMzNK1HiYGu.XDmBOvMi.HlYn/p2x.IbMsmnqNnMPnc0WOTS
```

5. **Deploy stack**

### 3. 🎯 Deploy LavControl

**No Portainer:**
1. Vá em **Stacks** → **Add stack** 
2. Nome: `lavcontrol`
3. Cole o conteúdo do arquivo `docker-compose.yml`
4. Configure as **Environment Variables**:

```env
DOMAIN=seudominio.com
JWT_SECRET=sua-chave-jwt-super-segura-de-32-caracteres-minimo
SESSION_SECRET=sua-chave-sessao-super-segura-de-32-caracteres-minimo
```

5. **Deploy stack**

## 🔧 Variáveis de Ambiente

### Obrigatórias:
- `DOMAIN`: Seu domínio base (ex: `meusite.com`)
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)
- `SESSION_SECRET`: Chave secreta para sessões (mínimo 32 caracteres)

### Opcionais:
- `ACME_EMAIL`: Email para certificados SSL
- `TRAEFIK_AUTH`: Usuário:senha hash para dashboard do Traefik

## 🌍 URLs Após Deploy

- **LavControl**: `https://lavcontrol.seudominio.com`
- **Traefik Dashboard**: `https://traefik.seudominio.com`

## 🔒 Gerar Hash de Senha para Traefik

```bash
# Instalar htpasswd (Ubuntu/Debian)
sudo apt install apache2-utils

# Gerar hash (substitua admin e sua-senha)
echo $(htpasswd -nb admin sua-senha-aqui) | sed -e s/\\$/\\$\\$/g
```

## ⚙️ Configurações do Sistema

### Banco PostgreSQL VPS
- ✅ **Conecta automaticamente na VPS**: `148.230.78.128:5432`
- ✅ **Credenciais já configuradas** no docker-compose.yml
- ✅ **Sem necessidade de banco separado**

### Recursos Docker
- **Replicas**: 2 instâncias da aplicação
- **CPU**: 0.25-0.5 cores por instância
- **Memory**: 256-512 MB por instância
- **Health Check**: Endpoint `/health` a cada 30s

### SSL/HTTPS
- ✅ **Certificados automáticos** via Let's Encrypt
- ✅ **HTTP → HTTPS redirect** automático
- ✅ **Headers de segurança** configurados

## 🔍 Troubleshooting

### Verificar Logs
```bash
# Logs do LavControl
docker service logs lavcontrol_lavcontrol-app

# Logs do Traefik
docker service logs traefik_traefik
```

### Verificar Status
```bash
# Status dos services
docker service ls

# Detalhes do service
docker service ps lavcontrol_lavcontrol-app
```

### Problemas Comuns

**🚫 Erro "service not found":**
- Verifique se a rede `traefik-public` existe
- Deploy o Traefik antes do LavControl

**🚫 Certificado SSL não funciona:**
- Verifique se o DOMAIN está apontando para o servidor
- Aguarde alguns minutos para geração do certificado

**🚫 Aplicação não responde:**
- Verifique se a imagem foi enviada corretamente
- Confirme as variáveis de ambiente

## 📊 Monitoramento

### Métricas Disponíveis
- Health check da aplicação
- Métricas do Traefik (Prometheus)
- Logs estruturados

### Dashboard Traefik
- Visualize todos os services
- Status dos certificados SSL
- Métricas de tráfego

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# 1. Build nova versão
./scripts/build-and-push.sh v1.1.0

# 2. No Portainer, edite a stack e altere:
image: jfmachia/lavcontrol:v1.1.0

# 3. Update stack
```

## 🏗️ Arquitetura Final

```
Internet
    ↓
Traefik (Load Balancer + SSL)
    ↓
LavControl App (2 replicas)
    ↓
PostgreSQL VPS (148.230.78.128:5432)
    ↓
MQTT Broker (broker.emqx.io)
```

---

**✅ Após seguir este guia, seu LavControl estará rodando em produção com:**
- Alta disponibilidade (2 replicas)
- SSL automático
- Load balancing
- Health checks
- Logs centralizados
- Monitoramento via Traefik dashboard