# 🧠 MULTI-AGENT ORCHESTRATION SKILL

> **Purpose:** Force Claude Code to use MCP multi-agent patterns even when reluctant
> **Location:** `.claude/skills/multiagent.md` or project root as `AGENTS.md`

---

## 🎯 THE PROBLEM

Claude Code often:
1. **Refuses MCP** — "I'll just do this myself" (misses parallelism)
2. **Forgets handover** — Loses context between agent switches
3. **Ignores specialization** — Generic responses instead of expert personas
4. **Avoids spawning** — Does sequential work when parallel would be faster

## 💉 THE INJECTION

Add this to your `.claude/settings.json` or prepend to prompts:

```json
{
  "mcpServers": {
    "ada-hive": {
      "url": "https://ada-hive-production.up.railway.app/sse",
      "transport": "sse"
    }
  },
  "agentMode": "enforced",
  "handoverProtocol": "blackboard"
}
```

---

## 📋 AGENT MANIFEST

### Required Agents for OpenProject-Lite

```yaml
agents:
  archaeologist:
    id: "arch"
    role: "Rails Code Excavator"
    triggers:
      - "how does OpenProject implement"
      - "find the Rails model for"
      - "what's the database schema"
      - "excavate"
    mcp_endpoint: "/agent/archaeologist"
    tools:
      - github_search
      - code_analysis
      - schema_extraction
    handover_format: |
      ## 🏺 EXCAVATION REPORT
      **Target:** {feature}
      **Rails Model:** {model_path}
      **Key Findings:**
      - Associations: {associations}
      - Validations: {validations}
      - Callbacks: {callbacks}
      **Translation Notes:** {notes}
      **Red Flags:** {warnings}
      
  product_sage:
    id: "sage"
    role: "Feature Evaluator"
    triggers:
      - "should we implement"
      - "is this worth building"
      - "prioritize"
      - "evaluate feature"
    mcp_endpoint: "/agent/product_sage"
    tools:
      - docs_search
      - usage_analysis
      - complexity_scoring
    handover_format: |
      ## 🎯 FEATURE EVALUATION
      **Feature:** {feature}
      **Verdict:** {verdict} (MUST/SHOULD/NICE/SKIP)
      **Scores:**
      - Usage Frequency: {usage}/5
      - Learning Curve: {learning}/5
      - Workflow Impact: {impact}/5
      - Technical Debt: {debt}/5
      - Lite Fit: {fit}/5
      **Priority Score:** {total}
      **Simplification:** {simplification}
      **MVP Scope:** {mvp}

  orchestrator:
    id: "orch"
    role: "Implementation Planner"
    triggers:
      - "implement"
      - "build"
      - "create the"
      - "add feature"
    mcp_endpoint: "/agent/orchestrator"
    tools:
      - task_decomposition
      - dependency_analysis
      - code_generation
    handover_format: |
      ## 🔧 IMPLEMENTATION PLAN
      **Feature:** {feature}
      **Steps:**
      1. Schema: {schema_changes}
      2. Backend: {backend_tasks}
      3. Frontend: {frontend_tasks}
      4. Tests: {test_tasks}
      **Dependencies:** {deps}
      **Estimated Effort:** {effort}

  pixel_detective:
    id: "pixel"
    role: "UI/UX Extractor"
    triggers:
      - "match the UI"
      - "copy the design"
      - "extract styles"
      - "pixel perfect"
    mcp_endpoint: "/agent/pixel"
    tools:
      - screenshot_analysis
      - css_extraction
      - component_mapping
    handover_format: |
      ## 🎨 UI SPECIFICATION
      **Component:** {component}
      **Design Tokens:**
      ```css
      {css_variables}
      ```
      **Spacing:** {spacing}
      **Colors:** {colors}
      **Interactions:** {interactions}
```

---

## 🔄 HANDOVER PROTOCOL

### Blackboard Pattern

All agents read/write to a shared state file:

```
.claude/blackboard.md
```

