import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.database import User, Workspace, UserRole
from app.schemas.api_models import WorkspaceCreateRequest, WorkspaceResponse
from app.core.deps import get_current_user, require_role

router = APIRouter()


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED, tags=["Workspaces"])
async def create_workspace(
    request: WorkspaceCreateRequest,
    current_user: User = Depends(require_role(UserRole.RESEARCHER, UserRole.ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a persistent research workspace with saved areas of interest (AOIs) and satellite granules.
    """
    workspace = Workspace(
        id=f"ws-{uuid.uuid4().hex[:10]}",
        user_id=current_user.id,
        name=request.name,
        description=request.description,
        aoi_geojson=request.aoi_geojson,
        saved_granules=request.saved_granules,
    )
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    return workspace


@router.get("", response_model=List[WorkspaceResponse], tags=["Workspaces"])
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists research workspaces owned by the authenticated researcher (or all for administrator).
    """
    stmt = select(Workspace)
    if current_user.role != UserRole.ADMINISTRATOR:
        stmt = stmt.where(Workspace.user_id == current_user.id)
    stmt = stmt.order_by(Workspace.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{workspace_id}", response_model=WorkspaceResponse, tags=["Workspaces"])
async def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves a specific workspace by ID.
    """
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(status_code=404, detail=f"Workspace '{workspace_id}' not found.")
    if workspace.user_id != current_user.id and current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this workspace.")
    return workspace


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Workspaces"])
async def delete_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Deletes a research workspace.
    """
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(status_code=404, detail=f"Workspace '{workspace_id}' not found.")
    if workspace.user_id != current_user.id and current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this workspace.")
    await db.delete(workspace)
    await db.commit()
    return None
