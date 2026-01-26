# OpenProject-Lite (TypeScript)

Minimal project management API built with Hono + Drizzle + PostgreSQL.

## Stack

- **Runtime**: Bun
- **Framework**: Hono
- **ORM**: Drizzle
- **Database**: PostgreSQL
- **Auth**: Session-based (cookies)
- **Mail**: MS Graph API

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp ../.env.example .env
# Edit .env with your DATABASE_URL

# Push schema to database
bun run db:push

# Start development server
bun run dev
```

## API Endpoints

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Current user

### Projects
- `GET /projects` - List my projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/members` - Add member
- `DELETE /projects/:id/members/:userId` - Remove member

### Tasks
- `GET /tasks?projectId=xxx` - List tasks
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/comments` - Add comment

### Notifications
- `GET /notifications` - List notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all read

## Deploy to Railway

```bash
# From this directory
railway link
railway up
```

Set these variables in Railway:
- `DATABASE_URL`
- `SESSION_SECRET`
- `MSGRAPH_*` (for email)

## Database Schema

```
users
  ├── projects (via project_members)
  ├── tasks (created/assigned)
  ├── comments
  └── notifications

projects
  ├── members
  └── tasks

tasks
  ├── assignee
  ├── creator  
  └── comments
```

## Container Size

~50MB (Bun runtime + dependencies)
