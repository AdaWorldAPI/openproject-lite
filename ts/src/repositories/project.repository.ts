// RUST: pub trait ProjectRepository { ... }

import { db } from "../db";
import { projects, projectMembers } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
  ProjectDTO,
  ProjectWithRoleDTO,
  ProjectDetailDTO,
  ProjectMemberDTO,
} from "../dto";
import type { ProjectRole } from "../lib/types";

export interface ProjectRepository {
  create(name: string, description: string | undefined, slug: string): Promise<ProjectDTO>;
  findById(id: string): Promise<ProjectDTO | null>;
  findByIdWithMembers(id: string): Promise<ProjectDetailDTO | null>;
  update(id: string, data: Partial<{ name: string; description: string; isArchived: boolean }>): Promise<ProjectDTO | null>;
  delete(id: string): Promise<void>;
  listByUserId(userId: string): Promise<ReadonlyArray<ProjectWithRoleDTO>>;
  getUserRole(projectId: string, userId: string): Promise<ProjectRole | null>;
  addMember(projectId: string, userId: string, role: ProjectRole): Promise<void>;
  removeMember(projectId: string, userId: string): Promise<void>;
  createWithOwner(name: string, description: string | undefined, slug: string, ownerId: string): Promise<ProjectDTO>;
}

// RUST: impl ProjectRepository for ProjectRepositoryImpl
export function createProjectRepository(): ProjectRepository {
  return {
    async create(name, description, slug) {
      const [row] = await db
        .insert(projects)
        .values({ name, description, slug })
        .returning();
      return toProjectDTO(row);
    },

    async findById(id) {
      const row = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });
      return row ? toProjectDTO(row) : null;
    },

    async findByIdWithMembers(id) {
      const row = await db.query.projects.findFirst({
        where: eq(projects.id, id),
        with: {
          members: {
            with: {
              user: {
                columns: { id: true, email: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      });
      if (!row) return null;
      return {
        ...toProjectDTO(row),
        members: row.members.map(
          (m): ProjectMemberDTO => ({
            id: m.id,
            role: m.role,
            joinedAt: m.joinedAt,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              avatarUrl: m.user.avatarUrl,
            },
          })
        ),
      };
    },

    async update(id, data) {
      const [row] = await db
        .update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
      return row ? toProjectDTO(row) : null;
    },

    async delete(id) {
      await db.delete(projects).where(eq(projects.id, id));
    },

    async listByUserId(userId) {
      const memberships = await db.query.projectMembers.findMany({
        where: eq(projectMembers.userId, userId),
        with: { project: true },
        orderBy: desc(projectMembers.joinedAt),
      });
      return memberships.map(
        (m): ProjectWithRoleDTO => ({
          ...toProjectDTO(m.project),
          role: m.role,
          joinedAt: m.joinedAt,
        })
      );
    },

    async getUserRole(projectId, userId) {
      const membership = await db.query.projectMembers.findFirst({
        where: and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        ),
      });
      return membership?.role ?? null;
    },

    async addMember(projectId, userId, role) {
      await db.insert(projectMembers).values({ projectId, userId, role });
    },

    async removeMember(projectId, userId) {
      await db
        .delete(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, userId)
          )
        );
    },

    async createWithOwner(name, description, slug, ownerId) {
      const [project] = await db.transaction(async (tx) => {
        const [newProject] = await tx
          .insert(projects)
          .values({ name, description, slug })
          .returning();

        await tx.insert(projectMembers).values({
          projectId: newProject.id,
          userId: ownerId,
          role: "owner",
        });

        return [newProject];
      });
      return toProjectDTO(project);
    },
  };
}

function toProjectDTO(row: typeof projects.$inferSelect): ProjectDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    slug: row.slug,
    isArchived: row.isArchived,
    settings: row.settings,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
