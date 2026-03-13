# Install dependencies only when needed
FROM node:18-alpine AS deps
RUN apk update && apk upgrade && apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4 --activate
COPY package.json yarn.lock ./
RUN yarn config set nodeLinker node-modules
RUN yarn install --frozen-lockfile

# Build the app with cache dependencies
FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4 --activate

# Copiar node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production image - ¡CORREGIDO!
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare yarn@4 --activate

# Copiar package.json y yarn.lock
COPY package.json yarn.lock ./

# Configurar yarn para modo node_modules
RUN yarn config set nodeLinker node-modules

# 👇 IMPORTANTE: Instalar solo dependencias de producción
RUN yarn workspaces focus --production

# Copiar el build desde builder
COPY --from=builder /app/dist ./dist

# Copiar node_modules de producción desde la misma etapa runner
# (ya deberían estar en /usr/src/app/node_modules)

CMD [ "node", "dist/main" ]