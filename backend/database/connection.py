import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from typing import Optional
import ssl
import certifi

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
    
    print(f"Connecting to MongoDB...")
    
    try:
        # Create client with server API version for MongoDB Atlas
        if "mongodb+srv" in mongodb_url:
            # MongoDB Atlas connection with minimal SSL configuration
            db.client = AsyncIOMotorClient(
                mongodb_url, 
                server_api=ServerApi('1'),
                tls=True,
                tlsAllowInvalidCertificates=True
            )
        else:
            # Local MongoDB connection
            db.client = AsyncIOMotorClient(mongodb_url)
            
        db.database = db.client[database_name]
        
        # Test connection
        await db.client.admin.command('ping')
        print(f"✅ Successfully connected to MongoDB database: {database_name}")
        
        # List collections for debugging
        collections = await db.database.list_collection_names()
        print(f"📁 Available collections: {collections}")
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("💡 If SSL certificate error persists, try updating certificates or using alternative SSL config")
        raise e

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("🔒 MongoDB connection closed")

async def get_collection(collection_name: str):
    """Get specified collection"""
    database = await get_database()
    return database[collection_name]

async def test_connection():
    """Test MongoDB connection"""
    try:
        await db.client.admin.command('ping')
        return True
    except Exception as e:
        print(f"Connection test failed: {e}")
        return False 