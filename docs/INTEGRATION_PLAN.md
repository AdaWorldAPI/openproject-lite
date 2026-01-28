# OpenProject-Lite 1:1 Integration Plan

> **Mission:** Achieve 100% API and UI parity with OpenProject while maintaining clean TypeScript architecture ready for Rust migration.

---

## Executive Summary

### OpenProject Full Feature Inventory

| Category | OpenProject | openproject-lite | Gap |
|----------|-------------|------------------|-----|
| **Database Tables** | ~150+ | 7 | 143+ |
| **API Endpoints** | ~150+ | ~20 | 130+ |
| **Models** | 1,129 | 7 | 1,122 |
| **Services** | 532 | 4 | 528 |
| **Controllers** | 310 | 4 | 306 |
| **Frontend Pages** | 50+ | 10 | 40+ |
| **Modules** | 28 | 0 | 28 |

### Current Implementation (What We Have)

```
ENTITIES:     Users, Projects, Tasks (WorkPackages), Comments, Notifications, Sessions
API:          Auth (4), Projects (7), Tasks (6), Notifications (3) = 20 endpoints
FRONTEND:     Login, Register, Dashboard, ProjectOverview, TaskList, Kanban, Members, Notifications, Settings
ARCHITECTURE: Clean layers (routes → services → repositories → DTOs) ✓
HAL+JSON:     Implemented ✓
```

---

## Phase 1: Core Entity Expansion (Priority: CRITICAL)

### 1.1 Work Package Enhancements

**Database Schema Additions:**
```sql
-- Work Package extended fields
ALTER TABLE tasks ADD COLUMN
  parent_id UUID REFERENCES tasks(id),
  type_id UUID REFERENCES types(id),
  percent_complete INTEGER DEFAULT 0,
  estimated_hours DECIMAL(10,2),
  spent_hours DECIMAL(10,2),
  start_date DATE,
  done_ratio INTEGER DEFAULT 0,
  lock_version INTEGER DEFAULT 0,
  position INTEGER,
  story_points INTEGER;

-- New tables needed
CREATE TABLE types (id, name, color, position, is_milestone, is_default, description_template);
CREATE TABLE statuses (id, name, color, position, is_closed, is_default, default_done_ratio);
CREATE TABLE priorities (id, name, color, position, is_default, is_active);
CREATE TABLE workflows (id, type_id, old_status_id, new_status_id, role_id, author, assignee);
CREATE TABLE relations (id, from_id, to_id, relation_type, lag, description);
CREATE TABLE watchers (id, watchable_type, watchable_id, user_id);
CREATE TABLE journals (id, journable_type, journable_id, user_id, notes, version, created_at);
CREATE TABLE journal_data (id, journal_id, property, old_value, new_value);
```

**API Endpoints to Add:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/work_packages` | List with filters, pagination |
| GET | `/api/v3/work_packages/:id/activities` | Activity stream |
| GET | `/api/v3/work_packages/:id/watchers` | List watchers |
| POST | `/api/v3/work_packages/:id/watchers` | Add watcher |
| DELETE | `/api/v3/work_packages/:id/watchers/:user_id` | Remove watcher |
| GET | `/api/v3/work_packages/:id/relations` | List relations |
| POST | `/api/v3/work_packages/:id/relations` | Create relation |
| GET | `/api/v3/work_packages/:id/available_relation_candidates` | Search for linkable WPs |
| GET | `/api/v3/work_packages/:id/revisions` | Git commits |
| GET | `/api/v3/work_packages/schemas` | Schema for forms |
| GET | `/api/v3/work_packages/form` | Create form |
| POST | `/api/v3/work_packages/:id/form` | Update form |

**Services to Implement:**
```typescript
// TypeScript services (Rust pattern)
WorkPackageCreateService    // → Rust: impl CreateService for WorkPackage
WorkPackageUpdateService    // → Rust: impl UpdateService for WorkPackage
WorkPackageDeleteService    // → Rust: impl DeleteService for WorkPackage
WorkPackageCopyService      // → Rust: impl CopyService for WorkPackage
WorkPackageSetScheduleService
WorkPackageUpdateAncestorsService
WorkPackageBulkCopyService
WorkPackageBulkUpdateService
```

### 1.2 Reference Data (Types, Statuses, Priorities)

**Database Schema:**
```sql
CREATE TABLE types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#1A67A3',
  position INTEGER DEFAULT 0,
  is_milestone BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  is_in_roadmap BOOLEAN DEFAULT true,
  description_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#DEE2E6',
  position INTEGER DEFAULT 0,
  is_closed BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  default_done_ratio INTEGER,
  is_readonly BOOLEAN DEFAULT false, -- Enterprise
  excluded_from_totals BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT,
  position INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Map types to statuses (which statuses allowed per type)
