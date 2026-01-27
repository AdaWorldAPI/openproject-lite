// Direct SQL migration - avoids drizzle-kit introspection issues with existing OpenProject tables
import { sql } from "drizzle-orm";
import { db } from "./index";

export async function migrate(): Promise<void> {
  console.log("[migrate] Running migrations...");

  try {
    // Create enums
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE op_lite_task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE op_lite_project_role AS ENUM ('owner', 'admin', 'member', 'viewer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE op_lite_notification_type AS ENUM ('task_assigned', 'task_updated', 'comment_added', 'mentioned', 'project_invite');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS op_lite_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS op_lite_sessions (
        id TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES op_lite_users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS op_lite_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        slug TEXT NOT NULL UNIQUE,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        settings JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS op_lite_project_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES op_lite_projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES op_lite_users(id) ON DELETE CASCADE,
        role op_lite_project_role NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_project_members_project_idx ON op_lite_project_members(project_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_project_members_user_idx ON op_lite_project_members(user_id);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS op_lite_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES op_lite_projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status op_lite_task_status NOT NULL DEFAULT 'backlog',
        priority TEXT NOT NULL DEFAULT 'medium',
        assignee_id UUID REFERENCES op_lite_users(id) ON DELETE SET NULL,
        creator_id UUID NOT NULL REFERENCES op_lite_users(id),
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_tasks_project_idx ON op_lite_tasks(project_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_tasks_assignee_idx ON op_lite_tasks(assignee_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_tasks_status_idx ON op_lite_tasks(status);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS op_lite_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES op_lite_tasks(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES op_lite_users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_comments_task_idx ON op_lite_comments(task_id);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS op_lite_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES op_lite_users(id) ON DELETE CASCADE,
        type op_lite_notification_type NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        link_url TEXT,
        is_read BOOLEAN NOT NULL DEFAULT false,
        email_sent BOOLEAN NOT NULL DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_notifications_user_idx ON op_lite_notifications(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS op_lite_notifications_unread_idx ON op_lite_notifications(user_id, is_read);
    `);

    console.log("[migrate] Migrations complete");
  } catch (err) {
    console.error("[migrate] Migration error:", err);
    throw err;
  }
}
