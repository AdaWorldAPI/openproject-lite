FROM oven/bun:1

WORKDIR /app

# Copy from ts subfolder
COPY ts/package.json ./
COPY ts/bun.lockb* ./
RUN bun install

COPY ts/src ./src
COPY ts/tsconfig.json ./
COPY ts/drizzle.config.ts ./

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "run", "src/index.ts"]
