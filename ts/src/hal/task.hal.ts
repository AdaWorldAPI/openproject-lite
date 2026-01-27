// RUST: WorkPackage HAL representer — maps TaskDTO variants to OpenProject HAL format
// RUST: See app/representers/api/v3/work_packages/work_package_representer.rb
// NOTE: "task" in our codebase = "work_package" in OpenProject

import type { HalResource } from "../lib/hal";
import { halResource, halCollection, formattable } from "../lib/hal";
import type {
  TaskDTO,
  TaskListItemDTO,
  TaskDetailDTO,
  CommentWithAuthorDTO,
} from "../dto";
import { representUserSummary } from "./user.hal";

const API_V3 = "/api/v3";

// RUST: fn represent_task(task: &TaskDTO) -> HalResource
export function representTask(task: TaskDTO): HalResource {
  const links: Record<string, { href: string; title?: string; method?: string }> = {
    project: {
      href: `${API_V3}/projects/${task.projectId}`,
    },
    update: {
      href: `${API_V3}/work_packages/${task.id}`,
      method: "PATCH",
    },
    delete: {
      href: `${API_V3}/work_packages/${task.id}`,
      method: "DELETE",
    },
    addComment: {
      href: `${API_V3}/work_packages/${task.id}/activities`,
      method: "POST",
    },
  };

  if (task.assigneeId) {
    links.assignee = { href: `${API_V3}/users/${task.assigneeId}` };
  }
  links.author = { href: `${API_V3}/users/${task.creatorId}` };

  return halResource(
    "WorkPackage",
    `${API_V3}/work_packages/${task.id}`,
    {
      id: task.id,
      subject: task.title,
      description: formattable(task.description),
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      creatorId: task.creatorId,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    },
    links,
  );
}

// RUST: fn represent_task_list_item(task: &TaskListItemDTO) -> HalResource
export function representTaskListItem(task: TaskListItemDTO): HalResource {
  const base = representTask(task);
  const embedded: Record<string, unknown> = {};

  if (task.assignee) {
    embedded.assignee = representUserSummary(task.assignee);
  }
  embedded.author = representUserSummary(task.creator);

  return {
    ...base,
    _embedded: {
      ...((base._embedded as Record<string, unknown>) ?? {}),
      ...embedded,
    },
  };
}

// RUST: fn represent_task_detail(task: &TaskDetailDTO) -> HalResource
export function representTaskDetail(task: TaskDetailDTO): HalResource {
  const base = representTask(task);
  const embedded: Record<string, unknown> = {};

  if (task.assignee) {
    embedded.assignee = representUserSummary(task.assignee);
  }
  embedded.author = representUserSummary(task.creator);
  embedded.project = halResource(
    "Project",
    `${API_V3}/projects/${task.project.id}`,
    {
      id: task.project.id,
      name: task.project.name,
      identifier: task.project.slug,
    },
  );
  embedded.activities = task.comments.map(representComment);

  return {
    ...base,
    _embedded: {
      ...((base._embedded as Record<string, unknown>) ?? {}),
      ...embedded,
    },
  };
}

// RUST: fn represent_comment(comment: &CommentWithAuthorDTO) -> HalResource
export function representComment(comment: CommentWithAuthorDTO): HalResource {
  return halResource(
    "Activity::Comment",
    `${API_V3}/activities/${comment.id}`,
    {
      id: comment.id,
      comment: formattable(comment.content),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    },
    {
      user: { href: `${API_V3}/users/${comment.author.id}`, title: comment.author.name },
      workPackage: { href: `${API_V3}/work_packages/${comment.taskId}` },
    },
    {
      user: representUserSummary(comment.author),
    },
  );
}

// RUST: fn represent_task_collection(tasks: &[TaskListItemDTO], self_href: &str) -> HalCollection
export function representTaskCollection(
  tasks: readonly TaskListItemDTO[],
  selfHref: string,
) {
  const elements = tasks.map(representTaskListItem);
  return halCollection(selfHref, elements, tasks.length);
}
