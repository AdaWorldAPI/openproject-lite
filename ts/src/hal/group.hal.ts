// RUST: Group HAL representer — maps GroupDTO to OpenProject HAL format
// RUST: See lib/api/v3/groups/group_representer.rb

import type { HalResource, HalCollection } from "../lib/hal";
import { halResource, halCollection } from "../lib/hal";
import type { GroupDTO, GroupMemberDTO } from "../dto/group.dto";

const API_V3 = "/api/v3";

// RUST: fn represent_group(group: &GroupDTO) -> HalResource
export function representGroup(group: GroupDTO): HalResource {
  const memberElements = group.members?.map((member) =>
    representGroupMember(member)
  );

  return halResource(
    "Group",
    `${API_V3}/groups/${group.id}`,
    {
      id: group.id,
      name: group.name,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    },
    {
      self: { href: `${API_V3}/groups/${group.id}`, title: group.name },
      members: { href: `${API_V3}/groups/${group.id}/members` },
    },
    memberElements && memberElements.length > 0
      ? { members: memberElements }
      : undefined
  );
}

// RUST: fn represent_group_member(member: &GroupMemberDTO) -> HalResource
export function representGroupMember(member: GroupMemberDTO): HalResource {
  return halResource(
    "User",
    `${API_V3}/users/${member.id}`,
    {
      id: member.id,
      name: member.name,
      email: member.email,
    },
    {
      self: { href: `${API_V3}/users/${member.id}`, title: member.name },
    }
  );
}

// RUST: fn represent_group_collection(groups: &[GroupDTO], total: i32) -> HalCollection
export function representGroupCollection(
  groups: readonly GroupDTO[],
  total?: number
): HalCollection {
  const elements = groups.map(representGroup);
  return halCollection(`${API_V3}/groups`, elements, total ?? groups.length);
}

// RUST: fn represent_group_members_collection(members: &[GroupMemberDTO], groupId: Uuid, total: i32) -> HalCollection
export function representGroupMembersCollection(
  members: readonly GroupMemberDTO[],
  groupId: string,
  total?: number
): HalCollection {
  const elements = members.map(representGroupMember);
  return halCollection(
    `${API_V3}/groups/${groupId}/members`,
    elements,
    total ?? members.length
  );
}
