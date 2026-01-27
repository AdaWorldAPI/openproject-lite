import { api } from './client';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithRole extends Project {
  role: string;
}

export interface ProjectDetail extends Project {
  members: ProjectMember[];
}

export interface ProjectMember {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
}

export async function listProjects(): Promise<ProjectWithRole[]> {
  const res = await api.get('/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const res = await api.get(`/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(data: { name: string; description?: string }): Promise<Project> {
  const res = await api.post('/projects', data);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to create project');
  }
  return res.json();
}

export async function updateProject(id: string, data: { name?: string; description?: string }): Promise<Project> {
  const res = await api.patch(`/projects/${id}`, data);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to update project');
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await api.delete(`/projects/${id}`);
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function addMember(projectId: string, data: { email: string; role: string }): Promise<void> {
  const res = await api.post(`/projects/${projectId}/members`, data);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to add member');
  }
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  const res = await api.delete(`/projects/${projectId}/members/${userId}`);
  if (!res.ok) throw new Error('Failed to remove member');
}
