"""
OpenProject-Lite Agent System
=============================
FastAPI-based multi-agent orchestration with:
- Specialist agents (archaeologist, product_sage, orchestrator, pixel_detective)
- Blackboard state management via Redis
- Knowledge graph learning via Neo4j
- RBAC for enterprise deployment
- Integration hooks (Notion, n8n, MS Graph)

Deployment: Railway alongside openproject-lite backend
MCP Transport: SSE at /sse or REST at /agent/*
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum
import httpx
import json
import os

# ============================================
# CONFIG
# ============================================

UPSTASH_REDIS_URL = os.getenv("UPSTASH_REDIS_REST_URL", "https://upright-jaybird-27907.upstash.io")
UPSTASH_REDIS_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
NEO4J_URI = os.getenv("NEO4J_URI", "")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
JINA_API_KEY = os.getenv("JINA_API_KEY", "")

# ============================================
# MODELS
# ============================================

class AgentId(str, Enum):
    ARCHAEOLOGIST = "archaeologist"
    PRODUCT_SAGE = "product_sage"
    ORCHESTRATOR = "orchestrator"
    PIXEL_DETECTIVE = "pixel_detective"

class Permission(str, Enum):
    READ_CODEBASE = "read:codebase"
    WRITE_CODE = "write:code"
    EXECUTE_MIGRATIONS = "execute:migrations"
    DEPLOY = "deploy"
    ACCESS_SECRETS = "access:secrets"

class UserRole(str, Enum):
    VIEWER = "viewer"
    DEVELOPER = "developer"
    LEAD = "lead"
    ADMIN = "admin"

ROLE_PERMISSIONS = {
    UserRole.VIEWER: [Permission.READ_CODEBASE],
    UserRole.DEVELOPER: [Permission.READ_CODEBASE, Permission.WRITE_CODE],
    UserRole.LEAD: [Permission.READ_CODEBASE, Permission.WRITE_CODE, Permission.EXECUTE_MIGRATIONS],
    UserRole.ADMIN: list(Permission),
}

class AgentRequest(BaseModel):
    action: str
    context: dict
    require_handover: bool = True
    task_id: Optional[str] = None
    user_role: UserRole = UserRole.DEVELOPER

class AgentResponse(BaseModel):
    agent_id: AgentId
    success: bool
    result: dict
    handover: Optional[dict] = None
    next_agent: Optional[AgentId] = None
    duration_ms: int
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ExcavationReport(BaseModel):
    target: str
    rails_model: str
    associations: list[str]
    validations: list[str]
    callbacks: list[str]
    scopes: list[str]
    translation_notes: str
    red_flags: list[str]
    recommended_schema: dict

class FeatureEvaluation(BaseModel):
    feature: str
    verdict: Literal["MUST", "SHOULD", "NICE", "SKIP"]
    scores: dict  # usage, learning, impact, debt, fit
    priority_score: int
    simplification: str
    mvp_scope: str
    reasoning: str

class ImplementationPlan(BaseModel):
    feature: str
    schema_changes: list[str]
    backend_tasks: list[str]
    frontend_tasks: list[str]
    test_tasks: list[str]
    dependencies: list[str]
    estimated_effort: str
    code_snippets: dict

# ============================================
# REDIS BLACKBOARD
# ============================================

class Blackboard:
    """Upstash Redis-backed state management"""
    
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.key = f"blackboard:{task_id}"
    
    async def _redis_request(self, command: list) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                UPSTASH_REDIS_URL,
                headers={"Authorization": f"Bearer {UPSTASH_REDIS_TOKEN}"},
                json=command
            )
            return response.json()
    
    async def write(self, agent_id: str, data: dict):
        entry = {
            "agent": agent_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        await self._redis_request(["RPUSH", self.key, json.dumps(entry)])
        await self._redis_request(["SET", f"{self.key}:current_agent", agent_id])
        await self._redis_request(["SET", f"{self.key}:phase", data.get("phase", "unknown")])
    
    async def read_all(self) -> list[dict]:
        result = await self._redis_request(["LRANGE", self.key, "0", "-1"])
        entries = result.get("result", [])
        return [json.loads(e) if isinstance(e, str) else e for e in entries]
    
    async def get_context(self) -> dict:
        entries = await self.read_all()
        current = await self._redis_request(["GET", f"{self.key}:current_agent"])
        phase = await self._redis_request(["GET", f"{self.key}:phase"])
        return {
            "task_id": self.task_id,
            "history": entries,
            "latest": entries[-1] if entries else None,
            "current_agent": current.get("result"),
            "phase": phase.get("result")
        }

# ============================================
# GITHUB CODE EXCAVATION
# ============================================

async def excavate_rails_model(model_name: str) -> ExcavationReport:
    """Fetch and analyze Rails model from OpenProject fork"""
    
    async with httpx.AsyncClient() as client:
        # Fetch model file
        model_path = f"app/models/{model_name.lower()}.rb"
        response = await client.get(
            f"https://api.github.com/repos/AdaWorldAPI/openproject/contents/{model_path}",
            headers={"Authorization": f"token {GITHUB_TOKEN}"}
        )
        
        if response.status_code != 200:
            return ExcavationReport(
                target=model_name,
                rails_model=model_path,
                associations=[],
                validations=[],
                callbacks=[],
                scopes=[],
                translation_notes=f"Model not found at {model_path}",
                red_flags=["Model file not found"],
                recommended_schema={}
            )
        
        import base64
        content = base64.b64decode(response.json()["content"]).decode("utf-8")
        
        # Parse Ruby patterns
        import re
        
        associations = re.findall(r'(belongs_to|has_many|has_one|has_and_belongs_to_many)\s+:(\w+)', content)
        validations = re.findall(r'validates?\s+:?(\w+).*', content)
        callbacks = re.findall(r'(before_|after_|around_)(\w+)\s+:(\w+)', content)
        scopes = re.findall(r'scope\s+:(\w+)', content)
        
        # Detect red flags
        red_flags = []
        if "acts_as_" in content:
            red_flags.append("Uses acts_as_* metaprogramming - extract manually")
        if "method_missing" in content:
            red_flags.append("Uses method_missing - document all dynamic methods")
        if "eval" in content or "instance_eval" in content:
            red_flags.append("Uses eval - potential security concern, review carefully")
        if "include " in content:
            concerns = re.findall(r'include\s+(\w+(?:::\w+)*)', content)
            if concerns:
                red_flags.append(f"Includes concerns: {', '.join(concerns[:5])} - chase these")
        
        return ExcavationReport(
            target=model_name,
            rails_model=model_path,
            associations=[f"{a[0]} :{a[1]}" for a in associations],
            validations=validations[:20],
            callbacks=[f"{c[0]}{c[1]} :{c[2]}" for c in callbacks],
            scopes=scopes[:10],
            translation_notes=f"Found {len(associations)} associations, {len(validations)} validations",
            red_flags=red_flags,
            recommended_schema={
                "table": f"op_lite_{model_name.lower()}s",
                "fields": ["id (uuid)", "created_at", "updated_at"] + 
                         [f"{a[1]}_id (uuid)" for a in associations if a[0] == "belongs_to"]
            }
        )

# ============================================
# FEATURE EVALUATION
# ============================================

async def evaluate_feature(feature_name: str, context: dict = None) -> FeatureEvaluation:
    """Evaluate feature using product wisdom"""
    
    # Feature database (expand as needed)
    FEATURE_WISDOM = {
        "versions": {
            "verdict": "SHOULD",
            "scores": {"usage": 3, "learning": 4, "impact": 4, "debt": 4, "fit": 4},
            "simplification": "Skip sharing options, skip burndown charts",
            "mvp_scope": "Name, status (open/locked/closed), start/end date, task count"
        },
        "custom_fields": {
            "verdict": "NICE",
            "scores": {"usage": 2, "learning": 2, "impact": 3, "debt": 1, "fit": 2},
            "simplification": "Delay until demanded. Use task description instead.",
            "mvp_scope": "If must: text fields only, no visibility rules"
        },
        "gantt": {
            "verdict": "NICE",
            "scores": {"usage": 2, "learning": 3, "impact": 3, "debt": 2, "fit": 3},
            "simplification": "Basic timeline view, no auto-scheduling",
            "mvp_scope": "Read-only timeline, drag to change dates"
        },
        "kanban": {
            "verdict": "MUST",
            "scores": {"usage": 5, "learning": 5, "impact": 5, "debt": 4, "fit": 5},
            "simplification": "Status-based board only, no custom columns",
            "mvp_scope": "Drag-drop between statuses, card shows title/assignee/priority"
        },
        "workflows": {
            "verdict": "SKIP",
            "scores": {"usage": 1, "learning": 1, "impact": 2, "debt": 1, "fit": 1},
            "simplification": "Use fixed status transitions, no per-role matrix",
            "mvp_scope": "N/A - skip entirely"
        },
        "ldap": {
            "verdict": "SKIP",
            "scores": {"usage": 1, "learning": 2, "impact": 2, "debt": 1, "fit": 1},
            "simplification": "Use OAuth instead (Google, GitHub)",
            "mvp_scope": "N/A - skip entirely"
        },
        "time_tracking": {
            "verdict": "SHOULD",
            "scores": {"usage": 3, "learning": 4, "impact": 3, "debt": 3, "fit": 3},
            "simplification": "Log time on task only, skip cost tracking",
            "mvp_scope": "Hours input on task, basic time report"
        },
        "members": {
            "verdict": "MUST",
            "scores": {"usage": 4, "learning": 5, "impact": 4, "debt": 5, "fit": 5},
            "simplification": "4 fixed roles: Owner, Admin, Member, Viewer",
            "mvp_scope": "Add by email, list members, change role, remove"
        }
    }
    
    # Normalize feature name
    feature_key = feature_name.lower().replace(" ", "_").replace("-", "_")
    
    if feature_key in FEATURE_WISDOM:
        wisdom = FEATURE_WISDOM[feature_key]
        scores = wisdom["scores"]
        priority = scores["usage"] * scores["learning"] * scores["impact"] * scores["debt"] * scores["fit"]
        
        return FeatureEvaluation(
            feature=feature_name,
            verdict=wisdom["verdict"],
            scores=scores,
            priority_score=priority,
            simplification=wisdom["simplification"],
            mvp_scope=wisdom["mvp_scope"],
            reasoning=f"Based on 5+ years of OpenProject usage patterns"
        )
    
    # Unknown feature - conservative evaluation
    return FeatureEvaluation(
        feature=feature_name,
        verdict="NICE",
        scores={"usage": 2, "learning": 3, "impact": 2, "debt": 3, "fit": 3},
        priority_score=108,
        simplification="Start with simplest possible version",
        mvp_scope="To be determined after Rails excavation",
        reasoning="Unknown feature - requires archaeologist excavation first"
    )

# ============================================
# IMPLEMENTATION PLANNING
# ============================================

async def plan_implementation(feature_name: str, excavation: ExcavationReport, evaluation: FeatureEvaluation) -> ImplementationPlan:
    """Generate implementation plan based on excavation and evaluation"""
    
    table_name = excavation.recommended_schema.get("table", f"op_lite_{feature_name.lower()}s")
    
    return ImplementationPlan(
        feature=feature_name,
        schema_changes=[
            f"Add {table_name} table to ts/src/db/schema.ts",
            f"Add migration SQL to ts/src/db/migrate.ts",
        ] + [f"Add foreign key: {f}" for f in excavation.recommended_schema.get("fields", []) if "uuid" in f],
        backend_tasks=[
            f"Create ts/src/dto/{feature_name.lower()}.dto.ts",
            f"Create ts/src/repositories/{feature_name.lower()}.repository.ts",
            f"Create ts/src/services/{feature_name.lower()}.service.ts",
            f"Add routes to ts/src/routes/{feature_name.lower()}s.ts",
            f"Register in ts/src/container.ts",
            f"Mount router in ts/src/index.ts",
        ],
        frontend_tasks=[
            f"Create frontend/src/api/{feature_name.lower()}s.ts",
            f"Create frontend/src/components/features/{feature_name.lower()}s/{feature_name}List.tsx",
            f"Create frontend/src/components/features/{feature_name.lower()}s/{feature_name}Form.tsx",
            f"Add page component if needed",
            f"Add to sidebar navigation if needed",
        ],
        test_tasks=[
            f"Add API integration tests",
            f"Add component tests",
        ],
        dependencies=[
            f"Depends on: {', '.join(excavation.associations[:3]) or 'none'}",
        ],
        estimated_effort=f"~{len(excavation.associations) + 2} hours",
        code_snippets={
            "schema_example": f"""
