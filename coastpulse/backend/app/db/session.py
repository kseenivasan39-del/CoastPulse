import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Resolve relative sqlite database URL to project absolute path if needed
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite+aiosqlite:///./"):
    # Resolve relative to project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    db_file = os.path.join(project_root, "coastpulse_dev.db")
    db_url = f"sqlite+aiosqlite:///{db_file.replace(os.sep, '/')}"

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
