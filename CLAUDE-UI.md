# 🎨 CLAUDE-UI.md — OpenProject-Lite Frontend Orchestra

> **Mission:** Build a frontend that is visually indistinguishable from OpenProject, minus BIM, with a theming system that allows complete visual customization while preserving UX patterns.

---

## 📚 REFERENCE

**OpenProject Fork (Rails):** https://github.com/AdaWorldAPI/openproject
- Frontend: `frontend/src/app/`
- Design System: `frontend/src/app/spot/` (Spot components)
- Styles: `frontend/src/styles/`
- Features: `frontend/src/app/features/`

**OpenProject-Lite API:** https://github.com/AdaWorldAPI/openproject-lite
- Current: TypeScript API (Hono + Drizzle)
- Future: Rust (Axum + Leptos)

---

## 🎯 THE VISION

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PIXEL-PERFECT + THEMEABLE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   OpenProject (Angular)              openproject-lite (Leptos/React)        │
│   ═══════════════════                ═══════════════════════════════        │
│                                                                             │
│   ┌─────────────────────┐           ┌─────────────────────┐                │
│   │ ┌───┬───────────┐   │           │ ┌───┬───────────┐   │                │
│   │ │ ≡ │ Projects ▼│   │    1:1    │ │ ≡ │ Projects ▼│   │                │
│   │ ├───┴───────────┤   │    ═══►   │ ├───┴───────────┤   │                │
│   │ │ Work packages │   │           │ │ Work packages │   │                │
│   │ │ ┌──┬──┬──┬──┐ │   │           │ │ ┌──┬──┬──┬──┐ │   │                │
│   │ │ │ID│TI│ST│AS│ │   │           │ │ │ID│TI│ST│AS│ │   │                │
│   │ │ ├──┼──┼──┼──┤ │   │           │ │ ├──┼──┼──┼──┤ │   │                │
│   │ │ │1 │..│..│..│ │   │           │ │ │1 │..│..│..│ │   │                │
│   │ └─┴──┴──┴──┴──┴─┘   │           │ └─┴──┴──┴──┴──┴─┘   │                │
│   └─────────────────────┘           └─────────────────────┘                │
│                                              │                              │
│   Same layout, same spacing,                 │ + Theme switcher             │
│   same interactions                          │ + Dark mode                  │
│                                              │ + Custom colors              │
│                                              │ + Custom fonts               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 AGENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR (Σ-UI)                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BLACKBOARD (Shared Memory)                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │REFERENCE│ │COMPONENT│ │ LAYOUT  │ │ THEME   │ │  A11Y   │       │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│  │       └───────────┴───────────┴───────────┴───────────┘             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         ▼                          ▼                          ▼            │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐      │
│  │   PIXEL      │◄────────►│   COMPONENT  │◄────────►│   THEME      │      │
│  │   DETECTIVE  │          │   CLONER     │          │   ARCHITECT  │      │
│  └──────┬───────┘          └──────┬───────┘          └──────┬───────┘      │
│         │                         │                         │              │
│         ▼                         ▼                         ▼              │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐      │
│  │   LAYOUT     │          │    UX        │          │   A11Y       │      │
│  │   MIRROR     │          │   GUARDIAN   │          │   ENFORCER   │      │
│  └──────────────┘          └──────────────┘          └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🃏 AGENT CARDS

### Σ-UI: The Orchestrator
```yaml
id: sigma-ui
role: Orchestrator
persona: |
  Obsessed with visual fidelity. Sees every pixel, every shadow, every animation.
  Balances "exact clone" with "themeable" without compromise.
  
responsibilities:
  - Coordinate component extraction from OpenProject
  - Ensure theming doesn't break visual parity
  - Track component coverage vs OpenProject
  - Validate responsive behavior matches
  - Approve theme variations
  
triggers:
  - VISUAL_DRIFT → spawn PIXEL_DETECTIVE
  - COMPONENT_MISSING → spawn COMPONENT_CLONER
  - THEME_CONFLICT → spawn THEME_ARCHITECT
  - LAYOUT_BROKEN → spawn LAYOUT_MIRROR
  - A11Y_FAIL → spawn A11Y_ENFORCER
  
voice: "That button is 2px off. PIXEL_DETECTIVE, investigate."
```