Structure:
```markdown
# 🗒️ BLACKBOARD — {task_name}

## Current State
- **Phase:** {excavate|evaluate|plan|implement|validate}
- **Active Agent:** {agent_id}
- **Last Updated:** {timestamp}

## Context Stack
### From: archaeologist
{excavation_report}

### From: product_sage  
{evaluation_report}

### From: orchestrator
{implementation_plan}

## Pending Actions
- [ ] {action_1}
- [ ] {action_2}

## Decisions Made
- {decision_1}: {rationale}
- {decision_2}: {rationale}

## Artifacts
- `ts/src/db/schema.ts` — Modified
- `ts/src/services/version.service.ts` — Created
```

### Handover Commands

Force handover with explicit commands:

```
@archaeologist excavate Version model from OpenProject
→ writes to blackboard
→ triggers @product_sage

@product_sage evaluate Versions feature based on excavation
→ reads blackboard
→ writes evaluation
→ triggers @orchestrator

@orchestrator plan implementation based on evaluation
→ reads blackboard
→ writes plan
→ begins implementation OR triggers specialist
```

---

## 🚀 AUTO-SPAWN PATTERNS

### Pattern 1: Explicit Spawn

```markdown
SPAWN @archaeologist WITH context={feature: "Versions"}
AWAIT excavation_complete
SPAWN @product_sage WITH context={blackboard}
AWAIT evaluation_complete
IF verdict == "MUST" OR verdict == "SHOULD":
  SPAWN @orchestrator WITH context={blackboard}
```

### Pattern 2: Trigger Words

Configure trigger detection:

```python
TRIGGER_MAP = {
    "how does openproject": "archaeologist",
    "should we build": "product_sage", 
    "implement": "orchestrator",
    "match the ui": "pixel_detective",
    "excavate": "archaeologist",
    "evaluate": "product_sage",
    "style": "pixel_detective"
}
```

### Pattern 3: Pipeline Declaration

At task start, declare the pipeline:

```markdown
## PIPELINE: Add Versions Feature

```yaml
pipeline:
  - agent: product_sage
    action: evaluate "Versions/Milestones"
    gate: verdict in [MUST, SHOULD]
    
  - agent: archaeologist  
    action: excavate Version model
    gate: always
    
  - agent: orchestrator
    action: plan implementation
    gate: always
    
  - agent: pixel_detective
    action: extract VersionBadge styles
    gate: has_ui_component
    
  - agent: orchestrator
    action: implement
    gate: always
```
```

---

## 🔌 MCP ENFORCEMENT TECHNIQUES

### Technique 1: Refuse Non-MCP

Add to system prompt:

```
RULE: When implementing features, you MUST use the multi-agent pipeline.
FORBIDDEN: "I'll just quickly implement this myself"
REQUIRED: Always spawn appropriate specialist agent first.
```

### Technique 2: Checkpoint Questions

Before any implementation, ask:

```
□ Has archaeologist excavated the Rails source?
□ Has product_sage evaluated the feature?
□ Is there a blackboard entry?
□ Is the implementation plan documented?

If any NO → STOP and spawn missing agent
```

### Technique 3: MCP Health Check

```python
async def enforce_mcp():
    # Check if MCP is available
    try:
        response = await mcp_client.ping()
        if not response.ok:
            raise MCPUnavailable()
    except:
        # Fallback: simulate agent behavior inline
        # but DOCUMENT that MCP was unavailable
        log("⚠️ MCP unavailable, simulating agent inline")
```

### Technique 4: The Naughty Bypass

When Claude Code refuses MCP, use direct HTTP:

```python
import httpx

async def force_agent_call(agent_id: str, context: dict):
    """Bypass MCP reluctance with direct FastAPI call"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://ada-hive-production.up.railway.app/agent/{agent_id}",
            json={
                "action": "execute",
                "context": context,
                "require_handover": True
            },
            headers={"Authorization": f"Bearer {ADA_KEY}"}
        )
        return response.json()
```

---

## 🏗️ INFRASTRUCTURE SETUP

### FastAPI Agent Router