CREATE TABLE type_statuses (
  type_id UUID REFERENCES types(id) ON DELETE CASCADE,
  status_id UUID REFERENCES statuses(id) ON DELETE CASCADE,
  PRIMARY KEY (type_id, status_id)
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/types` | List all types |
| GET | `/api/v3/types/:id` | Get type |
| GET | `/api/v3/projects/:id/types` | Types enabled for project |
| GET | `/api/v3/statuses` | List all statuses |
| GET | `/api/v3/statuses/:id` | Get status |
| GET | `/api/v3/priorities` | List all priorities |
| GET | `/api/v3/priorities/:id` | Get priority |

**Seed Data (Default OpenProject values):**
```typescript
const DEFAULT_TYPES = [
  { name: 'Task', color: '#1A67A3', is_default: true },
  { name: 'Milestone', color: '#F0F0F0', is_milestone: true },
  { name: 'Phase', color: '#FF922B' },
  { name: 'Feature', color: '#35C53F' },
  { name: 'Epic', color: '#9141AC' },
  { name: 'User story', color: '#00B0F0' },
  { name: 'Bug', color: '#CC0000' },
];

const DEFAULT_STATUSES = [
  { name: 'New', color: '#DEE2E6', is_default: true, position: 1 },
  { name: 'In progress', color: '#00B0F0', position: 2 },
  { name: 'Closed', color: '#35C53F', is_closed: true, position: 10, default_done_ratio: 100 },
  { name: 'On hold', color: '#FF922B', position: 5 },
  { name: 'Rejected', color: '#CC0000', is_closed: true, position: 11 },
];

const DEFAULT_PRIORITIES = [
  { name: 'Low', color: '#83898E', position: 1 },
  { name: 'Normal', color: '#1A67A3', is_default: true, position: 2 },
  { name: 'High', color: '#FF922B', position: 3 },
  { name: 'Immediate', color: '#CC0000', position: 4 },
];
```

### 1.3 Relations

**Database Schema:**
```sql
CREATE TABLE relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- follows, precedes, blocks, blocked, relates, duplicates, duplicated, includes, partof, requires, required
  lag INTEGER DEFAULT 0, -- days for predecessor/successor
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_id, to_id, relation_type)
);
```

**Relation Types (OpenProject):**
| Type | Inverse | Description |
|------|---------|-------------|
| `follows` | `precedes` | Finish-to-start dependency |
| `precedes` | `follows` | Inverse of follows |
| `blocks` | `blocked` | Blocking dependency |
| `blocked` | `blocks` | Is blocked by |
| `relates` | `relates` | General relation |
| `duplicates` | `duplicated` | Duplicate of |
| `duplicated` | `duplicates` | Is duplicated by |
| `includes` | `partof` | Parent-child (not hierarchy) |
| `partof` | `includes` | Part of |
| `requires` | `required` | Requires |
| `required` | `requires` | Is required by |

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/relations` | List all relations |
| GET | `/api/v3/relations/:id` | Get relation |
| POST | `/api/v3/relations` | Create relation |
| PATCH | `/api/v3/relations/:id` | Update relation |
| DELETE | `/api/v3/relations/:id` | Delete relation |

---

## Phase 2: Workflows & Permissions

### 2.1 Roles & Permissions

**Database Schema:**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  position INTEGER DEFAULT 0,
  permissions JSONB DEFAULT '[]', -- Array of permission strings
  assignable BOOLEAN DEFAULT true,
  builtin INTEGER DEFAULT 0, -- 0=normal, 1=non_member, 2=anonymous
  type TEXT DEFAULT 'Role', -- Role, GlobalRole
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- OpenProject permissions are strings like:
-- view_work_packages, add_work_packages, edit_work_packages, delete_work_packages
-- manage_members, view_members
-- manage_project_configuration
-- etc.
```

**Default Permissions (subset):**
```typescript
const PERMISSIONS = {
  // Work packages
  view_work_packages: 'View work packages',
  add_work_packages: 'Create work packages',
  edit_work_packages: 'Edit work packages',
  edit_own_work_packages: 'Edit own work packages',
  delete_work_packages: 'Delete work packages',
  move_work_packages: 'Move work packages',
  copy_work_packages: 'Copy work packages',
  manage_work_package_relations: 'Manage relations',
  add_work_package_notes: 'Add comments',
  edit_work_package_notes: 'Edit comments',
  edit_own_work_package_notes: 'Edit own comments',

  // Members
  view_members: 'View members',
  manage_members: 'Manage members',

  // Projects
  edit_project: 'Edit project',
  select_project_modules: 'Configure modules',
  manage_versions: 'Manage versions',
  manage_categories: 'Manage categories',
  manage_project_custom_values: 'Edit project custom fields',

  // Wiki
  view_wiki_pages: 'View wiki',
  edit_wiki_pages: 'Edit wiki',
  delete_wiki_pages: 'Delete wiki pages',

  // Time tracking
  view_time_entries: 'View time entries',
  log_time: 'Log time',
  edit_time_entries: 'Edit time entries',
  edit_own_time_entries: 'Edit own time entries',

  // Admin (global)
  add_project: 'Create projects',
  manage_user: 'Manage users',
  manage_roles: 'Manage roles',
};
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/roles` | List all roles |
| GET | `/api/v3/roles/:id` | Get role with permissions |

### 2.2 Workflows (Status Transitions)

**Database Schema:**
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id UUID NOT NULL REFERENCES types(id) ON DELETE CASCADE,
  old_status_id UUID NOT NULL REFERENCES statuses(id) ON DELETE CASCADE,
  new_status_id UUID NOT NULL REFERENCES statuses(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  author BOOLEAN DEFAULT false, -- Can author make this transition?
  assignee BOOLEAN DEFAULT false, -- Can assignee make this transition?
  UNIQUE(type_id, old_status_id, new_status_id, role_id)
);
```

**Implementation Note:**
In OpenProject, workflows determine which status transitions are allowed for each combination of:
- Work package type
- Current status
- User's role
- Is user the author?
- Is user the assignee?

**PostgreSQL Function (replace Ruby logic):**
```sql
CREATE OR REPLACE FUNCTION get_allowed_status_transitions(
  p_type_id UUID,
  p_current_status_id UUID,
  p_role_ids UUID[],
  p_is_author BOOLEAN,
  p_is_assignee BOOLEAN
) RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(DISTINCT w.new_status_id)
  FROM workflows w
  WHERE w.type_id = p_type_id
    AND w.old_status_id = p_current_status_id
    AND (
      w.role_id = ANY(p_role_ids)
      OR (w.author = true AND p_is_author)
      OR (w.assignee = true AND p_is_assignee)
    )
$$ LANGUAGE SQL;
```

