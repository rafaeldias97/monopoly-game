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

## ⚙️ Passo 6: Configurar Variáveis de Ambiente

```bash
# Configurar variáveis do backend com seu banco de dados externo
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=seu-host-do-banco
heroku config:set DB_PORT=5432
heroku config:set DB_USERNAME=seu-usuario
heroku config:set DB_PASSWORD=sua-senha
heroku config:set DB_DATABASE=nome-do-banco
heroku config:set DB_SYNCHRONIZE=true
heroku config:set DB_SSL=true
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Configurar URL da API para o frontend
# Substitua 'seu-app-monopoly' pelo nome do seu app
heroku config:set VITE_API_URL=https://seu-app-monopoly.herokuapp.com

# Ver todas as variáveis configuradas
heroku config
```

**⚠️ IMPORTANTE:** Substitua os valores acima pelos dados reais do seu banco de dados hospedado.

## 📝 Passo 7: Verificar Configuração do Backend

O backend já está configurado para usar as variáveis de ambiente `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` que você configurou acima.

## 🐳 Passo 8: Deploy com Docker

### 8.1. Habilitar Container Registry

```bash
heroku container:login
```

### 8.2. Fazer build e push da imagem

```bash
# Build e push da imagem Docker
heroku container:push web

# Release da aplicação
heroku container:release web
```

### 8.3. Ver logs

```bash
# Ver logs em tempo real
heroku logs --tail

# Ver últimas 100 linhas
heroku logs -n 100
```

## 🌐 Passo 9: Verificar Deploy

```bash
# Abrir app no navegador
heroku open

# Ver status dos dynos
heroku ps

# Ver informações do app
heroku info
```

## 🔍 Passo 10: Troubleshooting

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

## 📊 Passo 11: Monitoramento

### Ver uso de recursos

```bash
heroku ps
```

### Ver métricas

Acesse: https://dashboard.heroku.com/apps/seu-app-monopoly/metrics

## 🔄 Passo 12: Atualizar Deploy (quando fizer mudanças)

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

# 3. Configurar variáveis de ambiente (com seu banco externo)
heroku config:set DB_HOST=seu-host-do-banco
heroku config:set DB_PORT=5432
heroku config:set DB_USERNAME=seu-usuario
heroku config:set DB_PASSWORD=sua-senha
heroku config:set DB_DATABASE=nome-do-banco
heroku config:set DB_SYNCHRONIZE=true
heroku config:set DB_SSL=true
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set VITE_API_URL=https://seu-app-monopoly.herokuapp.com

# 5. Login no Container Registry
heroku container:login

# 6. Deploy
heroku container:push web
heroku container:release web

# 7. Ver logs
heroku logs --tail
```

## ⚠️ Importante: Configuração do Banco de Dados

O backend está configurado para usar as variáveis de ambiente:

- `DB_HOST` - Host do seu banco de dados
- `DB_PORT` - Porta (geralmente 5432 para PostgreSQL)
- `DB_USERNAME` - Usuário do banco
- `DB_PASSWORD` - Senha do banco
- `DB_DATABASE` - Nome do banco de dados
- `DB_SYNCHRONIZE` - true/false (sincronizar schema)
- `DB_SSL` - true/false (usar SSL)

Certifique-se de que seu banco de dados hospedado permite conexões externas e que você configurou as variáveis corretamente no Heroku.

## 🆘 Precisa de Ajuda?

- Documentação Heroku: https://devcenter.heroku.com
- Status do Heroku: https://status.heroku.com
- Suporte: https://help.heroku.com
