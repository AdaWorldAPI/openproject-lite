"""
Integration Hooks for OpenProject-Lite Agents
==============================================
Connect agent outputs to external systems:
- Notion: Sync blackboard state to project pages
- n8n: Trigger workflows on agent events
- MS Graph: Push to SharePoint/Planner
- Excel: Import/export via SpireDoc
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import httpx
import os
import json
from datetime import datetime

router = APIRouter(prefix="/integrations")

# ============================================
# CONFIG
# ============================================

NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
NOTION_PROJECT_PAGE = os.getenv("NOTION_PROJECT_PAGE", "")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID", "")
AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID", "")
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET", "")
SHAREPOINT_SITE_ID = os.getenv("SHAREPOINT_SITE_ID", "")

# ============================================
# NOTION INTEGRATION
# ============================================

class NotionSyncRequest(BaseModel):
    task_id: str
    page_id: Optional[str] = None
    include_history: bool = True

class NotionBlock(BaseModel):
    type: str
    content: dict

async def get_notion_client():
    """Return configured httpx client for Notion API"""
    return httpx.AsyncClient(
        base_url="https://api.notion.com/v1",
        headers={
            "Authorization": f"Bearer {NOTION_API_KEY}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
    )

def blackboard_to_notion_blocks(blackboard: dict) -> list[dict]:
    """Convert blackboard state to Notion blocks"""
    blocks = []
    
    # Header
    blocks.append({
        "object": "block",
        "type": "heading_1",
        "heading_1": {
            "rich_text": [{"type": "text", "text": {"content": f"🗒️ {blackboard.get('task_id', 'Task')}"}}]
        }
    })
    
    # Phase indicator
    phase = blackboard.get("phase", "unknown")
    phase_emoji = {
        "evaluated": "🎯",
        "excavated": "🏺",
        "planned": "🔧",
        "implemented": "✅"
    }.get(phase, "⏳")
    
    blocks.append({
        "object": "block",
        "type": "callout",
        "callout": {
            "icon": {"type": "emoji", "emoji": phase_emoji},
            "rich_text": [{"type": "text", "text": {"content": f"Phase: {phase}"}}]
        }
    })
    
    # History entries
    for entry in blackboard.get("history", []):
        agent = entry.get("agent", "unknown")
        timestamp = entry.get("timestamp", "")
        data = entry.get("data", {})
        
        # Agent header
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": f"Agent: {agent}"}}]
            }
        })
        
        # Timestamp
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": f"⏰ {timestamp}"}}]
            }
        })
        
        # Data as code block
        blocks.append({
            "object": "block",
            "type": "code",
            "code": {
                "rich_text": [{"type": "text", "text": {"content": json.dumps(data, indent=2)[:2000]}}],
                "language": "json"
            }
        })
    
    return blocks

@router.post("/notion/sync")
async def sync_to_notion(req: NotionSyncRequest, background_tasks: BackgroundTasks):
    """Push blackboard state to Notion page"""
    
    if not NOTION_API_KEY:
        raise HTTPException(400, "Notion API key not configured")
    
    # Get blackboard state
    from main import Blackboard
    bb = Blackboard(req.task_id)
    blackboard = await bb.get_context()
    
    page_id = req.page_id or NOTION_PROJECT_PAGE
    if not page_id:
        raise HTTPException(400, "No Notion page ID provided")
    
    async with await get_notion_client() as client:
        # Update page properties
        await client.patch(f"/pages/{page_id}", json={
            "properties": {
                "Status": {"select": {"name": blackboard.get("phase", "unknown")}},
                "Last Agent": {"rich_text": [{"text": {"content": blackboard.get("current_agent", "none")}}]},
                "Updated": {"date": {"start": datetime.utcnow().isoformat()}}
            }
        })
        
        # Append blocks
        if req.include_history:
            blocks = blackboard_to_notion_blocks(blackboard)
            # Notion allows max 100 blocks per request
            for i in range(0, len(blocks), 100):
                await client.patch(f"/blocks/{page_id}/children", json={
                    "children": blocks[i:i+100]
                })
    
    return {"synced": True, "page_id": page_id, "blocks_added": len(blackboard.get("history", []))}

@router.post("/notion/create-task-page")
async def create_notion_task_page(task_id: str, database_id: str):
    """Create a new Notion page for a task in a database"""
    
    if not NOTION_API_KEY:
        raise HTTPException(400, "Notion API key not configured")
    
    from main import Blackboard
    bb = Blackboard(task_id)
    blackboard = await bb.get_context()
    
    async with await get_notion_client() as client:
        response = await client.post("/pages", json={
            "parent": {"database_id": database_id},
            "properties": {
                "Name": {"title": [{"text": {"content": task_id}}]},
                "Status": {"select": {"name": blackboard.get("phase", "new")}},
                "Agent": {"rich_text": [{"text": {"content": blackboard.get("current_agent", "none")}}]}
            },
            "children": blackboard_to_notion_blocks(blackboard)
        })
        
        result = response.json()
        return {"page_id": result.get("id"), "url": result.get("url")}

# ============================================
# N8N INTEGRATION
# ============================================

class N8nEvent(BaseModel):
    event: str  # agent_started, agent_complete, pipeline_done, error
    task_id: str
    agent_id: Optional[str] = None
    data: dict = {}

@router.post("/n8n/trigger")
async def trigger_n8n(event: N8nEvent):
    """Trigger n8n workflow via webhook"""
    
    if not N8N_WEBHOOK_URL:
        raise HTTPException(400, "n8n webhook URL not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(N8N_WEBHOOK_URL, json={
            "event": event.event,
            "task_id": event.task_id,
            "agent_id": event.agent_id,
            "data": event.data,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "openproject-lite-agents"
        })
        
        return {
            "triggered": response.status_code == 200,
            "n8n_response": response.text[:500]
        }

@router.post("/n8n/setup-webhook")
async def setup_n8n_webhook_info():
    """Return info for setting up n8n webhook"""
    return {
        "webhook_url": "Set N8N_WEBHOOK_URL env var to your n8n webhook URL",
        "expected_events": [
            "agent_started",
            "agent_complete", 
            "pipeline_done",
            "error"
        ],
        "payload_example": {
            "event": "agent_complete",
            "task_id": "feature-versions-20260127",
            "agent_id": "archaeologist",
            "data": {"associations": 5, "validations": 3},
            "timestamp": "2026-01-27T12:00:00Z"
        }
    }

# ============================================
# MS GRAPH / SHAREPOINT INTEGRATION
# ============================================

class MSGraphToken:
    """Manage Azure AD tokens"""
    _token: str = None
    _expires: datetime = None
    
    @classmethod
    async def get_token(cls) -> str:
        if cls._token and cls._expires and datetime.utcnow() < cls._expires:
            return cls._token
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://login.microsoftonline.com/{AZURE_TENANT_ID}/oauth2/v2.0/token",
                data={
                    "client_id": AZURE_CLIENT_ID,
                    "client_secret": AZURE_CLIENT_SECRET,
                    "scope": "https://graph.microsoft.com/.default",
                    "grant_type": "client_credentials"
                }
            )
            data = response.json()
            cls._token = data["access_token"]
            cls._expires = datetime.utcnow() + timedelta(seconds=data["expires_in"] - 60)
            return cls._token

async def get_graph_client():
    """Return configured httpx client for MS Graph"""
    token = await MSGraphToken.get_token()
    return httpx.AsyncClient(
        base_url="https://graph.microsoft.com/v1.0",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )

class SharePointSyncRequest(BaseModel):
    task_id: str
    site_id: Optional[str] = None
    list_name: str = "Tasks"

@router.post("/sharepoint/sync")
async def sync_to_sharepoint(req: SharePointSyncRequest):
    """Push task state to SharePoint list"""
    
    if not all([AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET]):
        raise HTTPException(400, "Azure credentials not configured")
    
    from main import Blackboard
    bb = Blackboard(req.task_id)
    blackboard = await bb.get_context()
    
    site_id = req.site_id or SHAREPOINT_SITE_ID
    if not site_id:
        raise HTTPException(400, "No SharePoint site ID provided")
    
    async with await get_graph_client() as client:
        # Get list ID
        lists_response = await client.get(f"/sites/{site_id}/lists")
        lists = lists_response.json().get("value", [])
        target_list = next((l for l in lists if l["name"] == req.list_name), None)
        
        if not target_list:
            raise HTTPException(404, f"List '{req.list_name}' not found")
        
        list_id = target_list["id"]
        
        # Create or update item
        # First, search for existing item
        items_response = await client.get(
            f"/sites/{site_id}/lists/{list_id}/items",
            params={"$filter": f"fields/Title eq '{req.task_id}'"}
        )
        existing = items_response.json().get("value", [])
        
        item_data = {
            "fields": {
                "Title": req.task_id,
                "Status": blackboard.get("phase", "new"),
                "CurrentAgent": blackboard.get("current_agent", "none"),
                "LastUpdated": datetime.utcnow().isoformat()
            }
        }
        
        if existing:
            # Update existing
            item_id = existing[0]["id"]
            await client.patch(f"/sites/{site_id}/lists/{list_id}/items/{item_id}", json=item_data)
            return {"action": "updated", "item_id": item_id}
        else:
            # Create new
            response = await client.post(f"/sites/{site_id}/lists/{list_id}/items", json=item_data)
            return {"action": "created", "item_id": response.json().get("id")}

@router.post("/sharepoint/create-plan")
async def create_sharepoint_plan(task_id: str, plan_name: str = None):
    """Create a Planner plan from implementation plan"""
    
    if not all([AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET]):
        raise HTTPException(400, "Azure credentials not configured")
    
    from main import Blackboard
    bb = Blackboard(task_id)
    blackboard = await bb.get_context()
    
    # Find orchestrator plan in history
    plan_data = None
    for entry in blackboard.get("history", []):
        if entry.get("agent") == "orchestrator":
            plan_data = entry.get("data", {}).get("plan")
            break
    
    if not plan_data:
        raise HTTPException(400, "No implementation plan found in blackboard")
    
    async with await get_graph_client() as client:
        # Note: Creating Planner plans requires group context
        # This is a simplified example
        return {
            "message": "Planner integration requires Group ID",
            "plan_data": plan_data,
            "instructions": "Use the plan_data to manually create tasks in Planner, or provide a Group ID"
        }

# ============================================
# EXCEL IMPORT/EXPORT
# ============================================

class ExcelExportRequest(BaseModel):
    task_id: str
    include_history: bool = True

@router.post("/excel/export")
async def export_to_excel(req: ExcelExportRequest):
    """Export blackboard state to Excel format (JSON for now, SpireDoc later)"""
    
    from main import Blackboard
    bb = Blackboard(req.task_id)
    blackboard = await bb.get_context()
    
    # Flatten for Excel
    rows = []
    for entry in blackboard.get("history", []):
        row = {
            "task_id": req.task_id,
            "agent": entry.get("agent"),
            "timestamp": entry.get("timestamp"),
            "phase": entry.get("data", {}).get("phase"),
            "data_summary": json.dumps(entry.get("data", {}))[:500]
        }
        rows.append(row)
    
    return {
        "format": "json",
        "rows": rows,
        "note": "For actual Excel export, integrate SpireXLS or openpyxl"
    }

class ExcelImportRequest(BaseModel):
    task_id: str
    data: list[dict]

@router.post("/excel/import")
async def import_from_excel(req: ExcelImportRequest):
    """Import data from Excel format into blackboard"""
    
    from main import Blackboard
    bb = Blackboard(req.task_id)
    
    imported = 0
    for row in req.data:
        await bb.write(
            agent_id=row.get("agent", "import"),
            data={
                "phase": row.get("phase", "imported"),
                "imported_data": row
            }
        )
        imported += 1
    
    return {"imported": imported, "task_id": req.task_id}

# ============================================
# IMAP/EMAIL INTEGRATION (Future)
# ============================================

@router.get("/email/status")
async def email_status():
    """Placeholder for email integration"""
    return {
        "status": "not_implemented",
        "planned_features": [
            "Send agent reports via email",
            "Create tasks from emails",
            "Email notifications on pipeline completion"
        ],
        "note": "Use n8n for email workflows in the meantime"
    }
