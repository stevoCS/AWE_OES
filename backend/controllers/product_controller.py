from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import status

from database.connection import get_collection
from models.product import Product, ProductCreate, ProductUpdate, ProductResponse, ProductSearch
from utils.response import APIException

class ProductController:
    """Product management controller"""
    
    @staticmethod
    async def create_product(product_data: ProductCreate) -> ProductResponse:
        """Create product"""
        collection = await get_collection("products")
        
        # Create product object
        product = Product(
            name=product_data.name,
            description=product_data.description,
            price=product_data.price,
            category=product_data.category,
            brand=product_data.brand,
            model=product_data.model,
            specifications=product_data.specifications,
            images=product_data.images,
            stock_quantity=product_data.stock_quantity,
            is_available=product_data.is_available,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Insert into database
        result = await collection.insert_one(product.dict(by_alias=True, exclude={"id"}))
        
        # Get created product
        product_doc = await collection.find_one({"_id": result.inserted_id})
        product_doc["id"] = str(product_doc["_id"])
        del product_doc["_id"]
        
        return ProductResponse(**product_doc)
    
    @staticmethod
    async def get_product(product_id: str) -> ProductResponse:
        """Get single product details"""
        collection = await get_collection("products")
        
        # Validate ObjectId format
        if not ObjectId.is_valid(product_id):
            raise APIException("Invalid product ID format", status.HTTP_400_BAD_REQUEST)
        
        try:
            product_doc = await collection.find_one({"_id": ObjectId(product_id)})
            if not product_doc:
                raise APIException("Product not found", status.HTTP_404_NOT_FOUND)
        except Exception as e:
            if "invalid ObjectId" in str(e):
                raise APIException("Invalid product ID format", status.HTTP_400_BAD_REQUEST)
            raise APIException("Database error", status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Increment view count (optional operation, don't fail if it doesn't work)
        try:
            await collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$inc": {"views_count": 1}}
            )
        except:
            pass  # Don't fail the request if view count update fails
        
        # Convert data structure to match ProductResponse
        converted_doc = {
            "id": str(product_doc["_id"]),
            "name": product_doc["name"],
            "description": product_doc["description"],
            "price": product_doc["price"],
            "category": product_doc["category"],
            "brand": product_doc.get("brand", ""),
            "model": product_doc.get("model", ""),
            "specifications": product_doc.get("specifications", {}),
            "images": product_doc.get("images", []),
            "stock_quantity": product_doc.get("stock_quantity", 0),
            "stock": product_doc.get("stock_quantity", product_doc.get("stock", 0)),
            "is_available": product_doc.get("is_available", True),
            "created_at": product_doc.get("created_at", datetime.now()),
            "updated_at": product_doc.get("updated_at", datetime.now()),
            "views_count": product_doc.get("views_count", 0),
            "sales_count": product_doc.get("sales_count", 0)
        }
        
        return ProductResponse(**converted_doc)
    
    @staticmethod
    async def update_product(product_id: str, update_data: ProductUpdate) -> ProductResponse:
        """Update product information"""
        collection = await get_collection("products")
        
        # Prepare update data
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updated_at"] = datetime.now()
        
        # Update product
        result = await collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise APIException("Product not found", status.HTTP_404_NOT_FOUND)
        
        # Return updated product
        return await ProductController.get_product(product_id)
    
    @staticmethod
    async def delete_product(product_id: str) -> bool:
        """Delete product"""
        collection = await get_collection("products")
        
        result = await collection.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count == 0:
            raise APIException("Product not found", status.HTTP_404_NOT_FOUND)
        
        return True
    
    @staticmethod
    async def search_products(
        search_params: ProductSearch,
        page: int = 1,
        size: int = 20
    ) -> tuple[List[ProductResponse], int]:
        """Search products"""
        collection = await get_collection("products")
        
        # Build query conditions
        query = {}
        
        if search_params.keyword:
            query["$or"] = [
                {"name": {"$regex": search_params.keyword, "$options": "i"}},
                {"description": {"$regex": search_params.keyword, "$options": "i"}},
                {"brand": {"$regex": search_params.brand, "$options": "i"}} if search_params.brand else {}
            ]
        
        if search_params.category:
            query["category"] = search_params.category
        
        if search_params.brand:
            query["brand"] = search_params.brand
        
        if search_params.min_price is not None or search_params.max_price is not None:
            price_query = {}
            if search_params.min_price is not None:
                price_query["$gte"] = search_params.min_price
            if search_params.max_price is not None:
                price_query["$lte"] = search_params.max_price
            query["price"] = price_query
        
        if search_params.in_stock_only:
            query["stock"] = {"$gt": 0}
            query["active"] = True
        
        # Build sorting conditions
        sort_direction = 1 if search_params.sort_order == "asc" else -1
        sort_field = search_params.sort_by or "name"
        
        # Calculate pagination parameters
        skip = (page - 1) * size
        
        # Execute query
        cursor = collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(size)
        products = await cursor.to_list(length=size)
        
        # Calculate total count
        total = await collection.count_documents(query)
        
        # Convert to response format
        product_responses = []
        for product_doc in products:
            # Convert data structure to match ProductResponse
            converted_doc = {
                "id": str(product_doc["_id"]),
                "name": product_doc["name"],
                "description": product_doc["description"],
                "price": product_doc["price"],
                "category": product_doc["category"],
                "brand": product_doc.get("brand", ""),
                "model": product_doc.get("model", ""),
                "specifications": product_doc.get("specifications", {}),
                "images": product_doc.get("images", []),
                "stock_quantity": product_doc.get("stock_quantity", 0),
                "stock": product_doc.get("stock_quantity", product_doc.get("stock", 0)),
                "is_available": product_doc.get("is_available", True),
                "created_at": product_doc.get("created_at", datetime.now()),
                "updated_at": product_doc.get("updated_at", datetime.now()),
                "views_count": product_doc.get("views_count", 0),
                "sales_count": product_doc.get("sales_count", 0)
            }
            product_responses.append(ProductResponse(**converted_doc))
        
        return product_responses, total
    
    @staticmethod
    async def get_categories() -> List[dict]:
        """Get product category list"""
        collection = await get_collection("products")
        
        # Get all categories
        categories = await collection.distinct("category")
        
        # Count products in each category
        category_list = []
        for category in categories:
            count = await collection.count_documents({"category": category, "active": True})
            category_list.append({
                "name": category,
                "count": count
            })
        
        return category_list
    
    @staticmethod
    async def get_brands() -> List[dict]:
        """Get brand list"""
        collection = await get_collection("products")
        
        # Get all brands
        brands = await collection.distinct("brand")
        
        # Count products for each brand
        brand_list = []
        for brand in brands:
            if brand:  # Exclude null values
                count = await collection.count_documents({"brand": brand, "active": True})
                brand_list.append({
                    "name": brand,
                    "count": count
                })
        
        return brand_list
    
    @staticmethod
    async def update_stock(product_id: str, quantity_change: int) -> ProductResponse:
        """Update product stock"""
        collection = await get_collection("products")
        
        # Update stock
        result = await collection.update_one(
            {"_id": ObjectId(product_id)},
            {
                "$inc": {"stock_quantity": quantity_change},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        if result.matched_count == 0:
            raise APIException("Product not found", status.HTTP_404_NOT_FOUND)
        
        # Check if stock becomes negative
        product_doc = await collection.find_one({"_id": ObjectId(product_id)})
        if product_doc["stock_quantity"] < 0:
            # Rollback operation
            await collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$inc": {"stock_quantity": -quantity_change}}
            )
            raise APIException("Insufficient stock", status.HTTP_400_BAD_REQUEST)
        
        return await ProductController.get_product(product_id) 