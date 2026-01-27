// RUST: pub trait TaskService { ... }

import { ok, err, type Result } from "../lib/result";
import type { AppError } from "../lib/errors";
import { notFoundError, forbiddenError, validationError } from "../lib/errors";
import type {
  TaskDTO,
  TaskListItemDTO,
  TaskDetailDTO,
  CommentWithAuthorDTO,
  CreateTaskDTO,
  UpdateTaskDTO,
  CreateCommentDTO,
  SessionUserDTO,
} from "../dto";
import type { TaskRepository } from "../repositories/task.repository";
import type { NotificationRepository } from "../repositories/notification.repository";
import type { UserRepository } from "../repositories/user.repository";
import { isMailConfigured, sendTaskAssignedEmail } from "./mail";

export interface TaskService {
  list(projectId: string, actor: SessionUserDTO): Promise<Result<ReadonlyArray<TaskListItemDTO>, AppError>>;
  create(input: CreateTaskDTO, actor: SessionUserDTO): Promise<Result<TaskDTO, AppError>>;
  getById(id: string, actor: SessionUserDTO): Promise<Result<TaskDetailDTO, AppError>>;
  update(id: string, input: UpdateTaskDTO, actor: SessionUserDTO): Promise<Result<TaskDTO, AppError>>;
  delete(id: string, actor: SessionUserDTO): Promise<Result<void, AppError>>;
  addComment(taskId: string, input: CreateCommentDTO, actor: SessionUserDTO): Promise<Result<CommentWithAuthorDTO, AppError>>;
}

// RUST: pub struct TaskServiceImpl { task_repo, notification_repo, user_repo }
export function createTaskService(
  taskRepo: TaskRepository,
  notificationRepo: NotificationRepository,
  userRepo: UserRepository
): TaskService {
  async function ensureTaskAccess(
    taskId: string,
    userId: string
  ): Promise<Result<TaskDTO, AppError>> {
    const task = await taskRepo.findById(taskId);
    if (!task) {
      return err(notFoundError("Task not found"));
    }
    const hasAccess = await taskRepo.checkProjectAccess(task.projectId, userId);
    if (!hasAccess) {
      return err(notFoundError("Task not found"));
    }
    return ok(task);
  }

  return {
    // RUST: fn list(&self, project_id: Uuid, actor: &SessionUserDTO) -> Result<Vec<TaskListItemDTO>, AppError>
    async list(projectId, actor) {
      if (!projectId) {
        return err(validationError("projectId is required"));
      }

      const hasAccess = await taskRepo.checkProjectAccess(projectId, actor.id);
      if (!hasAccess) {
        return err(notFoundError("Project not found"));
      }

      const tasks = await taskRepo.listByProjectId(projectId);
      return ok(tasks);
    },

    // RUST: fn create(&self, input: CreateTaskDTO, actor: &SessionUserDTO) -> Result<TaskDTO, AppError>
    async create(input, actor) {
      const hasAccess = await taskRepo.checkProjectAccess(input.projectId, actor.id);
      if (!hasAccess) {
        return err(notFoundError("Project not found"));
      }

      const task = await taskRepo.create({
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        creatorId: actor.id,
      });

      // Notify assignee if assigned to someone else
      if (task.assigneeId && task.assigneeId !== actor.id) {
        const assignee = await userRepo.findById(task.assigneeId);
        if (assignee) {
          await notificationRepo.create({
            userId: assignee.id,
            type: "task_assigned",
            title: `You were assigned to "${task.title}"`,
            body: `${actor.name} assigned you a task`,
            linkUrl: `/tasks/${task.id}`,
            metadata: { taskId: task.id, assignerId: actor.id },
          });

          // Send email if configured
          if (isMailConfigured()) {
            try {
              await sendTaskAssignedEmail(
                assignee.email,
                task.title,
                "Project", // Simplified - could fetch project name
                actor.name,
                `${process.env.APP_URL ?? ""}/tasks/${task.id}`
              );
            } catch (e) {
              console.error("Failed to send assignment email:", e);
            }
          }
        }
      }

      return ok(task);
    },

    // RUST: fn get_by_id(&self, id: Uuid, actor: &SessionUserDTO) -> Result<TaskDetailDTO, AppError>
    async getById(id, actor) {
      const accessResult = await ensureTaskAccess(id, actor.id);
      if (!accessResult.ok) return accessResult;

      const task = await taskRepo.findByIdWithRelations(id);
      if (!task) {
        return err(notFoundError("Task not found"));
      }
      return ok(task);
    },

    // RUST: fn update(&self, id: Uuid, input: UpdateTaskDTO, actor: &SessionUserDTO) -> Result<TaskDTO, AppError>
    async update(id, input, actor) {
      const accessResult = await ensureTaskAccess(id, actor.id);
      if (!accessResult.ok) return accessResult;

      const oldTask = accessResult.data;
      const updateData: Record<string, unknown> = {
        ...input,
        updatedAt: new Date(),
      };

      // Handle dueDate conversion
      if (input.dueDate !== undefined) {
        updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
      }

      // Set completedAt when marking done
      if (input.status === "done" && oldTask.status !== "done") {
        updateData.completedAt = new Date();
      } else if (input.status && input.status !== "done") {
        updateData.completedAt = null;
      }

      const updated = await taskRepo.update(id, updateData);
      if (!updated) {
        return err(notFoundError("Task not found"));
      }

      // Notify new assignee
      if (
        input.assigneeId &&
        input.assigneeId !== oldTask.assigneeId &&
        input.assigneeId !== actor.id
      ) {
        await notificationRepo.create({
          userId: input.assigneeId,
          type: "task_assigned",
          title: `You were assigned to "${updated.title}"`,
          body: `${actor.name} assigned you a task`,
          linkUrl: `/tasks/${updated.id}`,
        });
      }

      return ok(updated);
    },

    // RUST: fn delete(&self, id: Uuid, actor: &SessionUserDTO) -> Result<(), AppError>
    async delete(id, actor) {
      const accessResult = await ensureTaskAccess(id, actor.id);
      if (!accessResult.ok) return accessResult;

      await taskRepo.delete(id);
      return ok(undefined);
    },

    // RUST: fn add_comment(&self, task_id: Uuid, input: CreateCommentDTO, actor: &SessionUserDTO) -> Result<CommentWithAuthorDTO, AppError>
    async addComment(taskId, input, actor) {
      const accessResult = await ensureTaskAccess(taskId, actor.id);
      if (!accessResult.ok) return accessResult;

      const task = accessResult.data;
      const comment = await taskRepo.addComment(taskId, actor.id, input.content);

      // Notify task creator and assignee (if not the commenter)
      const notifyUserIds = new Set<string>();
      if (task.creatorId !== actor.id) notifyUserIds.add(task.creatorId);
      if (task.assigneeId && task.assigneeId !== actor.id)
        notifyUserIds.add(task.assigneeId);

      for (const userId of notifyUserIds) {
        await notificationRepo.create({
          userId,
          type: "comment_added",
          title: `New comment on "${task.title}"`,
          body: `${actor.name}: ${input.content.slice(0, 100)}...`,
          linkUrl: `/tasks/${task.id}`,
        });
      }

      return ok(comment);
    },
  };
}
