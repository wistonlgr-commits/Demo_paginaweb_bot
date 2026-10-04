# =====================================================
# Dockerfile for Coolify Deployment (VPS Contabo)
# Fullstack: Node.js 22 + React 19 / Vite MPA + Express
# =====================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build client assets
COPY . .
RUN npm run build

# Prune devDependencies for lightweight production image
RUN npm prune --production

# =====================================================
# Production Runtime Stage
# =====================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies and built files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/database ./database

EXPOSE 3000

CMD ["node", "server.js"]
