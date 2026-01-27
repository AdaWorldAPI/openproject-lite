// RUST: pub trait ProjectService { ... }

import { nanoid } from "nanoid";
import { ok, err, type Result } from "../lib/result";
import type { AppError } from "../lib/errors";
import {
  notFoundError,
  forbiddenError,
  validationError,
  conflictError,
} from "../lib/errors";
import type {
  ProjectDTO,
  ProjectWithRoleDTO,
  ProjectDetailDTO,
  CreateProjectDTO,
  UpdateProjectDTO,
  SessionUserDTO,
} from "../dto";
import type { ProjectRole } from "../lib/types";
import type { ProjectRepository } from "../repositories/project.repository";

export interface ProjectService {
  list(actor: SessionUserDTO): Promise<Result<ReadonlyArray<ProjectWithRoleDTO>, AppError>>;
  create(input: CreateProjectDTO, actor: SessionUserDTO): Promise<Result<{ project: ProjectDTO; role: ProjectRole }, AppError>>;
  getById(id: string, actor: SessionUserDTO): Promise<Result<{ project: ProjectDetailDTO; role: ProjectRole }, AppError>>;
  update(id: string, input: UpdateProjectDTO, actor: SessionUserDTO): Promise<Result<ProjectDTO, AppError>>;
  delete(id: string, actor: SessionUserDTO): Promise<Result<void, AppError>>;
  addMember(projectId: string, userId: string, role: ProjectRole, actor: SessionUserDTO): Promise<Result<void, AppError>>;
  removeMember(projectId: string, targetUserId: string, actor: SessionUserDTO): Promise<Result<void, AppError>>;
}

// RUST: pub struct ProjectServiceImpl { repo: Arc<dyn ProjectRepository> }
export function createProjectService(repo: ProjectRepository): ProjectService {
  function generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    return `${base}-${nanoid(6)}`;
  }

  return {
    // RUST: fn list(&self, actor: &SessionUserDTO) -> Result<Vec<ProjectWithRoleDTO>, AppError>
    async list(actor) {
      const projects = await repo.listByUserId(actor.id);
      return ok(projects);
    },

    // RUST: fn create(&self, input: CreateProjectDTO, actor: &SessionUserDTO) -> Result<ProjectDTO, AppError>
    async create(input, actor) {
      const slug = generateSlug(input.name);
      const project = await repo.createWithOwner(
        input.name,
        input.description,
        slug,
        actor.id
      );
      return ok({ project, role: "owner" as ProjectRole });
    },

    // RUST: fn get_by_id(&self, id: Uuid, actor: &SessionUserDTO) -> Result<ProjectDetailDTO, AppError>
    async getById(id, actor) {
      const role = await repo.getUserRole(id, actor.id);
      if (!role) {
        return err(notFoundError("Project not found"));
      }

      const project = await repo.findByIdWithMembers(id);
      if (!project) {
        return err(notFoundError("Project not found"));
      }

      return ok({ project, role });
    },

    // RUST: fn update(&self, id: Uuid, input: UpdateProjectDTO, actor: &SessionUserDTO) -> Result<ProjectDTO, AppError>
    async update(id, input, actor) {
      const role = await repo.getUserRole(id, actor.id);
      if (!role || !["owner", "admin"].includes(role)) {
        return err(forbiddenError("Forbidden"));
      }

      const updated = await repo.update(id, input);
      if (!updated) {
        return err(notFoundError("Project not found"));
      }

      return ok(updated);
    },

    // RUST: fn delete(&self, id: Uuid, actor: &SessionUserDTO) -> Result<(), AppError>
    async delete(id, actor) {
      const role = await repo.getUserRole(id, actor.id);
      if (role !== "owner") {
        return err(forbiddenError("Forbidden - only owner can delete"));
      }

      await repo.delete(id);
      return ok(undefined);
    },

    // RUST: fn add_member(&self, ...) -> Result<(), AppError>
    async addMember(projectId, userId, role, actor) {
      const actorRole = await repo.getUserRole(projectId, actor.id);
      if (!actorRole || !["owner", "admin"].includes(actorRole)) {
        return err(forbiddenError("Forbidden"));
      }

      const existingRole = await repo.getUserRole(projectId, userId);
      if (existingRole) {
        return err(conflictError("User is already a member"));
      }

      await repo.addMember(projectId, userId, role);
      return ok(undefined);
    },

    // RUST: fn remove_member(&self, ...) -> Result<(), AppError>
    async removeMember(projectId, targetUserId, actor) {
      const actorRole = await repo.getUserRole(projectId, actor.id);

      // Can remove self, or admin/owner can remove others
      if (
        actor.id !== targetUserId &&
        !["owner", "admin"].includes(actorRole ?? "")
      ) {
        return err(forbiddenError("Forbidden"));
      }

      // Can't remove the owner
      const targetRole = await repo.getUserRole(projectId, targetUserId);
      if (targetRole === "owner") {
        return err(validationError("Cannot remove project owner"));
      }

      await repo.removeMember(projectId, targetUserId);
      return ok(undefined);
    },
  };
}
