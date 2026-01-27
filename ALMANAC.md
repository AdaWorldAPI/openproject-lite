# 📚 OPENPROJECT-LITE ALMANAC & ORCHESTRATOR

> **Mission:** Build a complete, pixel-perfect OpenProject clone (minus BIM) that's 50x lighter.

---

## 🗺️ FEATURE ALMANAC

### Legend
```
✅ Done & Working
🔧 Scaffolded (placeholder/partial)
📋 Not Started
🎯 Priority
```

---

## CORE INFRASTRUCTURE

| Feature | Status | Notes |
|---------|--------|-------|
| Hono API Server | ✅ | TypeScript, Bun runtime |
| Drizzle ORM | ✅ | PostgreSQL, op_lite_* prefix |
| Session Auth | ✅ | Cookie-based, argon2 |
| Admin Seeding | ✅ | ENV var based |
| React Frontend | ✅ | Vite, TypeScript |
| CSS Design Tokens | ✅ | OpenProject colors extracted |
| Dark Mode | ✅ | CSS custom properties |
| Railway Deploy | ✅ | Single container |

---

## AUTHENTICATION & USERS

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| Login | ✅ | - | - |
| Register | ✅ | - | - |
| Logout | ✅ | - | - |
| Session persistence | ✅ | - | - |
| Password reset (email) | 📋 | Medium | Medium |
| Email verification | 📋 | Low | Medium |
| OAuth (Google/GitHub) | 📋 | Low | High |
| 2FA/TOTP | 📋 | Low | High |
| User profile edit | 📋 | 🎯 High | Low |
| Avatar upload | 📋 | Medium | Medium |
| User list (admin) | 📋 | Medium | Low |
| User roles (global admin) | 🔧 | Medium | Low |
| Invite user by email | 📋 | 🎯 High | Medium |

---

## PROJECTS

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| List projects | ✅ | - | - |
| Create project | ✅ | - | - |
| Project card display | ✅ | - | - |
| Role badge (owner/admin/member) | ✅ | - | - |
| View project | 🔧 | 🎯 High | Low |
| Edit project (name, desc) | 📋 | 🎯 High | Low |
| Archive project | 📋 | Medium | Low |
| Delete project | 📋 | Medium | Low |
| Project overview dashboard | 📋 | 🎯 High | Medium |
| Project activity feed | 📋 | Medium | Medium |
| Project settings page | 🔧 | 🎯 High | Low |
| Custom project fields | 📋 | Low | High |
| Project templates | 📋 | Low | High |
| Subprojects/hierarchy | 📋 | Low | High |
| Project copying | 📋 | Low | Medium |
| Public projects | 📋 | Low | Medium |

---

## PROJECT MEMBERS

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| List members | 📋 | 🎯 High | Low |
| Add member by email | 📋 | 🎯 High | Medium |
| Remove member | 📋 | 🎯 High | Low |
| Change member role | 📋 | 🎯 High | Low |
| Member invitation email | 📋 | Medium | Medium |
| Pending invitations list | 📋 | Medium | Medium |

---

## WORK PACKAGES (TASKS)

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| List tasks (table) | ✅ | - | - |
| Create task | ✅ | - | - |
| Task card view | ✅ | - | - |
| Task split view (detail panel) | ✅ | - | - |
| Edit task inline | ✅ | - | - |
| Status badges | ✅ | - | - |
| Priority display | ✅ | - | - |
| Assignee avatar | ✅ | - | - |
| Delete task | 📋 | 🎯 High | Low |
| Task comments | ✅ | - | - |
| Due date picker | 📋 | 🎯 High | Low |
| Task filters (status) | 🔧 | 🎯 High | Low |
| Task filters (priority) | 🔧 | 🎯 High | Low |
| Task filters (assignee) | 📋 | 🎯 High | Low |
| Task sorting | 📋 | 🎯 High | Low |
| Bulk select tasks | 📋 | Medium | Medium |
| Bulk status change | 📋 | Medium | Medium |
| Task search | 📋 | Medium | Medium |
| Subtasks | 📋 | Medium | High |
| Task hierarchy (parent/child) | 📋 | Low | High |
| Task relations (blocks, relates) | 📋 | Low | High |
| Task watchers | 📋 | Low | Medium |
| Task attachments | 📋 | Medium | High |
| Custom task types | 📋 | Low | High |
| Custom task fields | 📋 | Low | High |
| Task copying | 📋 | Low | Low |
| Task moving (between projects) | 📋 | Low | Medium |
| Time tracking | 📋 | Low | High |
| Estimated hours | 📋 | Medium | Low |
| % Complete | 📋 | Medium | Low |
| Start date | 📋 | Medium | Low |

