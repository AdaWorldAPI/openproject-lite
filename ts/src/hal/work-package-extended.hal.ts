// RUST: Work Package Extended HAL representers — Relations, Watchers, Activities
// RUST: See lib/api/v3/relations/relation_representer.rb
// RUST: See lib/api/v3/watchers/watcher_representer.rb
// RUST: See lib/api/v3/activities/activity_representer.rb

import type { HalResource, HalCollection } from "../lib/hal";
import { halResource, halCollection } from "../lib/hal";
import type { RelationDTO, WatcherDTO, JournalDTO, UserDTO } from "../dto";

const API_V3 = "/api/v3";

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Inverse relation mapping (OpenProject pattern)
const INVERSE_RELATIONS: Record<string, string> = {
  follows: "precedes",
  precedes: "follows",
  blocks: "blocked",
  blocked: "blocks",
  duplicates: "duplicated",
  duplicated: "duplicates",
  includes: "partof",
  partof: "includes",
  requires: "required",
  required: "requires",
  relates: "relates",
};

// RUST: fn represent_relation(r: &RelationDTO) -> HalResource
export function representRelation(r: RelationDTO): HalResource {
  const reverseType = INVERSE_RELATIONS[r.relationType] || r.relationType;

  return halResource(
    "Relation",
    `${API_V3}/relations/${r.id}`,
    {
      id: r.id,
      name: r.relationType,
      type: r.relationType,
      reverseType,
      description: r.description,
      lag: r.lag,
    },
    {
      self: { href: `${API_V3}/relations/${r.id}` },
      from: {
        href: `${API_V3}/work_packages/${r.fromId}`,
        title: `#${r.fromId.substring(0, 8)}`, // Short ID for title
      },
      to: {
        href: `${API_V3}/work_packages/${r.toId}`,
        title: `#${r.toId.substring(0, 8)}`,
      },
      delete: { href: `${API_V3}/relations/${r.id}`, method: "DELETE" },
      updateImmediately: { href: `${API_V3}/relations/${r.id}`, method: "PATCH" },
    }
  );
}

// RUST: fn represent_relation_collection(relations: &[RelationDTO]) -> HalCollection
export function representRelationCollection(
  relations: readonly RelationDTO[],
  workPackageId?: string
): HalCollection {
  const elements = relations.map(representRelation);
  const selfHref = workPackageId
    ? `${API_V3}/work_packages/${workPackageId}/relations`
    : `${API_V3}/relations`;
  return halCollection(selfHref, elements, relations.length);
}

// ═══════════════════════════════════════════════════════════════════════════
// WATCHERS
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn represent_watcher_user(u: &UserDTO) -> HalResource
function representWatcherUser(u: UserDTO): HalResource {
  return halResource(
    "User",
    `${API_V3}/users/${u.id}`,
    {
      id: u.id,
      name: u.name,
      login: u.email.split("@")[0], // OpenProject uses login
      email: u.email,
      avatar: u.avatarUrl || "",
    },
    {
      self: { href: `${API_V3}/users/${u.id}`, title: u.name },
    }
  );
}

// RUST: fn represent_watcher(w: &WatcherDTO) -> HalResource
export function representWatcher(w: WatcherDTO): HalResource {
  const resource: HalResource = halResource(
    "User", // OpenProject represents watchers as User resources
    `${API_V3}/users/${w.userId}`,
    {
      id: w.userId,
      name: w.user?.name || "",
      login: w.user?.email?.split("@")[0] || "",
      email: w.user?.email || "",
      avatar: w.user?.avatarUrl || "",
    },
    {
      self: { href: `${API_V3}/users/${w.userId}`, title: w.user?.name || "" },
    }
  );
  return resource;
}

// RUST: fn represent_watcher_collection(watchers: &[WatcherDTO], watchable_type: &str, watchable_id: Uuid) -> HalResource
export function representWatcherCollection(
  watchers: readonly WatcherDTO[],
  watchableType: string,
  watchableId: string
): HalResource {
  const elements = watchers.map(representWatcher);
  const selfHref =
    watchableType === "WorkPackage"
      ? `${API_V3}/work_packages/${watchableId}/watchers`
      : `${API_V3}/${watchableType.toLowerCase()}s/${watchableId}/watchers`;

  // OpenProject returns watchers in a special format with _embedded.elements
  return {
    _type: "Watchers",
    count: watchers.length,
    total: watchers.length,
    _links: {
      self: { href: selfHref },
    },
    _embedded: {
      elements,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITIES (Journals)
// ═══════════════════════════════════════════════════════════════════════════

// RUST: fn represent_activity_detail(change: &JournalChangeDTO) -> object
function representActivityDetail(change: {
  property: string;
  propertyKey: string | null;
  oldValue: string | null;
  newValue: string | null;
}): Record<string, unknown> {
  // OpenProject format for activity details
  return {
    property: change.property,
    propertyKey: change.propertyKey,
    values: [change.oldValue, change.newValue],
  };
}

// RUST: fn represent_activity(j: &JournalDTO) -> HalResource
export function representActivity(j: JournalDTO): HalResource {
  const details = j.changes.map(representActivityDetail);

  // Build links conditionally to avoid undefined values
  const links: Record<string, { href: string; title?: string; method?: string }> = {
    self: { href: `${API_V3}/activities/${j.id}` },
    workPackage: {
      href: `${API_V3}/work_packages/${j.journableId}`,
    },
    user: {
      href: `${API_V3}/users/${j.userId}`,
      title: j.user?.name || "",
    },
  };

  // Only add update link if there are notes
  if (j.notes) {
    links.update = { href: `${API_V3}/activities/${j.id}`, method: "PATCH" };
  }

  return halResource(
    "Activity",
    `${API_V3}/activities/${j.id}`,
    {
      id: j.id,
      comment: j.notes
        ? {
            format: "plain",
            raw: j.notes,
            html: `<p>${j.notes}</p>`,
          }
        : { format: "plain", raw: "", html: "" },
      details,
      version: j.version,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
    },
    links,
    // Embed the user
    j.user
      ? {
          user: representWatcherUser(j.user),
        }
      : undefined
  );
}

// RUST: fn represent_activity_collection(activities: &[JournalDTO], work_package_id: Uuid) -> HalCollection
export function representActivityCollection(
  activities: readonly JournalDTO[],
  workPackageId: string
): HalCollection {
  const elements = activities.map(representActivity);
  return halCollection(
    `${API_V3}/work_packages/${workPackageId}/activities`,
    elements,
    activities.length
  );
}
