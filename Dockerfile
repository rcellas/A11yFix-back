FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

# Install native build tools required to compile better-sqlite3 C++ bindings
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Enable Corepack and activate PNPM 9
RUN corepack enable && \
    corepack prepare pnpm@9.15.4 --activate

# Copy manifests and lockfile first (for Docker layer caching)
COPY package.json pnpm-lock.yaml .npmrc ./

# Install exact dependency versions from lockfile
RUN pnpm install --frozen-lockfile

# Copy TypeScript configuration and source
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# Compile TypeScript to dist/
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/a11yfix.sqlite

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/main.js"]