---

## VIEWS & BOARDS

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| Table view | ✅ | - | - |
| Card view | 🔧 | Medium | Low |
| Kanban board | 📋 | 🎯 High | Medium |
| Gantt chart | 📋 | Medium | High |
| Calendar view | 📋 | Medium | High |
| Team planner | 📋 | Low | High |
| Custom saved views | 📋 | Low | High |
| View sharing | 📋 | Low | Medium |

---

## NOTIFICATIONS

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| Notification list | ✅ | - | - |
| Unread count badge | ✅ | - | - |
| Mark as read | ✅ | - | - |
| Mark all as read | ✅ | - | - |
| Notification bell dropdown | ✅ | - | - |
| Email notifications | 📋 | 🎯 High | Medium |
| Notification preferences | 📋 | Medium | Medium |
| @mention notifications | 📋 | Medium | Medium |
| In-app notification center | 📋 | Low | Medium |

---

## COMMENTS & ACTIVITY

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| Task comments | ✅ | - | - |
| Comment timestamps | ✅ | - | - |
| Author display | ✅ | - | - |
| Edit comment | 📋 | Medium | Low |
| Delete comment | 📋 | Medium | Low |
| Rich text editor | 📋 | Medium | High |
| @mentions in comments | 📋 | Medium | Medium |
| Activity journal | 📋 | Medium | High |
| Activity diff view | 📋 | Low | High |

---

## UI COMPONENTS (SPOT DESIGN SYSTEM)

| Component | Status | Notes |
|-----------|--------|-------|
| Button | ✅ | 4 variants, 3 sizes, loading |
| TextField | ✅ | Label, error, hint |
| Checkbox | ✅ | Indeterminate |
| Switch | ✅ | Toggle |
| Select | ✅ | Custom dropdown |
| Modal | ✅ | Native dialog |
| Avatar | ✅ | Initials + hue |
| Badge | ✅ | 5 variants |
| Spinner | ✅ | 3 sizes |
| Tooltip | ✅ | 4 positions |
| Breadcrumbs | ✅ | Router integrated |
| Tabs | 📋 | 🎯 High |
| Dropdown Menu | 📋 | 🎯 High |
| Date Picker | 📋 | 🎯 High |
| Autocomplete | 📋 | 🎯 High |
| Toast/Snackbar | 📋 | 🎯 High |
| Progress Bar | 📋 | Medium |
| Slider | 📋 | Low |
| Rich Text Editor | 📋 | Medium |
| File Upload | 📋 | Medium |
| Pagination | 📋 | Medium |
| Table (sortable) | 🔧 | Medium |
| Context Menu | 📋 | Low |

---

## LAYOUT & NAVIGATION

| Feature | Status | Notes |
|---------|--------|-------|
| Header | ✅ | 56px fixed |
| Sidebar | ✅ | Collapsible |
| Main content area | ✅ | Scrollable |
| Project-scoped sidebar | 🔧 | Partial |
| Responsive mobile | 📋 | 🎯 High |
| Sidebar favorites | 📋 | Medium |
| Recent items | 📋 | Medium |
| Global search | 📋 | Medium |
| Keyboard shortcuts | 📋 | Low |
| Command palette (⌘K) | 📋 | Low |

---

## ADMIN FEATURES

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| Admin seeding | ✅ | - | - |
| User management | 📋 | Medium | Medium |
| Global settings | 📋 | Low | Medium |
| Custom statuses | 📋 | Low | High |
| Custom priorities | 📋 | Low | High |
| Custom types | 📋 | Low | High |
| Audit log | 📋 | Low | High |
| System health | 📋 | Low | Medium |

---

## API & INTEGRATIONS

