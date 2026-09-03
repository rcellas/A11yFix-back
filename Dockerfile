FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

# Install native build tools (make, g++, python3) required to compile better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Enable Corepack and activate PNPM 9
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy project configuration
COPY .npmrc package.json tsconfig.json tsconfig.build.json ./

# Install dependencies and compile better-sqlite3 with make/g++
RUN pnpm install

# Copy application source
COPY src/ ./src/

# Compile TypeScript to dist/
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=data/a11yfix.sqlite

RUN mkdir -p data

EXPOSE 3000

CMD ["node", "dist/main.js"]
