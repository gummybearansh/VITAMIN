import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mongodb+srv://root:root@cluster0.hif20.mongodb.net/")

async def init_db():
    client = AsyncIOMotorClient(DATABASE_URL)
    return client["vitamin-dev"]