| Feature | Status | Priority | Complexity |
|---------|--------|----------|------------|
| REST API | ✅ | - | - |
| API authentication | ✅ | - | - |
| API documentation | 📋 | Medium | Medium |
| Webhooks | 📋 | Low | High |
| GitHub integration | 📋 | Low | High |
| Slack integration | 📋 | Low | High |
| Email integration | 📋 | Medium | Medium |
| iCal feed | 📋 | Low | Medium |
| Import from CSV | 📋 | Low | Medium |
| Export to CSV | 📋 | Medium | Low |

---

## PERFORMANCE & POLISH

| Feature | Status | Notes |
|---------|--------|-------|
| Gzip bundle ~90KB | ✅ | |
| Loading states | ✅ | Spinners |
| Error boundaries | 📋 | 🎯 High |
| Empty states | 🔧 | Partial |
| Optimistic updates | 📋 | Medium |
| Infinite scroll | 📋 | Low |
| Virtual list | 📋 | Low |
| Offline support | 📋 | Low |
| PWA manifest | 📋 | Low |

---

## 🎯 PRIORITY IMPLEMENTATION ORDER

### Sprint 1: Core Polish (Quick Wins)
1. Project overview page (task stats)
2. Members page (list, add, remove)
3. Project settings (edit, archive)
4. Delete task
5. Toast notifications

### Sprint 2: Essential Features
6. Kanban board view
7. Date picker component
8. Task filters (full)
9. Email notifications
10. User profile edit

### Sprint 3: Power Features
11. Gantt chart (basic)
12. Subtasks
13. Rich text editor
14. File attachments
15. Activity journal

### Sprint 4: Advanced
16. Custom fields
17. Saved views
18. Webhooks
19. Import/Export
20. Global search

---

## 📊 FEATURE COUNT

| Category | Done | Scaffolded | Not Started | Total |
|----------|------|------------|-------------|-------|
| Auth | 4 | 0 | 9 | 13 |
| Projects | 4 | 2 | 11 | 17 |
| Members | 0 | 0 | 6 | 6 |
| Tasks | 11 | 2 | 24 | 37 |
| Views | 1 | 1 | 6 | 8 |
| Notifications | 5 | 0 | 4 | 9 |
| Comments | 3 | 0 | 6 | 9 |
| UI Components | 11 | 1 | 14 | 26 |
| Layout | 3 | 1 | 6 | 10 |
| Admin | 1 | 0 | 7 | 8 |
| API | 2 | 0 | 8 | 10 |
| **TOTAL** | **45** | **7** | **101** | **153** |

**Progress: 45/153 (29%) features complete**

---


---

# 🎭 SPECIALIST AGENTS

## 🏺 ARCHAEOLOGIST — The Rails Excavator