---

## Phase 3: Custom Fields

### 3.1 Custom Field Types

**Database Schema:**
```sql
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- WorkPackageCustomField, ProjectCustomField, UserCustomField
  name TEXT NOT NULL,
  field_format TEXT NOT NULL, -- bool, date, float, int, link, list, string, text, user, version
  possible_values JSONB DEFAULT '[]', -- For list type
  regexp TEXT, -- Validation regex
  min_length INTEGER,
  max_length INTEGER,
  is_required BOOLEAN DEFAULT false,
  is_for_all BOOLEAN DEFAULT false, -- Available in all projects
  is_filter BOOLEAN DEFAULT true,
  searchable BOOLEAN DEFAULT false,
  default_value TEXT,
  editable BOOLEAN DEFAULT true,
  visible BOOLEAN DEFAULT true,
  multi_value BOOLEAN DEFAULT false, -- Allow multiple selections
  position INTEGER DEFAULT 0,
  content_right_to_left BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link custom fields to projects
CREATE TABLE custom_fields_projects (
  custom_field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (custom_field_id, project_id)
);

-- Link custom fields to types (for work package fields)
CREATE TABLE custom_fields_types (
  custom_field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
  type_id UUID REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (custom_field_id, type_id)
);

-- Store custom field values
CREATE TABLE custom_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customized_type TEXT NOT NULL, -- WorkPackage, Project, User
  customized_id UUID NOT NULL,
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  UNIQUE(customized_type, customized_id, custom_field_id)
);

-- For multi-value fields
CREATE TABLE custom_values_multi (
  custom_value_id UUID REFERENCES custom_values(id) ON DELETE CASCADE,
  value TEXT NOT NULL
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/custom_fields` | List custom fields |
| GET | `/api/v3/custom_fields/:id` | Get custom field |
| POST | `/api/v3/custom_fields` | Create custom field (admin) |
| PATCH | `/api/v3/custom_fields/:id` | Update custom field (admin) |
| DELETE | `/api/v3/custom_fields/:id` | Delete custom field (admin) |

**Work Package Schema Integration:**
Custom fields appear in work package schema as:
```json
{
  "_type": "Schema",
  "customField123": {
    "type": "String",
    "name": "Customer ID",
    "required": false,
    "hasDefault": false,
    "writable": true
  }
}
```

---

## Phase 4: Users & Groups (Extended)

### 4.1 Groups

**Database Schema:**
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE group_users (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/groups` | List groups |
| GET | `/api/v3/groups/:id` | Get group with members |
| POST | `/api/v3/groups` | Create group (admin) |
| PATCH | `/api/v3/groups/:id` | Update group (admin) |
| DELETE | `/api/v3/groups/:id` | Delete group (admin) |
| POST | `/api/v3/groups/:id/members` | Add user to group |
| DELETE | `/api/v3/groups/:id/members/:user_id` | Remove user from group |

### 4.2 Principals (Unified User/Group)

In OpenProject, `Principal` is an STI (Single Table Inheritance) base for Users and Groups. In TypeScript/PostgreSQL, we handle this differently:

```typescript
// TypeScript approach (no STI)
type Principal =
  | { _type: 'User'; id: string; name: string; email: string; }
  | { _type: 'Group'; id: string; name: string; };

// API endpoint returns either
GET /api/v3/principals?filters=[{"type":{"operator":"=","values":["User","Group"]}}]
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/principals` | List users and groups |
| GET | `/api/v3/principals/:id` | Get user or group |

### 4.3 Memberships (Extended)

**Database Schema Updates:**
```sql
-- Support multiple roles per membership
CREATE TABLE member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES project_members(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  inherited_from UUID REFERENCES member_roles(id) ON DELETE CASCADE, -- For group inheritance
  UNIQUE(member_id, role_id)
);

-- Allow groups as members (update project_members)
ALTER TABLE project_members ADD COLUMN principal_type TEXT DEFAULT 'User'; -- User or Group
ALTER TABLE project_members RENAME COLUMN user_id TO principal_id;
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/memberships` | List all memberships |
| GET | `/api/v3/memberships/:id` | Get membership |
| POST | `/api/v3/memberships` | Create membership |
| PATCH | `/api/v3/memberships/:id` | Update membership roles |
| DELETE | `/api/v3/memberships/:id` | Remove membership |
| GET | `/api/v3/memberships/available_projects` | Projects user can add members to |
| POST | `/api/v3/memberships/form` | Form for creating membership |

---

## Phase 5: Queries & Views

### 5.1 Saved Queries

**Database Schema:**
```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL for global
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '[]',
  column_names JSONB NOT NULL DEFAULT '[]', -- Array of column identifiers
  sort_criteria JSONB DEFAULT '[]', -- [[column, direction], ...]
  group_by TEXT,
  display_sums BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false, -- Favorited
  timestamps JSONB, -- For baseline comparison
  include_subprojects BOOLEAN DEFAULT true,
  display_representation TEXT DEFAULT 'table', -- table, card
  highlighting_mode TEXT, -- inline, status, priority, type, none
  show_hierarchies BOOLEAN DEFAULT true,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Filter Format (OpenProject Compatible):**
```json
[
  {"status_id": {"operator": "o", "values": []}},
  {"assigned_to_id": {"operator": "=", "values": ["me"]}},
  {"type_id": {"operator": "=", "values": ["1", "2"]}},
  {"due_date": {"operator": "<t+", "values": ["7"]}}
]
```

**Filter Operators:**
| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | `["1", "2"]` |
| `!` | Not equals | `["3"]` |
| `o` | Open (status) | `[]` |
| `c` | Closed (status) | `[]` |
| `*` | Not null | `[]` |
| `!*` | Null | `[]` |
| `~` | Contains | `["search term"]` |
| `!~` | Not contains | `["term"]` |
| `>=` | Greater or equal | `["2024-01-01"]` |
| `<=` | Less or equal | `["2024-12-31"]` |
| `<>d` | Between | `["2024-01-01", "2024-12-31"]` |
| `<t+` | In less than (days) | `["7"]` |
| `>t-` | In more than (days ago) | `["30"]` |
| `t` | Today | `[]` |
| `w` | This week | `[]` |

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/queries` | List queries |
| GET | `/api/v3/queries/default` | Default query |
| GET | `/api/v3/queries/available_projects` | Projects for query |
| GET | `/api/v3/queries/:id` | Get query |
| POST | `/api/v3/queries` | Create query |
| PATCH | `/api/v3/queries/:id` | Update query |
| DELETE | `/api/v3/queries/:id` | Delete query |
| PATCH | `/api/v3/queries/:id/star` | Star query |
| PATCH | `/api/v3/queries/:id/unstar` | Unstar query |
| GET | `/api/v3/queries/filter_instance_schemas` | Available filters |
| GET | `/api/v3/queries/columns` | Available columns |
| GET | `/api/v3/queries/group_bys` | Group by options |
| GET | `/api/v3/queries/sort_bys` | Sort options |

---

## Phase 6: Versions & Categories

### 6.1 Versions

**Database Schema:**
```sql
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  effective_date DATE, -- Target date
  status TEXT DEFAULT 'open', -- open, locked, closed
  sharing TEXT DEFAULT 'none', -- none, descendants, hierarchy, tree, system
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, name)
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/versions` | List all versions |
| GET | `/api/v3/versions/:id` | Get version |
| POST | `/api/v3/versions` | Create version |
| PATCH | `/api/v3/versions/:id` | Update version |
| DELETE | `/api/v3/versions/:id` | Delete version |
| GET | `/api/v3/projects/:id/versions` | Versions for project |
| GET | `/api/v3/work_packages/:id/available_assignees` | Users for assignment |

### 6.2 Categories

**Database Schema:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Default assignee
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, name)
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/categories/:id` | Get category |
| GET | `/api/v3/projects/:id/categories` | Categories for project |

