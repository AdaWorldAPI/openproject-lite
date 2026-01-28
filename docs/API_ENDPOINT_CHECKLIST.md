# OpenProject API v3 Endpoint Checklist

> Complete list of all OpenProject API v3 endpoints with implementation status.

**Legend:**
- [x] Implemented
- [ ] Not implemented
- (E) Enterprise only

---

## Authentication & Session

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | POST | `/auth/login` | Login |
| [x] | POST | `/auth/logout` | Logout |
| [x] | POST | `/auth/register` | Register |
| [x] | GET | `/auth/me` | Current user |
| [ ] | GET | `/oauth/authorize` | OAuth authorize |
| [ ] | POST | `/oauth/token` | OAuth token |
| [ ] | POST | `/oauth/revoke` | Revoke token |

---

## Root

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3` | API root |
| [ ] | GET | `/api/v3/configuration` | Configuration |

---

## Work Packages

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/api/v3/work_packages` | List (via tasks) |
| [x] | POST | `/api/v3/work_packages` | Create |
| [x] | GET | `/api/v3/work_packages/:id` | Get |
| [x] | PATCH | `/api/v3/work_packages/:id` | Update |
| [x] | DELETE | `/api/v3/work_packages/:id` | Delete |
| [x] | GET | `/api/v3/work_packages/:id/activities` | Activities |
| [x] | POST | `/api/v3/work_packages/:id/activities` | Add comment |
| [ ] | GET | `/api/v3/work_packages/:id/attachments` | Attachments |
| [ ] | POST | `/api/v3/work_packages/:id/attachments` | Attach file |
| [ ] | GET | `/api/v3/work_packages/:id/available_assignees` | Assignees |
| [ ] | GET | `/api/v3/work_packages/:id/available_watchers` | Available watchers |
| [ ] | GET | `/api/v3/work_packages/:id/available_relation_candidates` | Relation candidates |
| [x] | GET | `/api/v3/work_packages/:id/relations` | Relations |
| [x] | POST | `/api/v3/work_packages/:id/relations` | Create relation |
| [ ] | GET | `/api/v3/work_packages/:id/revisions` | Git revisions |
| [x] | GET | `/api/v3/work_packages/:id/watchers` | Watchers |
| [x] | POST | `/api/v3/work_packages/:id/watchers` | Add watcher |
| [x] | DELETE | `/api/v3/work_packages/:id/watchers/:user_id` | Remove watcher |
| [ ] | GET | `/api/v3/work_packages/form` | Create form |
| [ ] | POST | `/api/v3/work_packages/:id/form` | Update form |
| [ ] | GET | `/api/v3/work_packages/schemas` | Schemas |
| [ ] | GET | `/api/v3/work_packages/schemas/:id` | Schema by type |
| [ ] | GET | `/api/v3/work_packages/:id/reminders` | Reminders (E) |
| [ ] | POST | `/api/v3/work_packages/:id/reminders` | Create reminder (E) |

---

