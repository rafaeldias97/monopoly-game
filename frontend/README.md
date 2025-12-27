# Monopoly Frontend

Frontend React com PWA para o jogo de Monopoly.

## Requisitos

- Node.js 22+ (usando nvm)
- npm, yarn ou pnpm

## Instalação

1. Certifique-se de estar usando Node 22:

```bash
nvm use 22
```

2. Instale as dependências:

```bash
npm install
# ou
pnpm install
# ou
yarn install
```

## Desenvolvimento

```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`

## Build

```bash
npm run build
```

## Preview do build

```bash
npm run preview
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto frontend com:

```
VITE_API_URL=http://localhost:3000
```

Por padrão, se não houver `.env`, o app usa `http://localhost:3000`.

## PWA

O app está configurado como Progressive Web App (PWA) e pode ser instalado em dispositivos móveis.

### Ícones PWA

Para uma melhor experiência PWA, adicione os seguintes ícones na pasta `public/`:

- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)
- `apple-touch-icon.png` (180x180 pixels)

Depois, atualize o `vite.config.ts` para incluir esses ícones no manifest.

## Estrutura

- `src/pages/` - Telas da aplicação
  - `Login.tsx` - Tela de criação de usuário/login
  - `Salas.tsx` - Tela de listagem e criação de salas
- `src/services/` - Serviços
  - `api.ts` - Cliente HTTP para comunicação com backend
  - `storage.ts` - Gerenciamento do localStorage (token e usuário)
