import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db = Database()

async def get_database():
    """Get database instance"""
    return db.database

async def connect_to_mongo():
    """Connect to MongoDB database"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "awe_electronics_store")
    
    print(f"Connecting to MongoDB: {mongodb_url}")
    db.client = AsyncIOMotorClient(mongodb_url)
    db.database = db.client[database_name]
    
    try:
        # Test connection
        await db.client.admin.command('ping')
        print("Successfully connected to MongoDB database")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise e

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("MongoDB connection closed")

async def get_collection(collection_name: str):
    """Get specified collection"""
    database = await get_database()
    return database[collection_name] 