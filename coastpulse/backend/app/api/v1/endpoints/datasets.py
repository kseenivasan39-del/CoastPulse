from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.database import Dataset, Acquisition
from app.schemas.api_models import DatasetResponse, AcquisitionResponse

router = APIRouter()


@router.get("", response_model=List[DatasetResponse], tags=["Dataset Catalogue"])
async def list_datasets(
    radar_band: Optional[str] = Query(None, description="Filter by band (L, S, C)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns list of registered SAR missions and instruments.
    """
    stmt = select(Dataset)
    if radar_band:
        stmt = stmt.where(Dataset.radar_band == radar_band.upper())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{dataset_id}", response_model=DatasetResponse, tags=["Dataset Catalogue"])
async def get_dataset(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns dataset metadata by unique identifier.
    """
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return dataset


@router.get("/{dataset_id}/acquisitions", response_model=List[AcquisitionResponse], tags=["Dataset Catalogue"])
async def list_dataset_acquisitions(
    dataset_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns verified SAR acquisitions associated with a specific dataset.
    """
    stmt = (
        select(Acquisition)
        .where(Acquisition.dataset_id == dataset_id)
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
