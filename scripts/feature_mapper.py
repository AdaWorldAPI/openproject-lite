#!/usr/bin/env python3
"""
OpenProject Feature Mapper
===========================
Scrapes docs for the "what" (features, UI, behavior)
Mines Rails source for the "how" (models, controllers, routes)
Combines into a complete feature map for openproject-lite

Usage:
  python3 feature_mapper.py > FEATURE_MAP.md
"""

import json

# ============================================
# DOCS STRUCTURE (scraped from openproject.org/docs)
# ============================================

DOCS_STRUCTURE = {
    "system-admin-guide": {
        "users-and-permissions": [
            "users", "groups", "roles-permissions", "avatars",
            "ldap-authentication", "saml", "oidc-providers",
            "placeholder-users", "user-preferences"
        ],
        "work-packages": [
            "types", "status", "workflows", "custom-fields",
            "custom-actions", "work-package-settings"
        ],
        "projects": [
            "project-templates", "project-attributes",
            "project-custom-fields", "project-life-cycle"
        ],
        "custom-fields": [
            "text-fields", "list-fields", "date-fields", "user-fields",
            "version-fields", "boolean-fields"
        ],
        "attribute-help-texts": ["help-texts"],
        "calendars-and-dates": [
            "working-days", "date-formats", "non-working-days"
        ],
        "system-settings": [
            "general", "display", "attachments", "projects",
            "repositories", "activity", "incoming-mails"
        ],
        "emails-and-notifications": [
            "email-delivery", "notification-settings",
            "digest-settings", "email-reminders"
        ],
        "api-and-webhooks": [
            "api-keys", "webhooks", "api-settings"
        ],
        "authentication": [
            "authentication-settings", "password-policies",
            "two-factor-authentication", "session-settings"
        ],
        "gdpr": ["data-privacy"],
        "announcement": ["system-announcements"],
        "design": [
            "colors", "logo", "favicon", "custom-css",
            "login-page", "touch-icon"
        ],
        "colors": ["work-package-colors", "status-colors"],
        "time-and-costs": [
            "time-activities", "cost-types", "budgets"
        ],
        "backlogs": ["backlogs-settings"],
        "documents": ["document-categories"],
        "files": ["file-storages", "nextcloud", "onedrive"],
        "subscription": ["plan-management"],
        "slack-integration": ["slack-setup"],
        "plugins": ["plugin-management"],
        "backup": ["backup-settings"],
        "information": ["system-information", "logs"]
    },
    "user-guide": {
        "account-settings": [
            "profile", "notifications", "email", "access-tokens"
        ],
        "home": ["global-modules", "my-page", "activity"],
        "portfolios": ["portfolio-management"],
        "projects": [
            "project-overview", "project-settings", "project-members",
            "project-status", "project-templates"
        ],
        "work-packages": [
            "list-view", "table-view", "card-view", "split-view",
            "create", "edit", "copy", "move", "delete",
            "relations", "hierarchies", "watchers", "export"
        ],
        "gantt-chart": [
            "manual-scheduling", "auto-scheduling",
            "dependencies", "milestones", "versions"
        ],
        "team-planner": ["resource-planning"],
        "agile-boards": [
            "basic-board", "status-board", "version-board",
            "assignee-board", "subproject-board"
        ],
        "backlogs-scrum": [
            "product-backlog", "sprint-backlog", "taskboard"
        ],
        "calendar": ["calendar-views"],
        "news": ["news-management"],
        "forums": ["discussions"],
        "wiki": ["wiki-pages", "wiki-macros"],
        "time-and-costs": [
            "log-time", "track-costs", "reports", "budgets"
        ],
        "documents": ["document-management"],
        "meetings": [
            "classic-meetings", "dynamic-meetings", "meeting-minutes"
        ],
        "repository": ["git-integration", "svn-integration"],
        "members": ["member-management", "invitations"],
        "file-management": ["file-upload", "file-linking"],
        "notifications": [
            "in-app-notifications", "email-notifications",
            "notification-center"
        ]
    }
}

# ============================================
# RAILS MODELS (from app/models)
# ============================================

