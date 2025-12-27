# Deploy no Heroku com Docker e PM2

Este projeto está configurado para ser deployado no Heroku usando Docker e PM2 para gerenciar ambas as aplicações (backend e frontend).

## Arquivos Criados

### Configuração PM2

- `ecosystem.config.js` - Configuração do PM2 para gerenciar backend e frontend

### Dockerfiles

- `Dockerfile` (raiz) - Dockerfile multi-stage para PM2 com ambas apps
- `backend/Dockerfile` - Dockerfile específico para backend
- `frontend/Dockerfile` - Dockerfile específico para frontend

### Heroku

- `heroku.yml` - Configuração do Heroku para build e run com Docker

### Docker Compose (opcional para desenvolvimento)

- `docker-compose.yml` - Para rodar localmente com Docker

## Pré-requisitos

1. Conta no Heroku
2. Heroku CLI instalado
3. Docker instalado (opcional, para testar localmente)

## Variáveis de Ambiente Necessárias

### Backend

- `PORT` - Porta do backend (padrão: 3000)
- `DB_HOST` - Host do banco de dados PostgreSQL
- `DB_PORT` - Porta do banco (padrão: 5432)
- `DB_USERNAME` - Usuário do banco
- `DB_PASSWORD` - Senha do banco
- `DB_DATABASE` - Nome do banco
- `DB_SYNCHRONIZE` - Sincronizar schema (true/false)
- `DB_SSL` - Usar SSL (true/false)
- `JWT_SECRET` - Chave secreta para JWT

### Frontend

- `PORT` - Porta do frontend (padrão: 3001)
- `VITE_API_URL` - URL da API backend (ex: https://seu-backend.herokuapp.com)

## Deploy no Heroku

### Opção 1: Usando Docker (Recomendado)

1. **Criar apps no Heroku:**

```bash
heroku create seu-app-backend
heroku create seu-app-frontend
```

2. **Adicionar buildpack do Docker:**

```bash
heroku buildpacks:add heroku/nodejs -a seu-app-backend
heroku buildpacks:add heroku/nodejs -a seu-app-frontend
```

3. **Configurar variáveis de ambiente no backend:**

```bash
heroku config:set DB_HOST=seu-host -a seu-app-backend
heroku config:set DB_PORT=5432 -a seu-app-backend
heroku config:set DB_USERNAME=seu-usuario -a seu-app-backend
heroku config:set DB_PASSWORD=sua-senha -a seu-app-backend
heroku config:set DB_DATABASE=seu-banco -a seu-app-backend
heroku config:set DB_SYNCHRONIZE=true -a seu-app-backend
heroku config:set DB_SSL=true -a seu-app-backend
heroku config:set JWT_SECRET=sua-chave-secreta -a seu-app-backend
heroku config:set PORT=3000 -a seu-app-backend
```

4. **Configurar variáveis de ambiente no frontend:**

```bash
heroku config:set VITE_API_URL=https://seu-app-backend.herokuapp.com -a seu-app-frontend
heroku config:set PORT=3001 -a seu-app-frontend
```

5. **Fazer deploy:**

```bash
# Backend
cd backend
heroku container:push web -a seu-app-backend
heroku container:release web -a seu-app-backend

# Frontend
cd ../frontend
heroku container:push web -a seu-app-frontend
heroku container:release web -a seu-app-frontend
```

### Opção 2: Usando PM2 com Dockerfile único

1. **Criar app no Heroku:**

```bash
heroku create seu-app-monopoly
```

2. **Configurar variáveis de ambiente:**

```bash
heroku config:set DB_HOST=seu-host -a seu-app-monopoly
heroku config:set DB_PORT=5432 -a seu-app-monopoly
heroku config:set DB_USERNAME=seu-usuario -a seu-app-monopoly
heroku config:set DB_PASSWORD=sua-senha -a seu-app-monopoly
heroku config:set DB_DATABASE=seu-banco -a seu-app-monopoly
heroku config:set DB_SYNCHRONIZE=true -a seu-app-monopoly
heroku config:set DB_SSL=true -a seu-app-monopoly
heroku config:set JWT_SECRET=sua-chave-secreta -a seu-app-monopoly
heroku config:set VITE_API_URL=https://seu-app-monopoly.herokuapp.com -a seu-app-monopoly
```

3. **Fazer deploy:**

```bash
heroku container:push web -a seu-app-monopoly
heroku container:release web -a seu-app-monopoly
```

**Nota:** Para usar PM2 com ambas apps no mesmo container, você precisará configurar o Heroku para usar o Dockerfile da raiz e ajustar o `heroku.yml` ou usar um Procfile.

## Testar Localmente com Docker Compose

```bash
# Criar arquivo .env na raiz
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=test
DB_SYNCHRONIZE=true
DB_SSL=false
JWT_SECRET=your-secret-key
VITE_API_URL=http://localhost:3000
EOF

# Subir os containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os containers
docker-compose down
```

## Testar Localmente com PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Build das aplicações
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# Iniciar com PM2
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs
pm2 logs

# Parar
pm2 stop ecosystem.config.js
pm2 delete ecosystem.config.js
```

## Estrutura de Portas

- **Backend:** 3000 (ou variável `PORT`)
- **Frontend:** 3001 (ou variável `PORT`)

No Heroku, cada app terá sua própria porta dinâmica via variável `PORT`.

## Troubleshooting

### Backend não inicia

- Verifique as variáveis de ambiente do banco de dados
- Verifique os logs: `heroku logs --tail -a seu-app-backend`

### Frontend não conecta ao backend

- Verifique se `VITE_API_URL` está configurado corretamente
- Certifique-se de que a URL da API está acessível publicamente
- Verifique CORS no backend

### Build falha

- Verifique se todas as dependências estão no `package.json`
- Verifique se os arquivos de lock (`pnpm-lock.yaml`) estão commitados
- Verifique os logs de build: `heroku logs --tail -a seu-app`

## Notas Importantes

1. **PM2 no Heroku:** O Heroku gerencia processos automaticamente, então PM2 pode não ser necessário. Considere usar processos separados ou o Dockerfile da raiz apenas se precisar rodar ambas apps no mesmo dyno.

2. **Banco de Dados:** Configure um addon do PostgreSQL no Heroku:

```bash
heroku addons:create heroku-postgresql:hobby-dev -a seu-app-backend
```

3. **CORS:** O backend já está configurado para aceitar todas as origens. Em produção, considere restringir para o domínio do frontend.

4. **SSL:** Configure `DB_SSL=true` quando usar banco de dados remoto.
