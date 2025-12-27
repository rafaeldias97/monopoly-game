# Guia Completo de Deploy no Heroku - Passo a Passo

Este guia vai te ajudar desde a instalação do Heroku CLI até o deploy completo da aplicação.

## 📋 Pré-requisitos

1. Conta no Heroku (gratuita): https://signup.heroku.com
2. Git instalado no seu computador
3. Node.js 22+ instalado

## 🔧 Passo 1: Instalar Heroku CLI

### macOS

```bash
brew tap heroku/brew && brew install heroku
```

### Linux

```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### Windows

Baixe e instale o instalador: https://devcenter.heroku.com/articles/heroku-cli

### Verificar instalação

```bash
heroku --version
```

## 🔐 Passo 2: Autenticar no Heroku

```bash
# Abre o navegador para login
heroku login

# Ou login via CLI (sem abrir navegador)
heroku login -i
```

Você precisará:

- Email da sua conta Heroku
- Senha da sua conta Heroku

## 📦 Passo 3: Preparar o Projeto

### 3.1. Verificar se está usando Git

```bash
# Verificar status do Git
git status

# Se não tiver Git inicializado
git init
git add .
git commit -m "Initial commit"
```

### 3.2. Build das aplicações (opcional, mas recomendado)

```bash
# Build do backend
cd backend
npm install
npm run build
cd ..

# Build do frontend
cd frontend
npm install
npm run build
cd ..
```

## 🚀 Passo 4: Criar App no Heroku

### Opção A: Criar app via CLI (Recomendado)

```bash
# Criar app (o Heroku vai gerar um nome aleatório)
heroku create

# OU criar com nome específico (se disponível)
heroku create seu-app-monopoly

# Exemplo:
heroku create monopoly-game-2024
```

### Opção B: Criar via Dashboard

1. Acesse: https://dashboard.heroku.com/new-app
2. Escolha um nome para seu app
3. Escolha a região (United States ou Europe)
4. Clique em "Create app"

Depois, conecte seu repositório local:

```bash
heroku git:remote -a nome-do-seu-app
```

## 🔧 Passo 5: Configurar Buildpack

O Heroku precisa saber como buildar sua aplicação:

```bash
# Adicionar buildpack do Node.js
heroku buildpacks:add heroku/nodejs

# Verificar buildpacks
heroku buildpacks
```

## 🗄️ Passo 6: Configurar Banco de Dados PostgreSQL

### 6.1. Adicionar addon do PostgreSQL (gratuito)

```bash
heroku addons:create heroku-postgresql:mini
```

**Nota:** O plano `mini` é gratuito, mas tem limitações. Para produção, considere um plano pago.

### 6.2. Verificar variáveis do banco

```bash
# Ver todas as variáveis de ambiente
heroku config

# O Heroku automaticamente cria estas variáveis quando você adiciona o PostgreSQL:
# DATABASE_URL (já configurada automaticamente)
```

## ⚙️ Passo 7: Configurar Variáveis de Ambiente

```bash
# Configurar variáveis do backend
heroku config:set NODE_ENV=production
heroku config:set DB_SYNCHRONIZE=true
heroku config:set DB_SSL=true
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Configurar URL da API para o frontend
# Substitua 'seu-app-monopoly' pelo nome do seu app
heroku config:set VITE_API_URL=https://seu-app-monopoly.herokuapp.com

# Ver todas as variáveis configuradas
heroku config
```

### 7.1. Configurar banco de dados manualmente (se necessário)

Se você quiser usar um banco externo ou configurar manualmente:

```bash
heroku config:set DB_HOST=seu-host
heroku config:set DB_PORT=5432
heroku config:set DB_USERNAME=seu-usuario
heroku config:set DB_PASSWORD=sua-senha
heroku config:set DB_DATABASE=seu-banco
```

**Mas se você usou o addon do PostgreSQL (Passo 6.1), o Heroku já configura tudo automaticamente via `DATABASE_URL`.**

## 📝 Passo 8: Ajustar Backend para usar DATABASE_URL

O Heroku fornece a URL do banco via `DATABASE_URL`. Você precisa ajustar o backend para usar isso.

**Verificar se o backend já está configurado para usar DATABASE_URL:**

Verifique o arquivo `backend/src/app.module.ts`. Se não estiver usando `DATABASE_URL`, você precisará ajustar.

## 🐳 Passo 9: Deploy com Docker

### 9.1. Habilitar Container Registry

```bash
heroku container:login
```

### 9.2. Fazer build e push da imagem

```bash
# Build e push da imagem Docker
heroku container:push web

# Release da aplicação
heroku container:release web
```

### 9.3. Ver logs

```bash
# Ver logs em tempo real
heroku logs --tail

# Ver últimas 100 linhas
heroku logs -n 100
```

## 🌐 Passo 10: Verificar Deploy

```bash
# Abrir app no navegador
heroku open

# Ver status dos dynos
heroku ps

# Ver informações do app
heroku info
```

## 🔍 Passo 11: Troubleshooting

### Ver logs de erro

```bash
heroku logs --tail
```

### Reiniciar a aplicação

```bash
heroku restart
```

### Verificar variáveis de ambiente

```bash
heroku config
```

### Acessar console do Heroku

```bash
heroku run bash
```

### Verificar se o banco está conectado

```bash
heroku pg:info
```

## 📊 Passo 12: Monitoramento

### Ver uso de recursos

```bash
heroku ps
```

### Ver métricas

Acesse: https://dashboard.heroku.com/apps/seu-app-monopoly/metrics

## 🔄 Atualizar Deploy (quando fizer mudanças)

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "Descrição das mudanças"

# 2. Fazer push para o Heroku
git push heroku main

# OU se estiver usando Docker
heroku container:push web
heroku container:release web
```

## 🎯 Resumo Rápido (Comandos Essenciais)

```bash
# 1. Login
heroku login

# 2. Criar app
heroku create seu-app-monopoly

# 3. Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# 4. Configurar variáveis
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set VITE_API_URL=https://seu-app-monopoly.herokuapp.com
heroku config:set DB_SYNCHRONIZE=true
heroku config:set DB_SSL=true

# 5. Login no Container Registry
heroku container:login

# 6. Deploy
heroku container:push web
heroku container:release web

# 7. Ver logs
heroku logs --tail
```

## ⚠️ Importante: Ajustar Backend para DATABASE_URL

O Heroku fornece o banco via `DATABASE_URL`. Você precisa verificar se o `backend/src/app.module.ts` está configurado para usar isso.

Se não estiver, você pode precisar instalar `pg-connection-string` e fazer parse da URL:

```bash
cd backend
npm install pg-connection-string
```

E ajustar o `app.module.ts` para fazer parse da `DATABASE_URL`.

## 🆘 Precisa de Ajuda?

- Documentação Heroku: https://devcenter.heroku.com
- Status do Heroku: https://status.heroku.com
- Suporte: https://help.heroku.com
