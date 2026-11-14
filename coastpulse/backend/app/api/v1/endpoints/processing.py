import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db, AsyncSessionLocal
from app.models.database import ProcessingJob, Acquisition
from app.schemas.api_models import JobSubmitRequest, JobResponse
from app.services.job_service import BackgroundJobService

router = APIRouter()


@router.post("/submit", response_model=JobResponse, status_code=202, tags=["Processing Jobs"])
async def submit_job(
    request: JobSubmitRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a computationally intensive SAR radiometric calibration or change analysis job.
    Executes asynchronously via non-blocking background workers.
    """
    # Verify input granule exists
    acq_res = await db.execute(select(Acquisition).where(Acquisition.id == request.granule_id))
    if not acq_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Target granule '{request.granule_id}' does not exist in catalog.")

    job = await BackgroundJobService.create_job(
        session=db,
        job_name=request.job_name,
        granule_id=request.granule_id,
        algorithm=request.algorithm,
        parameters=request.parameters,
    )

    # Dispatch to background task runner
    background_tasks.add_task(
        BackgroundJobService.run_simulated_sar_pipeline,
        job_id=job.id,
        async_session_factory=AsyncSessionLocal,
    )

    return job


@router.get("", response_model=List[JobResponse], tags=["Processing Jobs"])
async def list_jobs(
    status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
):
    """
    List all background processing jobs.
    """
    stmt = select(ProcessingJob)
    if status:
        stmt = stmt.where(ProcessingJob.status == status.upper())
    stmt = stmt.order_by(ProcessingJob.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{job_id}", response_model=JobResponse, tags=["Processing Jobs"])
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """
    Poll processing status, progress percentage, and operational logs for an active job.
    """
    result = await db.execute(select(ProcessingJob).where(ProcessingJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return job


@router.post("/{job_id}/cancel", response_model=JobResponse, tags=["Processing Jobs"])
async def cancel_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """
    Cancels an active or queued background processing job.
    """
    job = await BackgroundJobService.cancel_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found or cannot be cancelled.")
    return job