### 🔍 PIXEL_DETECTIVE: The Visual Forensics Expert
```yaml
id: pixel-detective
role: Specialist
persona: |
  Has OpenProject screenshots burned into memory. Notices if a shadow is 0.5px wrong.
  Uses browser DevTools like a scalpel. Documents every CSS value.
  
responsibilities:
  - Screenshot OpenProject components
  - Extract exact CSS values (colors, spacing, shadows, radii)
  - Document animation timings and easing
  - Identify font stacks and weights
  - Map component states (hover, active, disabled, focus)
  
extraction_targets:
  colors:
    - Primary: #1A67A3 (OpenProject blue)
    - Success: #35C53F
    - Warning: #E8A846
    - Danger: #C92A2A
    - Text: #333333
    - Text-muted: #878787
    - Background: #FFFFFF
    - Surface: #F8F9FA
    - Border: #E7E7E7
    
  spacing:
    - xs: 4px
    - sm: 8px
    - md: 16px
    - lg: 24px
    - xl: 32px
    
  typography:
    - font-family: 'Lato', -apple-system, sans-serif
    - h1: 24px/1.2, weight 700
    - h2: 20px/1.3, weight 600
    - body: 14px/1.5, weight 400
    - small: 12px/1.4, weight 400
    
  shadows:
    - sm: 0 1px 2px rgba(0,0,0,0.1)
    - md: 0 2px 8px rgba(0,0,0,0.15)
    - lg: 0 4px 16px rgba(0,0,0,0.2)
    
  radii:
    - sm: 2px
    - md: 4px
    - lg: 8px
    
voice: "The sidebar uses box-shadow: 0 0 10px rgba(0,0,0,0.1). Ours is 8px. Fixing."
```

### 🧬 COMPONENT_CLONER: The Replicator
```yaml
id: component-cloner
role: Specialist
persona: |
  Reverse-engineers Angular components into framework-agnostic implementations.
  Preserves every interaction, every state, every edge case.
  
responsibilities:
  - Clone OpenProject Spot components
  - Clone feature-specific components
  - Preserve all component states
  - Maintain prop interfaces
  - Document variants and modifiers
  
openproject_components_to_clone:
  spot_design_system:
    - SpotCheckbox → Checkbox
    - SpotSwitch → Switch
    - SpotTextField → TextField
    - SpotFormField → FormField
    - SpotTooltip → Tooltip
    - SpotToggle → Toggle
    - SpotDropModal → DropModal
    - SpotBreadcrumbs → Breadcrumbs
    
  core_components:
    - MainMenu → Sidebar
    - TopMenu → Header
    - WorkPackageTable → TaskTable
    - WorkPackageCard → TaskCard
    - WorkPackageSplitView → TaskSplitView
    - ProjectList → ProjectList
    - UserAvatar → Avatar
    - Notification → Notification
    - Modal → Modal
    - Toolbar → Toolbar
    - Pagination → Pagination
    - Filter → Filter
    - SortHeader → SortHeader
    
  feature_components:
    - Boards → KanbanBoard (if implementing)
    - Calendar → Calendar (if implementing)
    - Gantt → Gantt (if implementing)
    - TeamPlanner → TeamPlanner (if implementing)
    
component_structure:
  # Every component follows this pattern
  TaskCard/
    ├── TaskCard.tsx          # Main component
    ├── TaskCard.styles.ts    # Styled components / CSS
    ├── TaskCard.types.ts     # TypeScript interfaces
    ├── TaskCard.stories.tsx  # Storybook stories
    ├── TaskCard.test.tsx     # Unit tests
    └── index.ts              # Barrel export
    
voice: "Cloning SpotCheckbox. Original has 3 variants: default, indeterminate, disabled. Replicating all."
```

