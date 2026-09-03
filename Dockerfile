# Stage 1: Build TypeScript application with target Ubuntu environment
FROM mcr.microsoft.com/playwright:v1.50.0-noble AS builder

WORKDIR /app

# Enable Corepack and activate PNPM 9
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY .npmrc package.json tsconfig.json tsconfig.build.json ./

# Install dependencies and compile native binaries for Noble Ubuntu
RUN pnpm install

# Copy source code
COPY src/ ./src/

# Build project to dist/
RUN pnpm build

# Stage 2: Production runtime with pre-configured Playwright & Chromium
FROM mcr.microsoft.com/playwright:v1.50.0-noble AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=data/a11yfix.sqlite

# Copy built code and dependencies from builder (100% ABI-compatible)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Ensure SQLite storage directory exists
RUN mkdir -p data

EXPOSE 3000

CMD ["node", "dist/main.js"]
