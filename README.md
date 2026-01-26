# OpenProject-Lite

A clean, minimal project management system. Two implementations, same soul.

## Structure

```
/ts     → TypeScript (Hono + Drizzle + PostgreSQL)
/rust   → Rust (Axum + SQLx + PostgreSQL) — coming soon
```

## Features

- **Projects** — Create, manage, archive
- **Tasks** — Status workflow, assignments, due dates
- **Users** — Auth, roles, invitations
- **Comments** — Discussion on tasks
- **Notifications** — Email via MS Graph, in-app

## Quick Start (TypeScript)

```bash
# Start postgres + redis
docker compose up -d

# Install & run
cd ts
bun install
bun run db:push
bun run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/openproject
REDIS_URL=redis://localhost:6379

# MS Graph Mail
MSGRAPH_TENANT_ID=
MSGRAPH_CLIENT_ID=
MSGRAPH_CLIENT_SECRET=
MSGRAPH_SENDER_EMAIL=

# Auth
SESSION_SECRET=your-secret-here
```

## Deploy to Railway

Each folder has its own `railway.toml`. Deploy from subfolder:

```bash
cd ts
railway up
```

## Why Two Implementations?

1. **TypeScript** — Fast to build, easy to iterate
2. **Rust** — Performance flex, tiny containers, learning

Same API, same schema, different runtimes.