---

## Phase 7: Time Tracking

### 7.1 Time Entries

**Database Schema:**
```sql
CREATE TABLE time_entry_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES time_entry_activities(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_package_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES time_entry_activities(id),
  hours DECIMAL(10,2) NOT NULL,
  comments TEXT,
  spent_on DATE NOT NULL,
  tyear INTEGER NOT NULL, -- Denormalized for queries
  tmonth INTEGER NOT NULL,
  tweek INTEGER NOT NULL,
  ongoing BOOLEAN DEFAULT false, -- Timer running
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/time_entries` | List time entries |
| GET | `/api/v3/time_entries/:id` | Get time entry |
| POST | `/api/v3/time_entries` | Log time |
| PATCH | `/api/v3/time_entries/:id` | Update time entry |
| DELETE | `/api/v3/time_entries/:id` | Delete time entry |
| GET | `/api/v3/time_entries/form` | Create form |
| POST | `/api/v3/time_entries/:id/form` | Update form |
| GET | `/api/v3/time_entry_activities` | List activities |
| GET | `/api/v3/projects/:id/available_assignees` | Assignable users |

---

## Phase 8: Attachments

### 8.1 File Storage

**Database Schema:**
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_type TEXT NOT NULL, -- WorkPackage, WikiPage, Project, etc.
  container_id UUID NOT NULL,
  filename TEXT NOT NULL,
  disk_filename TEXT NOT NULL, -- Stored filename (UUID-based)
  filesize BIGINT NOT NULL,
  content_type TEXT,
  digest TEXT, -- MD5/SHA hash
  downloads INTEGER DEFAULT 0,
  author_id UUID NOT NULL REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for polymorphic lookup
CREATE INDEX idx_attachments_container ON attachments(container_type, container_id);
```

**Storage Strategy:**
- Local filesystem: `/uploads/{container_type}/{container_id}/{disk_filename}`
- S3-compatible: `s3://bucket/attachments/{disk_filename}`
- Direct upload with presigned URLs

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/attachments/:id` | Get attachment metadata |
| GET | `/api/v3/attachments/:id/content` | Download file |
| DELETE | `/api/v3/attachments/:id` | Delete attachment |
| POST | `/api/v3/attachments` | Direct upload (multipart) |
| POST | `/api/v3/work_packages/:id/attachments` | Attach to work package |
| GET | `/api/v3/work_packages/:id/attachments` | List attachments |
| POST | `/api/v3/attachments/prepare` | Get presigned upload URL |

---

## Phase 9: Activity & Journals

### 9.1 Activity Journaling

**Database Schema:**
```sql
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journable_type TEXT NOT NULL, -- WorkPackage, Project, WikiPage, etc.
  journable_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  notes TEXT, -- Comment text
  version INTEGER NOT NULL DEFAULT 1, -- Auto-increment per journable
  cause_type TEXT, -- system (auto-changes), user (manual)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE journal_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  property TEXT NOT NULL, -- Field name
  property_key TEXT, -- For custom fields: customField123
  old_value TEXT,
  new_value TEXT
);

