from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.database import AnalysisResult
from app.schemas.api_models import AnalysisResultResponse

router = APIRouter()


@router.get("", response_model=List[AnalysisResultResponse], tags=["Analysis"])
async def list_analysis_results(
    analysis_type: Optional[str] = Query(None, description="CHANGE_DETECTION, WATER_DELINEATION"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns verified analysis records, metrics, and cryptographic provenance hashes.
    """
    stmt = select(AnalysisResult)
    if analysis_type:
        stmt = stmt.where(AnalysisResult.analysis_type == analysis_type.upper())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{analysis_id}", response_model=AnalysisResultResponse, tags=["Analysis"])
async def get_analysis_result(analysis_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves full calculated metrics, uncertainty bounds, and spatial indicators for an analysis run.
    """
    result = await db.execute(select(AnalysisResult).where(AnalysisResult.id == analysis_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    return record
