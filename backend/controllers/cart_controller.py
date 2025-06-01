from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import status

from database.connection import get_collection
from models.cart import CartItem, CartItemCreate, CartItemUpdate, CartItemResponse, CartSummary
from models.product import ProductResponse
from controllers.product_controller import ProductController
from utils.response import APIException

class CartController:
    """Shopping cart management controller"""
    
    @staticmethod
    async def add_item_to_cart(customer_id: str, add_item: CartItemCreate) -> CartSummary:
        """Add item to shopping cart"""
        # Validate ObjectIds
        if not ObjectId.is_valid(customer_id):
            raise APIException("Invalid customer ID", status.HTTP_400_BAD_REQUEST)
        if not ObjectId.is_valid(add_item.product_id):
            raise APIException("Invalid product ID", status.HTTP_400_BAD_REQUEST)
        
        # Get product information
        product = await ProductController.get_product(add_item.product_id)
        
        # Check stock
        if product.stock_quantity < add_item.quantity:
            raise APIException("Insufficient stock", status.HTTP_400_BAD_REQUEST)
        
        if not product.is_available:
            raise APIException("Product is unavailable", status.HTTP_400_BAD_REQUEST)
        
        collection = await get_collection("cart_items")
        
        # Check if item already exists in cart
        existing_item = await collection.find_one({
            "customer_id": ObjectId(customer_id),
            "product_id": ObjectId(add_item.product_id)
        })
        
        if existing_item:
            # Update quantity
            new_quantity = existing_item["quantity"] + add_item.quantity
            if new_quantity > product.stock_quantity:
                raise APIException("Insufficient stock", status.HTTP_400_BAD_REQUEST)
            
            await collection.update_one(
                {
                    "customer_id": ObjectId(customer_id),
                    "product_id": ObjectId(add_item.product_id)
                },
                {
                    "$set": {
                        "quantity": new_quantity,
                        "updated_at": datetime.now()
                    }
                }
            )
        else:
            # Add new item
            cart_item_doc = {
                "customer_id": ObjectId(customer_id),
                "product_id": ObjectId(add_item.product_id),
                "product_name": product.name,
                "product_price": product.price,
                "quantity": add_item.quantity,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            await collection.insert_one(cart_item_doc)
        
        return await CartController.get_cart_summary(customer_id)
    
    @staticmethod
    async def get_cart_summary(customer_id: str) -> CartSummary:
        """Get shopping cart summary"""
        collection = await get_collection("cart_items")
        
        # Validate customer_id
        if not ObjectId.is_valid(customer_id):
            raise APIException("Invalid customer ID", status.HTTP_400_BAD_REQUEST)
        
        # Get all cart items
        cart_items = await collection.find({"customer_id": ObjectId(customer_id)}).to_list(length=None)
        
        # Convert to response model
        item_responses = []
        for item_doc in cart_items:
            item_doc["id"] = str(item_doc["_id"])
            del item_doc["_id"]
            
            # Convert ObjectIds to strings
            item_doc["customer_id"] = str(item_doc["customer_id"])
            item_doc["product_id"] = str(item_doc["product_id"])
            
            # Calculate subtotal
            subtotal = item_doc["product_price"] * item_doc["quantity"]
            item_doc["subtotal"] = subtotal
            
            item_responses.append(CartItemResponse(**item_doc))
        
        # Calculate totals
        total_items = sum(item.quantity for item in item_responses)
        subtotal = sum(item.subtotal for item in item_responses)
        estimated_tax = round(subtotal * 0.085, 2)
        estimated_shipping = 0.0 if subtotal >= 50 else 9.99
        estimated_total = subtotal + estimated_tax + estimated_shipping
        
        return CartSummary(
            items=item_responses,
            total_items=total_items,
            subtotal=subtotal,
            estimated_tax=estimated_tax,
            estimated_shipping=estimated_shipping,
            estimated_total=estimated_total
        )
    
    @staticmethod
    async def update_cart_item(
        customer_id: str,
        product_id: str,
        update_data: CartItemUpdate
    ) -> CartSummary:
        """Update cart item"""
        collection = await get_collection("cart_items")
        
        # Validate ObjectIds
        if not ObjectId.is_valid(customer_id):
            raise APIException("Invalid customer ID", status.HTTP_400_BAD_REQUEST)
        if not ObjectId.is_valid(product_id):
            raise APIException("Invalid product ID", status.HTTP_400_BAD_REQUEST)
        
        # Check stock
        product = await ProductController.get_product(product_id)
        if update_data.quantity > product.stock_quantity:
            raise APIException("Insufficient stock", status.HTTP_400_BAD_REQUEST)
        
        # Update cart item
        result = await collection.update_one(
            {
                "customer_id": ObjectId(customer_id),
                "product_id": ObjectId(product_id)
            },
            {
                "$set": {
                    "quantity": update_data.quantity,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.matched_count == 0:
            raise APIException("Item not found in cart", status.HTTP_404_NOT_FOUND)
        
        return await CartController.get_cart_summary(customer_id)
    
    @staticmethod
    async def remove_cart_item(customer_id: str, product_id: str) -> CartSummary:
        """Remove item from cart"""
        collection = await get_collection("cart_items")
        
        # Validate ObjectIds
        if not ObjectId.is_valid(customer_id):
            raise APIException("Invalid customer ID", status.HTTP_400_BAD_REQUEST)
        if not ObjectId.is_valid(product_id):
            raise APIException("Invalid product ID", status.HTTP_400_BAD_REQUEST)
        
        result = await collection.delete_one({
            "customer_id": ObjectId(customer_id),
            "product_id": ObjectId(product_id)
        })
        
        if result.deleted_count == 0:
            raise APIException("Item not found in cart", status.HTTP_404_NOT_FOUND)
        
        return await CartController.get_cart_summary(customer_id)
    
    @staticmethod
    async def clear_cart(customer_id: str) -> bool:
        """Clear shopping cart"""
        collection = await get_collection("cart_items")
        
        # Validate customer_id
        if not ObjectId.is_valid(customer_id):
            raise APIException("Invalid customer ID", status.HTTP_400_BAD_REQUEST)
        
        result = await collection.delete_many({"customer_id": ObjectId(customer_id)})
        
        return result.deleted_count >= 0
    
    @staticmethod
    async def get_cart_items_count(customer_id: str) -> int:
        """Get cart items count"""
        collection = await get_collection("cart_items")
        
        # Validate customer_id
        if not ObjectId.is_valid(customer_id):
            raise APIException("Invalid customer ID", status.HTTP_400_BAD_REQUEST)
        
        pipeline = [
            {"$match": {"customer_id": ObjectId(customer_id)}},
            {"$group": {"_id": None, "total": {"$sum": "$quantity"}}}
        ]
        
        result = await collection.aggregate(pipeline).to_list(length=1)
        
        return result[0]["total"] if result else 0 