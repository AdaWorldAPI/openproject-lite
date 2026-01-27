// RUST: Project HAL representer — maps ProjectDTO variants to OpenProject HAL format
// RUST: See app/representers/api/v3/projects/project_representer.rb

import type { HalResource } from "../lib/hal";
import { halResource, halCollection, formattable } from "../lib/hal";
import type {
  ProjectDTO,
  ProjectWithRoleDTO,
  ProjectDetailDTO,
  ProjectMemberDTO,
} from "../dto";
import { representUserSummary } from "./user.hal";

const API_V3 = "/api/v3";

// RUST: fn represent_project(project: &ProjectDTO) -> HalResource
export function representProject(project: ProjectDTO): HalResource {
  return halResource(
    "Project",
    `${API_V3}/projects/${project.id}`,
    {
      id: project.id,
      name: project.name,
      identifier: project.slug,
      description: formattable(project.description),
      active: !project.isArchived,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    {
      createWorkPackage: {
        href: `${API_V3}/projects/${project.id}/work_packages/form`,
        method: "POST",
      },
      workPackages: {
        href: `${API_V3}/projects/${project.id}/work_packages`,
      },
      memberships: {
        href: `${API_V3}/memberships?filters=${encodeURIComponent(JSON.stringify([{ project: { operator: "=", values: [project.id] } }]))}`,
      },
      categories: {
        href: `${API_V3}/projects/${project.id}/categories`,
      },
    },
  );
}

// RUST: fn represent_project_with_role(project: &ProjectWithRoleDTO) -> HalResource
export function representProjectWithRole(project: ProjectWithRoleDTO): HalResource {
  const base = representProject(project);
  return {
    ...base,
    // Extra properties not in OpenProject — our extension
    _meta: {
      role: project.role,
      joinedAt: project.joinedAt,
    },
  };
}

// RUST: fn represent_project_detail(project: &ProjectDetailDTO) -> HalResource
export function representProjectDetail(
  project: ProjectDetailDTO,
  role: string,
): HalResource {
  const base = representProject(project);
  const memberResources = project.members.map(representMember);

  return {
    ...base,
    _meta: { role },
    _embedded: {
      ...((base._embedded as Record<string, unknown>) ?? {}),
      members: memberResources,
    },
  };
}

// RUST: fn represent_member(member: &ProjectMemberDTO) -> HalResource
export function representMember(member: ProjectMemberDTO): HalResource {
  return halResource(
    "Member",
    `${API_V3}/memberships/${member.id}`,
    {
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
    },
    {},
    {
      principal: representUserSummary(member.user),
    },
  );
}

// RUST: fn represent_project_collection(projects: &[ProjectWithRoleDTO], self_href: &str) -> HalCollection
export function representProjectCollection(
  projects: readonly ProjectWithRoleDTO[],
  selfHref: string,
) {
  const elements = projects.map(representProjectWithRole);
  return halCollection(selfHref, elements, projects.length);
}