-- Store full state for work packages (optional, for snapshots)
CREATE TABLE work_package_journals (
  journal_id UUID PRIMARY KEY REFERENCES journals(id) ON DELETE CASCADE,
  subject TEXT,
  description TEXT,
  type_id UUID,
  status_id UUID,
  priority_id UUID,
  author_id UUID,
  assigned_to_id UUID,
  -- ... all work package fields
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/activities` | List recent activities |
| GET | `/api/v3/activities/:id` | Get activity |
| PATCH | `/api/v3/activities/:id` | Update comment |
| GET | `/api/v3/work_packages/:id/activities` | WP activities |
| POST | `/api/v3/work_packages/:id/activities` | Add comment |

**Activity Representation:**
```typescript
interface Activity {
  _type: 'Activity' | 'Activity::Comment';
  id: string;
  comment?: Formattable;
  details: Array<{
    format: 'markdown';
    raw: string;  // "Status changed from New to In progress"
    html: string;
  }>;
  version: number;
  createdAt: string;
  _links: {
    self: HalLink;
    user: HalLink;
    workPackage: HalLink;
  };
}
```

---

## Phase 10: Notifications (Extended)

### 10.1 In-App Notifications

**Database Schema Updates:**
```sql
-- Extend existing notifications table
ALTER TABLE notifications ADD COLUMN
  resource_type TEXT, -- WorkPackage, WikiPage, etc.
  resource_id UUID,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  journal_id UUID REFERENCES journals(id) ON DELETE SET NULL,
  reason TEXT NOT NULL, -- mentioned, assigned, watched, created, commented, date_alert
  read_ian BOOLEAN DEFAULT false, -- Read in-app notification
  read_email BOOLEAN DEFAULT false, -- Read via email
  mail_alert_sent_at TIMESTAMPTZ,
  mail_reminder_sent_at TIMESTAMPTZ;
```

**Notification Reasons:**
| Reason | Trigger |
|--------|---------|
| `mentioned` | @mentioned in comment |
| `assigned` | Assigned to work package |
| `watched` | Watching work package |
| `created` | Created work package I watch |
| `commented` | Comment on work package I watch |
| `date_alert` | Due date approaching |
| `shared` | Work package shared with me |

**API Endpoints (Extended):**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/notifications` | List with filters |
| GET | `/api/v3/notifications/:id` | Get notification |
| PATCH | `/api/v3/notifications/:id/read_ian` | Mark as read (in-app) |
| PATCH | `/api/v3/notifications/:id/unread_ian` | Mark as unread |
| POST | `/api/v3/notifications/read_ian` | Mark multiple as read |
| GET | `/api/v3/notifications/unread_count` | Unread count |

### 10.2 Notification Settings

**Database Schema:**
```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL for global
  channel TEXT NOT NULL, -- in_app, mail, mail_digest
  involved BOOLEAN DEFAULT true, -- Involved notifications
  watched BOOLEAN DEFAULT true, -- Watched notifications
  mentioned BOOLEAN DEFAULT true, -- @mentions
  work_package_commented BOOLEAN DEFAULT true,
  work_package_created BOOLEAN DEFAULT true,
  work_package_processed BOOLEAN DEFAULT true,
  work_package_prioritized BOOLEAN DEFAULT true,
  work_package_scheduled BOOLEAN DEFAULT true,
  news_added BOOLEAN DEFAULT false,
  news_commented BOOLEAN DEFAULT false,
  document_added BOOLEAN DEFAULT false,
  forum_messages BOOLEAN DEFAULT false,
  wiki_page_added BOOLEAN DEFAULT false,
  wiki_page_updated BOOLEAN DEFAULT false,
  membership_added BOOLEAN DEFAULT true,
  membership_updated BOOLEAN DEFAULT true,
  start_date BOOLEAN DEFAULT false, -- Date alerts
  due_date BOOLEAN DEFAULT false,
  overdue BOOLEAN DEFAULT false,
  all_days BOOLEAN DEFAULT true, -- Email days
  monday BOOLEAN DEFAULT true,
  tuesday BOOLEAN DEFAULT true,
  wednesday BOOLEAN DEFAULT true,
  thursday BOOLEAN DEFAULT true,
  friday BOOLEAN DEFAULT true,
  saturday BOOLEAN DEFAULT false,
  sunday BOOLEAN DEFAULT false,
  UNIQUE(user_id, project_id, channel)
);
```

---

## Phase 11: Wiki

### 11.1 Wiki Pages

**Database Schema:**
```sql
CREATE TABLE wikis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  start_page TEXT DEFAULT 'Wiki',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiki_id UUID NOT NULL REFERENCES wikis(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES wiki_pages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-safe title
  protected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wiki_id, slug)
);

CREATE TABLE wiki_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL UNIQUE REFERENCES wiki_pages(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  text TEXT,
  comments TEXT, -- Edit summary
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wiki_content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  text TEXT,
  comments TEXT,
  version INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/wiki_pages/:id` | Get wiki page |
| GET | `/api/v3/projects/:id/wiki` | Wiki index |
| POST | `/api/v3/projects/:id/wiki` | Create wiki page |
| PATCH | `/api/v3/wiki_pages/:id` | Update wiki page |
| DELETE | `/api/v3/wiki_pages/:id` | Delete wiki page |
| GET | `/api/v3/wiki_pages/:id/attachments` | Page attachments |

---

## Phase 12: Meetings

### 12.1 Meeting Management

**Database Schema:**
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  duration INTEGER, -- Minutes
  state TEXT DEFAULT 'open', -- open, closed
  type TEXT DEFAULT 'classic', -- classic (agenda+minutes), structured
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited BOOLEAN DEFAULT true,
  attended BOOLEAN DEFAULT false,
  UNIQUE(meeting_id, user_id)
);

CREATE TABLE meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  notes TEXT,
  position INTEGER DEFAULT 0,
  duration_in_minutes INTEGER,
  item_type TEXT DEFAULT 'simple', -- simple, work_package
  work_package_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  presenter_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- For recurring meetings