## Projects

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/api/v3/projects` | List |
| [x] | POST | `/api/v3/projects` | Create |
| [x] | GET | `/api/v3/projects/:id` | Get |
| [x] | PATCH | `/api/v3/projects/:id` | Update |
| [x] | DELETE | `/api/v3/projects/:id` | Delete |
| [ ] | POST | `/api/v3/projects/:id/copy` | Copy project |
| [ ] | GET | `/api/v3/projects/:id/available_assignees` | Assignees |
| [ ] | GET | `/api/v3/projects/:id/available_responsibles` | Responsibles |
| [ ] | GET | `/api/v3/projects/:id/available_parents` | Parent projects |
| [ ] | GET | `/api/v3/projects/:id/types` | Project types |
| [ ] | GET | `/api/v3/projects/:id/versions` | Versions |
| [ ] | GET | `/api/v3/projects/:id/categories` | Categories |
| [ ] | GET | `/api/v3/projects/:id/work_packages` | Project work packages |
| [ ] | GET | `/api/v3/projects/:id/queries/default` | Default query |
| [ ] | GET | `/api/v3/projects/:id/form` | Create form |
| [ ] | PATCH | `/api/v3/projects/:id/form` | Update form |
| [ ] | GET | `/api/v3/projects/schema` | Schema |
| [ ] | GET | `/api/v3/project_statuses` | Project statuses |
| [ ] | GET | `/api/v3/project_statuses/:id` | Get status |

---

## Users

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/users` | List users |
| [ ] | POST | `/api/v3/users` | Create user |
| [ ] | GET | `/api/v3/users/:id` | Get user |
| [ ] | PATCH | `/api/v3/users/:id` | Update user |
| [ ] | DELETE | `/api/v3/users/:id` | Delete user |
| [ ] | POST | `/api/v3/users/:id/lock` | Lock user |
| [ ] | DELETE | `/api/v3/users/:id/lock` | Unlock user |
| [ ] | GET | `/api/v3/users/:id/form` | User form |
| [ ] | GET | `/api/v3/users/schema` | User schema |
| [ ] | GET | `/api/v3/users/me` | Current user (alias) |

---

## Groups

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/groups` | List groups |
| [ ] | POST | `/api/v3/groups` | Create group |
| [ ] | GET | `/api/v3/groups/:id` | Get group |
| [ ] | PATCH | `/api/v3/groups/:id` | Update group |
| [ ] | DELETE | `/api/v3/groups/:id` | Delete group |

---

## Principals

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/principals` | List principals |
| [ ] | GET | `/api/v3/principals/:id` | Get principal |

---

## Memberships

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/api/v3/projects/:id/members` | List (via getProject) |
| [x] | POST | `/api/v3/projects/:id/members` | Add member |
| [x] | DELETE | `/api/v3/projects/:id/members/:user_id` | Remove member |
| [ ] | GET | `/api/v3/memberships` | List all |
| [ ] | GET | `/api/v3/memberships/:id` | Get membership |
| [ ] | PATCH | `/api/v3/memberships/:id` | Update roles |
| [ ] | DELETE | `/api/v3/memberships/:id` | Delete membership |
| [ ] | GET | `/api/v3/memberships/available_projects` | Available projects |
| [ ] | POST | `/api/v3/memberships/form` | Create form |
| [ ] | GET | `/api/v3/memberships/schema` | Schema |

---

## Roles

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/roles` | List roles |
| [ ] | GET | `/api/v3/roles/:id` | Get role |

---

## Statuses

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/api/v3/statuses` | List statuses |
| [x] | GET | `/api/v3/statuses/:id` | Get status |

---

## Types

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/api/v3/types` | List types |
| [x] | GET | `/api/v3/types/:id` | Get type |

---

## Priorities

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/api/v3/priorities` | List priorities |
| [x] | GET | `/api/v3/priorities/:id` | Get priority |

---

## Versions

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/versions` | List versions |
| [ ] | POST | `/api/v3/versions` | Create version |
| [ ] | GET | `/api/v3/versions/:id` | Get version |
| [ ] | PATCH | `/api/v3/versions/:id` | Update version |
| [ ] | DELETE | `/api/v3/versions/:id` | Delete version |
| [ ] | GET | `/api/v3/versions/:id/projects` | Version projects |

---

## Categories

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/categories/:id` | Get category |

---

## Relations

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/relations` | List relations |
| [ ] | POST | `/api/v3/relations` | Create relation |
| [x] | GET | `/api/v3/relations/:id` | Get relation |
| [ ] | PATCH | `/api/v3/relations/:id` | Update relation |
| [x] | DELETE | `/api/v3/relations/:id` | Delete relation |

---

