#!/usr/bin/env python3
"""
Database initialization script
Used to create MongoDB indexes and initial data
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def create_indexes():
    """Create database indexes"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "awe_electronics_store")
    
    print(f"Connecting to MongoDB: {mongodb_url}")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    try:
        # Customer collection indexes
        print("Creating customer collection indexes...")
        await db.customers.create_index("username", unique=True)
        await db.customers.create_index("email", unique=True)
        await db.customers.create_index("created_at")
        
        # Product collection indexes
        print("Creating product collection indexes...")
        await db.products.create_index([("name", "text"), ("description", "text")])
        await db.products.create_index("category")
        await db.products.create_index("brand")
        await db.products.create_index("price")
        await db.products.create_index("is_available")
        await db.products.create_index("created_at")
        
        # Cart collection indexes
        print("Creating cart collection indexes...")
        await db.carts.create_index("customer_id", unique=True)
        await db.carts.create_index("updated_at")
        
        # Order collection indexes
        print("Creating order collection indexes...")
        await db.orders.create_index("customer_id")
        await db.orders.create_index("order_number", unique=True)
        await db.orders.create_index("status")
        await db.orders.create_index("created_at")
        await db.orders.create_index("updated_at")
        
        # Tracking collection indexes
        print("Creating tracking collection indexes...")
        await db.tracking.create_index("order_id", unique=True)
        await db.tracking.create_index("order_number")
        await db.tracking.create_index("tracking_number")
        await db.tracking.create_index("customer_id")
        await db.tracking.create_index("current_status")
        await db.tracking.create_index("updated_at")
        
        print("✅ All indexes created successfully")
        
    except Exception as e:
        print(f"❌ Error creating indexes: {e}")
    finally:
        client.close()

async def create_sample_data():
    """Create sample data"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "awe_electronics_store")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    try:
        # Check if product data already exists
        product_count = await db.products.count_documents({})
        if product_count > 0:
            print("Product data already exists in database, skipping sample data creation")
            return
        
        print("Creating sample product data...")
        
        # Sample product data
        sample_products = [
            {
                "name": "iPhone 15 Pro",
                "description": "Apple's latest smartphone featuring A17 Pro chip",
                "price": 999.0,
                "category": "Smartphones",
                "brand": "Apple",
                "model": "iPhone 15 Pro",
                "specifications": {
                    "screen_size": "6.1 inches",
                    "storage": "128GB",
                    "color": "Titanium Blue"
                },
                "images": [
                    "/images/iphone15pro-1.jpg",
                    "/images/iphone15pro-2.jpg"
                ],
                "stock_quantity": 50,
                "is_available": True,
                "views_count": 0,
                "sales_count": 0,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "name": "MacBook Air M2",
                "description": "Lightweight and portable laptop featuring M2 chip",
                "price": 1199.0,
                "category": "Laptops",
                "brand": "Apple",
                "model": "MacBook Air M2",
                "specifications": {
                    "screen_size": "13.6 inches",
                    "memory": "8GB",
                    "storage": "256GB SSD",
                    "color": "Midnight"
                },
                "images": [
                    "/images/macbook-air-m2-1.jpg",
                    "/images/macbook-air-m2-2.jpg"
                ],
                "stock_quantity": 30,
                "is_available": True,
                "views_count": 0,
                "sales_count": 0,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "name": "AirPods Pro 2",
                "description": "Active noise cancelling wireless earbuds with spatial audio support",
                "price": 249.0,
                "category": "Headphones",
                "brand": "Apple",
                "model": "AirPods Pro 2",
                "specifications": {
                    "type": "In-ear",
                    "connectivity": "Bluetooth 5.3",
                    "battery_life": "6 hours (with ANC on)"
                },
                "images": [
                    "/images/airpods-pro-2-1.jpg",
                    "/images/airpods-pro-2-2.jpg"
                ],
                "stock_quantity": 100,
                "is_available": True,
                "views_count": 0,
                "sales_count": 0,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "name": "iPad Air 5",
                "description": "Tablet computer featuring M1 chip with Apple Pencil support",
                "price": 599.0,
                "category": "Tablets",
                "brand": "Apple",
                "model": "iPad Air 5",
                "specifications": {
                    "screen_size": "10.9 inches",
                    "storage": "64GB",
                    "color": "Pink",
                    "connectivity": "Wi-Fi"
                },
                "images": [
                    "/images/ipad-air-5-1.jpg",
                    "/images/ipad-air-5-2.jpg"
                ],
                "stock_quantity": 25,
                "is_available": True,
                "views_count": 0,
                "sales_count": 0,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "name": "Samsung Galaxy S24",
                "description": "Samsung flagship smartphone with AI features",
                "price": 799.0,
                "category": "Smartphones",
                "brand": "Samsung",
                "model": "Galaxy S24",
                "specifications": {
                    "screen_size": "6.2 inches",
                    "storage": "256GB",
                    "color": "Phantom Black",
                    "ram": "8GB"
                },
                "images": [
                    "/images/galaxy-s24-1.jpg",
                    "/images/galaxy-s24-2.jpg"
                ],
                "stock_quantity": 40,
                "is_available": True,
                "views_count": 0,
                "sales_count": 0,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        ]
        
        # Insert sample products
        result = await db.products.insert_many(sample_products)
        print(f"✅ Created {len(result.inserted_ids)} sample products")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
    finally:
        client.close()

async def main():
    """Main function"""
    print("🚀 Starting AWE Electronics database initialization...")
    
    # Create indexes
    await create_indexes()
    
    # Create sample data
    await create_sample_data()
    
    print("🎉 Database initialization completed!")

if __name__ == "__main__":
    asyncio.run(main()) 