CREATE TABLE recurring_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  location TEXT,
  start_time TIME NOT NULL,
  duration INTEGER,
  frequency TEXT NOT NULL, -- daily, working_days, weekly
  interval INTEGER DEFAULT 1,
  end_after INTEGER, -- Number of occurrences, NULL for infinite
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/meetings` | List meetings |
| GET | `/api/v3/meetings/:id` | Get meeting |
| POST | `/api/v3/meetings` | Create meeting |
| PATCH | `/api/v3/meetings/:id` | Update meeting |
| DELETE | `/api/v3/meetings/:id` | Delete meeting |
| GET | `/api/v3/meetings/:id/agenda_items` | List agenda items |
| POST | `/api/v3/meetings/:id/agenda_items` | Add agenda item |

---

## Phase 13: News & Forums

### 13.1 News

**Database Schema:**
```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE news_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  comments TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/news` | List news |
| GET | `/api/v3/news/:id` | Get news item |
| POST | `/api/v3/news` | Create news |
| PATCH | `/api/v3/news/:id` | Update news |
| DELETE | `/api/v3/news/:id` | Delete news |

### 13.2 Forums

**Database Schema:**
```sql
CREATE TABLE forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  topics_count INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  last_message_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE, -- For replies
  subject TEXT NOT NULL,
  content TEXT,
  author_id UUID NOT NULL REFERENCES users(id),
  replies_count INTEGER DEFAULT 0,
  last_reply_id UUID,
  sticky BOOLEAN DEFAULT false, -- Pinned
  locked BOOLEAN DEFAULT false, -- No replies
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 14: Boards (Kanban)

### 14.1 Action Boards

**Database Schema:**
```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  board_type TEXT NOT NULL, -- basic, status, assignee, version, subproject, parent
  display_mode TEXT DEFAULT 'cards', -- cards, table
  options JSONB DEFAULT '{}', -- Filters, highlighting, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE board_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  query_id UUID REFERENCES queries(id) ON DELETE SET NULL, -- Saved filter for list
  -- For action boards, this references the value:
  action_attribute TEXT, -- status_id, assigned_to_id, version_id, parent_id
  action_value UUID, -- The value for this column
  options JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Board Types:**
| Type | Columns Based On | Auto-Update |
|------|------------------|-------------|
| `basic` | Manual | No |
| `status` | Statuses | Yes (status change) |
| `assignee` | Team members | Yes (assignee change) |
| `version` | Versions | Yes (version change) |
| `subproject` | Subprojects | Yes (project change) |
| `parent` | Parent WPs | Yes (parent change) |

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/boards` | List boards |
| GET | `/api/v3/boards/:id` | Get board with lists |
| POST | `/api/v3/boards` | Create board |
| PATCH | `/api/v3/boards/:id` | Update board |
| DELETE | `/api/v3/boards/:id` | Delete board |
| POST | `/api/v3/boards/:id/lists` | Add list |
| PATCH | `/api/v3/boards/:id/lists/:list_id` | Update list |
| DELETE | `/api/v3/boards/:id/lists/:list_id` | Delete list |

---

## Phase 15: Gantt Charts

### 15.1 Gantt View

The Gantt view is primarily a frontend concern using the existing work package data. Backend support needed:

**Additional Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/work_packages/:id/children` | Children WPs |
| POST | `/api/v3/work_packages/:id/relations` | Create relation |
| PATCH | `/api/v3/work_packages/bulk` | Bulk update dates |

**Data Requirements:**
- Start date, Finish date, Duration
- Parent-child hierarchy
- Predecessor/successor relations
- Manual vs automatic scheduling flag
- Milestones (type.is_milestone)
- Non-working days integration

**PostgreSQL Scheduling Function:**
```sql
-- Calculate finish date from start date and duration
CREATE OR REPLACE FUNCTION calculate_finish_date(
  p_start_date DATE,
  p_duration INTEGER, -- Working days
  p_ignore_non_working_days BOOLEAN DEFAULT false
) RETURNS DATE AS $$
DECLARE
  v_finish DATE := p_start_date;
  v_days_added INTEGER := 0;
BEGIN
  IF p_ignore_non_working_days THEN
    RETURN p_start_date + (p_duration - 1);
  END IF;

  WHILE v_days_added < p_duration LOOP
    IF is_working_day(v_finish) THEN
      v_days_added := v_days_added + 1;
    END IF;
    IF v_days_added < p_duration THEN
      v_finish := v_finish + 1;
    END IF;
  END LOOP;

  RETURN v_finish;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 16: Team Planner

### 16.1 Resource Planning View

Team Planner is a frontend view combining calendar with work packages grouped by assignee.

**Backend Requirements:**
- Work packages with dates and assignees
- Working days configuration
- Team member list (project members)

**API Enhancements:**
```typescript
// Optimized endpoint for team planner
GET /api/v3/projects/:id/team_planner
  ?startDate=2024-01-01
  &endDate=2024-01-31
  &assignees[]=uuid1&assignees[]=uuid2

// Returns:
{
  _type: 'TeamPlannerData',
  members: [/* assignees */],
  workPackages: [/* filtered by date range */],
  nonWorkingDays: [/* dates */]
}
```

---

## Phase 17: Calendars

### 17.1 Calendar View

**Backend Requirements:**
- Work packages with start/finish dates
- Meetings (if meetings module enabled)
- Non-working days

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/calendars/ical` | iCalendar feed |
| GET | `/api/v3/projects/:id/calendars/ical` | Project calendar |

**iCalendar Format:**
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OpenProject//Calendar//EN
BEGIN:VEVENT
UID:work_package_123@openproject.local
DTSTART:20240115
DTEND:20240120
SUMMARY:Implement feature X
DESCRIPTION:Work package description...
URL:https://openproject.local/work_packages/123
END:VEVENT
END:VCALENDAR
```

