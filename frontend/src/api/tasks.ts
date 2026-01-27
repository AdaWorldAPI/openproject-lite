import { api, parseError } from './client';
import { halElements, halText, halEmbedded, isHalResource } from './hal';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListItem extends Task {
  assigneeName: string | null;
  assigneeEmail: string | null;
  creatorName: string;
  creatorEmail: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

export interface TaskDetail extends Task {
  assigneeName: string | null;
  assigneeEmail: string | null;
  creatorName: string;
  creatorEmail: string;
  comments: Comment[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTask(hal: any): Task {
  return {
    id: hal.id,
    projectId: hal.projectId,
    // HAL uses "subject" (OpenProject convention), fallback to "title"
    title: hal.subject ?? hal.title ?? '',
    description: halText(hal.description),
    status: hal.status ?? 'backlog',
    priority: hal.priority ?? 'medium',
    assigneeId: hal.assigneeId ?? null,
    creatorId: hal.creatorId ?? '',
    dueDate: hal.dueDate ?? null,
    completedAt: hal.completedAt ?? null,
    createdAt: hal.createdAt,
    updatedAt: hal.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTaskListItem(hal: any): TaskListItem {
  const base = parseTask(hal);
  // HAL embeds assignee and author as user resources
  const assignee = hal._embedded?.assignee ?? hal.assignee;
  const author = hal._embedded?.author ?? hal.creator;

  return {
    ...base,
    assigneeName: assignee?.name ?? hal.assigneeName ?? null,
    assigneeEmail: assignee?.email ?? hal.assigneeEmail ?? null,
    creatorName: author?.name ?? hal.creatorName ?? '',
    creatorEmail: author?.email ?? hal.creatorEmail ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseComment(hal: any): Comment {
  // HAL comment has comment: { format, raw, html } and _embedded.user
  const user = hal._embedded?.user ?? hal.author ?? {};
  return {
    id: hal.id,
    taskId: hal.taskId ?? hal._links?.workPackage?.href?.split('/').pop() ?? '',
    authorId: user.id ?? hal.authorId ?? '',
    authorName: user.name ?? hal.authorName ?? '',
    authorEmail: user.email ?? hal.authorEmail ?? '',
    content: halText(hal.comment) ?? hal.content ?? '',
    createdAt: hal.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTaskDetail(hal: any): TaskDetail {
  const base = parseTask(hal);
  const assignee = hal._embedded?.assignee ?? hal.assignee;
  const author = hal._embedded?.author ?? hal.creator;
  const activities = halEmbedded<any[]>(hal, 'activities') ?? hal.comments ?? [];

  return {
    ...base,
    assigneeName: assignee?.name ?? hal.assigneeName ?? null,
    assigneeEmail: assignee?.email ?? hal.assigneeEmail ?? null,
    creatorName: author?.name ?? hal.creatorName ?? '',
    creatorEmail: author?.email ?? hal.creatorEmail ?? '',
    comments: activities.map(parseComment),
  };
}

export async function listTasks(projectId: string): Promise<TaskListItem[]> {
  const res = await api.get(`/tasks?projectId=${projectId}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();

  // HAL Collection format
  if (data._type === 'Collection') {
    return halElements<any>(data).map(parseTaskListItem);
  }
  // Legacy format fallback
  return (data.tasks ?? []).map(parseTaskListItem);
}

export async function getTask(id: string): Promise<TaskDetail> {
  const res = await api.get(`/tasks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch task');
  const data = await res.json();

  if (isHalResource(data)) return parseTaskDetail(data);
  return data.task ?? data;
}

export async function createTask(input: {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}): Promise<Task> {
  const res = await api.post('/tasks', input);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to create task'));
  const data = await res.json();

  if (isHalResource(data)) return parseTask(data);
  return data.task ?? data;
}

export async function updateTask(id: string, input: Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
}>): Promise<Task> {
  const res = await api.patch(`/tasks/${id}`, input);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to update task'));
  const data = await res.json();

  if (isHalResource(data)) return parseTask(data);
  return data.task ?? data;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await api.delete(`/tasks/${id}`);
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function addComment(taskId: string, content: string): Promise<Comment> {
  const res = await api.post(`/tasks/${taskId}/comments`, { content });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to add comment'));
  const data = await res.json();

  if (isHalResource(data)) return parseComment(data);
  return data.comment ?? data;
}