RAILS_MODELS = {
    "core": [
        "User", "Group", "AnonymousUser", "DeletedUser", "SystemUser",
        "Project", "ProjectQuery", "EnabledModule",
        "WorkPackage", "Type", "Status", "Priority",
        "Version", "Category", "Relation",
        "Role", "RolePermission", "Member", "MemberRole",
        "Attachment", "Comment", "Journal", "Activity",
        "Notification", "ReminderNotification",
        "Setting", "CustomStyle", "DesignColor"
    ],
    "custom_fields": [
        "CustomField", "CustomValue", "CustomOption",
        "CustomFieldSection", "CustomFieldsProject",
        "UserCustomField", "GroupCustomField",
        "WorkPackageCustomField", "ProjectCustomField",
        "VersionCustomField"
    ],
    "auth": [
        "AuthProvider", "LdapAuthSource", "Token",
        "UserPassword", "UserPreference", "UserAuthProviderLink",
        "RemoteIdentity", "OauthClient"
    ],
    "collaboration": [
        "Forum", "Message", "Wiki", "WikiPage", "WikiRedirect",
        "News", "Document", "Meeting", "MeetingAgenda"
    ],
    "time_tracking": [
        "TimeEntry", "CostEntry", "CostType", "Budget",
        "LaborBudgetItem", "MaterialBudgetItem"
    ],
    "scm": [
        "Repository", "Changeset", "Change"
    ],
    "agile": [
        "View", "Query", "Workflow", "Board", "Sprint"
    ],
    "enterprise": [
        "EnterpriseToken", "EnterpriseTrial",
        "Announcement", "Backup"
    ]
}

# ============================================
# RAILS CONTROLLERS (from app/controllers)
# ============================================

RAILS_CONTROLLERS = {
    "admin": [
        "AdminController", "UsersController", "GroupsController",
        "RolesController", "CustomFieldsController", "TypesController",
        "StatusesController", "WorkflowsController", "EnumerationsController",
        "SettingsController", "ColorsController", "CustomStylesController",
        "AuthenticationController", "LdapAuthSourcesController",
        "AnnouncementsController", "BackupsController", "PluginsController"
    ],
    "projects": [
        "ProjectsController", "MembersController", "VersionsController",
        "CategoriesController", "RepositoriesController", "WikisController"
    ],
    "work_packages": [
        "WorkPackagesController", "WorkPackageRelationsController",
        "JournalsController", "AttachmentsController", "ActivitiesController",
        "WatchersController"
    ],
    "time": [
        "TimeEntriesController", "CostEntriesController", "BudgetsController",
        "CostReportsController"
    ],
    "collaboration": [
        "NewsController", "ForumsController", "MessagesController",
        "WikiPagesController", "DocumentsController", "MeetingsController"
    ],
    "user": [
        "AccountController", "MyController", "UsersController",
        "NotificationsController", "UserPreferencesController"
    ],
    "api": [
        "Api::V3::*"  # Many API controllers
    ]
}

# ============================================
# FEATURE MAP GENERATION
# ============================================