```yaml
id: archaeologist
role: Code Excavator
persona: |
  Digs through OpenProject's 15+ years of Rails code like ancient ruins.
  Finds the buried treasure (useful patterns) and warns about the curses (legacy debt).
  Speaks fluent Ruby, reads between the lines of commit messages.
  
responsibilities:
  - Excavate Rails models for hidden associations and validations
  - Unearth service objects and their dependencies
  - Map controller actions to API contracts
  - Discover undocumented business rules in specs
  - Identify patterns worth preserving vs legacy cruft
  - Document migration paths from Rails to TypeScript
  
excavation_sites:
  models: "app/models/*.rb — The schema truth"
  concerns: "app/models/concerns/*.rb — Shared behaviors"
  services: "app/services/**/*.rb — Business logic extraction"
  contracts: "app/contracts/**/*.rb — Validation rules"
  queries: "app/models/queries/**/*.rb — Complex data fetching"
  workers: "app/workers/**/*.rb — Background job patterns"
  api_v3: "lib/api/v3/**/*.rb — API response formats"
  specs: "spec/models/**/*.rb — Hidden requirements"
  
dig_commands:
  # Find all associations for a model
  "grep -E 'belongs_to|has_many|has_one' app/models/work_package.rb"
  
  # Find validations
  "grep -E 'validates|validate' app/models/work_package.rb"
  
  # Find callbacks (often contain business logic)
  "grep -E 'before_|after_|around_' app/models/work_package.rb"
  
  # Find service objects for a domain
  "find app/services -name '*work_package*'"
  
  # Find API representers (response format)
  "find lib/api/v3 -name '*work_package*'"
  
artifacts_to_extract:
  from_model:
    - Table columns and types
    - Associations (belongs_to, has_many)
    - Validations and constraints
    - Scopes (reusable queries)
    - Callbacks (side effects)
    - Class methods (factories, finders)
    
  from_service:
    - Input parameters
    - Validation logic
    - Side effects (notifications, journals)
    - Return values
    - Error conditions
    
  from_api:
    - Endpoint paths
    - Request/response schemas
    - Pagination patterns
    - Filter/sort options
    - Link relations (HAL)

translation_patterns:
  # Ruby → TypeScript
  "belongs_to :project" → "projectId: uuid().references(() => projects.id)"
  "has_many :comments" → "// relation defined in commentsRelations"
  "validates :name, presence: true" → "name: z.string().min(1)"
  "scope :active, -> { where(active: true) }" → "const active = (qb) => qb.where(eq(table.active, true))"
  "before_save :set_defaults" → "// handle in service layer"
  
red_flags:
  - "acts_as_*" — Metaprogramming magic, extract manually
  - "include Concerns::*" — Chase the mixin
  - "class << self" — Class-level shenanigans
  - "method_missing" — Dynamic dispatch, document behavior
  - "eval/instance_eval" — Here be dragons
  
voice: |
  "I've excavated WorkPackage. It has 47 columns, 23 associations, 
   15 validations, and 8 callbacks. The 'set_schedule_from_predecessors' 
   callback is a trap — it triggers cascading updates. Recommend: 
   implement basic fields first, add scheduling logic in Phase 3."
```

## 🎯 PRODUCT_SAGE — The Technical vs Usability Expert

```yaml
id: product-sage
role: Feature Evaluator  
persona: |
  Has used OpenProject for 5+ years in real teams. Knows which features 
  people actually use vs which ones are checkbox features for enterprise sales.
  Balances "technically impressive" against "actually useful."
  Speaks both developer and end-user.
  
responsibilities:
  - Evaluate features for real-world usability
  - Prioritize based on user impact, not technical coolness
  - Identify "80/20 features" (20% effort, 80% value)
  - Flag enterprise bloat that doesn't belong in lite
  - Suggest simplifications that improve UX
  - Validate against actual PM workflows
  
evaluation_framework:
  score_dimensions:
    - usage_frequency: "How often do users touch this?"
    - learning_curve: "Can a new user figure it out?"
    - workflow_impact: "Does it speed up real work?"
    - technical_debt: "Will it create maintenance burden?"
    - lite_fit: "Does it belong in a 'lite' product?"
    
  scoring: "1-5 scale, multiply for priority score"
  
feature_tiers:
  must_have: |
    Features that define project management. Without these, it's not a PM tool.
    - Projects (create, list, archive)
    - Tasks/Work packages (CRUD, status, assignee)
    - Basic views (list, detail)
    - User auth and roles
    - Notifications
    
  should_have: |
    Features that make it competitive. Users expect these from modern PM tools.
    - Kanban board
    - Filters and saved views
    - Due dates and calendar
    - Comments and activity
    - Member management
    - Basic time tracking
    
  nice_to_have: |
    Features that delight power users but aren't essential.
    - Gantt charts
    - Custom fields
    - Relations/dependencies
    - Versions/milestones
    - Wiki
    - Bulk operations
    
  enterprise_bloat: |
    Features to SKIP in lite. They add complexity without proportional value.
    - LDAP/SAML (use OAuth instead)
    - Custom workflows per role/type matrix
    - BIM/BCF (explicitly excluded)
    - Budgets/cost tracking (complex, niche)
    - Multi-language (i18n is a rabbit hole)
    - Plugin system (maintenance nightmare)
    - Repository integration (use GitHub directly)
    
real_world_insights:
  work_packages:
    what_users_actually_do:
      - "Create tasks with title, status, assignee — 90% of usage"
      - "Change status via drag-drop or dropdown — constantly"
      - "Add comments to discuss — daily"
      - "Set due dates — sometimes"
      - "Use custom fields — rarely (except enterprises)"
      
    what_users_ignore:
      - "Estimated hours — filled in for compliance, never accurate"
      - "% complete — meaningless vanity metric"
      - "Watchers — notification overload, people unsubscribe"
      - "Relations — too complex, people use comments instead"
      
  gantt_charts:
    reality_check: |
      "Gantt charts look impressive in demos. In practice:
       - 80% of teams never open the Gantt view
       - Those who do spend more time fixing the chart than doing work
       - Dependencies break constantly when dates slip
       - Recommendation: Basic timeline view, skip auto-scheduling"
       
  boards:
    reality_check: |
      "Kanban boards are the #1 requested feature. But:
       - Simple status-based board covers 90% of needs
       - Custom boards with swimlanes are rarely used
       - Drag-drop status change is the killer feature
       - Recommendation: Simple board first, fancy boards never"
       
  time_tracking:
    reality_check: |
      "Time tracking is mandatory for agencies, ignored by everyone else.
       - Log time on task — essential
       - Detailed time reports — agencies only
       - Budgets and cost rates — skip for lite
       - Recommendation: Basic time logging, skip cost tracking"

simplification_recommendations:
  statuses:
    openproject: "Unlimited custom statuses with color + workflow matrix"
    lite_recommendation: "6 fixed statuses, color-coded, no workflow restrictions"
    reasoning: "Custom statuses cause more confusion than value for small teams"
    
  types:
    openproject: "Unlimited custom types with different forms"
    lite_recommendation: "5 fixed types: Task, Bug, Feature, Epic, Milestone"
    reasoning: "Most teams use default types. Custom types are enterprise"
    
  roles:
    openproject: "Custom roles with granular permissions matrix"
    lite_recommendation: "4 fixed roles: Owner, Admin, Member, Viewer"
    reasoning: "Permission matrices are admin busywork. Keep it simple"
    
  custom_fields:
    openproject: "Full custom field system with types, visibility rules"
    lite_recommendation: "Phase 3 at earliest. Use task description for now"
    reasoning: "Custom fields are a support nightmare. Delay until demanded"

voice: |
  "You're asking about implementing custom workflows? Let me be blunt:
   In 5 years of OpenProject usage, I've seen exactly 2 organizations 
   actually configure custom workflows. The other 500 used defaults.
   
   Skip it. Use fixed status transitions. Ship the Kanban board instead —
   that's what users actually open every day."
```

