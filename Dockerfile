# Stage 1: Build Frontend
FROM oven/bun:1 AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lockb* ./
RUN bun install

COPY frontend/ ./
RUN bun run build

# Stage 2: Backend + Static Files
FROM oven/bun:1

WORKDIR /app

# Install backend dependencies
COPY ts/package.json ts/bun.lockb* ./
RUN bun install

# Copy backend source
COPY ts/src ./src
COPY ts/tsconfig.json ./
COPY ts/drizzle.config.ts ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000
ENV NODE_ENV=production

# App runs migrations on startup via migrate.ts
CMD ["bun", "run", "src/index.ts"]
