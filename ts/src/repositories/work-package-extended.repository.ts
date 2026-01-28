// RUST: Work Package Extended Repository — Relations, Watchers, Activities
// RUST: impl WorkPackageExtendedRepository for DrizzleWorkPackageExtendedRepository

import { db } from "../db";
import {
  workPackageRelations,
  watchers,
  journals,
  journalChanges,
  users,
} from "../db/schema";
import { eq, and, or } from "drizzle-orm";
import type {
  RelationDTO,
  CreateRelationDTO,
  WatcherDTO,
  CreateWatcherDTO,
  JournalDTO,
  CreateJournalDTO,
  JournalChangeDTO,
  RelationType,
  WatchableType,
  JournableType,
} from "../dto";

// ═══════════════════════════════════════════════════════════════════════════
// REPOSITORY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

// RUST: pub trait WorkPackageExtendedRepository: Send + Sync
export interface WorkPackageExtendedRepository {
  // Relations
  listRelationsForWorkPackage(workPackageId: string): Promise<RelationDTO[]>;
  getRelationById(id: string): Promise<RelationDTO | null>;
  createRelation(input: CreateRelationDTO): Promise<RelationDTO>;
  deleteRelation(id: string): Promise<boolean>;

  // Watchers
  listWatchersForResource(
    watchableType: WatchableType,
    watchableId: string
  ): Promise<WatcherDTO[]>;
  isWatching(
    watchableType: WatchableType,
    watchableId: string,
    userId: string
  ): Promise<boolean>;
  addWatcher(input: CreateWatcherDTO): Promise<WatcherDTO>;
  removeWatcher(
    watchableType: WatchableType,
    watchableId: string,
    userId: string
  ): Promise<boolean>;