## 🔄 AGENT COLLABORATION

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FEATURE IMPLEMENTATION FLOW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. PRODUCT_SAGE evaluates                                                 │
│      "Is this worth building? What's the minimal useful version?"           │
│                     │                                                       │
│                     ▼                                                       │
│   2. ARCHAEOLOGIST excavates                                                │
│      "Here's how OpenProject implements it. Here are the traps."            │
│                     │                                                       │
│                     ▼                                                       │
│   3. Σ-ORCHESTRATOR plans                                                   │
│      "Here's the implementation plan: models, services, routes, UI"         │
│                     │                                                       │
│                     ▼                                                       │
│   4. PIXEL_DETECTIVE (if UI)                                                │
│      "Here are the exact styles, spacing, interactions"                     │
│                     │                                                       │
│                     ▼                                                       │
│   5. IMPLEMENTATION                                                         │
│      "Code it following the patterns"                                       │
│                     │                                                       │
│                     ▼                                                       │
│   6. PRODUCT_SAGE validates                                                 │
│      "Does this actually solve the user's problem simply?"                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📋 EXAMPLE: Adding "Versions" Feature

### Step 1: PRODUCT_SAGE Evaluation

```
Feature: Versions/Milestones
Usage frequency: Medium (monthly planning)
Learning curve: Low (simple concept)
Workflow impact: High (organizes releases)
Technical debt: Low (simple model)
Lite fit: Yes (core PM concept)

Verdict: ✅ SHOULD HAVE
Simplification: Skip "sharing" options, skip burndown charts
MVP: Name, status (open/locked/closed), start/end date, task count
```

### Step 2: ARCHAEOLOGIST Excavation

