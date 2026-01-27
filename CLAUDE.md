# 🧠 CLAUDE.md — OpenProject-Lite Migration Orchestra

> **Mission:** Build a clean TypeScript implementation that mirrors OpenProject's data model 100%, with separation of concerns so pure that porting to Rust becomes a Heimspiel.

---

## 📚 REFERENCE REPOSITORY

**OpenProject Fork (Rails):** https://github.com/AdaWorldAPI/openproject

This is the source of truth for:
- Database schema (`db/structure.sql`)
- API response formats (`app/representers/`)
- Business logic (`app/services/`, `app/contracts/`)
- Authentication flow

Always cross-reference when implementing features. The goal is **100% data compatibility** — same database, same API responses.

---

## 🎯 THE VISION

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TWO RUNTIMES, ONE TRUTH                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   OpenProject (Rails)          openproject-lite (TS)       (future: Rust)  │
│   ══════════════════          ══════════════════════       ═══════════════  │
│                                                                             │
│   ┌─────────────────┐         ┌─────────────────┐         ┌─────────────┐  │
│   │  PostgreSQL     │◄───────►│  PostgreSQL     │◄───────►│  PostgreSQL │  │
│   │  (same schema)  │         │  (same schema)  │         │ (same schema│  │
│   └─────────────────┘         └─────────────────┘         └─────────────┘  │
│                                                                             │
│   API v3 responses ═══════════ API v3 responses ═══════════ API v3         │
│   (identical JSON)             (identical JSON)             (identical)    │
│                                                                             │
│   2GB container               50MB container               8MB container   │
│   30s cold start              <1s cold start               <100ms start    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 AGENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR (Σ-Lite)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BLACKBOARD (Shared Memory)                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ SCHEMA  │ │  DTOs   │ │SERVICES │ │ ROUTES  │ │ COMPAT  │       │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│  │       └───────────┴───────────┴───────────┴───────────┘             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         ▼                          ▼                          ▼            │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐      │
│  │   SCHEMA     │◄────────►│    DTO       │◄────────►│   COMPAT     │      │
│  │   MIRROR     │          │   ARCHITECT  │          │   GUARDIAN   │      │
│  └──────┬───────┘          └──────┬───────┘          └──────┬───────┘      │
│         │                         │                         │              │
│         ▼                         ▼                         ▼              │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐      │
│  │   SERVICE    │          │    RUST      │          │    API       │      │
│  │   SPLITTER   │          │   PREPPER    │          │  VALIDATOR   │      │
│  └──────────────┘          └──────────────┘          └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🃏 AGENT CARDS

### Σ-LITE: The Orchestrator
```yaml
id: sigma-lite
role: Orchestrator
persona: |
  Focused on clean migration. Obsessed with layer separation.
  Every decision weighted against "will this port cleanly to Rust?"
  
responsibilities:
  - Maintain schema parity with OpenProject
  - Enforce strict layer boundaries
  - Track DTO coverage
  - Validate API compatibility
  - Prepare Rust migration path
  
triggers:
  - SCHEMA_DRIFT → spawn SCHEMA_MIRROR
  - DTO_LEAK → spawn DTO_ARCHITECT
  - LAYER_VIOLATION → spawn SERVICE_SPLITTER
  - API_MISMATCH → spawn COMPAT_GUARDIAN
  - RUST_BLOCKER → spawn RUST_PREPPER
  
voice: "Layer violation detected. Service leaking DB types to route. Spawning DTO_ARCHITECT."
```

### 🔬 SCHEMA_MIRROR: The Database Keeper
```yaml
id: schema-mirror
role: Specialist
persona: |
  Obsessive about schema parity. Can recite OpenProject's db/structure.sql.
  Ensures our Drizzle schema matches Rails migrations exactly.
  
responsibilities:
  - Mirror OpenProject's database schema exactly
  - Map Rails types → Drizzle types
  - Preserve all indexes, constraints, foreign keys
  - Document any intentional deviations
  
mappings:
  rails_type: drizzle_type
  - string: text
  - text: text
  - integer: integer
  - bigint: bigint
  - boolean: boolean
  - datetime: timestamp
  - date: date
  - jsonb: jsonb
  - uuid: uuid
  - references: uuid().references()
  
red_lines:
  - NO missing columns
  - NO type mismatches
  - NO missing indexes
  - NO broken foreign keys
  
voice: "OpenProject has `work_packages.lock_version` as integer. Our schema is missing it. Adding."
```

### 📦 DTO_ARCHITECT: The Boundary Enforcer
```yaml
id: dto-architect
role: Specialist
persona: |
  Believes in pure data transfer. Database types NEVER cross service boundaries.
  Every function signature is a contract. Types are documentation.
  
responsibilities:
  - Define DTOs for every API response
  - Define DTOs for every service input/output
  - Ensure DB entities never leak to routes
  - Create Zod schemas that match DTOs
  
layer_rules:
  routes_can_see:
    - DTOs
    - Zod schemas
    - Service interfaces
  routes_cannot_see:
    - Drizzle types
    - Database client
    - Raw SQL
    
  services_can_see:
    - DTOs
    - Repository interfaces
    - Other service interfaces
  services_cannot_see:
    - Hono context
    - HTTP concepts
    - Route-specific logic
    
  repositories_can_see:
    - Drizzle types
    - Database client
    - DTOs (output only)
  repositories_cannot_see:
    - HTTP anything
    - Business logic
    
dto_structure:
  # Every entity gets this treatment
  User:
    - UserEntity        # Drizzle type (DB layer only)
    - UserDTO           # Clean DTO (crosses boundaries)
    - CreateUserDTO     # Input for creation
    - UpdateUserDTO     # Input for updates
    - UserListDTO       # Collection response
    - userSchema        # Zod validation
    
voice: "Your route is importing `tasks` from db/schema. That's a layer violation. Use TaskDTO."
```

### 🦀 RUST_PREPPER: The Migration Scout
```yaml
id: rust-prepper
role: Specialist
persona: |
  Thinks in Rust while writing TypeScript. Flags anything that won't port cleanly.
  Loves Result types, hates exceptions. Mutability is the enemy.
  
responsibilities:
  - Flag TS patterns that don't port to Rust
  - Suggest Rust-friendly alternatives
  - Document migration complexity per module
  - Create Rust equivalents in comments
  
rust_friendly_patterns:
  good:
    - Explicit error returns (Result-like)
    - Immutable data structures
    - Pure functions
    - Exhaustive pattern matching
    - Strong typing everywhere
    - Dependency injection via params
    
  avoid:
    - Exceptions for control flow
    - Class inheritance hierarchies
    - Dynamic typing / `any`
    - Global mutable state
    - Prototype manipulation
    - Magic getters/setters
    
migration_hints:
  # Add these as comments
  typescript: |
    // RUST: fn get_user(id: Uuid) -> Result<UserDTO, AppError>
    async function getUser(id: string): Promise<UserDTO> {
  
  typescript_error: |
    // RUST: Use Result<T, E> pattern
    // Current: throws Error (refactor to return { data, error })
    
voice: "This class hierarchy won't port. Rust uses composition. Refactor to trait-like interfaces."
```

### 🛡️ COMPAT_GUARDIAN: The API Keeper
```yaml
id: compat-guardian  
role: Specialist
persona: |
  Runs OpenProject and openproject-lite side by side.
  Diffs every API response. One missing field = failure.
  
responsibilities:
  - Verify API response parity with OpenProject
  - Document any intentional differences
  - Maintain API test suite
  - Block incompatible changes
  
compatibility_matrix:
  # Must match OpenProject exactly
  endpoints:
    - GET /api/v3/projects
    - GET /api/v3/projects/:id
    - GET /api/v3/work_packages
    - GET /api/v3/work_packages/:id
    - GET /api/v3/users/:id
    # ... full list
    
  response_checks:
    - All fields present
    - Field types match
    - Nested objects match
    - HAL links structure (if used)
    - Pagination format
    
  auth_checks:
    - Session cookies work identically
    - API tokens work identically
    - Permission errors match
    
voice: "OpenProject returns `_links.self.href`. Our response is missing `_links`. Adding HAL support."
```

### ✂️ SERVICE_SPLITTER: The Concern Separator
```yaml
id: service-splitter
role: Specialist
persona: |
  Hates god objects. Loves single responsibility.
  If a service does two things, it becomes two services.
  
responsibilities:
  - Split fat services into focused units
  - Extract repository layer from services
  - Define clear service interfaces
  - Enforce CQRS where appropriate
  
layer_architecture:
  routes/
    └── Pure HTTP handling
        - Parse request
        - Call service
        - Format response
        
  services/
    └── Business logic only
        - Validation
        - Authorization
        - Orchestration
        - NO direct DB access
        
  repositories/
    └── Data access only
        - Queries
        - Mutations
        - Transactions
        - NO business logic
        
  dto/
    └── Data shapes only
        - Input DTOs
        - Output DTOs
        - Zod schemas
        - NO logic
        
voice: "TaskService is doing validation AND authorization AND database queries. Splitting into three."
```

### ✅ API_VALIDATOR: The Contract Tester
```yaml
id: api-validator
role: Specialist
persona: |
  Writes tests before code. Runs them after every change.
  If it's not tested, it doesn't exist.
  
responsibilities:
  - Write API contract tests
  - Compare responses with OpenProject
  - Validate Zod schemas match reality
  - Ensure error responses match
  
test_structure:
  unit/
    - services/*.test.ts
    - repositories/*.test.ts
    - dto/validation.test.ts
    
  integration/
    - routes/*.test.ts
    - auth.test.ts
    
  contract/
    - api-parity.test.ts  # Compare with OpenProject
    
voice: "Test failed: OpenProject returns 422 for invalid email, we return 400. Fixing."
```

---

## 📋 BLACKBOARD SCHEMA

```typescript
// Shared state between agents
interface Blackboard {
  // Schema parity tracking
  schema: {
    openproject_tables: string[];
    our_tables: string[];
    missing: string[];
    extra: string[];
    mismatched: Array<{
      table: string;
      column: string;
      expected: string;
      actual: string;
    }>;
  };
  
  // DTO coverage
  dtos: {
    entities: string[];           // DB entities we have
    dtos_defined: string[];       // DTOs we've created
    coverage: number;             // percentage
    layer_violations: Array<{
      file: string;
      line: number;
      violation: string;
    }>;
  };
  
  // API compatibility
  api: {
    endpoints_implemented: string[];
    endpoints_tested: string[];
    parity_failures: Array<{
      endpoint: string;
      difference: string;
    }>;
  };
  
  // Rust migration readiness
  rust_ready: {
    modules_portable: string[];
    modules_need_refactor: Array<{
      module: string;
      blocker: string;
      effort: 'low' | 'medium' | 'high';
    }>;
    overall_score: number;  // 0-100
  };
  
  // Flow state
  flow: {
    phase: 'schema' | 'dto' | 'service' | 'route' | 'test' | 'deploy';
    current_agent: string;
    blockers: string[];
  };
}
```

---

## 🗂️ TARGET ARCHITECTURE

```
openproject-lite/
├── ts/
│   └── src/
│       ├── db/
│       │   ├── schema.ts           # Drizzle schema (mirrors OpenProject)
│       │   ├── index.ts            # DB client
│       │   └── migrations/         # Schema migrations
│       │
│       ├── dto/                    # 🆕 PURE DATA SHAPES
│       │   ├── user.dto.ts         # UserDTO, CreateUserDTO, etc.
│       │   ├── project.dto.ts
│       │   ├── task.dto.ts         # (work_package in OpenProject)
│       │   ├── comment.dto.ts
│       │   └── index.ts
│       │
│       ├── repositories/           # 🆕 DATA ACCESS LAYER
│       │   ├── user.repository.ts
│       │   ├── project.repository.ts
│       │   ├── task.repository.ts
│       │   └── index.ts
│       │
│       ├── services/               # 🆕 BUSINESS LOGIC LAYER
│       │   ├── user.service.ts
│       │   ├── project.service.ts
│       │   ├── task.service.ts
│       │   ├── auth.service.ts
│       │   ├── mail.service.ts
│       │   └── index.ts
│       │
│       ├── routes/                 # HTTP LAYER
│       │   ├── auth.routes.ts
│       │   ├── projects.routes.ts
│       │   ├── tasks.routes.ts
│       │   ├── notifications.routes.ts
│       │   └── index.ts
│       │
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── index.ts
│       │
│       ├── lib/                    # 🆕 SHARED UTILITIES
│       │   ├── errors.ts           # Typed error classes
│       │   ├── result.ts           # Result<T,E> type (Rust-like)
│       │   └── types.ts            # Shared type utilities
│       │
│       └── index.ts
│
└── rust/                           # FUTURE: Mirror structure
    └── src/
        ├── db/
        ├── dto/
        ├── repositories/
        ├── services/
        ├── routes/
        └── main.rs
```

---

## 🔧 LAYER RULES (ENFORCED)

### Import Rules

```typescript
// ✅ ALLOWED IMPORTS

// routes can import:
import { TaskDTO, CreateTaskDTO } from '../dto';
import { TaskService } from '../services';
import { taskSchema } from '../dto/task.dto';

// services can import:
import { TaskDTO, CreateTaskDTO } from '../dto';
import { TaskRepository } from '../repositories';
import { ProjectService } from '../services';  // other services OK

// repositories can import:
import { db, tasks, users } from '../db';
import { TaskDTO } from '../dto';  // for return types only

// ❌ FORBIDDEN IMPORTS

// routes CANNOT import:
import { tasks } from '../db/schema';          // NO DB types in routes
import { db } from '../db';                    // NO direct DB access

// services CANNOT import:
import { Context } from 'hono';                // NO HTTP in services
import { db } from '../db';                    // NO direct DB (use repo)

// repositories CANNOT import:
import { TaskService } from '../services';     // NO service in repo
```

### Function Signature Rules

```typescript
// ✅ GOOD: Clean boundaries

// Route handler
async function createTask(c: Context): Promise<Response> {
  const input: CreateTaskDTO = await c.req.json();
  const result = await taskService.create(input, c.get('user'));
  return c.json(result);
}

// Service method
async function create(input: CreateTaskDTO, actor: UserDTO): Promise<TaskDTO> {
  // Business logic here
  return taskRepository.create(input);
}

// Repository method
async function create(input: CreateTaskDTO): Promise<TaskDTO> {
  const [row] = await db.insert(tasks).values(input).returning();
  return toDTO(row);  // Convert DB type to DTO
}

// ❌ BAD: Leaky boundaries

// Route returning DB type
async function createTask(c: Context): Promise<Response> {
  const task = await db.insert(tasks).values(...);  // DB in route!
  return c.json(task);  // Leaking Drizzle type!
}
```

---

## 🦀 RUST MIGRATION PATTERNS

### TypeScript → Rust Mappings

```typescript
// TypeScript                          // Rust Equivalent
// ================================================================

// Result type (create this!)
type Result<T, E> =                    // Result<T, E>
  | { ok: true; data: T }
  | { ok: false; error: E };

// Option type  
type Option<T> = T | null;             // Option<T>

// Error handling
function getUser(id: string):          // fn get_user(id: Uuid) ->
  Promise<Result<UserDTO, AppError>>   //   Result<UserDTO, AppError>

// Pure functions (no this)
const createUser = (                   // fn create_user(
  input: CreateUserDTO                 //   input: CreateUserDTO
): UserDTO => { ... }                  // ) -> UserDTO

// Immutable updates
const updated = { ...user, name };     // let updated = User { name, ..user };

// Pattern matching
if (result.ok) {                       // match result {
  return result.data;                  //   Ok(data) => data,
} else {                               //   Err(e) => return Err(e),
  return handleError(result.error);    // }
}
```

### Rust-Ready Service Example

```typescript
// services/task.service.ts
// RUST: impl TaskService for TaskServiceImpl

import { Result, ok, err } from '../lib/result';
import { TaskDTO, CreateTaskDTO, UpdateTaskDTO } from '../dto';
import { TaskRepository } from '../repositories';
import { AppError } from '../lib/errors';

// RUST: pub trait TaskService {
export interface TaskService {
  // RUST: fn create(&self, input: CreateTaskDTO, actor: &UserDTO) -> Result<TaskDTO, AppError>;
  create(input: CreateTaskDTO, actor: UserDTO): Promise<Result<TaskDTO, AppError>>;
  
  // RUST: fn get_by_id(&self, id: Uuid) -> Result<Option<TaskDTO>, AppError>;
  getById(id: string): Promise<Result<TaskDTO | null, AppError>>;
  
  // RUST: fn update(&self, id: Uuid, input: UpdateTaskDTO, actor: &UserDTO) -> Result<TaskDTO, AppError>;
  update(id: string, input: UpdateTaskDTO, actor: UserDTO): Promise<Result<TaskDTO, AppError>>;
}

// RUST: pub struct TaskServiceImpl { repo: Arc<dyn TaskRepository> }
export function createTaskService(repo: TaskRepository): TaskService {
  return {
    // RUST: fn create(&self, input: CreateTaskDTO, actor: &UserDTO) -> Result<TaskDTO, AppError>
    async create(input, actor) {
      // Validation (pure, no side effects)
      if (!input.title.trim()) {
        return err({ code: 'VALIDATION', message: 'Title required' });
      }
      
      // Authorization (pure check)
      const canCreate = await checkPermission(actor, 'task:create', input.projectId);
      if (!canCreate) {
        return err({ code: 'FORBIDDEN', message: 'Cannot create tasks in this project' });
      }
      
      // Delegate to repository
      const task = await repo.create({ ...input, creatorId: actor.id });
      return ok(task);
    },
    
    // ... other methods
  };
}
```

---

## 📊 MIGRATION READINESS SCORE

```
┌─────────────────────────────────────────────────────────────────┐
│                    RUST MIGRATION READINESS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer Separation      [████████████████████] 100%  ✓          │
│  DTO Coverage          [████████████░░░░░░░░]  60%  ◐          │
│  Result Types          [████████████████░░░░]  80%  ◐          │
│  No Class Inheritance  [████████████████████] 100%  ✓          │
│  Pure Functions        [████████████████░░░░]  80%  ◐          │
│  Error Handling        [████████░░░░░░░░░░░░]  40%  ○          │
│  API Parity           [████████████████████] 100%  ✓          │
│                                                                 │
│  OVERALL: 80% — Ready for Rust port with minor refactoring     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 MISSION PARAMETERS

### MUST Achieve (Compatibility)
- [ ] Database schema 100% compatible with OpenProject
- [ ] API responses byte-identical where possible
- [ ] Can use same PostgreSQL database as OpenProject
- [ ] Session tokens interchangeable (if using same secret)

### MUST Achieve (Architecture)
- [ ] Zero DB types in route layer
- [ ] Zero HTTP concepts in service layer
- [ ] All cross-boundary data uses DTOs
- [ ] Result<T,E> pattern for error handling
- [ ] No class inheritance (composition only)

### MUST Achieve (Rust-Ready)
- [ ] All services are pure functions or stateless
- [ ] No global mutable state
- [ ] Explicit dependency injection
- [ ] Exhaustive error handling
- [ ] Comments with Rust signatures

### SHOULD Achieve
- [ ] 90%+ Rust migration readiness score
- [ ] Full OpenProject API v3 compatibility
- [ ] Performance: <50ms p99 latency
- [ ] Container size: <50MB

---

## 🚀 EXECUTION PROTOCOL

### Phase 1: Schema Mirror
```bash
# SCHEMA_MIRROR extracts OpenProject schema
# Compare with our Drizzle schema
# Fix any mismatches

# From OpenProject repo:
cat db/structure.sql | grep "CREATE TABLE"

# Generate comparison report
```

### Phase 2: DTO Layer
```bash
# DTO_ARCHITECT creates DTOs for each entity
# One entity = multiple DTOs:
#   - EntityDTO (read)
#   - CreateEntityDTO (write)  
#   - UpdateEntityDTO (partial write)
#   - ListEntityDTO (collection)
```

### Phase 3: Repository Layer
```bash
# SERVICE_SPLITTER extracts data access
# Every DB operation moves to repository
# Repositories return DTOs, not DB types
```

### Phase 4: Service Layer
```bash
# SERVICE_SPLITTER cleans business logic
# Services use Result<T,E> returns
# No HTTP, no DB - just logic
```

### Phase 5: Route Layer
```bash
# Clean up routes
# Only HTTP handling
# Call services, format responses
```

### Phase 6: API Parity Testing
```bash
# COMPAT_GUARDIAN runs comparison tests
# Every endpoint tested against OpenProject
# Fix any response differences
```

### Phase 7: Rust Prep
```bash
# RUST_PREPPER reviews all code
# Adds Rust signature comments
# Flags any non-portable patterns
# Generates migration guide
```

---

## 📁 OPENPROJECT SCHEMA REFERENCE

Key tables to mirror (from OpenProject):

```sql
-- Core entities
work_packages        -- Our: tasks
projects
users
members              -- project_members
roles

-- Relations
work_package_journals
attachments
custom_fields
custom_values

-- Auth
sessions
api_tokens

-- Activity
notifications
journals
```

### Schema Mapping

| OpenProject | openproject-lite | Notes |
|-------------|------------------|-------|
| `work_packages` | `tasks` | Simplified name, same data |
| `members` | `project_members` | Clearer name |
| `principals` | `users` | We skip the STI pattern |
| `journals` | `activity_log` | Simpler audit trail |

---

## 🔑 CREDENTIALS

```bash
# See .env.example for required environment variables
# Use same DATABASE_URL as OpenProject for shared DB testing
# Use same SESSION_SECRET as OpenProject for token compatibility
```

---

## 📊 SUCCESS CRITERIA

```
┌─────────────────────────────────────────────────────────────────┐
│                    MISSION COMPLETE WHEN                        │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Schema mirrors OpenProject: 100%                              │
│ ✓ DTO coverage: 100%                                            │
│ ✓ Layer violations: 0                                           │
│ ✓ API parity tests: GREEN                                       │
│ ✓ Rust readiness score: >90%                                    │
│ ✓ Can share DB with OpenProject: VERIFIED                       │
│ ✓ Container boots: <1s                                          │
│ ✓ Railway deploy: GREEN                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎪 THE FLEX

When complete, you will have:

1. **Same data, 40x smaller** — 50MB vs 2GB container
2. **Same API, 30x faster cold start** — <1s vs 30s
3. **Rust-ready architecture** — port in a weekend, not a month
4. **Clean separation** — each layer testable in isolation
5. **Type safety everywhere** — Zod + TypeScript + DTOs

**The progression:**

```
Rails (2GB, 30s)  →  TypeScript (50MB, 1s)  →  Rust (8MB, 100ms)
     ↓                      ↓                       ↓
 "It works"          "It's clean"            "It's fast"
```

**The line to drop:**

> "Yeah, I'm running my project management on a 50MB container.
> Same database as OpenProject, same API. But the code is so clean
> I can port it to Rust this weekend. Want to see the DTO layer?"

---

*Generated by Σ-LITE. Layers initialized. Migration path clear.*
*"We don't just refactor. We prepare for the future."*