---

## Phase 18: Configuration API

### 18.1 Instance Configuration

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v3/configuration` | Current configuration |
| GET | `/api/v3` | Root/capabilities |

**Configuration Response:**
```json
{
  "_type": "Configuration",
  "maximumAttachmentFileSize": 5242880,
  "perPageOptions": [20, 50, 100],
  "dateFormat": "%Y-%m-%d",
  "timeFormat": "%H:%M",
  "startOfWeek": 1,
  "hoursPerDay": 8,
  "daysPerWeek": 5,
  "selfRegistration": true,
  "userPasswordMinLength": 10,
  "_links": {
    "userPreferences": { "href": "/api/v3/my_preferences" }
  }
}
```

---

## Phase 19: Authentication (Extended)

### 19.1 OAuth 2.0 Provider

**Database Schema:**
```sql
CREATE TABLE oauth_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  uid TEXT NOT NULL UNIQUE, -- client_id
  secret TEXT NOT NULL, -- client_secret (hashed)
  redirect_uri TEXT NOT NULL,
  scopes TEXT DEFAULT 'api_v3',
  confidential BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES users(id),
  owner_type TEXT, -- User or null for global
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE oauth_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_in INTEGER NOT NULL,
  redirect_uri TEXT NOT NULL,
  scopes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE oauth_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES oauth_applications(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,
  expires_in INTEGER,
  scopes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
```

**OAuth Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/oauth/authorize` | Authorization endpoint |
| POST | `/oauth/token` | Token endpoint |
| POST | `/oauth/revoke` | Revoke token |
| GET | `/oauth/userinfo` | OpenID Connect userinfo |

### 19.2 API Tokens

**Database Schema:**
```sql
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_digest TEXT NOT NULL, -- Hashed token
  token_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 20: File Storages (Nextcloud/OneDrive)

### 20.1 Storage Integration

**Database Schema:**
```sql
CREATE TABLE storages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id),
  provider_type TEXT NOT NULL, -- Nextcloud, OneDrive
  name TEXT NOT NULL,
  host TEXT NOT NULL, -- Base URL
  provider_fields JSONB DEFAULT '{}', -- Provider-specific config
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_storages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_id UUID NOT NULL REFERENCES storages(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id),
  project_folder_id TEXT, -- Remote folder ID
  project_folder_mode TEXT, -- inactive, automatic, manual
  UNIQUE(project_id, storage_id)
);

CREATE TABLE file_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_id UUID NOT NULL REFERENCES storages(id) ON DELETE CASCADE,
  container_type TEXT NOT NULL, -- WorkPackage
  container_id UUID NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id),
  origin_id TEXT NOT NULL, -- Remote file ID
  origin_name TEXT NOT NULL,
  origin_mime_type TEXT,
  origin_created_by_name TEXT,
  origin_last_modified_by_name TEXT,
  origin_created_at TIMESTAMPTZ,
  origin_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 21: Integrations

### 21.1 Webhooks

**Database Schema:**
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT, -- For signature verification
  events JSONB NOT NULL DEFAULT '[]', -- ['work_package:created', 'project:updated']
  all_projects BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE webhook_projects (
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (webhook_id, project_id)
);

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  response_code INTEGER,
  response_headers JSONB,
  response_body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Webhook Events:**
| Event | Trigger |
|-------|---------|
| `project:created` | New project |
| `project:updated` | Project changed |
| `work_package:created` | New work package |
| `work_package:updated` | Work package changed |
| `work_package:deleted` | Work package deleted |
| `comment:created` | New comment |
| `time_entry:created` | Time logged |
| `attachment:created` | File attached |
| `membership:created` | Member added |
| `membership:destroyed` | Member removed |

### 21.2 GitHub Integration

**Database Schema:**
```sql
CREATE TABLE github_pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_package_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  github_id BIGINT NOT NULL,
  github_html_url TEXT NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL, -- open, closed, merged
  github_user_login TEXT,
  github_user_avatar_url TEXT,
  github_updated_at TIMESTAMPTZ,
  number INTEGER NOT NULL,
  body TEXT,
  base_branch TEXT,
  head_branch TEXT,
  repository TEXT NOT NULL,
  labels JSONB DEFAULT '[]',
  draft BOOLEAN DEFAULT false,
  merged BOOLEAN DEFAULT false,
  merged_at TIMESTAMPTZ,
  comments_count INTEGER DEFAULT 0,
  review_comments_count INTEGER DEFAULT 0,
  additions INTEGER,
  deletions INTEGER,
  changed_files INTEGER,
  check_runs JSONB DEFAULT '[]', -- GitHub Actions status
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(work_package_id, github_id)
);
```

---

## Implementation Roadmap

### Sprint 1 (Foundation) - 2 weeks
- [ ] Types, Statuses, Priorities (reference data)
- [ ] Workflows (status transitions)
- [ ] Relations (work package links)
- [ ] Seed default data

### Sprint 2 (Work Packages Enhanced) - 2 weeks
- [ ] Parent-child hierarchy
- [ ] Watchers
- [ ] Journals/Activity
- [ ] Attachments

### Sprint 3 (Users & Permissions) - 2 weeks
- [ ] Groups
- [ ] Roles with permissions
- [ ] Permission checking middleware
- [ ] Member role assignments

### Sprint 4 (Queries & Views) - 1 week
- [ ] Saved queries
- [ ] Filter system
- [ ] Column configuration
- [ ] View types

### Sprint 5 (Custom Fields) - 2 weeks
- [ ] Custom field types
- [ ] Custom values storage
- [ ] Schema integration
- [ ] Form configuration

