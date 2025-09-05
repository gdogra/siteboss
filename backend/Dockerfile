# Production-optimized multi-stage Docker build

# Stage 1: Dependencies
FROM node:20-alpine AS deps
LABEL stage=deps
WORKDIR /app

# Install security updates and required tools
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    && apk upgrade --no-cache

# Copy package files
COPY package*.json ./

# Install dependencies with cache optimization
RUN npm ci --only=production --frozen-lockfile --no-audit --no-fund \
    && npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
LABEL stage=builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Install dev dependencies and build
RUN npm ci --frozen-lockfile --no-audit --no-fund \
    && npm run build \
    && npm prune --production

# Stage 3: Production runner
FROM node:20-alpine AS runner
LABEL maintainer="SiteBoss Team"
LABEL version="1.0.0"

# Install dumb-init for proper signal handling
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs uploads \
    && chown -R nextjs:nodejs logs uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]