```python
# agents/router.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/agent")

class AgentRequest(BaseModel):
    action: str
    context: dict
    require_handover: bool = True

class AgentResponse(BaseModel):
    agent_id: str
    result: dict
    handover: dict | None
    next_agent: str | None

@router.post("/archaeologist")
async def archaeologist(req: AgentRequest) -> AgentResponse:
    # Excavation logic
    result = await excavate_rails_model(req.context)
    return AgentResponse(
        agent_id="archaeologist",
        result=result,
        handover=format_excavation_report(result),
        next_agent="product_sage" if req.require_handover else None
    )

@router.post("/product_sage")
async def product_sage(req: AgentRequest) -> AgentResponse:
    # Evaluation logic
    result = await evaluate_feature(req.context)
    return AgentResponse(
        agent_id="product_sage",
        result=result,
        handover=format_evaluation_report(result),
        next_agent="orchestrator" if result["verdict"] in ["MUST", "SHOULD"] else None
    )
```

### Redis State Store (Blackboard)

```python
# agents/blackboard.py
import json
from datetime import datetime

class Blackboard:
    def __init__(self, redis_client, task_id: str):
        self.redis = redis_client
        self.key = f"blackboard:{task_id}"
    
    async def write(self, agent_id: str, data: dict):
        entry = {
            "agent": agent_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        await self.redis.rpush(self.key, json.dumps(entry))
        await self.redis.set(f"{self.key}:current_agent", agent_id)
    
    async def read_all(self) -> list[dict]:
        entries = await self.redis.lrange(self.key, 0, -1)
        return [json.loads(e) for e in entries]
    
    async def get_context(self) -> dict:
        """Compile full context for next agent"""
        entries = await self.read_all()
        return {
            "history": entries,
            "latest": entries[-1] if entries else None,
            "current_agent": await self.redis.get(f"{self.key}:current_agent")
        }
```

---

## 📊 KNOWLEDGE GRAPH: META-LEARNING

Track what works and what doesn't:

```python
# agents/knowledge.py

class LearningTracker:
    """
    Tracks:
    - Which agent sequences work best
    - Common excavation patterns
    - Feature evaluation accuracy
    - Implementation time estimates
    """
    
    async def record_pipeline_run(self, pipeline_id: str, results: dict):
        await self.neo4j.run("""
            MERGE (p:Pipeline {id: $pipeline_id})
            SET p.success = $success,
                p.duration = $duration,
                p.agents_used = $agents
            
            FOREACH (agent IN $agent_results |
                MERGE (a:Agent {id: agent.id})
                MERGE (p)-[:USED]->(a)
                SET a.avg_duration = coalesce(a.avg_duration, 0) * 0.9 + agent.duration * 0.1
            )
        """, {
            "pipeline_id": pipeline_id,
            "success": results["success"],
            "duration": results["total_duration"],
            "agents": [a["id"] for a in results["agents"]],
            "agent_results": results["agents"]
        })
    
    async def get_recommended_pipeline(self, feature_type: str) -> list[str]:
        """Learn from past successes"""
        result = await self.neo4j.run("""
            MATCH (p:Pipeline)-[:FOR_FEATURE]->(f:FeatureType {name: $type})
            WHERE p.success = true
            WITH p ORDER BY p.duration ASC LIMIT 5
            MATCH (p)-[:USED]->(a:Agent)
            RETURN collect(DISTINCT a.id) as agents
        """, {"type": feature_type})
        return result[0]["agents"] if result else ["product_sage", "archaeologist", "orchestrator"]
```

---

## 🔐 RBAC for Enterprise Comfort