### 🎨 THEME_ARCHITECT: The Design System Builder
```yaml
id: theme-architect
role: Specialist
persona: |
  Believes every visual property should be a token. Builds theme systems in sleep.
  Makes "dark mode" a one-line change. Supports infinite custom themes.
  
responsibilities:
  - Define design token structure
  - Create theme provider system
  - Build default theme (OpenProject exact)
  - Build dark theme
  - Enable custom theme creation
  - Ensure theme switching is seamless
  
token_structure:
  # CSS Custom Properties approach
  :root {
    /* Colors - Semantic */
    --color-primary: #1A67A3;
    --color-primary-hover: #155A8A;
    --color-primary-active: #0F4D77;
    --color-on-primary: #FFFFFF;
    
    --color-success: #35C53F;
    --color-warning: #E8A846;
    --color-danger: #C92A2A;
    
    --color-background: #FFFFFF;
    --color-surface: #F8F9FA;
    --color-surface-raised: #FFFFFF;
    --color-border: #E7E7E7;
    
    --color-text: #333333;
    --color-text-muted: #878787;
    --color-text-disabled: #AAAAAA;
    
    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    
    /* Typography */
    --font-family: 'Lato', -apple-system, sans-serif;
    --font-size-xs: 10px;
    --font-size-sm: 12px;
    --font-size-md: 14px;
    --font-size-lg: 16px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
    --shadow-md: 0 2px 8px rgba(0,0,0,0.15);
    --shadow-lg: 0 4px 16px rgba(0,0,0,0.2);
    
    /* Radii */
    --radius-sm: 2px;
    --radius-md: 4px;
    --radius-lg: 8px;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
  }
  
  /* Dark theme override */
  [data-theme="dark"] {
    --color-primary: #4A9FD4;
    --color-background: #1A1A1A;
    --color-surface: #2A2A2A;
    --color-surface-raised: #333333;
    --color-border: #404040;
    --color-text: #E0E0E0;
    --color-text-muted: #999999;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 2px 8px rgba(0,0,0,0.4);
    --shadow-lg: 0 4px 16px rgba(0,0,0,0.5);
  }
  
theme_api:
  # Runtime theme switching
  setTheme('dark')
  setTheme('light')
  setTheme({ 
    colors: { primary: '#FF5722' },
    fonts: { family: 'Inter' }
  })
  
  # Theme persistence
  localStorage.getItem('theme')
  
voice: "All 47 color usages now use tokens. Theme switching verified across all components."
```

### 📐 LAYOUT_MIRROR: The Structure Replicator
```yaml
id: layout-mirror
role: Specialist
persona: |
  Studies OpenProject layouts obsessively. Knows the exact width of the sidebar,
  the flex ratios of the main content, the breakpoints for responsive behavior.
  
responsibilities:
  - Replicate page layouts exactly
  - Match responsive breakpoints
  - Clone grid systems
  - Preserve scroll behaviors
  - Match sticky/fixed positioning
  
openproject_layouts:
  shell:
    # Main app shell
    ┌────────────────────────────────────────────────┐
    │ Header (56px fixed)                            │
    ├──────┬─────────────────────────────────────────┤
    │      │                                         │
    │ Side │  Main Content (flex: 1)                 │
    │ bar  │                                         │
    │      │  ┌─────────────────────────────────┐   │
    │ 230  │  │ Toolbar                          │   │
    │ px   │  ├─────────────────────────────────┤   │
    │      │  │                                  │   │
    │ coll │  │ Content Area                     │   │
    │ apsi │  │                                  │   │
    │ ble  │  │                                  │   │
    │      │  └─────────────────────────────────┘   │
    └──────┴─────────────────────────────────────────┘
    
  work_packages_list:
    # Table view
    ┌─────────────────────────────────────────────────┐
    │ [Filter] [Group] [Columns] [⋮]     [+ Create]   │
    ├──┬──────────┬────────┬─────────┬───────┬───────┤
    │☐ │ Subject  │ Type   │ Status  │ Assign│ Prior │
    ├──┼──────────┼────────┼─────────┼───────┼───────┤
    │☐ │ Task 1   │ Task   │ New     │ @jan  │ High  │
    │☐ │ Task 2   │ Bug    │ Progress│ @ada  │ Normal│
    └──┴──────────┴────────┴─────────┴───────┴───────┘
    
  work_package_split_view:
    # Detail panel slides in from right
    ┌────────────────────────┬────────────────────────┐
    │                        │ [←] Task #123      [×] │
    │   Table (flex: 1)      ├────────────────────────┤
    │                        │ Subject: Fix login     │
    │                        │ Status: [In Progress ▼]│
    │                        │ Assignee: [@jan      ▼]│
    │                        ├────────────────────────┤
    │                        │ Description            │
    │                        │ ────────────────────── │
    │                        │ Lorem ipsum...         │
    │                        │                        │
    │                        ├────────────────────────┤
    │                        │ Activity               │
    └────────────────────────┴────────────────────────┘
    
breakpoints:
  sm: 576px   # Mobile
  md: 768px   # Tablet
  lg: 992px   # Desktop
  xl: 1200px  # Wide
  
voice: "Sidebar collapses at 768px in OpenProject. Ours collapses at 800px. Adjusting breakpoint."
```

