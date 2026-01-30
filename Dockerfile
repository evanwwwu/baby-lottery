FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source files
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM zeabur/caddy-static:latest

COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 8080
