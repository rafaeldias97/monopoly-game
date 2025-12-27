# 🚀 Comandos Rápidos para Deploy no Heroku

## Primeira Vez - Setup Completo

```bash
# 1. Instalar Heroku CLI (se ainda não tiver)
# macOS:
brew tap heroku/brew && brew install heroku

# 2. Login no Heroku
heroku login

# 3. Criar app no Heroku
heroku create seu-app-monopoly

# 4. Adicionar PostgreSQL (gratuito)
heroku addons:create heroku-postgresql:mini

# 5. Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set DB_SYNCHRONIZE=true
heroku config:set DB_SSL=true

# IMPORTANTE: Substitua 'seu-app-monopoly' pelo nome real do seu app
heroku config:set VITE_API_URL=https://seu-app-monopoly.herokuapp.com

# 6. Login no Container Registry
heroku container:login

# 7. Fazer deploy
heroku container:push web
heroku container:release web

# 8. Ver logs
heroku logs --tail
```

## Deploy de Atualizações

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "Sua mensagem de commit"

# 2. Deploy
heroku container:push web
heroku container:release web

# 3. Ver logs
heroku logs --tail
```

## Comandos Úteis

```bash
# Ver todas as variáveis de ambiente
heroku config

# Ver logs em tempo real
heroku logs --tail

# Reiniciar aplicação
heroku restart

# Abrir app no navegador
heroku open

# Ver status dos dynos
heroku ps

# Ver informações do banco
heroku pg:info

# Acessar console
heroku run bash
```

## ⚠️ IMPORTANTE

1. **Substitua `seu-app-monopoly`** pelo nome real do seu app em todos os comandos
2. **Aguarde alguns minutos** após o deploy para a aplicação ficar disponível
3. **Verifique os logs** se algo não funcionar: `heroku logs --tail`