  // Activities (Journals)
  listActivitiesForWorkPackage(workPackageId: string): Promise<JournalDTO[]>;
  getActivityById(id: string): Promise<JournalDTO | null>;
  createActivity(input: CreateJournalDTO): Promise<JournalDTO>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAPPERS
// ═══════════════════════════════════════════════════════════════════════════

type RelationRow = typeof workPackageRelations.$inferSelect;
type WatcherRow = typeof watchers.$inferSelect;
type JournalRow = typeof journals.$inferSelect;
type JournalChangeRow = typeof journalChanges.$inferSelect;
type UserRow = typeof users.$inferSelect;

// RUST: fn relation_to_dto(row: &RelationRow) -> RelationDTO
function relationToDTO(row: RelationRow): RelationDTO {
  return {
    id: row.id,
    fromId: row.fromId,
    toId: row.toId,
    relationType: row.relationType as RelationType,
    lag: row.lag,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// RUST: fn watcher_to_dto(row: &WatcherRow, user: Option<&UserRow>) -> WatcherDTO
function watcherToDTO(
  row: WatcherRow,
  user?: UserRow | null
): WatcherDTO {
  return {
    id: row.id,
    watchableType: row.watchableType as WatchableType,
    watchableId: row.watchableId,
    userId: row.userId,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      : undefined,
    createdAt: row.createdAt,
  };
}

// RUST: fn journal_change_to_dto(row: &JournalChangeRow) -> JournalChangeDTO
function journalChangeToDTO(row: JournalChangeRow): JournalChangeDTO {
  return {
    id: row.id,
    journalId: row.journalId,
    property: row.property,
    propertyKey: row.propertyKey,
    oldValue: row.oldValue,
    newValue: row.newValue,
  };
}

// RUST: fn journal_to_dto(row: &JournalRow, user: Option<&UserRow>, changes: &[JournalChangeDTO]) -> JournalDTO
function journalToDTO(
  row: JournalRow,
  user?: UserRow | null,
  changes: JournalChangeDTO[] = []
): JournalDTO {
  return {
    id: row.id,
    journableType: row.journableType as JournableType,
    journableId: row.journableId,
    userId: row.userId,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      : undefined,
    notes: row.notes,
    version: row.version,
    causeType: row.causeType,
    changes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

// RUST: pub fn create_work_package_extended_repository() -> impl WorkPackageExtendedRepository
export function createWorkPackageExtendedRepository(): WorkPackageExtendedRepository {
  return {
    // ─────────────────────────────────────────────────────────────────────────
    // RELATIONS
    // ─────────────────────────────────────────────────────────────────────────

    async listRelationsForWorkPackage(workPackageId: string): Promise<RelationDTO[]> {
      const rows = await db
        .select()
        .from(workPackageRelations)
        .where(
          or(
            eq(workPackageRelations.fromId, workPackageId),
            eq(workPackageRelations.toId, workPackageId)
          )
        );
      return rows.map(relationToDTO);
    },

    async getRelationById(id: string): Promise<RelationDTO | null> {
      const rows = await db
        .select()
        .from(workPackageRelations)
        .where(eq(workPackageRelations.id, id))
        .limit(1);
      return rows[0] ? relationToDTO(rows[0]) : null;
    },

    async createRelation(input: CreateRelationDTO): Promise<RelationDTO> {
      const [row] = await db
        .insert(workPackageRelations)
        .values({
          fromId: input.fromId,
          toId: input.toId,
          relationType: input.relationType,
          lag: input.lag ?? 0,
          description: input.description ?? null,
        })
        .returning();
      return relationToDTO(row);
    },

    async deleteRelation(id: string): Promise<boolean> {
      const result = await db
        .delete(workPackageRelations)
        .where(eq(workPackageRelations.id, id))
        .returning({ id: workPackageRelations.id });
      return result.length > 0;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // WATCHERS
    // ─────────────────────────────────────────────────────────────────────────

    async listWatchersForResource(
      watchableType: WatchableType,
      watchableId: string
    ): Promise<WatcherDTO[]> {
      const rows = await db
        .select({
          watcher: watchers,
          user: users,
        })
        .from(watchers)
        .leftJoin(users, eq(watchers.userId, users.id))
        .where(
          and(
            eq(watchers.watchableType, watchableType),
            eq(watchers.watchableId, watchableId)
          )
        );
      return rows.map((r) => watcherToDTO(r.watcher, r.user));
    },

    async isWatching(
      watchableType: WatchableType,
      watchableId: string,
      userId: string
    ): Promise<boolean> {
      const rows = await db
        .select()
        .from(watchers)
        .where(
          and(
            eq(watchers.watchableType, watchableType),
            eq(watchers.watchableId, watchableId),
            eq(watchers.userId, userId)
          )
        )
        .limit(1);
      return rows.length > 0;
    },

    async addWatcher(input: CreateWatcherDTO): Promise<WatcherDTO> {
      const [row] = await db
        .insert(watchers)
        .values({
          watchableType: input.watchableType,
          watchableId: input.watchableId,
          userId: input.userId,
        })
        .returning();

      // Fetch user for response
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return watcherToDTO(row, userRows[0]);
    },

    async removeWatcher(
      watchableType: WatchableType,
      watchableId: string,
      userId: string
    ): Promise<boolean> {
      const result = await db
        .delete(watchers)
        .where(
          and(
            eq(watchers.watchableType, watchableType),
            eq(watchers.watchableId, watchableId),
            eq(watchers.userId, userId)
          )
        )
        .returning({ id: watchers.id });
      return result.length > 0;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ACTIVITIES (Journals)
    // ─────────────────────────────────────────────────────────────────────────

    async listActivitiesForWorkPackage(workPackageId: string): Promise<JournalDTO[]> {
      const rows = await db
        .select({
          journal: journals,
          user: users,
        })
        .from(journals)
        .leftJoin(users, eq(journals.userId, users.id))
        .where(
          and(
            eq(journals.journableType, "WorkPackage"),
            eq(journals.journableId, workPackageId)
          )
        )
        .orderBy(journals.createdAt);

      // Fetch changes for each journal
      const journalIds = rows.map((r) => r.journal.id);
      const allChanges =
        journalIds.length > 0
          ? await db
              .select()
              .from(journalChanges)
              .where(
                // Using OR for each ID - simpler but works for small result sets
                or(
                  ...journalIds.map((id) => eq(journalChanges.journalId, id))
                )
              )
          : [];

      // Group changes by journal ID
      const changesByJournal = new Map<string, JournalChangeDTO[]>();
      for (const change of allChanges) {
        const existing = changesByJournal.get(change.journalId) || [];
        existing.push(journalChangeToDTO(change));
        changesByJournal.set(change.journalId, existing);
      }

      return rows.map((r) =>
        journalToDTO(
          r.journal,
          r.user,
          changesByJournal.get(r.journal.id) || []
        )
      );
    },

    async getActivityById(id: string): Promise<JournalDTO | null> {
      const rows = await db
        .select({
          journal: journals,
          user: users,
        })
        .from(journals)
        .leftJoin(users, eq(journals.userId, users.id))
        .where(eq(journals.id, id))
        .limit(1);

      if (!rows[0]) return null;

      const changes = await db
        .select()
        .from(journalChanges)
        .where(eq(journalChanges.journalId, id));

      return journalToDTO(
        rows[0].journal,
        rows[0].user,
        changes.map(journalChangeToDTO)
      );
    },

    async createActivity(input: CreateJournalDTO): Promise<JournalDTO> {
      // Get next version number
      const existingJournals = await db
        .select()
        .from(journals)
        .where(
          and(
            eq(journals.journableType, input.journableType),
            eq(journals.journableId, input.journableId)
          )
        );
      const nextVersion = existingJournals.length + 1;

      // Create journal
      const [journalRow] = await db
        .insert(journals)
        .values({
          journableType: input.journableType,
          journableId: input.journableId,
          userId: input.userId,
          notes: input.notes ?? null,
          causeType: input.causeType ?? null,
          version: nextVersion,
        })
        .returning();

      // Create changes if provided
      let changesDTOs: JournalChangeDTO[] = [];
      if (input.changes && input.changes.length > 0) {
        const changeRows = await db
          .insert(journalChanges)
          .values(
            input.changes.map((c) => ({
              journalId: journalRow.id,
              property: c.property,
              propertyKey: c.propertyKey ?? null,
              oldValue: c.oldValue ?? null,
              newValue: c.newValue ?? null,
            }))
          )
          .returning();
        changesDTOs = changeRows.map(journalChangeToDTO);
      }

      // Fetch user for response
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return journalToDTO(journalRow, userRows[0], changesDTOs);
    },
  };
}
