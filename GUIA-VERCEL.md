# Guia: Criar Projeto no GitHub e Deploy no Vercel

## 📋 Pré-requisitos

1. Conta no GitHub
2. Conta no Vercel (https://vercel.com)
3. Node.js instalado

## 🔐 Passo 1: Autenticar no GitHub CLI

```bash
# Autenticar no GitHub
gh auth login

# Escolher:
# - GitHub.com
# - HTTPS (recomendado)
# - Autenticar via navegador (mais fácil)
```

## 📦 Passo 2: Instalar Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# OU com pnpm
pnpm add -g vercel

# Verificar instalação
vercel --version
```

## 🚀 Passo 3: Criar Repositório no GitHub

### Opção A: Criar repositório e conectar projeto existente

```bash
# 1. Criar repositório no GitHub (público ou privado)
gh repo create monopoly-game --public --source=. --remote=origin --push

# OU criar sem fazer push imediato
gh repo create monopoly-game --public --source=. --remote=origin

# 2. Se já tiver um remote, adicionar o GitHub
git remote add origin https://github.com/SEU-USUARIO/monopoly-game.git

# 3. Fazer push do código
git push -u origin master
# OU se sua branch for main:
git push -u origin main
```

### Opção B: Criar repositório vazio primeiro

```bash
# 1. Criar repositório vazio no GitHub
gh repo create monopoly-game --public --description "Monopoly Game - Backend API"

# 2. Adicionar remote (substitua SEU-USUARIO pelo seu username)
git remote add github https://github.com/SEU-USUARIO/monopoly-game.git

# 3. Renomear branch se necessário (se estiver em master, mudar para main)
git branch -M main

# 4. Fazer push
git push -u github main
```

## 🌐 Passo 4: Configurar Projeto para Vercel

### 4.1. Criar arquivo vercel.json (para backend)

Como este é um projeto backend NestJS, você precisa configurar o Vercel para rodar como serverless function ou usar o modo standalone.

Crie o arquivo `vercel.json` na raiz:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4.2. Alternativa: Usar Vercel com Docker (Recomendado para NestJS)

O Vercel também suporta Docker. Você pode usar o mesmo Dockerfile:

```json
{
  "version": 2,
  "buildCommand": "cd backend && pnpm install && pnpm run build",
  "outputDirectory": "backend/dist",
  "installCommand": "cd backend && pnpm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

## 🚀 Passo 5: Deploy no Vercel

### Opção A: Via CLI (Recomendado)

```bash
# 1. Login no Vercel
vercel login

# 2. Inicializar projeto (na raiz do projeto)
vercel

# 3. Seguir as instruções:
# - Set up and deploy? Y
# - Which scope? (escolher sua conta)
# - Link to existing project? N (primeira vez)
# - Project name? monopoly-game (ou o nome que preferir)
# - Directory? ./backend (ou . se configurar na raiz)
# - Override settings? N (primeira vez)

# 4. Deploy de produção
vercel --prod
```

### Opção B: Via Dashboard do Vercel

1. Acesse: https://vercel.com/new
2. Conecte sua conta do GitHub
3. Importe o repositório `monopoly-game`
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend` (ou `.` se configurar na raiz)
   - **Build Command**: `cd backend && pnpm install && pnpm run build`
   - **Output Directory**: `backend/dist`
   - **Install Command**: `cd backend && pnpm install`
5. Adicione as variáveis de ambiente:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_DATABASE`
   - `DB_SYNCHRONIZE`
   - `DB_SSL`
   - `JWT_SECRET`
   - `PORT` (opcional, Vercel define automaticamente)
6. Clique em "Deploy"

## ⚙️ Passo 6: Configurar Variáveis de Ambiente no Vercel

```bash
# Via CLI
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USERNAME
vercel env add DB_PASSWORD
vercel env add DB_DATABASE
vercel env add DB_SYNCHRONIZE
vercel env add DB_SSL
vercel env add JWT_SECRET

# Ou via Dashboard:
# Settings > Environment Variables
```

## 📝 Nota Importante sobre NestJS no Vercel

O Vercel é otimizado para serverless functions. Para aplicações NestJS completas, você tem algumas opções:

### Opção 1: Usar Vercel com modo standalone do NestJS

Modifique o `main.ts` para suportar serverless:

```typescript
// Adicionar no final do main.ts
export default app; // Para Vercel serverless
```

E crie um arquivo `api/index.js`:

```javascript
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const server = require("../dist/main");

module.exports = server;
```

### Opção 2: Usar Railway ou Render (Alternativas)

Se o Vercel não funcionar bem com NestJS, considere:

- **Railway**: https://railway.app (suporta Docker)
- **Render**: https://render.com (suporta Docker)
- **Fly.io**: https://fly.io (suporta Docker)

## 🔄 Comandos Úteis

```bash
# Ver status do deploy
vercel ls

# Ver logs
vercel logs

# Remover deploy
vercel remove

# Ver informações do projeto
vercel inspect
```

## 🆘 Troubleshooting

### Erro: "Cannot find module"

- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o build está gerando os arquivos corretamente

### Erro: "Port already in use"

- O Vercel define a porta automaticamente via `process.env.PORT`
- Não precisa definir porta manualmente

### Erro de conexão com banco

- Verifique se as variáveis de ambiente estão configuradas
- Certifique-se de que o banco permite conexões externas
- Verifique se `DB_SSL=true` está configurado

## 📚 Referências

- Vercel Docs: https://vercel.com/docs
- GitHub CLI: https://cli.github.com/manual/
- NestJS Deployment: https://docs.nestjs.com/faq/serverless
