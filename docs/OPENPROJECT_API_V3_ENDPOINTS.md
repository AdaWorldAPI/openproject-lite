# OpenProject API v3 - Complete Endpoint Inventory

> **Source:** OpenProject Documentation (https://www.openproject.org/docs/api/)
> **Generated:** 2026-01-28
> **API Type:** HAL+JSON (HATEOAS - Hypermedia As The Engine Of Application State)

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [HAL+JSON Response Format](#haljson-response-format)
4. [Filtering & Pagination](#filtering--pagination)
5. [Core Endpoints](#core-endpoints)
   - [Root & Configuration](#root--configuration)
   - [Work Packages](#work-packages)
   - [Projects](#projects)
   - [Users](#users)
   - [Groups](#groups)
   - [Principals](#principals)
   - [Memberships](#memberships)
   - [Roles](#roles)
   - [Time Entries](#time-entries)
   - [Versions](#versions)
   - [Categories](#categories)
   - [Statuses](#statuses)
   - [Types](#types)
   - [Priorities](#priorities)
   - [Queries](#queries)
   - [Notifications](#notifications)
   - [Attachments](#attachments)
   - [Activities](#activities)
   - [Relations](#relations)
   - [Wiki Pages](#wiki-pages)
   - [News](#news)
   - [Custom Fields & Options](#custom-fields--options)
   - [Actions & Capabilities](#actions--capabilities)
   - [Budgets](#budgets)
   - [Documents](#documents)
   - [File Links & Storages](#file-links--storages)
   - [Grids](#grids)
   - [Views](#views)
   - [Work Schedule](#work-schedule)
   - [Workspaces](#workspaces)
   - [Help Texts](#help-texts)
   - [OAuth 2](#oauth-2)
   - [Posts](#posts)
   - [Previewing (Render)](#previewing-render)
   - [User Preferences](#user-preferences)
   - [Revisions](#revisions)

---

## API Overview

OpenProject API v3 is a **hypermedia REST API** implementing HATEOAS principles. Each endpoint returns links to related resources and available actions in the response body.

**Base URL:** `/api/v3`

**Content-Type:** `application/hal+json`

**OpenAPI Specification:**
- JSON: `/api/v3/spec.json`
- YAML: `/api/v3/spec.yml`

---

## Authentication

### Methods Supported

| Method | Description |
|--------|-------------|
| **API Key (Basic Auth)** | Username: `apikey`, Password: your API key |
| **OAuth 2.0** | Authorization code flow, PKCE, client credentials |
| **Session Cookie** | Browser-based, requires `X-Requested-With: XMLHttpRequest` header |
| **OIDC JWT Bearer** | `Authorization: Bearer {jwt}` header |

---

## HAL+JSON Response Format

### Standard Properties

```json
{
  "_type": "WorkPackage",
  "id": 123,
  "subject": "Example",
  "_links": {
    "self": { "href": "/api/v3/work_packages/123" },
    "project": { "href": "/api/v3/projects/1" },
    "type": { "href": "/api/v3/types/1" }
  },
  "_embedded": {
    "project": { /* full project object */ }
  }
}
```

### Collection Response

```json
{
  "_type": "Collection",
  "total": 100,
  "count": 25,
  "pageSize": 25,
  "offset": 1,
  "_embedded": {
    "elements": [ /* array of resources */ ]
  },
  "_links": {
    "self": { "href": "/api/v3/work_packages?offset=1&pageSize=25" },
    "nextByOffset": { "href": "/api/v3/work_packages?offset=2&pageSize=25" }
  }
}
```

---

## Filtering & Pagination

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `offset` | integer | Page number (1-indexed) |
| `pageSize` | integer | Items per page |
| `filters` | JSON string | Filter conditions |
| `sortBy` | JSON string | Sort criteria |
| `groupBy` | string | Column to group by |
| `select` | string | Comma-separated properties to include |

### Filter Syntax

```
filters=[{"status":{"operator":"o","values":[]}}]
```

### Common Operators

| Operator | Meaning |
|----------|---------|
| `=` | Equals |
| `!` | Not equals |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |
| `*` | Not NULL |
| `!*` | Is NULL |
| `**` | Full-text search |
| `~` | Contains |
| `!~` | Does not contain |
| `o` | Open (status) |
| `c` | Closed (status) |

---

## Core Endpoints

### Root & Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3` | Root resource with links to all available resources |
| GET | `/api/v3/configuration` | System configuration (max attachment size, hostname, etc.) |

**Configuration Response Properties:**
- `maximumAttachmentFileSize` (Integer)
- `hostName` (String)
- `perPageOptions` (Integer[])
- `durationFormat` (String)
- `activeFeatureFlags` (String[])

---

### Work Packages

**The core resource for tasks/issues in OpenProject.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/work_packages` | List all work packages |
| POST | `/api/v3/work_packages` | Create work package |
| GET | `/api/v3/work_packages/{id}` | View work package |
| PATCH | `/api/v3/work_packages/{id}` | Update work package |
| DELETE | `/api/v3/work_packages/{id}` | Delete work package |
| GET | `/api/v3/work_packages/schemas` | List work package schemas |
| GET | `/api/v3/work_packages/{id}/schemas/{schema_id}` | View specific schema |

**Project-scoped:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/projects/{id}/work_packages` | List project work packages |
| POST | `/api/v3/projects/{id}/work_packages` | Create work package in project |
| GET | `/api/v3/projects/{id}/available_assignees` | List assignable users |

**Activities/Comments:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/work_packages/{id}/activities` | List activities/comments |
| POST | `/api/v3/work_packages/{id}/activities` | Add comment |

**Watchers:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/work_packages/{id}/watchers` | List watchers |
| POST | `/api/v3/work_packages/{id}/watchers` | Add watcher |
| DELETE | `/api/v3/work_packages/{id}/watchers/{user_id}` | Remove watcher |
| GET | `/api/v3/work_packages/{id}/available_watchers` | List potential watchers |
| GET | `/api/v3/work_packages/{id}/available_assignees` | List potential assignees |

**File Links:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/work_packages/{id}/file_links` | List file links |
| POST | `/api/v3/work_packages/{id}/file_links` | Create file link |

**Attachments:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/work_packages/{id}/attachments` | List attachments |
| POST | `/api/v3/work_packages/{id}/attachments` | Upload attachment |

**Relations:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v3/work_packages/{id}/relations` | Create relation |

**Reminders:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/work_packages/{id}/reminders` | List reminders |
| POST | `/api/v3/work_packages/{id}/reminders` | Create reminder |

**Query Parameters (GET /api/v3/work_packages):**
- `offset` - Page number
- `pageSize` - Items per page
- `filters` - JSON filter conditions
- `sortBy` - JSON sort criteria
- `groupBy` - Column to group by
- `showSums` - Show sum properties
- `select` - Properties to include
- `notify` - Send notifications (boolean)

---

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/projects` | List all projects |
| POST | `/api/v3/projects` | Create project |
| POST | `/api/v3/projects/form` | Project creation form |
| GET | `/api/v3/projects/{id}` | View project |
| PATCH | `/api/v3/projects/{id}` | Update project |
| DELETE | `/api/v3/projects/{id}` | Delete project (admin only) |
| GET | `/api/v3/projects/available_parent_projects` | List parent candidates |
| GET | `/api/v3/project_statuses/{id}` | View project status |

**Project Sub-resources:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/projects/{id}/types` | List project types |
| GET | `/api/v3/projects/{id}/categories` | List project categories |
| GET | `/api/v3/projects/{id}/versions` | List project versions |
| GET | `/api/v3/projects/{id}/budgets` | List project budgets |

**Query Parameters (GET /api/v3/projects):**
- `filters` - JSON (active, ancestor, name_and_identifier, parent_id)
- `sortBy` - JSON (id, name, typeahead, created_at, public, latest_activity_at)
- `select` - Comma-separated properties

---

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/users` | List users |
| POST | `/api/v3/users` | Create user (admin/manage_user) |
| GET | `/api/v3/users/schema` | User schema |
| GET | `/api/v3/users/{id}` | View user (use `me` for current) |
| PATCH | `/api/v3/users/{id}` | Update user |
| DELETE | `/api/v3/users/{id}` | Delete user permanently |
| POST | `/api/v3/users/{id}/lock` | Lock user (admin only) |
| POST | `/api/v3/users/{id}/unlock` | Unlock user (admin only) |

**Query Parameters:**
- `filters` - JSON (status, group, name, login)
- `sortBy` - JSON sort criteria
- `offset`, `pageSize`, `select`

---

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/groups` | List groups |
| POST | `/api/v3/groups` | Create group |
| GET | `/api/v3/groups/{id}` | View group |
| PATCH | `/api/v3/groups/{id}` | Update group |
| DELETE | `/api/v3/groups/{id}` | Delete group |

---

### Principals

**Unified endpoint for users, groups, and placeholder users.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/principals` | List all principals |

**Placeholder Users:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/placeholder_users` | List placeholder users |
| POST | `/api/v3/placeholder_users` | Create placeholder user |
| GET | `/api/v3/placeholder_users/{id}` | View placeholder user |
| PATCH | `/api/v3/placeholder_users/{id}` | Update placeholder user |
| DELETE | `/api/v3/placeholder_users/{id}` | Delete placeholder user |

---

### Memberships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/memberships` | List memberships |
| POST | `/api/v3/memberships` | Create membership |
| POST | `/api/v3/memberships/form` | Membership creation form |
| GET | `/api/v3/memberships/schema` | Membership schema |
| GET | `/api/v3/memberships/available_projects` | Projects for membership |
| GET | `/api/v3/memberships/{id}` | View membership |
| PATCH | `/api/v3/memberships/{id}` | Update membership |
| DELETE | `/api/v3/memberships/{id}` | Delete membership |
| POST | `/api/v3/memberships/{id}/form` | Membership update form |

---

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/roles` | List all roles (including built-in) |
| GET | `/api/v3/roles/{id}` | View role |

**Query Parameters:**
- `filters` - JSON (grantable, unit)

---

### Time Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/time_entries` | List time entries |
| POST | `/api/v3/time_entries` | Create time entry |
| GET | `/api/v3/time_entries/{id}` | View time entry |
| PATCH | `/api/v3/time_entries/{id}` | Update time entry |
| DELETE | `/api/v3/time_entries/{id}` | Delete time entry |
| POST | `/api/v3/time_entries/{id}/form` | Time entry edit form |

**Time Entry Activities:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/time_entries/activities/{id}` | View time entry activity |

---

### Versions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/versions` | List all versions |
| POST | `/api/v3/versions` | Create version |
| POST | `/api/v3/versions/form` | Version creation form |
| GET | `/api/v3/versions/schema` | Version schema |
| GET | `/api/v3/versions/available_projects` | Projects for version |
| GET | `/api/v3/versions/{id}` | View version |
| PATCH | `/api/v3/versions/{id}` | Update version |
| DELETE | `/api/v3/versions/{id}` | Delete version |
| GET | `/api/v3/projects/{id}/versions` | List project versions |
| GET | `/api/v3/workspaces/{id}/versions` | List workspace versions |

---

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/categories/{id}` | View category |
| GET | `/api/v3/projects/{id}/categories` | List project categories (deprecated) |
| GET | `/api/v3/workspaces/{id}/categories` | List workspace categories |

---

### Statuses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/statuses` | List all statuses |
| GET | `/api/v3/statuses/{id}` | View status |

---

### Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/types` | List all types |
| GET | `/api/v3/types/{id}` | View type |
| GET | `/api/v3/projects/{id}/types` | List project types (deprecated) |
| GET | `/api/v3/workspaces/{id}/types` | List workspace types |

---

### Priorities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/priorities` | List all priorities |
| GET | `/api/v3/priorities/{id}` | View priority |

---

### Queries

**Saved filters for work packages.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/queries` | List queries |
| POST | `/api/v3/queries` | Create query |
| GET | `/api/v3/queries/{id}` | View query |
| PATCH | `/api/v3/queries/{id}` | Update query |
| DELETE | `/api/v3/queries/{id}` | Delete query |
| POST | `/api/v3/queries/{id}/star` | Star/favorite query |
| POST | `/api/v3/queries/{id}/unstar` | Unstar query |

**Project/Workspace Queries:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/projects/{id}/queries/default` | Default project query |
| GET | `/api/v3/projects/{id}/queries/schema` | Project query schema |
| GET | `/api/v3/workspaces/{id}/queries/default` | Default workspace query |
| GET | `/api/v3/workspaces/{id}/queries/schema` | Workspace query schema |

**Query Metadata:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/queries/columns/{id}` | View query column |
| GET | `/api/v3/queries/filters/{id}` | View query filter |
| GET | `/api/v3/queries/operators/{id}` | View query operator |
| GET | `/api/v3/queries/sort_bys/{id}` | View query sort by |

---

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/notifications` | List notifications |
| GET | `/api/v3/notifications/{id}` | View notification |
| POST | `/api/v3/notifications/read_ian` | Mark all as read |
| POST | `/api/v3/notifications/unread_ian` | Mark all as unread |
| POST | `/api/v3/notifications/{id}/read_ian` | Mark one as read |
| POST | `/api/v3/notifications/{id}/unread_ian` | Mark one as unread |
| GET | `/api/v3/notifications/{notification_id}/details/{id}` | View notification detail |

---

### Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v3/attachments` | Create attachment (without container) |
| GET | `/api/v3/attachments/{id}` | View attachment |
| DELETE | `/api/v3/attachments/{id}` | Delete attachment |

**Resource-specific Attachments:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/work_packages/{id}/attachments` | Work package attachments |
| POST | `/api/v3/work_packages/{id}/attachments` | Upload to work package |
| GET | `/api/v3/wiki_pages/{id}/attachments` | Wiki page attachments |
| POST | `/api/v3/wiki_pages/{id}/attachments` | Upload to wiki page |
| GET | `/api/v3/posts/{id}/attachments` | Post attachments |
| POST | `/api/v3/posts/{id}/attachments` | Upload to post |
| GET | `/api/v3/meetings/{id}/attachments` | Meeting attachments |
| POST | `/api/v3/meetings/{id}/attachments` | Upload to meeting |
| GET | `/api/v3/activities/{id}/attachments` | Activity attachments |
| POST | `/api/v3/activities/{id}/attachments` | Upload to activity |

---

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/activities/{id}` | View activity |
| PATCH | `/api/v3/activities/{id}` | Update activity comment |
| GET | `/api/v3/activities/{id}/attachments` | List attachments |
| POST | `/api/v3/activities/{id}/attachments` | Add attachment |
| GET | `/api/v3/activities/{id}/emoji_reactions` | List emoji reactions |
| POST | `/api/v3/activities/{id}/emoji_reactions` | Toggle emoji reaction |

---

### Relations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/relations` | List all relations |
| GET | `/api/v3/relations/{id}` | View relation |
| PATCH | `/api/v3/relations/{id}` | Update relation |
| DELETE | `/api/v3/relations/{id}` | Delete relation |
| POST | `/api/v3/work_packages/{id}/relations` | Create work package relation |

**Relation Types:**
- `blocks` / `blocked`
- `precedes` / `follows`
- `relates`
- `duplicates` / `duplicated`
- `requires` / `required`
- `parent` / `children`

---

### Wiki Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/wiki_pages/{id}` | View wiki page |
| GET | `/api/v3/wiki_pages/{id}/attachments` | List attachments |
| POST | `/api/v3/wiki_pages/{id}/attachments` | Add attachment |

*Note: Currently a stub resource with limited functionality.*

---

### News

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/news` | List news |
| POST | `/api/v3/news` | Create news (admin/manage_news) |
| GET | `/api/v3/news/{id}` | View news |
| PATCH | `/api/v3/news/{id}` | Update news |
| DELETE | `/api/v3/news/{id}` | Delete news |

---

### Custom Fields & Options

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/custom_options/{id}` | View custom option |
| GET | `/api/v3/custom_fields/{id}/items` | List custom field items |
| GET | `/api/v3/custom_field_items/{id}` | View custom field item |
| GET | `/api/v3/custom_field_items/{id}/branch` | View item branch |

**Custom Actions:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/custom_actions/{id}` | View custom action |
| POST | `/api/v3/custom_actions/{id}/execute` | Execute custom action |

---

### Actions & Capabilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/actions` | List actions |
| GET | `/api/v3/actions/{id}` | View action |
| GET | `/api/v3/capabilities` | List capabilities |
| GET | `/api/v3/capabilities/{id}` | View capability |
| GET | `/api/v3/capabilities/context/global` | Global capability context |

---

### Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/budgets/{id}` | View budget |
| GET | `/api/v3/projects/{id}/budgets` | List project budgets |

*Note: Currently a stub resource.*

---

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/documents` | List documents |
| GET | `/api/v3/documents/{id}` | View document |
| PATCH | `/api/v3/documents/{id}` | Update document |

---

### File Links & Storages

**File Links:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/file_links/{id}` | View file link |
| DELETE | `/api/v3/file_links/{id}` | Delete file link |
| GET | `/api/v3/file_links/{id}/download` | Generate download URI |
| GET | `/api/v3/file_links/{id}/open` | Generate opening URI |
| GET | `/api/v3/work_packages/{id}/file_links` | List work package file links |
| POST | `/api/v3/work_packages/{id}/file_links` | Create file link |

**Storages:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/storages` | List storages |
| POST | `/api/v3/storages` | Create storage |
| GET | `/api/v3/storages/{id}` | View storage |
| PATCH | `/api/v3/storages/{id}` | Update storage |
| DELETE | `/api/v3/storages/{id}` | Delete storage |
| GET | `/api/v3/storages/{id}/files` | List storage files |
| POST | `/api/v3/storages/{id}/files` | Create folder |
| POST | `/api/v3/storages/{id}/files/prepare_upload` | Prepare upload |
| POST | `/api/v3/storages/{id}/oauth_client_credentials` | Create OAuth credentials |

---

### Grids

**Layout management for dashboards/widgets.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/grids` | List grids |
| POST | `/api/v3/grids` | Create grid |
| POST | `/api/v3/grids/form` | Grid creation form |
| GET | `/api/v3/grids/{id}` | View grid |
| PATCH | `/api/v3/grids/{id}` | Update grid |
| POST | `/api/v3/grids/{id}/form` | Grid update form |

---

### Views

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/views` | List views |
| GET | `/api/v3/views/{id}` | View single view |
| POST | `/api/v3/views/{id}` | Create view |

**View Type Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v3/views/work_packages_table` | Create table view |
| POST | `/api/v3/views/team_planner` | Create team planner view |
| POST | `/api/v3/views/work_packages_calendar` | Create calendar view |

---

### Work Schedule

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/days` | List all days |
| GET | `/api/v3/days/{date}` | View specific date |
| GET | `/api/v3/days/non_working` | List non-working days |
| GET | `/api/v3/days/non_working/{date}` | View non-working day |
| POST | `/api/v3/days/non_working` | Create non-working day * |
| PATCH | `/api/v3/days/non_working/{date}` | Update non-working day * |
| DELETE | `/api/v3/days/non_working/{date}` | Delete non-working day * |
| GET | `/api/v3/days/week` | List week days |
| GET | `/api/v3/days/week/{day}` | View week day |
| PATCH | `/api/v3/days/week` | Update week days * |

*\* Not fully implemented*

---

### Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/workspaces/schema` | Workspace schema |
| POST | `/api/v3/workspaces/{id}/favorite` | Add to favorites |
| DELETE | `/api/v3/workspaces/{id}/favorite` | Remove from favorites |
| GET | `/api/v3/workspaces/{id}/types` | List workspace types |
| GET | `/api/v3/workspaces/{id}/categories` | List workspace categories |
| GET | `/api/v3/workspaces/{id}/versions` | List workspace versions |
| GET | `/api/v3/workspaces/{id}/queries/default` | Default query |
| GET | `/api/v3/workspaces/{id}/queries/schema` | Query schema |
| GET | `/api/v3/workspaces/{id}/work_packages` | List work packages |
| POST | `/api/v3/workspaces/{id}/work_packages` | Create work package |
| GET | `/api/v3/workspaces/{id}/available_assignees` | List assignees |

---

### Help Texts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/help_texts` | List help texts |
| GET | `/api/v3/help_texts/{id}` | View help text |

---

### OAuth 2

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/oauth_applications/{id}` | View OAuth application (admin) |
| GET | `/api/v3/oauth_client_credentials/{id}` | View OAuth credentials (admin) |

---

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/posts/{id}` | View post |
| GET | `/api/v3/posts/{id}/attachments` | List attachments |
| POST | `/api/v3/posts/{id}/attachments` | Add attachment |

*Note: Currently a stub resource.*

---

### Previewing (Render)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v3/render/markdown` | Render markdown to HTML |
| POST | `/api/v3/render/plain` | Render plain text to HTML |

**Content-Type:** `text/plain` (required)

**Query Parameters (markdown):**
- `context` - Work package reference for image resolution

---

### User Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/my_preferences` | View current user preferences |
| PATCH | `/api/v3/my_preferences` | Update preferences |

**Updateable Properties:**
- `autoHidePopups` (Boolean)
- `timeZone` (String)
- `commentSortDescending` (Boolean)
- `warnOnLeavingUnsaved` (Boolean)
- `notifications` (NotificationSetting)

---

### Revisions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/revisions/{id}` | View revision (VCS changesets) |

---

## Meetings (Additional)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/meetings/{id}` | View meeting |
| GET | `/api/v3/meetings/{id}/attachments` | List attachments |
| POST | `/api/v3/meetings/{id}/attachments` | Add attachment |

---

## Summary Statistics

| Category | Endpoints |
|----------|-----------|
| **Work Packages** | ~25 endpoints |
| **Projects** | ~10 endpoints |
| **Users/Groups/Principals** | ~20 endpoints |
| **Queries** | ~15 endpoints |
| **Time Entries** | ~6 endpoints |
| **Attachments** | ~15 endpoints |
| **File Links/Storages** | ~15 endpoints |
| **Other Resources** | ~50+ endpoints |
| **Total** | **~150+ endpoints** |

---

## References

- [OpenProject API Documentation](https://www.openproject.org/docs/api/)
- [OpenProject API Endpoints](https://www.openproject.org/docs/api/endpoints/)
- [OpenProject API Introduction](https://www.openproject.org/docs/api/introduction/)
- [OpenAPI Specification (GitHub)](https://github.com/opf/openproject/blob/dev/docs/api/apiv3/openapi-spec.yml)
- [Live OpenAPI Spec](https://community.openproject.org/api/v3/spec.yml)

---

*This document provides a comprehensive reference for implementing OpenProject API v3 compatibility in openproject-lite.*
