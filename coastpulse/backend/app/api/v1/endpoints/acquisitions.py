from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.database import Acquisition
from app.schemas.api_models import AcquisitionResponse

router = APIRouter()


@router.get("", response_model=List[AcquisitionResponse], tags=["Acquisitions"])
async def list_acquisitions(
    orbit_pass: Optional[str] = Query(None, description="ASCENDING or DESCENDING"),
    relative_orbit: Optional[int] = Query(None, description="Track number"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Query individual SAR acquisitions across target study area.
    """
    stmt = select(Acquisition)
    if orbit_pass:
        stmt = stmt.where(Acquisition.orbit_pass == orbit_pass.upper())
    if relative_orbit:
        stmt = stmt.where(Acquisition.relative_orbit == relative_orbit)

    stmt = stmt.order_by(Acquisition.acquisition_date.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{granule_id}", response_model=AcquisitionResponse, tags=["Acquisitions"])
async def get_acquisition(granule_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve acquisition metadata, geometry, and cryptographic hash by granule ID.
    """
    result = await db.execute(select(Acquisition).where(Acquisition.id == granule_id))
    granule = result.scalar_one_or_none()
    if not granule:
        raise HTTPException(status_code=404, detail=f"Acquisition '{granule_id}' not found.")
    return granule