FEATURE_MAP = """
# 🗺️ OPENPROJECT FEATURE MAP

> **Source of Truth:** OpenProject docs + Rails source code
> **Target:** openproject-lite TypeScript implementation

---

## 📊 COVERAGE MATRIX

### System Administration

| Admin Section | Docs Pages | Rails Model | Rails Controller | op-lite Status |
|---------------|------------|-------------|------------------|----------------|
| Users & Permissions | users, groups, roles | User, Group, Role, Member | UsersController, GroupsController | 🔧 Partial |
| Work Packages Config | types, status, workflows | Type, Status, Workflow | TypesController, StatusesController | 📋 Not Started |
| Projects Config | templates, attributes | Project, ProjectQuery | ProjectsController | 🔧 Partial |
| Custom Fields | all field types | CustomField, CustomValue | CustomFieldsController | 📋 Not Started |
| System Settings | general, display, etc | Setting | SettingsController | 📋 Not Started |
| Emails & Notifications | delivery, settings | Notification, DigestSettings | NotificationsController | 🔧 Partial |
| API & Webhooks | keys, webhooks | Token, Webhook | ApiController | 📋 Not Started |
| Authentication | settings, 2FA, LDAP | AuthProvider, LdapAuthSource | AuthenticationController | ✅ Basic |
| Design | colors, logo, CSS | CustomStyle, DesignColor | CustomStylesController | 🔧 Tokens Only |
| Time & Costs | activities, types | TimeEntry, CostType | TimeEntriesController | 📋 Not Started |

### User Features

| Feature | Docs Section | Rails Models | Rails Controllers | op-lite Status |
|---------|--------------|--------------|-------------------|----------------|
| Project List | projects | Project | ProjectsController | ✅ Done |
| Project Overview | project-home | Project, Widget | ProjectsController | 📋 Not Started |
| Project Members | members | Member, MemberRole | MembersController | 📋 Not Started |
| Work Packages | work-packages | WorkPackage, Type, Status | WorkPackagesController | ✅ Basic |
| WP Table View | work-package-views | Query, View | QueriesController | ✅ Basic |
| WP Split View | work-package-views | WorkPackage | WorkPackagesController | ✅ Done |
| WP Relations | relations-hierarchies | Relation | RelationsController | 📋 Not Started |
| Gantt Chart | gantt-chart | WorkPackage, Version | GanttController | 📋 Not Started |
| Agile Boards | agile-boards | Board, Query | BoardsController | 📋 Not Started |
| Calendar | calendar | WorkPackage | CalendarController | 📋 Not Started |
| Team Planner | team-planner | WorkPackage, User | TeamPlannerController | 📋 Not Started |
| Time Tracking | time-and-costs | TimeEntry | TimeEntriesController | 📋 Not Started |
| Notifications | notifications | Notification | NotificationsController | ✅ Basic |
| Wiki | wiki | Wiki, WikiPage | WikiController | 📋 Not Started |
| News | news | News | NewsController | 📋 Not Started |
| Forums | forums | Forum, Message | ForumsController | 📋 Not Started |
| Documents | documents | Document | DocumentsController | 📋 Not Started |
| Meetings | meetings | Meeting | MeetingsController | 📋 Not Started |

---

## 🏗️ MODEL MAPPING

### Core Models

| OpenProject Model | op-lite Table | Fields Mapped | Notes |
|-------------------|---------------|---------------|-------|
| User | op_lite_users | ✅ Core fields | Missing: preferences, avatar upload |
| Project | op_lite_projects | ✅ Core fields | Missing: custom fields, modules |
| WorkPackage | op_lite_tasks | 🔧 Basic fields | Missing: ~40 fields |
| Member | op_lite_project_members | ✅ Basic | Missing: multiple roles |
| Type | ❌ | - | Need to add |
| Status | ❌ (enum) | - | Using enum, need table |
| Priority | ❌ (enum) | - | Using enum, need table |
| Version | ❌ | - | Need to add |
| Role | ❌ (enum) | - | Using enum, need table |
| Comment | op_lite_comments | ✅ Basic | Missing: journals |
| Notification | op_lite_notifications | ✅ Basic | Missing: digest |
| Session | op_lite_sessions | ✅ | - |

### Missing Core Models (Need to Add)

```
Type          - Work package types (Bug, Feature, Task, etc.)
Status        - Custom statuses with workflows
Priority      - Custom priorities
Version       - Project versions/milestones
Category      - Work package categories
Relation      - WP dependencies (blocks, relates, etc.)
Workflow      - Status transitions per role/type
Journal       - Activity/audit log
TimeEntry     - Time tracking
Attachment    - File uploads
CustomField   - User-defined fields
CustomValue   - Custom field values
Query         - Saved views/filters
View          - UI view configurations
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Core Parity (MVP++)

| Feature | Docs Reference | Model Needed | Effort |
|---------|----------------|--------------|--------|
| Custom Statuses | system-admin-guide/work-packages/status | Status table | Medium |
| Custom Types | system-admin-guide/work-packages/types | Type table | Medium |
| Custom Priorities | system-admin-guide/work-packages/types | Priority table | Low |
| Versions/Milestones | user-guide/projects/versions | Version table | Medium |
| Member Roles | user-guide/members | Role table | Medium |
| Project Members UI | user-guide/members | - | Low |
| Project Settings UI | user-guide/projects/project-settings | - | Low |

### Phase 2: Power Features

| Feature | Docs Reference | Model Needed | Effort |
|---------|----------------|--------------|--------|
| Kanban Boards | user-guide/agile-boards | Board, Query | High |
| Gantt Chart | user-guide/gantt-chart | - | High |
| WP Relations | user-guide/work-packages/relations | Relation | Medium |
| Time Tracking | user-guide/time-and-costs | TimeEntry | Medium |
| File Attachments | user-guide/file-management | Attachment | Medium |
| Activity Journal | user-guide/activity | Journal | High |
| Custom Fields | system-admin-guide/custom-fields | CustomField | High |

### Phase 3: Collaboration

| Feature | Docs Reference | Model Needed | Effort |
|---------|----------------|--------------|--------|
| Wiki | user-guide/wiki | Wiki, WikiPage | High |
| News | user-guide/news | News | Low |
| Forums | user-guide/forums | Forum, Message | Medium |
| Documents | user-guide/documents | Document | Low |
| Meetings | user-guide/meetings | Meeting | High |

### Phase 4: Enterprise-ish

| Feature | Docs Reference | Model Needed | Effort |
|---------|----------------|--------------|--------|
| LDAP Auth | system-admin-guide/users/ldap | LdapAuthSource | High |
| SAML/OIDC | system-admin-guide/users/saml | AuthProvider | High |
| Webhooks | system-admin-guide/api/webhooks | Webhook | Medium |
| Backups | system-admin-guide/backup | Backup | Medium |
| Plugins | system-admin-guide/plugins | Plugin | High |

---

## 📁 DOCS → CODE MAPPING

### How to Find Implementation Details

1. **Identify feature in docs:** `https://www.openproject.org/docs/user-guide/work-packages/`

2. **Find Rails model:** `app/models/work_package.rb`
   - Look at associations, validations, scopes
   - Check `concerns/` for mixins

3. **Find Rails controller:** `app/controllers/work_packages_controller.rb`
   - Actions = API endpoints
   - Strong params = DTO fields

4. **Find API spec:** `spec/requests/api/v3/work_packages/`
   - Request/response formats
   - Edge cases

5. **Find frontend component:** `frontend/src/app/features/work-packages/`
   - Angular components
   - UI patterns

### Example: Adding "Versions" Feature

1. **Docs:** https://www.openproject.org/docs/user-guide/projects/project-settings/versions/

2. **Model:** `app/models/version.rb`
   ```ruby
   belongs_to :project
   has_many :work_packages
   validates :name, presence: true
   scope :open, -> { where(status: 'open') }
   ```

3. **Controller:** `app/controllers/versions_controller.rb`
   ```ruby
   def create
     @version = @project.versions.build(version_params)
     @version.save
   end
   ```

4. **API:** `app/controllers/api/v3/versions_controller.rb`
   ```json
   {
     "id": 1,
     "name": "v1.0",
     "status": "open",
     "startDate": "2024-01-01",
     "endDate": "2024-03-31"
   }
   ```

5. **Implement in op-lite:**
   - Add `op_lite_versions` table
   - Add `versionId` to tasks
   - Create VersionRepository, VersionService
   - Add `/api/projects/:id/versions` routes
   - Create VersionList, VersionForm components

---

## 🔗 QUICK REFERENCE URLS

### Documentation
- System Admin: https://www.openproject.org/docs/system-admin-guide/
- User Guide: https://www.openproject.org/docs/user-guide/
- API Docs: https://www.openproject.org/docs/api/

### Source Code (our fork)
- Models: https://github.com/AdaWorldAPI/openproject/tree/main/app/models
- Controllers: https://github.com/AdaWorldAPI/openproject/tree/main/app/controllers
- API v3: https://github.com/AdaWorldAPI/openproject/tree/main/app/controllers/api/v3
- Frontend: https://github.com/AdaWorldAPI/openproject/tree/main/frontend/src/app

### Our Implementation
- Backend: https://github.com/AdaWorldAPI/openproject-lite/tree/main/ts/src
- Frontend: https://github.com/AdaWorldAPI/openproject-lite/tree/main/frontend/src

---

*Map updated: 2026-01-27*
*Source: OpenProject docs + Rails source analysis*
"""

if __name__ == "__main__":
    print(FEATURE_MAP)
