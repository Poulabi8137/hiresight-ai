# =============================================================================
# Stage 1: Base
# =============================================================================
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# =============================================================================
# Stage 2: Dependencies (production only)
# =============================================================================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production
RUN npm ci --include=dev --ignore-scripts

# =============================================================================
# Stage 3: Builder (Next.js app + worker compile)
# =============================================================================
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# =============================================================================
# Stage 4: Web runner
# =============================================================================
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# =============================================================================
# Stage 5: Worker runner
# =============================================================================
FROM base AS worker

COPY --from=deps /app/node_modules ./node_modules
COPY scripts ./scripts
COPY package.json ./

ENV WORKER_HEALTH_DIR=/tmp

CMD ["npx", "tsx", "scripts/worker.ts"]
