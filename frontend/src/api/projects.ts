import { api, parseError } from './client';
import { halElements, halText, halMeta, halEmbedded, isHalResource } from './hal';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProject(hal: any): Project {
  return {
    id: hal.id,
    name: hal.name,
    description: halText(hal.description),
    slug: hal.identifier ?? hal.slug ?? '',
    isArchived: hal.active != null ? !hal.active : (hal.isArchived ?? false),
    createdAt: hal.createdAt,
    updatedAt: hal.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProjectWithRole(hal: any): ProjectWithRole {
  return {
    ...parseProject(hal),
    role: halMeta(hal, 'role') ?? hal.role ?? 'member',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMember(hal: any): ProjectMember {
  // HAL member has _embedded.principal with user info
  const principal = hal._embedded?.principal ?? hal;
  return {
    userId: principal.id ?? hal.userId ?? '',
    userName: principal.name ?? hal.userName ?? '',
    userEmail: principal.email ?? hal.userEmail ?? '',
    role: hal.role ?? 'member',
    joinedAt: hal.joinedAt ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProjectDetail(hal: any): ProjectDetail {
  const base = parseProject(hal);
  const embeddedMembers = halEmbedded<any[]>(hal, 'members') ?? hal.members ?? [];
  return {
    ...base,
    members: embeddedMembers.map(parseMember),
  };
}

export async function listProjects(): Promise<ProjectWithRole[]> {
  const res = await api.get('/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();

  // HAL Collection format
  if (data._type === 'Collection') {
    return halElements<any>(data).map(parseProjectWithRole);
  }
  // Legacy format fallback
  return (data.projects ?? []).map(parseProjectWithRole);
}

export async function getProject(id: string): Promise<ProjectDetail & { role?: string }> {
  const res = await api.get(`/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  const data = await res.json();

  if (isHalResource(data)) {
    const detail = parseProjectDetail(data);
    return { ...detail, role: halMeta(data, 'role') };
  }
  // Legacy
  const legacy = data.project ?? data;
  return { ...legacy, role: data.role };
}

export async function createProject(input: { name: string; description?: string }): Promise<Project> {
  const res = await api.post('/projects', input);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to create project'));
  const data = await res.json();

  if (isHalResource(data)) return parseProject(data);
  return data.project ?? data;
}

export async function updateProject(id: string, input: { name?: string; description?: string }): Promise<Project> {
  const res = await api.patch(`/projects/${id}`, input);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to update project'));
  const data = await res.json();

  if (isHalResource(data)) return parseProject(data);
  return data.project ?? data;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await api.delete(`/projects/${id}`);
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function addMember(projectId: string, data: { email: string; role: string }): Promise<void> {
  const res = await api.post(`/projects/${projectId}/members`, data);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to add member'));
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  const res = await api.delete(`/projects/${projectId}/members/${userId}`);
  if (!res.ok) throw new Error('Failed to remove member');
}
