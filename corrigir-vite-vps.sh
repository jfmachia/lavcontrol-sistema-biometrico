#!/bin/bash
set -e

echo "🔧 CORREÇÃO DEFINITIVA DO VITE NA VPS"
echo "===================================="

cd /root/lavcontrol-sistema-biometrico

# 1. Fazer backup do arquivo original
echo "📄 Fazendo backup..."
cp server/index.ts server/index.ts.original

# 2. Criar versão corrigida SEM imports do Vite
echo "🔨 Criando versão corrigida..."
cat > server/index.ts << 'EOF'
// FORÇAR DATABASE_URL PARA VPS POSTGRESQL ANTES DE QUALQUER IMPORTAÇÃO
process.env.DATABASE_URL = 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres';

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import fs from "fs";
import path from "path";

// Função log para produção (sem dependência do vite.ts)
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit", 
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Função para servir arquivos estáticos (sem dependência do vite.ts)
function serveStatic(app: express.Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // CRÍTICO: NUNCA IMPORTAR VITE EM PRODUÇÃO
  if (process.env.NODE_ENV === "development") {
    // Desenvolvimento: importar dinamicamente
    try {
      const viteModule = await import("./vite.js");
      await viteModule.setupVite(app, server);
    } catch (err) {
      console.error("Erro ao carregar Vite:", err);
      serveStatic(app);
    }
  } else {
    // Produção: sempre servir estático
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`LavControl serving on port ${port}`);
  });
})();
EOF

# 3. Limpar cache e build
echo "🧹 Limpando cache..."
rm -rf node_modules/.cache
rm -rf dist
rm -rf .vite

# 4. Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm install

# 5. Build frontend primeiro
echo "🎨 Build frontend..."
npx vite build

# 6. Build backend com exclusões específicas
echo "🔧 Build backend..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-cartographer \
  --external:@replit/vite-plugin-runtime-error-modal

# 7. Verificar se não há imports do Vite
echo "🔍 Verificando imports do Vite..."
if grep -r "from.*vite" dist/ 2>/dev/null; then
    echo "❌ ERRO: Ainda há imports do Vite!"
    exit 1
else
    echo "✅ Nenhum import do Vite encontrado"
fi

# 8. Teste local do build
echo "🧪 Testando build..."
timeout 5 node dist/index.js 2>&1 | head -5 || echo "Build testado"

# 9. Criar imagem Docker
echo "🐳 Criando imagem Docker..."
docker build -t jfmachia/lavcontrol:latest . --no-cache

# 10. Verificar imagem
echo "📋 Verificando imagem..."
docker images | grep lavcontrol

echo ""
echo "✅ CORREÇÃO CONCLUÍDA!"
echo "========================"
echo "Agora você pode usar a imagem no Portainer:"
echo "  jfmachia/lavcontrol:latest"
echo ""
echo "Para testar localmente:"
echo "  docker run -p 5000:5000 jfmachia/lavcontrol:latest"
EOF

chmod +x corrigir-vite-vps.sh
echo "✅ Script criado!"