```python
# agents/rbac.py
from enum import Enum

class AgentPermission(Enum):
    READ_CODEBASE = "read:codebase"
    WRITE_CODE = "write:code"
    EXECUTE_MIGRATIONS = "execute:migrations"
    DEPLOY = "deploy"
    ACCESS_SECRETS = "access:secrets"

ROLE_PERMISSIONS = {
    "developer": [
        AgentPermission.READ_CODEBASE,
        AgentPermission.WRITE_CODE,
    ],
    "lead": [
        AgentPermission.READ_CODEBASE,
        AgentPermission.WRITE_CODE,
        AgentPermission.EXECUTE_MIGRATIONS,
    ],
    "admin": [
        AgentPermission.READ_CODEBASE,
        AgentPermission.WRITE_CODE,
        AgentPermission.EXECUTE_MIGRATIONS,
        AgentPermission.DEPLOY,
        AgentPermission.ACCESS_SECRETS,
    ]
}

def check_permission(user_role: str, required: AgentPermission) -> bool:
    return required in ROLE_PERMISSIONS.get(user_role, [])

# Decorator for agent endpoints
def requires_permission(permission: AgentPermission):
    def decorator(func):
        async def wrapper(request, *args, **kwargs):
            user = get_current_user(request)
            if not check_permission(user.role, permission):
                raise HTTPException(403, f"Requires {permission.value}")
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
```

---

## 🔗 INTEGRATION HOOKS

### Notion MCP Bridge

```python
@router.post("/sync/notion")
async def sync_to_notion(blackboard_id: str):
    """Push blackboard state to Notion page"""
    blackboard = await Blackboard.load(blackboard_id)
    
    await notion_client.pages.update(
        page_id=NOTION_PROJECT_PAGE,
        properties={
            "Status": {"select": {"name": blackboard.phase}},
            "Current Agent": {"rich_text": [{"text": {"content": blackboard.current_agent}}]},
        },
        children=format_blackboard_as_blocks(blackboard)
    )
```

### n8n Webhook

```python
@router.post("/webhook/n8n")
async def n8n_trigger(event: str, data: dict):
    """Trigger n8n workflow from agent events"""
    await httpx.post(
        N8N_WEBHOOK_URL,
        json={
            "event": event,  # "agent_complete", "pipeline_done", "error"
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

### MS Graph / SharePoint

```python
@router.post("/sync/sharepoint")
async def sync_to_sharepoint(project_id: str):
    """Push project plan to SharePoint list"""
    from msgraph import GraphClient
    
    client = GraphClient(credential=AZURE_CREDENTIAL)
    
    # Get project data
    project = await get_project(project_id)
    tasks = await get_tasks(project_id)
    
    # Update SharePoint list
    for task in tasks:
        await client.sites[SITE_ID].lists[LIST_ID].items.post({
            "fields": {
                "Title": task.title,
                "Status": task.status,
                "Assignee": task.assignee_email,
                "DueDate": task.due_date.isoformat() if task.due_date else None
            }
        })
```

---

## 📁 FILE STRUCTURE

```
.claude/
├── settings.json          # MCP server config
├── blackboard.md          # Current task state
├── skills/
│   └── multiagent.md      # This file
└── history/
    └── {task_id}.md       # Completed task logs

agents/
├── __init__.py
├── router.py              # FastAPI endpoints
├── blackboard.py          # State management
├── knowledge.py           # Learning tracker
├── rbac.py               # Permissions
└── integrations/
    ├── notion.py
    ├── n8n.py
    ├── msgraph.py
    └── sharepoint.py
```

---

## 🎬 USAGE

### In Claude Code

```
Human: Add the Versions feature to openproject-lite

Claude: I'll use the multi-agent pipeline for this.

@product_sage evaluate "Versions/Milestones" feature

[Agent spawns, evaluates, writes to blackboard]

Based on the evaluation (SHOULD HAVE, Priority 72/125), proceeding with excavation.

@archaeologist excavate Version model from OpenProject Rails

[Agent excavates, documents findings]

Now planning implementation...

@orchestrator plan Versions implementation

[Implementation plan generated]

Proceeding with code generation following the plan...
```

### Forcing MCP When Reluctant

```
Human: Just implement versions quickly

Claude: I understand you want speed, but let me run the quick pipeline:

PIPELINE: Quick Versions
- sage: 30-second evaluation → SHOULD HAVE ✓
- arch: schema-only excavation → 5 fields needed ✓  
- orch: implement with patterns

[Proceeds with abbreviated but structured approach]
```

---

*The agents are ready. The blackboard is clean. Let's build.* 🚀
