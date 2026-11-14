import asyncio
from app.db.session import engine, Base, AsyncSessionLocal
from app.db.seed import seed_initial_fixtures

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as s:
        await seed_initial_fixtures(s)
    print("Database schema and fixtures initialized successfully.")

if __name__ == "__main__":
    asyncio.run(init())
