// Seed admin user from environment variables
// OPENPROJECT_SEED__ADMIN__USER__PASSWORD - admin password (required to seed)
// OPENPROJECT_SEED__ADMIN__USER__PASSWORD__RESET - if "true", reset password even if admin exists

import { db } from "./index";
import { users, types, statuses, priorities } from "./schema";
import { eq, sql } from "drizzle-orm";
import argon2 from "argon2";

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

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
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
  } catch (err) {
    // Table might not exist yet on first run
    console.log("[seed] Could not seed admin (table may not exist yet):", (err as Error).message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE DATA SEED
// ═══════════════════════════════════════════════════════════════════════════

// OpenProject default types
const DEFAULT_TYPES = [
  { name: "Task", color: "#1A67A3", position: 1, isDefault: true, isMilestone: false },
  { name: "Milestone", color: "#F0F0F0", position: 2, isDefault: false, isMilestone: true },
  { name: "Phase", color: "#FF922B", position: 3, isDefault: false, isMilestone: false },
  { name: "Feature", color: "#35C53F", position: 4, isDefault: false, isMilestone: false },
  { name: "Epic", color: "#9141AC", position: 5, isDefault: false, isMilestone: false },
  { name: "User story", color: "#00B0F0", position: 6, isDefault: false, isMilestone: false },
  { name: "Bug", color: "#CC0000", position: 7, isDefault: false, isMilestone: false },
];

// OpenProject default statuses
const DEFAULT_STATUSES = [
  { name: "New", color: "#DEE2E6", position: 1, isClosed: false, isDefault: true, defaultDoneRatio: 0 },
  { name: "In progress", color: "#00B0F0", position: 2, isClosed: false, isDefault: false, defaultDoneRatio: null },
  { name: "Developed", color: "#74C0FC", position: 3, isClosed: false, isDefault: false, defaultDoneRatio: null },
  { name: "In testing", color: "#FFE066", position: 4, isClosed: false, isDefault: false, defaultDoneRatio: null },
  { name: "Tested", color: "#8CE99A", position: 5, isClosed: false, isDefault: false, defaultDoneRatio: null },
  { name: "Test failed", color: "#FF8787", position: 6, isClosed: false, isDefault: false, defaultDoneRatio: null },
  { name: "Closed", color: "#35C53F", position: 10, isClosed: true, isDefault: false, defaultDoneRatio: 100 },
  { name: "On hold", color: "#FF922B", position: 11, isClosed: false, isDefault: false, defaultDoneRatio: null },
  { name: "Rejected", color: "#CC0000", position: 12, isClosed: true, isDefault: false, defaultDoneRatio: null },
];

// OpenProject default priorities
const DEFAULT_PRIORITIES = [
  { name: "Low", color: "#83898E", position: 1, isDefault: false, isActive: true },
  { name: "Normal", color: "#1A67A3", position: 2, isDefault: true, isActive: true },
  { name: "High", color: "#FF922B", position: 3, isDefault: false, isActive: true },
  { name: "Immediate", color: "#CC0000", position: 4, isDefault: false, isActive: true },
];

export async function seedReferenceData(): Promise<void> {
  console.log("[seed] Checking reference data...");

  try {
    // Seed types if empty
    const existingTypes = await db.select({ count: sql<number>`count(*)` }).from(types);
    if (Number(existingTypes[0]?.count) === 0) {
      console.log("[seed] Seeding default types...");
      await db.insert(types).values(DEFAULT_TYPES);
      console.log(`[seed] Created ${DEFAULT_TYPES.length} types`);
    } else {
      console.log("[seed] Types already exist, skipping");
    }

    // Seed statuses if empty
    const existingStatuses = await db.select({ count: sql<number>`count(*)` }).from(statuses);
    if (Number(existingStatuses[0]?.count) === 0) {
      console.log("[seed] Seeding default statuses...");
      await db.insert(statuses).values(DEFAULT_STATUSES);
      console.log(`[seed] Created ${DEFAULT_STATUSES.length} statuses`);
    } else {
      console.log("[seed] Statuses already exist, skipping");
    }

    // Seed priorities if empty
    const existingPriorities = await db.select({ count: sql<number>`count(*)` }).from(priorities);
    if (Number(existingPriorities[0]?.count) === 0) {
      console.log("[seed] Seeding default priorities...");
      await db.insert(priorities).values(DEFAULT_PRIORITIES);
      console.log(`[seed] Created ${DEFAULT_PRIORITIES.length} priorities`);
    } else {
      console.log("[seed] Priorities already exist, skipping");
    }

    console.log("[seed] Reference data check complete");
  } catch (err) {
    console.log("[seed] Could not seed reference data:", (err as Error).message);
  }
}