## Queries

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/queries` | List queries |
| [ ] | POST | `/api/v3/queries` | Create query |
| [ ] | GET | `/api/v3/queries/:id` | Get query |
| [ ] | PATCH | `/api/v3/queries/:id` | Update query |
| [ ] | DELETE | `/api/v3/queries/:id` | Delete query |
| [ ] | PATCH | `/api/v3/queries/:id/star` | Star query |
| [ ] | PATCH | `/api/v3/queries/:id/unstar` | Unstar query |
| [ ] | GET | `/api/v3/queries/default` | Default query |
| [ ] | GET | `/api/v3/queries/available_projects` | Available projects |
| [ ] | GET | `/api/v3/queries/filter_instance_schemas` | Filter schemas |
| [ ] | GET | `/api/v3/queries/columns` | Available columns |
| [ ] | GET | `/api/v3/queries/group_bys` | Group by options |
| [ ] | GET | `/api/v3/queries/sort_bys` | Sort options |
| [ ] | GET | `/api/v3/queries/operators` | Filter operators |

---

## Time Entries

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/time_entries` | List entries |
| [ ] | POST | `/api/v3/time_entries` | Log time |
| [ ] | GET | `/api/v3/time_entries/:id` | Get entry |
| [ ] | PATCH | `/api/v3/time_entries/:id` | Update entry |
| [ ] | DELETE | `/api/v3/time_entries/:id` | Delete entry |
| [ ] | GET | `/api/v3/time_entries/form` | Create form |
| [ ] | POST | `/api/v3/time_entries/:id/form` | Update form |
| [ ] | GET | `/api/v3/time_entries/schema` | Schema |

---

## Time Entry Activities

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/time_entry_activities` | List activities |
| [ ] | GET | `/api/v3/time_entry_activities/:id` | Get activity |

---

## Attachments

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/attachments/:id` | Get attachment |
| [ ] | GET | `/api/v3/attachments/:id/content` | Download file |
| [ ] | DELETE | `/api/v3/attachments/:id` | Delete attachment |
| [ ] | POST | `/api/v3/attachments` | Direct upload |
| [ ] | POST | `/api/v3/attachments/prepare` | Prepare upload |

---

## Activities

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/activities` | List activities |
| [x] | GET | `/api/v3/activities/:id` | Get activity |
| [ ] | PATCH | `/api/v3/activities/:id` | Update comment |

---

## Notifications

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [x] | GET | `/api/v3/notifications` | List notifications |
| [ ] | GET | `/api/v3/notifications/:id` | Get notification |
| [x] | PATCH | `/api/v3/notifications/:id/read` | Mark as read |
| [x] | POST | `/api/v3/notifications/read_all` | Mark all as read |
| [ ] | PATCH | `/api/v3/notifications/:id/unread` | Mark as unread |
| [ ] | POST | `/api/v3/notifications/read_ian` | Bulk mark read |

---

## Custom Fields

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/custom_fields` | List custom fields |
| [ ] | GET | `/api/v3/custom_fields/:id` | Get custom field |

---

## Custom Options (for list fields)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/custom_options/:id` | Get custom option |

---

## Wiki Pages

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/wiki_pages/:id` | Get wiki page |
| [ ] | GET | `/api/v3/wiki_pages/:id/attachments` | Page attachments |

---

## News

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/news` | List news |
| [ ] | POST | `/api/v3/news` | Create news |
| [ ] | GET | `/api/v3/news/:id` | Get news item |
| [ ] | PATCH | `/api/v3/news/:id` | Update news |
| [ ] | DELETE | `/api/v3/news/:id` | Delete news |

---

## Meetings

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/meetings` | List meetings |
| [ ] | POST | `/api/v3/meetings` | Create meeting |
| [ ] | GET | `/api/v3/meetings/:id` | Get meeting |
| [ ] | PATCH | `/api/v3/meetings/:id` | Update meeting |
| [ ] | DELETE | `/api/v3/meetings/:id` | Delete meeting |
| [ ] | GET | `/api/v3/meetings/:id/agenda_items` | Agenda items |
| [ ] | POST | `/api/v3/meetings/:id/agenda_items` | Add agenda item |

---

## Documents

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/documents` | List documents |
| [ ] | GET | `/api/v3/documents/:id` | Get document |

