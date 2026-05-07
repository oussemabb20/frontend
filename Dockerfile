# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Vite environment variables are injected at build time
ARG VITE_CHAT_SOCKET_URL
ENV VITE_CHAT_SOCKET_URL=$VITE_CHAT_SOCKET_URL

# Copy package files
COPY package*.json .npmrc ./

# Install dependencies
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build || npx vite build

# Runtime stage (no nginx pull required)
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/build /app/build

# Lightweight static server for production
RUN npm install -g serve@14

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Serve static files
CMD ["serve", "-s", "build", "-l", "80"]