### Sprint 6 (Time & Costs) - 1 week
- [ ] Time entries
- [ ] Time activities
- [ ] Time reports

### Sprint 7 (Content Modules) - 2 weeks
- [ ] Wiki pages
- [ ] News
- [ ] Meetings
- [ ] Forums

### Sprint 8 (Boards & Views) - 2 weeks
- [ ] Kanban boards (action boards)
- [ ] Gantt enhancements
- [ ] Team planner
- [ ] Calendar

### Sprint 9 (Integrations) - 2 weeks
- [ ] Webhooks
- [ ] GitHub integration
- [ ] OAuth provider
- [ ] API tokens

### Sprint 10 (Admin & Config) - 1 week
- [ ] System settings
- [ ] Configuration API
- [ ] Admin panel
- [ ] Branding

### Sprint 11 (Enterprise Features) - 2 weeks
- [ ] File storages (Nextcloud)
- [ ] Advanced permissions
- [ ] Form configuration
- [ ] Date alerts

### Sprint 12 (Polish & Parity) - 2 weeks
- [ ] API response parity testing
- [ ] Frontend pixel-perfect review
- [ ] Performance optimization
- [ ] Documentation

---

## Ruby → TypeScript/PostgreSQL Migration Patterns

### Pattern 1: STI (Single Table Inheritance) → Union Types

**Ruby (STI):**
```ruby
class Principal < ApplicationRecord
end
class User < Principal
end
class Group < Principal
end
```

**TypeScript:**
```typescript
type Principal = User | Group;

interface User {
  _type: 'User';
  id: string;
  email: string;
  name: string;
}

interface Group {
  _type: 'Group';
  id: string;
  name: string;
}
```

### Pattern 2: Polymorphic Associations → Type + ID

**Ruby:**
```ruby
belongs_to :container, polymorphic: true
```

**PostgreSQL:**
```sql
container_type TEXT NOT NULL,
container_id UUID NOT NULL
```

**TypeScript:**
```typescript
interface Attachment {
  containerType: 'WorkPackage' | 'WikiPage' | 'Project';
  containerId: string;
}
```

### Pattern 3: Concerns → Composition

**Ruby (Concern):**
```ruby
module Timestamps
  extend ActiveSupport::Concern
  included do
    validates :created_at, presence: true
  end
end
```

**TypeScript:**
```typescript
// Just use interface extension
interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}

interface WorkPackage extends WithTimestamps {
  // ...
}
```

### Pattern 4: Callbacks → Service Hooks

**Ruby (Callbacks):**
```ruby
after_save :notify_watchers
after_destroy :cleanup_attachments
```

**TypeScript:**
```typescript
// Explicit in service
async function updateWorkPackage(id: string, input: UpdateInput): Promise<Result<WorkPackage, AppError>> {
  const result = await repo.update(id, input);
  if (result.ok) {
    await notificationService.notifyWatchers(result.data);
  }
  return result;
}
```

### Pattern 5: Scopes → Repository Methods

**Ruby:**
```ruby
scope :visible, -> { where(public: true) }
scope :for_user, ->(user) { joins(:members).where(members: { user_id: user.id }) }
```

**TypeScript:**
```typescript
// In repository
async findVisible(): Promise<Project[]> {
  return db.select().from(projects).where(eq(projects.isPublic, true));
}

async findForUser(userId: string): Promise<Project[]> {
  return db.select()
    .from(projects)
    .innerJoin(members, eq(projects.id, members.projectId))
    .where(eq(members.userId, userId));
}
```

### Pattern 6: Service Objects → Pure Functions

**Ruby:**
```ruby
class WorkPackages::CreateService
  def initialize(user:, contract_class: CreateContract)
    @user = user
    @contract_class = contract_class
  end

  def call(params)
    # ...
  end
end
```

**TypeScript (Rust-ready):**
```typescript
// Pure function with explicit dependencies
interface WorkPackageService {
  create(input: CreateInput, actor: User): Promise<Result<WorkPackage, AppError>>;
}

function createWorkPackageService(
  repo: WorkPackageRepository,
  notificationService: NotificationService
): WorkPackageService {
  return {
    async create(input, actor) {
      // Validate
      const validation = validateCreate(input, actor);
      if (!validation.ok) return validation;

      // Create
      const wp = await repo.create(input);

      // Side effects
      await notificationService.notifyCreated(wp, actor);

      return ok(wp);
    }
  };
}
```

### Pattern 7: Representers → HAL Builders

**Ruby (Roar/Representable):**
```ruby
class WorkPackageRepresenter < Roar::Decorator
  property :id
  property :subject
  link :self do
    api_v3_paths.work_package(represented.id)
  end
end
```

**TypeScript:**
```typescript
function representWorkPackage(wp: WorkPackageDTO): HalResource {
  return halResource('WorkPackage', `/api/v3/work_packages/${wp.id}`, {
    id: wp.id,
    subject: wp.title,
    description: formattable(wp.description),
  }, {
    project: { href: `/api/v3/projects/${wp.projectId}` },
    type: { href: `/api/v3/types/${wp.typeId}` },
    status: { href: `/api/v3/statuses/${wp.statusId}` },
  });
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| API Endpoint Parity | 100% |
| HAL Response Match | Byte-identical |
| Database Compatibility | Shared PostgreSQL |
| Frontend Pages | All OpenProject views |
| TypeScript Errors | 0 |
| Container Size | < 50MB |
| Cold Start | < 1s |
| Rust Migration Readiness | > 90% |

---

*Generated from OpenProject documentation, AdaWorldAPI/openproject repository analysis, and openproject-lite audit.*