---

## Grids (My Page widgets)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/grids` | List grids |
| [ ] | POST | `/api/v3/grids` | Create grid |
| [ ] | GET | `/api/v3/grids/:id` | Get grid |
| [ ] | PATCH | `/api/v3/grids/:id` | Update grid |
| [ ] | DELETE | `/api/v3/grids/:id` | Delete grid |
| [ ] | POST | `/api/v3/grids/form` | Create form |
| [ ] | GET | `/api/v3/grids/schema` | Schema |

---

## Views (Saved table/board views)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/views/:id` | Get view |
| [ ] | GET | `/api/v3/views/work_packages_table` | Table views |
| [ ] | POST | `/api/v3/views/work_packages_table` | Create table view |

---

## Budgets

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/budgets/:id` | Get budget |
| [ ] | GET | `/api/v3/projects/:id/budgets` | Project budgets |

---

## Placeholder Users (E)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/placeholder_users` | List placeholder users |
| [ ] | POST | `/api/v3/placeholder_users` | Create placeholder |
| [ ] | GET | `/api/v3/placeholder_users/:id` | Get placeholder |
| [ ] | PATCH | `/api/v3/placeholder_users/:id` | Update placeholder |
| [ ] | DELETE | `/api/v3/placeholder_users/:id` | Delete placeholder |

---

## Storages (E)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/storages` | List storages |
| [ ] | GET | `/api/v3/storages/:id` | Get storage |
| [ ] | GET | `/api/v3/storages/:id/files` | Storage files |
| [ ] | POST | `/api/v3/storages/:id/files/prepare_upload` | Prepare upload |

---

## Project Storages (E)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/project_storages` | List project storages |
| [ ] | GET | `/api/v3/project_storages/:id` | Get project storage |
| [ ] | POST | `/api/v3/project_storages/:id/open` | Open storage |

---

## File Links (E)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/file_links/:id` | Get file link |
| [ ] | DELETE | `/api/v3/file_links/:id` | Delete file link |
| [ ] | GET | `/api/v3/work_packages/:id/file_links` | WP file links |
| [ ] | POST | `/api/v3/work_packages/:id/file_links` | Create file link |

---

## Capabilities

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/capabilities` | List capabilities |
| [ ] | GET | `/api/v3/capabilities/:id` | Get capability |
| [ ] | GET | `/api/v3/capabilities/context/global` | Global capabilities |

---

## Actions

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/actions` | List actions |
| [ ] | GET | `/api/v3/actions/:id` | Get action |

---

## Posts (Forum messages)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/posts/:id` | Get post |

---

## Render (Text formatting)

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | POST | `/api/v3/render/markdown` | Render markdown |
| [ ] | POST | `/api/v3/render/plain` | Render plain text |

---

## Help Texts

| Status | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| [ ] | GET | `/api/v3/help_texts` | List help texts |
| [ ] | GET | `/api/v3/help_texts/:id` | Get help text |

---

## Summary

| Category | Implemented | Total | Percentage |
|----------|-------------|-------|------------|
| Auth | 4 | 7 | 57% |
| Work Packages | 13 | 24 | 54% |
| Projects | 5 | 20 | 25% |
| Users | 0 | 12 | 0% |
| Groups | 0 | 5 | 0% |
| Memberships | 3 | 11 | 27% |
| Reference Data (Types, Statuses, Priorities) | 6 | 8 | 75% |
| Relations | 2 | 5 | 40% |
| Activities | 1 | 3 | 33% |
| Queries | 0 | 13 | 0% |
| Time Entries | 0 | 11 | 0% |
| Attachments | 0 | 5 | 0% |
| Notifications | 3 | 6 | 50% |
| Content (Wiki, News, etc.) | 0 | 20+ | 0% |
| Enterprise | 0 | 15+ | 0% |
| **TOTAL** | **~37** | **~150+** | **~25%** |

---

*Use this checklist to track implementation progress toward 100% API parity.*
