# Multi-Stage Production Dockerfile for Routeflow Backend
# Stage 1: Build & Dependencies
FROM node:22-alpine AS build

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY . .

# Stage 2: Production Runtime
FROM node:22-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source from build stage
COPY --from=build /app/src ./src
COPY --from=build /app/scripts ./scripts

# Create logs directory with node user permissions
RUN mkdir -p /app/logs && chown -R node:node /app

# Use non-root node user for security
USER node

EXPOSE 5000

# Health check using native Node.js HTTP call to readiness endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health/ready', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "src/server.js"]

