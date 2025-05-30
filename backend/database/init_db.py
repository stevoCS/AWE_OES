"""
Database initialization script for AWE Electronics Online Store
"""
import asyncio
from dotenv import load_dotenv
from connection import connect_to_mongo, get_database, close_mongo_connection

# Load environment variables
load_dotenv("../config.env")

async def create_collections():
    """Create required collections and indexes"""
    db = await get_database()
    
    # Define collections
    collections = {
        "users": {
            "indexes": [
                ("email", 1),  # Unique email index
                ("username", 1)  # Unique username index
            ],
            "unique_indexes": ["email", "username"]
        },
        "products": {
            "indexes": [
                ("name", 1),
                ("category", 1),
                ("price", 1),
                ("created_at", -1)
            ]
        },
        "categories": {
            "indexes": [
                ("name", 1),
                ("slug", 1)
            ],
            "unique_indexes": ["slug"]
        },
        "orders": {
            "indexes": [
                ("user_id", 1),
                ("order_number", 1),
                ("status", 1),
                ("created_at", -1)
            ],
            "unique_indexes": ["order_number"]
        },
        "cart_items": {
            "indexes": [
                ("user_id", 1),
                ("product_id", 1),
                ("created_at", -1)
            ]
        },
        "order_tracking": {
            "indexes": [
                ("order_id", 1),
                ("tracking_number", 1),
                ("status", 1),
                ("updated_at", -1)
            ],
            "unique_indexes": ["tracking_number"]
        }
    }
    
    print("🔧 Creating collections and indexes...")
    
    for collection_name, config in collections.items():
        try:
            # Create collection if it doesn't exist
            if collection_name not in await db.list_collection_names():
                await db.create_collection(collection_name)
                print(f"✅ Created collection: {collection_name}")
            else:
                print(f"📁 Collection already exists: {collection_name}")
            
            # Create indexes
            collection = db[collection_name]
            
            # Create regular indexes
            for index_field, direction in config.get("indexes", []):
                try:
                    await collection.create_index([(index_field, direction)])
                    print(f"  📑 Created index on {collection_name}.{index_field}")
                except Exception as e:
                    print(f"  ⚠️  Index already exists: {collection_name}.{index_field}")
            
            # Create unique indexes
            for unique_field in config.get("unique_indexes", []):
                try:
                    await collection.create_index(unique_field, unique=True)
                    print(f"  🔒 Created unique index on {collection_name}.{unique_field}")
                except Exception as e:
                    print(f"  ⚠️  Unique index already exists: {collection_name}.{unique_field}")
                    
        except Exception as e:
            print(f"❌ Error creating collection {collection_name}: {e}")

async def insert_sample_data():
    """Insert sample data for development"""
    db = await get_database()
    
    # Sample categories
    categories_data = [
        {
            "name": "New Arrivals",
            "slug": "new-arrivals",
            "description": "Latest products in our store",
            "active": True
        },
        {
            "name": "Best Sellers",
            "slug": "best-sellers", 
            "description": "Most popular products",
            "active": True
        },
        {
            "name": "Laptops",
            "slug": "laptops",
            "description": "Laptops and notebooks",
            "active": True
        },
        {
            "name": "Smartphones",
            "slug": "smartphones",
            "description": "Mobile phones and accessories",
            "active": True
        },
        {
            "name": "Audio",
            "slug": "audio",
            "description": "Speakers, headphones, and audio equipment",
            "active": True
        }
    ]
    
    # Sample products (matching your frontend data)
    products_data = [
        {
            "id": 1,
            "name": "UltraBook Pro 15",
            "description": "Powerful and portable laptop for professionals",
            "price": 1299.99,
            "category": "laptops",
            "image": "/src/assets/laptop.png",
            "stock": 50,
            "specs": {
                "screen": "15.6 inch 4K Display",
                "processor": "Intel Core i7",
                "memory": "16GB RAM",
                "storage": "512GB SSD"
            },
            "active": True
        },
        {
            "id": 2,
            "name": "Galaxy X50",
            "description": "Next-gen mobile experience with advanced features",
            "price": 899.99,
            "category": "smartphones",
            "image": "/src/assets/Phone.png",
            "stock": 100,
            "specs": {
                "screen": "6.7 inch OLED",
                "camera": "108MP Triple Camera",
                "battery": "5000mAh",
                "storage": "256GB"
            },
            "active": True
        },
        {
            "id": 3,
            "name": "SmartHome Speaker",
            "description": "Immersive home environment with smart controls",
            "price": 199.99,
            "category": "audio",
            "image": "/src/assets/Speaker.png",
            "stock": 75,
            "specs": {
                "connectivity": "WiFi, Bluetooth 5.0",
                "voice": "Voice Assistant Built-in",
                "sound": "360-degree Sound",
                "compatibility": "All Smart Devices"
            },
            "active": True
        },
        {
            "id": 4,
            "name": "FitTrack Smartwatch",
            "description": "Track your fitness journey with advanced monitoring",
            "price": 299.99,
            "category": "wearables",
            "image": "/src/assets/smartwatch.png",
            "stock": 60,
            "specs": {
                "display": "1.4 inch AMOLED",
                "battery": "7 days battery life",
                "sensors": "Heart Rate, GPS, Sleep Tracking",
                "waterproof": "5ATM Water Resistant"
            },
            "active": True
        }
    ]
    
    try:
        # Insert categories
        categories_collection = db["categories"]
        existing_categories = await categories_collection.count_documents({})
        if existing_categories == 0:
            await categories_collection.insert_many(categories_data)
            print(f"✅ Inserted {len(categories_data)} sample categories")
        else:
            print(f"📁 Categories already exist ({existing_categories} found)")
        
        # Insert products
        products_collection = db["products"]
        existing_products = await products_collection.count_documents({})
        if existing_products == 0:
            await products_collection.insert_many(products_data)
            print(f"✅ Inserted {len(products_data)} sample products")
        else:
            print(f"📁 Products already exist ({existing_products} found)")
            
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")

async def main():
    """Main initialization function"""
    print("🎯 Initializing AWE Electronics Database...")
    
    try:
        # Connect to database
        await connect_to_mongo()
        
        # Create collections and indexes
        await create_collections()
        
        # Insert sample data
        await insert_sample_data()
        
        print("🎉 Database initialization completed successfully!")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main()) 