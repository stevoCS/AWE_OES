#!/usr/bin/env python3
"""
product data initialization script
add basic product data to AWE Electronics database
"""
import asyncio
from datetime import datetime
from database.connection import get_collection, connect_to_mongo, close_mongo_connection

# 产品数据
PRODUCTS = [
    {
        "name": "TechPro Ultrabook Pro",
        "description": "high performance ultrabook",
        "price": 2299.99,
        "category": "Electronics",
        "brand": "TechPro",
        "model": "UB-2024",
        "specifications": {
            "CPU": "Intel Core i7-13700H",
            "RAM": "16GB DDR5",
            "Storage": "512GB SSD",
            "Display": "14寸 2K IPS",
            "Graphics": "integrated graphics",
            "Weight": "1.3kg"
        },
        "images": ["/src/assets/laptop.png"],
        "stock_quantity": 15,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Samsung Galaxy S24 Ultra",
        "description": "latest flagship smartphone, excellent photo and performance",
        "price": 1499.99,
        "category": "Electronics", 
        "brand": "Samsung",
        "model": "SM-S928",
        "specifications": {
            "Display": "6.8寸 Dynamic AMOLED",
            "CPU": "Snapdragon 8 Gen 3",
            "RAM": "12GB",
            "Storage": "256GB",
            "Camera": "200MP main camera",
            "Battery": "5000mAh"
        },
        "images": ["/src/assets/Phone.png"],
        "stock_quantity": 25,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "SoundWave SmartHome Speaker",
        "description": "smart home speaker, support voice assistant and multi-room audio",
        "price": 299.99,
        "category": "Electronics",
        "brand": "SoundWave",
        "model": "SHS-100",
        "specifications": {
            "Audio": "360° surround sound",
            "Connectivity": "WiFi, Bluetooth 5.2",
            "Voice Assistant": "support multiple voice assistants",
            "Power": "30W",
            "Size": "直径 120mm"
        },
        "images": ["/src/assets/Speaker.png"],
        "stock_quantity": 30,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "FitTrack Pro Smartwatch",
        "description": "professional sports smartwatch,全天健康监测",
        "price": 199.99,
        "category": "Electronics",
        "brand": "FitTech",
        "model": "FT-SW300",
        "specifications": {
            "Display": "1.4寸 AMOLED",
            "Battery": "7 days battery life",
            "Sensors": "heart rate, blood oxygen, GPS",
            "Waterproof": "5ATM waterproof",
            "Compatibility": "iOS/Android"
        },
        "images": ["/src/assets/smartwatch.png"],
        "stock_quantity": 40,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Wireless Gaming Mouse Pro",
        "description": "high precision wireless gaming mouse, RGB backlight design",
        "price": 79.99,
        "category": "Electronics",
        "brand": "Logitech",
        "model": "WGM-500",
        "specifications": {
            "DPI": "25600 DPI",
            "Connectivity": "2.4GHz wireless + USB-C",
            "Battery": "70 hours battery life",
            "Buttons": "8 programmable buttons",
            "RGB": "16.8 million color backlight"
        },
        "images": ["/src/assets/Wireless mouse.png"],
        "stock_quantity": 150,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Fast Wall Charger 65W",
        "description": "GaN fast wall charger, support multiple devices charging at the same time",
        "price": 49.99,
        "category": "Electronics",
        "brand": "PowerTech",
        "model": "PWC-65",
        "specifications": {
            "Power": "65W total power",
            "Ports": "2x USB-C + 1x USB-A",
            "Technology": "GaN",
            "Safety": "multiple safety protection",
            "Size": "compact and portable design"
        },
        "images": ["/src/assets/Well charger.png"],
        "stock_quantity": 200,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "VR Gaming Headset Elite",
        "description": "immersive VR headset, suitable for gaming and entertainment",
        "price": 599.99,
        "category": "Electronics",
        "brand": "VisionTech",
        "model": "VR-E200",
        "specifications": {
            "Display": "dual 2K OLED screen",
            "Refresh Rate": "90Hz",
            "Field of View": "110°",
            "Tracking": "6DOF tracking",
            "Audio": "built-in 3D audio"
        },
        "images": ["/src/assets/VR Headset.png"],
        "stock_quantity": 8,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Apple Magic Keyboard",
        "description": "apple official wireless keyboard, elegant design and excellent",
        "price": 129.99,
        "category": "Electronics",
        "brand": "Apple",
        "model": "MK2A3",
        "specifications": {
            "Layout": "QWERTY layout",
            "Connectivity": "Lightning + Bluetooth",
            "Battery": "rechargeable lithium battery",
            "Design": "ultra-thin aluminum body",
            "Compatibility": "Mac series products"
        },
        "images": ["/src/assets/Keyboard.png"],
        "stock_quantity": 85,
        "is_available": True,
        "views_count": 0,
        "sales_count": 0,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

async def init_products():
    """initialize product data"""
    try:
        # 首先连接数据库
        await connect_to_mongo()
        
        collection = await get_collection("products")
        
        # 检查是否已有产品数据
        existing_count = await collection.count_documents({})
        if existing_count > 0:
            print(f"database already has {existing_count} products, skip initialization")
            return
        
        # 插入产品数据
        result = await collection.insert_many(PRODUCTS)
        
        print(f"✅ successfully initialized {len(result.inserted_ids)} products:")
        for i, product in enumerate(PRODUCTS, 1):
            print(f"  {i}. {product['name']} - ${product['price']}")
        
        print(f"\n🎉 database initialization completed!")
        
    except Exception as e:
        print(f"❌ initialization failed: {e}")
        raise
    finally:
        # 关闭数据库连接
        await close_mongo_connection()

if __name__ == "__main__":
    print("🚀 start initializing AWE Electronics product data...")
    asyncio.run(init_products()) 