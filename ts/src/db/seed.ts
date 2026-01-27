// Seed admin user from environment variables
// OPENPROJECT_SEED__ADMIN__USER__PASSWORD - admin password (required to seed)
// OPENPROJECT_SEED__ADMIN__USER__PASSWORD__RESET - if "true", reset password even if admin exists

import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";

const ADMIN_EMAIL = "admin@openproject-lite.local";
const ADMIN_NAME = "Administrator";

export async function seedAdmin(): Promise<void> {
  const password = process.env.OPENPROJECT_SEED__ADMIN__USER__PASSWORD;
  const forceReset = process.env.OPENPROJECT_SEED__ADMIN__USER__PASSWORD__RESET === "true";

  if (!password) {
    console.log("[seed] No OPENPROJECT_SEED__ADMIN__USER__PASSWORD set, skipping admin seed");
    return;
  }

  console.log("[seed] Admin password configured, checking for existing admin...");

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (existing.length > 0) {
    if (forceReset) {
      console.log("[seed] Admin exists, resetting password (RESET=true)");
      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.email, ADMIN_EMAIL));
      console.log("[seed] Admin password reset complete");
    } else {
      console.log("[seed] Admin already exists, skipping (set RESET=true to force)");
    }
    return;
  }

  console.log("[seed] Creating admin user...");
  await db.insert(users).values({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    passwordHash,
    isAdmin: true,
    isActive: true,
  });

  console.log(`[seed] Admin created: ${ADMIN_EMAIL}`);
}