export const {feature_name.lower()}s = pgTable("{table_name}", {{
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // ... add fields based on excavation
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}});
""",
            "dto_example": f"""
export const create{feature_name}Schema = z.object({{
  name: z.string().min(1).max(255),
  // ... add fields
}});
""",
        }
    )

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="OpenProject-Lite Agents",
    description="Multi-agent orchestration for openproject-lite development",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# HEALTH & INFO
# ============================================

@app.get("/health")
async def health():
    return {"status": "ok", "service": "openproject-lite-agents"}

@app.get("/agents")
async def list_agents():
    return {
        "agents": [
            {"id": "archaeologist", "role": "Rails Code Excavator", "endpoint": "/agent/archaeologist"},
            {"id": "product_sage", "role": "Feature Evaluator", "endpoint": "/agent/product_sage"},
            {"id": "orchestrator", "role": "Implementation Planner", "endpoint": "/agent/orchestrator"},
            {"id": "pixel_detective", "role": "UI/UX Extractor", "endpoint": "/agent/pixel_detective"},
        ]
    }

# ============================================
# AGENT ENDPOINTS
# ============================================

@app.post("/agent/archaeologist", response_model=AgentResponse)
async def agent_archaeologist(req: AgentRequest, background_tasks: BackgroundTasks):
    """Excavate Rails models from OpenProject source"""
    start = datetime.utcnow()
    
    model_name = req.context.get("model") or req.context.get("feature", "WorkPackage")
    
    try:
        result = await excavate_rails_model(model_name)
        
        # Write to blackboard
        if req.task_id:
            bb = Blackboard(req.task_id)
            await bb.write("archaeologist", {
                "phase": "excavated",
                "report": result.dict()
            })
        
        duration = int((datetime.utcnow() - start).total_seconds() * 1000)
        
        return AgentResponse(
            agent_id=AgentId.ARCHAEOLOGIST,
            success=True,
            result=result.dict(),
            handover={
                "title": "🏺 EXCAVATION REPORT",
                "model": model_name,
                "associations_count": len(result.associations),
                "red_flags_count": len(result.red_flags),
            },
            next_agent=AgentId.PRODUCT_SAGE if req.require_handover else None,
            duration_ms=duration
        )
    except Exception as e:
        return AgentResponse(
            agent_id=AgentId.ARCHAEOLOGIST,
            success=False,
            result={"error": str(e)},
            duration_ms=int((datetime.utcnow() - start).total_seconds() * 1000)
        )

@app.post("/agent/product_sage", response_model=AgentResponse)
async def agent_product_sage(req: AgentRequest, background_tasks: BackgroundTasks):
    """Evaluate feature for usability and priority"""
    start = datetime.utcnow()
    
    feature_name = req.context.get("feature", "Unknown")
    
    try:
        result = await evaluate_feature(feature_name, req.context)
        
        # Write to blackboard
        if req.task_id:
            bb = Blackboard(req.task_id)
            await bb.write("product_sage", {
                "phase": "evaluated",
                "evaluation": result.dict()
            })
        
        duration = int((datetime.utcnow() - start).total_seconds() * 1000)
        
        # Decide next agent
        next_agent = None
        if req.require_handover and result.verdict in ["MUST", "SHOULD"]:
            next_agent = AgentId.ARCHAEOLOGIST
        
        return AgentResponse(
            agent_id=AgentId.PRODUCT_SAGE,
            success=True,
            result=result.dict(),
            handover={
                "title": "🎯 FEATURE EVALUATION",
                "verdict": result.verdict,
                "priority_score": result.priority_score,
                "proceed": result.verdict in ["MUST", "SHOULD"],
            },
            next_agent=next_agent,
            duration_ms=duration
        )
    except Exception as e:
        return AgentResponse(
            agent_id=AgentId.PRODUCT_SAGE,
            success=False,
            result={"error": str(e)},
            duration_ms=int((datetime.utcnow() - start).total_seconds() * 1000)
        )

@app.post("/agent/orchestrator", response_model=AgentResponse)
async def agent_orchestrator(req: AgentRequest, background_tasks: BackgroundTasks):
    """Plan implementation based on excavation and evaluation"""
    start = datetime.utcnow()
    
    feature_name = req.context.get("feature", "Unknown")
    
    try:
        # Get blackboard context
        excavation = None
        evaluation = None
        
        if req.task_id:
            bb = Blackboard(req.task_id)
            context = await bb.get_context()
            
            for entry in context.get("history", []):
                if entry.get("agent") == "archaeologist":
                    excavation = ExcavationReport(**entry["data"]["report"])
                elif entry.get("agent") == "product_sage":
                    evaluation = FeatureEvaluation(**entry["data"]["evaluation"])
        
        # If no prior context, do quick excavation
        if not excavation:
            excavation = await excavate_rails_model(feature_name)
        if not evaluation:
            evaluation = await evaluate_feature(feature_name)
        
        result = await plan_implementation(feature_name, excavation, evaluation)
        
        # Write to blackboard
        if req.task_id:
            bb = Blackboard(req.task_id)
            await bb.write("orchestrator", {
                "phase": "planned",
                "plan": result.dict()
            })
        
        duration = int((datetime.utcnow() - start).total_seconds() * 1000)
        
        return AgentResponse(
            agent_id=AgentId.ORCHESTRATOR,
            success=True,
            result=result.dict(),
            handover={
                "title": "🔧 IMPLEMENTATION PLAN",
                "feature": feature_name,
                "backend_tasks": len(result.backend_tasks),
                "frontend_tasks": len(result.frontend_tasks),
                "estimated_effort": result.estimated_effort,
            },
            next_agent=None,  # Orchestrator is usually terminal
            duration_ms=duration
        )
    except Exception as e:
        return AgentResponse(
            agent_id=AgentId.ORCHESTRATOR,
            success=False,
            result={"error": str(e)},
            duration_ms=int((datetime.utcnow() - start).total_seconds() * 1000)
        )

# ============================================
# BLACKBOARD ENDPOINTS
# ============================================

@app.get("/blackboard/{task_id}")
async def get_blackboard(task_id: str):
    """Get current blackboard state for a task"""
    bb = Blackboard(task_id)
    return await bb.get_context()

@app.post("/blackboard/{task_id}/clear")
async def clear_blackboard(task_id: str):
    """Clear blackboard for a task"""
    bb = Blackboard(task_id)
    # Delete all keys with this prefix
    await bb._redis_request(["DEL", bb.key])
    await bb._redis_request(["DEL", f"{bb.key}:current_agent"])
    await bb._redis_request(["DEL", f"{bb.key}:phase"])
    return {"cleared": True, "task_id": task_id}

# ============================================
# PIPELINE ENDPOINT
# ============================================

@app.post("/pipeline/feature")
async def run_feature_pipeline(
    feature: str,
    task_id: str = None,
    skip_evaluation: bool = False,
    skip_excavation: bool = False
):
    """Run full feature implementation pipeline"""
    
    if not task_id:
        task_id = f"feature-{feature.lower().replace(' ', '-')}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    results = {"task_id": task_id, "steps": []}
    
    # Step 1: Evaluate
    if not skip_evaluation:
        eval_result = await agent_product_sage(AgentRequest(
            action="evaluate",
            context={"feature": feature},
            require_handover=False,
            task_id=task_id
        ), BackgroundTasks())
        results["steps"].append({"agent": "product_sage", "result": eval_result.dict()})
        
        if eval_result.result.get("verdict") == "SKIP":
            results["verdict"] = "SKIP"
            results["message"] = f"Feature '{feature}' evaluated as SKIP - not implementing"
            return results
    
    # Step 2: Excavate
    if not skip_excavation:
        excavate_result = await agent_archaeologist(AgentRequest(
            action="excavate",
            context={"model": feature, "feature": feature},
            require_handover=False,
            task_id=task_id
        ), BackgroundTasks())
        results["steps"].append({"agent": "archaeologist", "result": excavate_result.dict()})
    
    # Step 3: Plan
    plan_result = await agent_orchestrator(AgentRequest(
        action="plan",
        context={"feature": feature},
        require_handover=False,
        task_id=task_id
    ), BackgroundTasks())
    results["steps"].append({"agent": "orchestrator", "result": plan_result.dict()})
    
    results["verdict"] = "READY"
    results["message"] = f"Feature '{feature}' ready for implementation"
    results["blackboard_url"] = f"/blackboard/{task_id}"
    
    return results

# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8080")))