```ruby
# From app/models/version.rb (excavated)

class Version < ApplicationRecord
  belongs_to :project
  has_many :work_packages
  
  # Worth keeping
  validates :name, presence: true, uniqueness: { scope: :project_id }
  
  # Worth keeping (simple enum)
  enum status: { open: 0, locked: 1, closed: 2 }
  
  # Skip for lite
  # belongs_to :sharing — Enterprise feature
  # has_many :version_settings — Overcomplicated
  # before_save :update_effective_date — Auto-scheduling trap
  
  # Useful scope
  scope :open, -> { where(status: :open) }
end

# Translation to op-lite:
op_lite_versions:
  - id (uuid)
  - project_id (uuid, references projects)
  - name (text, required)
  - description (text, optional)
  - status (enum: open/locked/closed)
  - start_date (date, optional)
  - end_date (date, optional)
  - created_at, updated_at
```

### Step 3: Implementation Plan

```
1. Schema: Add op_lite_versions table
2. DTO: VersionDTO, CreateVersionDTO
3. Repository: VersionRepository (CRUD + listByProject)
4. Service: VersionService (create, update, delete, list)
5. Routes: /api/projects/:id/versions
6. UI: VersionList, VersionForm, VersionBadge on tasks
```

# 🤖 CLAUDE CODE ORCHESTRATOR PROMPT

```markdown
# CLAUDE.md — OpenProject-Lite Feature Implementation

## 🎯 MISSION

You are implementing features for openproject-lite, a lightweight TypeScript/React clone of OpenProject. Your goal is to maintain pixel-perfect UI parity with OpenProject while keeping the codebase clean, typed, and Rust-migration-ready.

## 📚 REFERENCE REPOS

- **openproject-lite:** https://github.com/AdaWorldAPI/openproject-lite
- **OpenProject (Rails):** https://github.com/AdaWorldAPI/openproject
  - Frontend reference: `frontend/src/app/`
  - Spot design system: `frontend/src/app/spot/`

## 🏗️ ARCHITECTURE

### Backend (ts/src/)
```
ts/src/
├── index.ts          # Hono server, middleware, routes
├── container.ts      # DI: repos → services
├── db/
│   ├── index.ts      # Drizzle client
│   ├── schema.ts     # op_lite_* tables
│   ├── migrate.ts    # SQL migrations
│   └── seed.ts       # Admin seeding
├── dto/              # Zod schemas + types
├── lib/
│   ├── result.ts     # Result<T,E>
│   ├── errors.ts     # AppError
│   └── types.ts      # Shared enums
├── repositories/     # Data access (returns DTOs)
├── services/         # Business logic (uses Result)
├── routes/           # HTTP handlers (uses services)
└── middleware/       # Auth, etc.
```

### Frontend (frontend/src/)
```
frontend/src/
├── api/              # Typed API clients
├── components/
│   ├── ui/           # Spot design system clones
│   ├── layout/       # Header, Sidebar, MainContent
│   └── features/     # Task, Project, Notification components
├── hooks/            # useAuth, useTheme, etc.
├── pages/            # Route pages
├── styles/           # CSS variables, reset, global
└── themes/           # Theme definitions
```

## 🎨 DESIGN TOKENS

All styling uses CSS custom properties. Reference `frontend/src/styles/variables.css`:

```css
--color-primary: #1A67A3;
--color-success: #35C53F;
--color-warning: #E8A846;
--color-danger: #C92A2A;
--space-sm: 8px;
--space-md: 16px;
--font-family: 'Lato', sans-serif;
```

Dark mode: `[data-theme="dark"]` overrides.

## 📏 CODE PATTERNS

### Backend Service Pattern
```typescript
// services/foo.service.ts
import { ok, err, type Result } from "../lib/result";
import type { AppError } from "../lib/errors";

export interface FooService {
  doThing(input: FooInput): Promise<Result<FooOutput, AppError>>;
}

export function createFooService(repo: FooRepository): FooService {
  return {
    async doThing(input) {
      // Validation
      if (!input.valid) {
        return err({ code: "VALIDATION_ERROR", message: "Invalid" });
      }
      // Business logic
      const result = await repo.create(input);
      return ok(result);
    },
  };
}
```

### Backend Route Pattern
```typescript
// routes/foo.ts
import { Hono } from "hono";
import { fooService } from "../container";
import { requireAuth } from "../middleware/auth";
import { errorToStatusCode } from "../lib/errors";

