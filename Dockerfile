# Multi-stage build for PM2 with both apps
FROM node:22-alpine AS base

# Install PM2 globally
RUN npm install -g pm2 serve

WORKDIR /app

# Copy ecosystem config
COPY ecosystem.config.js ./

# Backend stage
FROM base AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/pnpm-lock.yaml ./

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

COPY backend/ .

RUN pnpm run build

# Frontend stage
FROM base AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
COPY frontend/pnpm-lock.yaml ./

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

COPY frontend/ .

RUN pnpm run build

# Production stage
FROM base AS production

WORKDIR /app

# Copy built applications
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy ecosystem config
COPY ecosystem.config.js ./

# Create logs directory
RUN mkdir -p logs

# Expose ports
EXPOSE 3000 3001

# Start with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

