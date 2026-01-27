# Stage 1: Build Frontend
FROM oven/bun:1 AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lockb* ./
RUN bun install

COPY frontend/ ./
RUN bun run build

# Stage 2: Backend + Static Files
FROM oven/bun:1-slim

WORKDIR /app

# Install backend dependencies (need full deps for drizzle-kit)
COPY ts/package.json ts/bun.lockb* ./
RUN bun install

# Copy backend source
COPY ts/src ./src
COPY ts/tsconfig.json ./
COPY ts/drizzle.config.ts ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Create startup script that runs migrations then starts server
RUN echo '#!/bin/sh\nbun run db:push && bun run src/index.ts' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000
ENV NODE_ENV=production

CMD ["/app/start.sh"]
