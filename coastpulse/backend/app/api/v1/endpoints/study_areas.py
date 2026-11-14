from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.database import StudyArea
from app.schemas.api_models import StudyAreaResponse

router = APIRouter()


@router.get("", response_model=List[StudyAreaResponse], tags=["Study Areas"])
async def list_study_areas(db: AsyncSession = Depends(get_db)):
    """
    Returns registered target coastal ecosystems.
    """
    result = await db.execute(select(StudyArea))
    return result.scalars().all()


@router.get("/{area_id}", response_model=StudyAreaResponse, tags=["Study Areas"])
async def get_study_area(area_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns spatial boundaries and ecological parameters for a designated area.
    """
    result = await db.execute(select(StudyArea).where(StudyArea.id == area_id))
    area = result.scalar_one_or_none()
    if not area:
        raise HTTPException(status_code=404, detail=f"Study area '{area_id}' not found.")
    return area
