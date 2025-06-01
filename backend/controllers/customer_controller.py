from typing import List, Tuple, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from datetime import datetime

from database.connection import get_collection
from models.customer import Customer, CustomerCreate, CustomerUpdate, CustomerSearch, CustomerResponse
from models.order import Order

class CustomerController:
    @staticmethod
    async def search_customers(
        search_params: CustomerSearch,
        page: int = 1,
        size: int = 20
    ) -> Tuple[List[CustomerResponse], int]:
        """Search customers with pagination"""
        customers_collection = await get_collection("customers")
        orders_collection = await get_collection("orders")
        
        # Build search query
        query = {}
        if search_params.keyword:
            keyword_regex = {"$regex": search_params.keyword, "$options": "i"}
            query["$or"] = [
                {"full_name": keyword_regex},
                {"email": keyword_regex},
                {"username": keyword_regex}
            ]
        
        # Get total count
        total = await customers_collection.count_documents(query)
        
        # Calculate skip value
        skip = (page - 1) * size
        
        # Build sort parameters
        sort_field = search_params.sort_by or "created_at"
        sort_direction = -1 if search_params.sort_order == "desc" else 1
        
        # Execute query with pagination
        cursor = customers_collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(size)
        customers_data = await cursor.to_list(length=size)
        
        # Convert to CustomerResponse objects and calculate statistics
        customers = []
        for data in customers_data:
            customer_id = data["_id"]
            
            # Calculate order statistics for this customer
            order_stats_pipeline = [
                {"$match": {"customer_id": customer_id}},
                {"$group": {
                    "_id": None,
                    "total_orders": {"$sum": 1},
                    "total_spent": {"$sum": "$total_amount"}
                }}
            ]
            
            stats_result = await orders_collection.aggregate(order_stats_pipeline).to_list(1)
            order_stats = stats_result[0] if stats_result else {"total_orders": 0, "total_spent": 0}
            
            # Prepare customer data
            data["id"] = str(data["_id"])
            del data["_id"]
            # Remove sensitive data
            data.pop("hashed_password", None)
            
            # Add calculated statistics
            data["total_orders"] = order_stats["total_orders"]
            data["total_spent"] = float(order_stats["total_spent"] or 0)
            
            customers.append(CustomerResponse(**data))
        
        return customers, total
    
    @staticmethod
    async def get_customer(customer_id: str) -> CustomerResponse:
        """Get customer by ID"""
        collection = await get_collection("customers")
        
        # Validate ObjectId
        if not ObjectId.is_valid(customer_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        customer_data = await collection.find_one({"_id": ObjectId(customer_id)})
        
        if not customer_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Convert ObjectId to string and remove sensitive data
        customer_data["id"] = str(customer_data["_id"])
        del customer_data["_id"]
        customer_data.pop("hashed_password", None)
        
        return CustomerResponse(**customer_data)
    
    @staticmethod
    async def get_customer_orders(
        customer_id: str,
        page: int = 1,
        size: int = 10
    ) -> Tuple[List[Order], int]:
        """Get customer order history"""
        customers_collection = await get_collection("customers")
        orders_collection = await get_collection("orders")
        
        # Validate ObjectId
        if not ObjectId.is_valid(customer_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        # Check if customer exists
        customer_exists = await customers_collection.find_one({"_id": ObjectId(customer_id)})
        if not customer_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Build query for customer orders
        query = {"customer_id": ObjectId(customer_id)}
        
        # Get total count
        total = await orders_collection.count_documents(query)
        
        # Calculate skip value
        skip = (page - 1) * size
        
        # Execute query with pagination
        cursor = orders_collection.find(query).sort("created_at", -1).skip(skip).limit(size)
        orders_data = await cursor.to_list(length=size)
        
        # Convert to Order objects
        orders = []
        for data in orders_data:
            data["id"] = str(data["_id"])
            del data["_id"]
            if "customer_id" in data:
                data["customer_id"] = str(data["customer_id"])
            orders.append(Order(**data))
        
        return orders, total
    
    @staticmethod
    async def update_customer(customer_id: str, update_data: CustomerUpdate) -> CustomerResponse:
        """Update customer information"""
        collection = await get_collection("customers")
        
        # Validate ObjectId
        if not ObjectId.is_valid(customer_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        # Prepare update data
        update_dict = update_data.dict(exclude_unset=True)
        if update_dict:
            update_dict["updated_at"] = datetime.utcnow()
        
        # Update customer
        result = await collection.update_one(
            {"_id": ObjectId(customer_id)},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Return updated customer
        updated_customer_data = await collection.find_one({"_id": ObjectId(customer_id)})
        updated_customer_data["id"] = str(updated_customer_data["_id"])
        del updated_customer_data["_id"]
        updated_customer_data.pop("hashed_password", None)
        
        return CustomerResponse(**updated_customer_data)
    
    @staticmethod
    async def delete_customer(customer_id: str) -> None:
        """Delete customer"""
        customers_collection = await get_collection("customers")
        orders_collection = await get_collection("orders")
        
        # Validate ObjectId
        if not ObjectId.is_valid(customer_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        # Check if customer has any orders
        order_count = await orders_collection.count_documents({"customer_id": ObjectId(customer_id)})
        if order_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete customer with existing orders"
            )
        
        # Delete customer
        result = await customers_collection.delete_one({"_id": ObjectId(customer_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )