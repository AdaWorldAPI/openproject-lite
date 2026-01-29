// RUST: Version HAL representer — maps VersionDTO to OpenProject HAL format
// RUST: See lib/api/v3/versions/version_representer.rb

import type { HalResource, HalCollection } from "../lib/hal";
import { halResource, halCollection } from "../lib/hal";
import type { VersionDTO } from "../dto/version.dto";

const API_V3 = "/api/v3";

// RUST: fn represent_version(version: &VersionDTO) -> HalResource
export function representVersion(version: VersionDTO): HalResource {
  return halResource(
    "Version",
    `${API_V3}/versions/${version.id}`,
    {
      id: version.id,
      name: version.name,
      description: version.description
        ? {
            format: "plain",
            raw: version.description,
            html: `<p>${version.description}</p>`,
          }
        : { format: "plain", raw: "", html: "" },
      startDate: version.startDate?.toISOString().split("T")[0] ?? null,
      endDate: version.effectiveDate?.toISOString().split("T")[0] ?? null, // OpenProject uses endDate
      status: version.status,
      sharing: version.sharing,
      createdAt: version.createdAt.toISOString(),
      updatedAt: version.updatedAt.toISOString(),
    },
    {
      self: { href: `${API_V3}/versions/${version.id}`, title: version.name },
      definingProject: {
        href: `${API_V3}/projects/${version.projectId}`,
      },
      availableInProjects: {
        href: `${API_V3}/versions/${version.id}/projects`,
      },
      update: { href: `${API_V3}/versions/${version.id}`, method: "PATCH" },
      delete: { href: `${API_V3}/versions/${version.id}`, method: "DELETE" },
    }
  );
}

// RUST: fn represent_version_collection(versions: &[VersionDTO], total: i32, offset: i32, page_size: i32) -> HalCollection
export function representVersionCollection(
  versionList: readonly VersionDTO[],
  total?: number,
  pageSize?: number,
  offset?: number
): HalCollection {
  const elements = versionList.map(representVersion);
  return halCollection(
    `${API_V3}/versions`,
    elements,
    total ?? versionList.length,
    pageSize,
    offset
  );
}

// RUST: fn represent_project_versions(versions: &[VersionDTO], project_id: Uuid) -> HalCollection
export function representProjectVersions(
  versionList: readonly VersionDTO[],
  projectId: string
): HalCollection {
  const elements = versionList.map(representVersion);
  return halCollection(
    `${API_V3}/projects/${projectId}/versions`,
    elements,
    versionList.length
  );
}
