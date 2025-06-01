from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from datetime import datetime, timedelta
from database.connection import get_collection
from models.product import ProductCreate, ProductUpdate, Product
from models.order import Order
from models.customer import Customer
from bson import ObjectId
from typing import Optional, List
import os
import json
from pathlib import Path

router = APIRouter()

# ==================== Dashboard Statistics ====================

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics data"""
    try:
        # Get collections
        orders_collection = await get_collection("orders")
        products_collection = await get_collection("products")
        customers_collection = await get_collection("customers")
        
        # Calculate total orders
        total_orders = await orders_collection.count_documents({})
        
        # Calculate total products
        total_products = await products_collection.count_documents({})
        
        # Calculate total customers
        total_customers = await customers_collection.count_documents({})
        
        # Calculate today's orders
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_orders = await orders_collection.count_documents({
            "created_at": {"$gte": today}
        })
        
        # Calculate total revenue
        pipeline = [
            {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
        ]
        revenue_result = await orders_collection.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
        
        # Calculate monthly revenue
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_pipeline = [
            {"$match": {"created_at": {"$gte": month_start}}},
            {"$group": {"_id": None, "month_revenue": {"$sum": "$total_amount"}}}
        ]
        month_result = await orders_collection.aggregate(month_pipeline).to_list(1)
        month_revenue = month_result[0]["month_revenue"] if month_result else 0
        
        return {
            "success": True,
            "data": {
                "total_orders": total_orders,
                "total_products": total_products,
                "total_customers": total_customers,
                "today_orders": today_orders,
                "total_revenue": total_revenue,
                "month_revenue": month_revenue
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics data: {str(e)}")

@router.get("/dashboard/sales-trends")
async def get_sales_trends():
    """Get sales trends data"""
    try:
        orders_collection = await get_collection("orders")
        
        # Get sales data for the past 7 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=6)
        
        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$gte": start_date.replace(hour=0, minute=0, second=0, microsecond=0),
                        "$lte": end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$created_at"
                        }
                    },
                    "daily_revenue": {"$sum": "$total_amount"},
                    "daily_orders": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        
        results = await orders_collection.aggregate(pipeline).to_list(7)
        
        return {
            "success": True,
            "data": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sales trends: {str(e)}")

@router.get("/dashboard/best-selling-products")
async def get_best_selling_products():
    """Get best selling products"""
    try:
        products_collection = await get_collection("products")
        
        # Sort by sales count, get top 5 products
        cursor = products_collection.find({}).sort("sales_count", -1).limit(5)
        products = await cursor.to_list(5)
        
        # Convert ObjectId to string
        for product in products:
            product["id"] = str(product["_id"])
            del product["_id"]
            
        return {
            "success": True,
            "data": products
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get best selling products: {str(e)}")

# ==================== Product Management ====================

@router.get("/products")
async def get_all_products(page: int = 1, limit: int = 10, search: str = ""):
    """Get all products"""
    try:
        collection = await get_collection("products")
        
        # Build query conditions
        query = {}
        if search:
            query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"brand": {"$regex": search, "$options": "i"}}
                ]
            }
        
        # Calculate skip amount
        skip = (page - 1) * limit
        
        # Get total count
        total = await collection.count_documents(query)
        
        # Get product data
        cursor = collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
        products = await cursor.to_list(limit)
        
        # Convert ObjectId to string
        for product in products:
            product["id"] = str(product["_id"])
            del product["_id"]
            
        return {
            "success": True,
            "data": {
                "items": products,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get product list: {str(e)}")

@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get single product details"""
    try:
        collection = await get_collection("products")
        
        product = await collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        product["id"] = str(product["_id"])
        del product["_id"]
        
        return {
            "success": True,
            "data": product
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get product details: {str(e)}")

@router.post("/products")
async def create_product(product_data: ProductCreate):
    """Create new product"""
    try:
        collection = await get_collection("products")
        
        # Create product data
        product_dict = product_data.dict()
        product_dict["created_at"] = datetime.now()
        product_dict["updated_at"] = datetime.now()
        product_dict["views_count"] = 0
        product_dict["sales_count"] = 0
        
        result = await collection.insert_one(product_dict)
        
        # Get created product
        created_product = await collection.find_one({"_id": result.inserted_id})
        created_product["id"] = str(created_product["_id"])
        del created_product["_id"]
        
        return {
            "success": True,
            "data": created_product,
            "message": "Product created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

@router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductUpdate):
    """Update product"""
    try:
        collection = await get_collection("products")
        
        # Check if product exists
        existing_product = await collection.find_one({"_id": ObjectId(product_id)})
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Update data
        update_data = {k: v for k, v in product_data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.now()
        
        await collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        # Get updated product
        updated_product = await collection.find_one({"_id": ObjectId(product_id)})
        updated_product["id"] = str(updated_product["_id"])
        del updated_product["_id"]
        
        return {
            "success": True,
            "data": updated_product,
            "message": "Product updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")

@router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete product"""
    try:
        collection = await get_collection("products")
        
        # Check if product exists
        product = await collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Delete product
        await collection.delete_one({"_id": ObjectId(product_id)})
        
        return {
            "success": True,
            "message": "Product deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")

# ==================== Order Management ====================

@router.get("/orders")
async def get_all_orders(page: int = 1, limit: int = 10, status: str = ""):
    """Get all orders"""
    try:
        collection = await get_collection("orders")
        
        # Build query conditions
        query = {}
        if status:
            query["status"] = status
        
        # Calculate skip amount
        skip = (page - 1) * limit
        
        # Get total count
        total = await collection.count_documents(query)
        
        # Get order data
        cursor = collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
        orders = await cursor.to_list(limit)
        
        # Convert ObjectId to string
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
            
        return {
            "success": True,
            "data": {
                "items": orders,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order list: {str(e)}")

@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """Get single order details"""
    try:
        collection = await get_collection("orders")
        
        order = await collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        order["id"] = str(order["_id"])
        del order["_id"]
        
        return {
            "success": True,
            "data": order
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order details: {str(e)}")

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    """Update order status"""
    try:
        collection = await get_collection("orders")
        
        # Check if order exists
        order = await collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update status
        await collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": status, "updated_at": datetime.now()}}
        )
        
        return {
            "success": True,
            "message": "Order status updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update order status: {str(e)}")

# ==================== Customer Management ====================

@router.get("/customers")
async def get_all_customers(page: int = 1, limit: int = 10):
    """Get all customers"""
    try:
        collection = await get_collection("customers")
        
        # Calculate skip amount
        skip = (page - 1) * limit
        
        # Get total count
        total = await collection.count_documents({})
        
        # Get customer data
        cursor = collection.find({}).skip(skip).limit(limit).sort("created_at", -1)
        customers = await cursor.to_list(limit)
        
        # Convert ObjectId to string and remove sensitive information
        for customer in customers:
            customer["id"] = str(customer["_id"])
            del customer["_id"]
            if "hashed_password" in customer:
                del customer["hashed_password"]
            
        return {
            "success": True,
            "data": {
                "items": customers,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get customer list: {str(e)}")

# ==================== Image Upload ====================

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload product image"""
    try:
        # Create upload directory
        upload_dir = Path("frontend/src/assets/products")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Check file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are supported")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Return relative path
        relative_path = f"/src/assets/products/{unique_filename}"
        
        return {
            "success": True,
            "data": {
                "filename": unique_filename,
                "path": relative_path,
                "url": relative_path
            },
            "message": "Image uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# ==================== System Settings ====================

@router.get("/settings")
async def get_system_settings():
    """Get system settings"""
    try:
        collection = await get_collection("settings")
        
        settings = await collection.find_one({"type": "system"})
        if not settings:
            # Return default settings
            settings = {
                "site_name": "AWE Electronics",
                "site_description": "Electronics Store",
                "contact_email": "admin@aweelectronics.com",
                "contact_phone": "+1-234-567-8900"
            }
        else:
            settings["id"] = str(settings["_id"])
            del settings["_id"]
        
        return {
            "success": True,
            "data": settings
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system settings: {str(e)}")

@router.put("/settings")
async def update_system_settings(settings_data: dict):
    """Update system settings"""
    try:
        collection = await get_collection("settings")
        
        settings_data["type"] = "system"
        settings_data["updated_at"] = datetime.now()
        
        # Use upsert to update or create settings
        await collection.replace_one(
            {"type": "system"}, 
            settings_data, 
            upsert=True
        )
        
        return {
            "success": True,
            "message": "System settings updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update system settings: {str(e)}") 