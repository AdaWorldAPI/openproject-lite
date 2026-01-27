import { api } from './client';

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

export async function listTasks(projectId: string): Promise<TaskListItem[]> {
  const res = await api.get(`/tasks?projectId=${projectId}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks ?? [];
}

export async function getTask(id: string): Promise<TaskDetail> {
  const res = await api.get(`/tasks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch task');
  const data = await res.json();
  return data.task ?? data;
}

export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}): Promise<Task> {
  const res = await api.post('/tasks', data);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to create task');
  }
  const result = await res.json();
  return result.task ?? result;
}

export async function updateTask(id: string, data: Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
}>): Promise<Task> {
  const res = await api.patch(`/tasks/${id}`, data);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to update task');
  }
  const result = await res.json();
  return result.task ?? result;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await api.delete(`/tasks/${id}`);
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function addComment(taskId: string, content: string): Promise<Comment> {
  const res = await api.post(`/tasks/${taskId}/comments`, { content });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to add comment');
  }
  const result = await res.json();
  return result.comment ?? result;
}