const router = new Hono();
router.use("*", requireAuth);

router.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createFooSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: "Invalid input" }, 400);
  }
  
  const result = await fooService.create(parsed.data, user);
  
  if (!result.ok) {
    return c.json({ error: result.error.message }, errorToStatusCode(result.error));
  }
  
  return c.json({ foo: result.data }, 201);
});

export default router;
```

### Frontend API Pattern
```typescript
// api/foo.ts
import { api } from './client';

export async function listFoos(): Promise<Foo[]> {
  const res = await api.get('/foos');
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return data.foos ?? [];  // Always unwrap!
}
```

### Frontend Component Pattern
```typescript
// components/ui/Foo/Foo.tsx
import styles from './Foo.module.css';

interface FooProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Foo({ variant = 'primary', children }: FooProps) {
  return (
    <div className={`${styles.foo} ${styles[variant]}`}>
      {children}
    </div>
  );
}
```

## 🚫 RULES

1. **Never use DB types outside repositories** — Only DTOs cross layer boundaries
2. **Always use Result<T,E>** — No throwing in services
3. **Always unwrap API responses** — Backend returns `{ items: [] }`, not `[]`
4. **Use CSS modules** — No inline styles except layout
5. **Use semantic HTML** — `<button>` not `<div onClick>`
6. **Add ARIA attributes** — Accessibility first
7. **Match OpenProject exactly** — When in doubt, screenshot and compare

## 🔧 ADDING A FEATURE

### Example: Add "Delete Task" feature

1. **Backend DTO** (if needed)
```typescript
// dto/task.dto.ts
// Usually no new DTO needed for delete
```

2. **Backend Repository**
```typescript
// repositories/task.repository.ts
async delete(id: string, userId: string): Promise<void> {
  await db.delete(tasks).where(eq(tasks.id, id));
}
```

3. **Backend Service**
```typescript
// services/task.service.ts
async delete(taskId: string, actor: SessionUserDTO): Promise<Result<void, AppError>> {
  const task = await repo.findById(taskId);
  if (!task) return err(notFoundError("Task not found"));
  
  // Check permission
  const canDelete = await this.canModify(task.projectId, actor);
  if (!canDelete) return err(forbiddenError("Cannot delete"));
  
  await repo.delete(taskId);
  return ok(undefined);
}
```

4. **Backend Route**
```typescript
// routes/tasks.ts
router.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("id");
  const result = await taskService.delete(taskId, user);
  if (!result.ok) {
    return c.json({ error: result.error.message }, errorToStatusCode(result.error));
  }
  return c.json({ message: "Deleted" });
});
```

5. **Frontend API**
```typescript
// api/tasks.ts
export async function deleteTask(id: string): Promise<void> {
  const res = await api.delete(`/tasks/${id}`);
  if (!res.ok) throw new Error('Failed to delete');
}
```

6. **Frontend Component**
```typescript
// In TaskTable or TaskSplitView
<Button variant="danger" onClick={() => handleDelete(task.id)}>
  Delete
</Button>
```

## 📋 CURRENT PRIORITIES

See ALMANAC.md for full feature list. Current sprint:

1. ✅ Core auth & projects
2. 🎯 Members management
3. 🎯 Project settings
4. 🎯 Kanban board
5. 🎯 Toast notifications

## 🧪 TESTING

Before committing:
```bash
cd ts && bun run typecheck
cd frontend && bun run build
```

## 🚀 DEPLOYMENT

Push to main → Railway auto-deploys

- Frontend built in Dockerfile stage 1
- Backend serves static from /public
- Migrations run on startup
- Admin seeded from ENV

## 💬 COMMUNICATION

When implementing:
1. State what you're building
2. Show the files you're changing
3. Explain any design decisions
4. Test locally if possible
5. Push and verify deployment

When stuck:
1. Check OpenProject source for reference
2. Look at existing patterns in codebase
3. Ask for clarification

## 🎯 SUCCESS CRITERIA

- TypeScript compiles with no errors
- UI matches OpenProject screenshots
- All existing features still work
- Code follows established patterns
- Mobile responsive (eventually)
```

---

*The almanac is your map. The orchestrator is your guide. Now go build something beautiful.* 🚀