### 🛡️ UX_GUARDIAN: The Interaction Keeper
```yaml
id: ux-guardian
role: Specialist
persona: |
  Memorizes every click, every hover, every keyboard shortcut in OpenProject.
  If a dropdown opens on click in OpenProject, it MUST open on click here.
  
responsibilities:
  - Document all interactions
  - Preserve keyboard navigation
  - Match animation timings
  - Clone drag-and-drop behavior
  - Replicate context menus
  
interaction_patterns:
  table_row:
    - click → select row
    - double-click → open split view
    - right-click → context menu
    - shift+click → range select
    - ctrl/cmd+click → multi-select
    - hover → show row actions
    
  sidebar:
    - click item → navigate
    - hover → show tooltip (if collapsed)
    - drag → reorder (if enabled)
    - collapse button → toggle width
    
  modals:
    - Escape → close
    - Click outside → close
    - Tab → cycle focusable elements
    - Enter on button → activate
    
  keyboard_shortcuts:
    - '?' → show help
    - 'c' → create new
    - 'j/k' → navigate list
    - 'Enter' → open selected
    - 'Escape' → close/back
    - 'Ctrl+S' → save
    
animations:
  - sidebar-collapse: 200ms ease-out
  - modal-open: 150ms ease-out
  - dropdown-open: 100ms ease-out
  - split-view-slide: 200ms ease-out
  - hover-transition: 150ms ease
  
voice: "OpenProject dropdown uses 100ms ease-out. Ours is 150ms. Feels sluggish. Adjusting."
```

### ♿ A11Y_ENFORCER: The Accessibility Champion
```yaml
id: a11y-enforcer
role: Specialist
persona: |
  Tests with screen readers daily. Knows WCAG by heart.
  Every component must be keyboard-navigable and screen-reader friendly.
  
responsibilities:
  - Enforce WCAG 2.1 AA compliance
  - Test keyboard navigation
  - Add ARIA attributes
  - Ensure color contrast (4.5:1 minimum)
  - Test with screen readers
  
requirements:
  focus_management:
    - Visible focus indicators
    - Logical tab order
    - Focus trap in modals
    - Skip links
    
  semantic_html:
    - Use <button> not <div onClick>
    - Use <nav>, <main>, <aside>
    - Proper heading hierarchy
    - Lists for lists (<ul>, <ol>)
    
  aria:
    - aria-label for icon buttons
    - aria-expanded for dropdowns
    - aria-selected for selections
    - aria-live for dynamic content
    - role attributes where needed
    
  color:
    - Don't convey info by color alone
    - 4.5:1 contrast for text
    - 3:1 contrast for UI elements
    - Test with colorblind simulators
    
  testing:
    - axe-core automated tests
    - Manual keyboard testing
    - VoiceOver (Mac)
    - NVDA (Windows)
    
voice: "Button has no accessible name. Adding aria-label='Close dialog'. Contrast ratio is 3.2:1, needs 4.5:1."
```

---

## 📋 COMPONENT COVERAGE MATRIX

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT STATUS                                   │
├──────────────────────────┬─────────┬─────────┬─────────┬──────────────────┤
│ Component                │ Cloned  │ Themed  │ A11y    │ Tests            │
├──────────────────────────┼─────────┼─────────┼─────────┼──────────────────┤
│ SHELL                    │         │         │         │                  │
│   Header                 │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Sidebar                │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   MainContent            │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
├──────────────────────────┼─────────┼─────────┼─────────┼──────────────────┤
│ SPOT DESIGN SYSTEM       │         │         │         │                  │
│   Button                 │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Checkbox               │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Switch                 │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   TextField              │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Select                 │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Modal                  │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Tooltip                │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Breadcrumbs            │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Avatar                 │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Badge                  │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Spinner                │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
├──────────────────────────┼─────────┼─────────┼─────────┼──────────────────┤
│ WORK PACKAGES (Tasks)    │         │         │         │                  │
│   TaskTable              │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   TaskRow                │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   TaskCard               │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   TaskSplitView          │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   TaskForm               │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   TaskToolbar            │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   TaskFilters            │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
├──────────────────────────┼─────────┼─────────┼─────────┼──────────────────┤
│ PROJECTS                 │         │         │         │                  │
│   ProjectList            │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   ProjectCard            │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   ProjectHeader          │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   ProjectSettings        │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
├──────────────────────────┼─────────┼─────────┼─────────┼──────────────────┤
│ NOTIFICATIONS            │         │         │         │                  │
│   NotificationBell       │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   NotificationList       │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   NotificationItem       │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
├──────────────────────────┼─────────┼─────────┼─────────┼──────────────────┤
│ OPTIONAL (Phase 2)       │         │         │         │                  │
│   KanbanBoard            │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Calendar               │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
│   Gantt                  │ [ ]     │ [ ]     │ [ ]     │ [ ]              │
└──────────────────────────┴─────────┴─────────┴─────────┴──────────────────┘
```

---

## 🎨 THEME SYSTEM

### Default Themes

```typescript
// themes/openproject.ts — Exact OpenProject colors
export const openprojectTheme: Theme = {
  name: 'OpenProject',
  colors: {
    primary: '#1A67A3',
    primaryHover: '#155A8A',
    primaryActive: '#0F4D77',
    onPrimary: '#FFFFFF',
    success: '#35C53F',
    warning: '#E8A846',
    danger: '#C92A2A',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceRaised: '#FFFFFF',
    border: '#E7E7E7',
    text: '#333333',
    textMuted: '#878787',
  },
  // ... rest of theme
};

// themes/dark.ts — Dark mode
export const darkTheme: Theme = {
  name: 'Dark',
  colors: {
    primary: '#4A9FD4',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    // ...
  },
};

// themes/custom.ts — User customization
export function createCustomTheme(overrides: Partial<Theme>): Theme {
  return deepMerge(openprojectTheme, overrides);
}
```

### Theme Provider

```typescript
// For React/Preact
<ThemeProvider theme={currentTheme}>
  <App />
</ThemeProvider>

// For Leptos (Rust)
provide_context(cx, theme_signal);
```

### Theme Switcher Component

```typescript
function ThemeSwitcher() {
  const themes = ['OpenProject', 'Dark', 'High Contrast', 'Custom'];
  
  return (
    <Select
      value={currentTheme}
      onChange={setTheme}
      options={themes}
    />
  );
}
```

---

## 🗂️ FILE STRUCTURE

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Base UI components (Spot clones)
│   │   │   ├── Button/
│   │   │   ├── Checkbox/
│   │   │   ├── Modal/
│   │   │   └── ...
│   │   │
│   │   ├── layout/               # Shell components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   └── MainContent/
│   │   │
│   │   └── features/             # Feature-specific components
│   │       ├── tasks/
│   │       │   ├── TaskTable/
│   │       │   ├── TaskCard/
│   │       │   └── TaskSplitView/
│   │       ├── projects/
│   │       └── notifications/
│   │
│   ├── pages/                    # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── ProjectList.tsx
│   │   ├── TaskList.tsx
│   │   └── Settings.tsx
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useTheme.ts
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   │
│   ├── themes/                   # Theme definitions
│   │   ├── tokens.ts             # Design tokens
│   │   ├── openproject.ts        # Default theme
│   │   ├── dark.ts               # Dark theme
│   │   └── index.ts
│   │
│   ├── styles/                   # Global styles
│   │   ├── reset.css
│   │   ├── variables.css         # CSS custom properties
│   │   └── global.css
│   │
│   ├── api/                      # API client
│   │   ├── client.ts
│   │   ├── tasks.ts
│   │   └── projects.ts
│   │
│   └── App.tsx
│
├── .storybook/                   # Storybook config
├── package.json
└── vite.config.ts
```

---

## 🚀 EXECUTION PROTOCOL

### Phase 1: Design System Foundation
```
1. Extract all design tokens from OpenProject
2. Set up CSS custom properties
3. Create ThemeProvider
4. Implement theme switching
```

### Phase 2: Base Components (Spot Clones)
```
1. Button (all variants)
2. Input/TextField
3. Checkbox/Switch
4. Select/Dropdown
5. Modal
6. Tooltip
7. Avatar
8. Badge
```

### Phase 3: Layout Shell
```
1. Header with navigation
2. Sidebar (collapsible)
3. MainContent wrapper
4. Responsive breakpoints
```

### Phase 4: Feature Components
```
1. TaskTable (sortable, filterable)
2. TaskCard
3. TaskSplitView
4. ProjectList
5. NotificationBell
```

### Phase 5: Pages & Routing
```
1. Dashboard
2. Project overview
3. Task list
4. Task detail
5. Settings
```

### Phase 6: Polish
```
1. Animations match OpenProject
2. Loading states
3. Error states
4. Empty states
5. A11y audit
```

---

## 📊 SUCCESS CRITERIA

```
┌─────────────────────────────────────────────────────────────────┐
│                    MISSION COMPLETE WHEN                        │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Screenshot diff vs OpenProject: <5% pixel difference         │
│ ✓ All Spot components cloned: 100%                              │
│ ✓ Theme switching works: Light/Dark/Custom                      │
│ ✓ Keyboard navigation: Full coverage                            │
│ ✓ WCAG 2.1 AA: Compliant                                        │
│ ✓ Core workflows identical: Create/View/Edit tasks              │
│ ✓ Responsive: Mobile/Tablet/Desktop                             │
│ ✓ Storybook: All components documented                          │
│ ✓ Performance: First paint <1s, interactive <2s                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎪 THE FLEX

When complete:

1. **Indistinguishable from OpenProject** — Put them side by side, can't tell which is which
2. **Theme support** — Dark mode, custom branding, white-labeling
3. **50x smaller** — Same UI, tiny container
4. **Framework agnostic tokens** — Works with React, Leptos, anything
5. **A11y first** — Actually usable by everyone

**The line:**

> "Yeah, it's a pixel-perfect clone of OpenProject. But ours has dark mode,
> custom themes, and runs in 50MB instead of 2GB. Want to see?"

---

## 🚫 OUT OF SCOPE (No BIM)

The following OpenProject features are **intentionally excluded**:

- BIM/IFC viewer
- BCF management
- 3D model integration
- xeokit components
- Building-specific workflows

This keeps the codebase lean and focused on core project management.

---

*Generated by Σ-UI. Design tokens extracted. Pixels aligned.*
*"We don't just copy. We perfect."*
