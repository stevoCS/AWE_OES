from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import status

from database.connection import get_collection
from models.order import Order, OrderCreate, OrderUpdate, OrderResponse, OrderSearch, OrderItem, OrderStatus
from models.tracking import OrderTracking, TrackingStatus
from controllers.cart_controller import CartController
from controllers.product_controller import ProductController
from utils.response import APIException

class OrderController:
    """Order management controller"""
    
    @staticmethod
    async def create_order(customer_id: str, order_data: OrderCreate) -> OrderResponse:
        """Create order from shopping cart"""
        # Get shopping cart
        cart = await CartController.get_cart(customer_id)
        
        if not cart.items or cart.total_items == 0:
            raise APIException("Shopping cart is empty, cannot create order", status.HTTP_400_BAD_REQUEST)
        
        # Check selected items' stock
        selected_items = [item for item in cart.items if item.selected]
        if not selected_items:
            raise APIException("Please select items to purchase", status.HTTP_400_BAD_REQUEST)
        
        order_items = []
        for cart_item in selected_items:
            # Validate product and stock
            product = await ProductController.get_product(cart_item.product_id)
            if not product.is_available:
                raise APIException(f"Product {product.name} is unavailable", status.HTTP_400_BAD_REQUEST)
            
            if product.stock_quantity < cart_item.quantity:
                raise APIException(f"Product {product.name} has insufficient stock", status.HTTP_400_BAD_REQUEST)
            
            order_item = OrderItem(
                product_id=cart_item.product_id,
                product_name=cart_item.product_name,
                product_price=cart_item.product_price,
                quantity=cart_item.quantity,
                subtotal=cart_item.subtotal
            )
            order_items.append(order_item)
        
        # Calculate order amounts
        subtotal = sum(item.subtotal for item in order_items)
        tax_amount = subtotal * 0.08  # 8% tax
        shipping_fee = 0.0 if subtotal >= 100 else 10.0  # Free shipping over $100
        total_amount = subtotal + tax_amount + shipping_fee
        
        # Generate order number
        order_number = Order.generate_order_number()
        
        # Create order
        order = Order(
            customer_id=customer_id,
            order_number=order_number,
            items=order_items,
            shipping_address=order_data.shipping_address,
            payment_method=order_data.payment_method,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_fee=shipping_fee,
            total_amount=total_amount,
            notes=order_data.notes,
            status=OrderStatus.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Save order to database
        collection = await get_collection("orders")
        result = await collection.insert_one(order.dict(by_alias=True, exclude={"id"}))
        
        # Update product stock
        for item in order_items:
            await ProductController.update_stock(item.product_id, -item.quantity)
        
        # Create order tracking
        await OrderController._create_order_tracking(str(result.inserted_id), order_number, customer_id)
        
        # Empty shopping cart of selected items
        cart_collection = await get_collection("carts")
        remaining_items = [item for item in cart.items if not item.selected]
        await cart_collection.update_one(
            {"customer_id": customer_id},
            {"$set": {"items": [item.dict() for item in remaining_items], "updated_at": datetime.now()}}
        )
        
        # Return order information
        order_doc = await collection.find_one({"_id": result.inserted_id})
        order_doc["id"] = str(order_doc["_id"])
        del order_doc["_id"]
        
        # Ensure all required fields have default values
        order_doc.setdefault("tracking_number", None)
        order_doc.setdefault("paid_at", None)
        order_doc.setdefault("shipped_at", None)
        order_doc.setdefault("delivered_at", None)
        order_doc.setdefault("notes", None)
        
        return OrderResponse(**order_doc)
    
    @staticmethod
    async def get_order(order_id: str, customer_id: Optional[str] = None) -> OrderResponse:
        """Get order details"""
        collection = await get_collection("orders")
        
        query = {"_id": ObjectId(order_id)}
        if customer_id:
            query["customer_id"] = customer_id
        
        order_doc = await collection.find_one(query)
        if not order_doc:
            raise APIException("Order not found", status.HTTP_404_NOT_FOUND)
        
        order_doc["id"] = str(order_doc["_id"])
        del order_doc["_id"]
        
        # Ensure all required fields have default values
        order_doc.setdefault("tracking_number", None)
        order_doc.setdefault("paid_at", None)
        order_doc.setdefault("shipped_at", None)
        order_doc.setdefault("delivered_at", None)
        order_doc.setdefault("notes", None)
        
        return OrderResponse(**order_doc)
    
    @staticmethod
    async def get_order_by_number(order_number: str, customer_id: Optional[str] = None) -> OrderResponse:
        """Get order by order number"""
        collection = await get_collection("orders")
        
        query = {"order_number": order_number}
        if customer_id:
            query["customer_id"] = customer_id
        
        order_doc = await collection.find_one(query)
        if not order_doc:
            raise APIException("Order not found", status.HTTP_404_NOT_FOUND)
        
        order_doc["id"] = str(order_doc["_id"])
        del order_doc["_id"]
        
        return OrderResponse(**order_doc)
    
    @staticmethod
    async def update_order_status(order_id: str, update_data: OrderUpdate) -> OrderResponse:
        """Update order status"""
        collection = await get_collection("orders")
        
        # Prepare update data
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updated_at"] = datetime.now()
        
        # Update timestamps based on status
        if update_data.status:
            if update_data.status == OrderStatus.PAID:
                update_dict["paid_at"] = datetime.now()
            elif update_data.status == OrderStatus.SHIPPED:
                update_dict["shipped_at"] = datetime.now()
            elif update_data.status == OrderStatus.DELIVERED:
                update_dict["delivered_at"] = datetime.now()
        
        # Update order
        result = await collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise APIException("Order not found", status.HTTP_404_NOT_FOUND)
        
        # Update order tracking
        if update_data.status:
            await OrderController._update_order_tracking(order_id, update_data.status)
        
        return await OrderController.get_order(order_id)
    
    @staticmethod
    async def search_orders(
        search_params: OrderSearch,
        page: int = 1,
        size: int = 20
    ) -> tuple[List[OrderResponse], int]:
        """Search orders"""
        collection = await get_collection("orders")
        
        # Build query conditions
        query = {}
        
        if search_params.customer_id:
            query["customer_id"] = search_params.customer_id
        
        if search_params.status:
            query["status"] = search_params.status
        
        if search_params.order_number:
            query["order_number"] = {"$regex": search_params.order_number, "$options": "i"}
        
        if search_params.start_date or search_params.end_date:
            date_query = {}
            if search_params.start_date:
                date_query["$gte"] = search_params.start_date
            if search_params.end_date:
                date_query["$lte"] = search_params.end_date
            query["created_at"] = date_query
        
        # Build sorting conditions
        sort_direction = 1 if search_params.sort_order == "asc" else -1
        sort_field = search_params.sort_by or "created_at"
        
        # Calculate pagination parameters
        skip = (page - 1) * size
        
        # Execute query
        cursor = collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(size)
        orders = await cursor.to_list(length=size)
        
        # Calculate total count
        total = await collection.count_documents(query)
        
        # Convert to response format
        order_responses = []
        for order_doc in orders:
            order_doc["id"] = str(order_doc["_id"])
            del order_doc["_id"]
            
            # Ensure all required fields have default values
            order_doc.setdefault("tracking_number", None)
            order_doc.setdefault("paid_at", None)
            order_doc.setdefault("shipped_at", None)
            order_doc.setdefault("delivered_at", None)
            order_doc.setdefault("notes", None)
            
            order_responses.append(OrderResponse(**order_doc))
        
        return order_responses, total
    
    @staticmethod
    async def cancel_order(order_id: str, customer_id: str) -> OrderResponse:
        """Cancel order"""
        # Get order
        order = await OrderController.get_order(order_id, customer_id)
        
        # Check order status
        if order.status not in [OrderStatus.PENDING, OrderStatus.PAID]:
            raise APIException("Order status does not allow cancellation", status.HTTP_400_BAD_REQUEST)
        
        # Update order status
        update_data = OrderUpdate(status=OrderStatus.CANCELLED)
        updated_order = await OrderController.update_order_status(order_id, update_data)
        
        # Restore stock
        for item in order.items:
            await ProductController.update_stock(item.product_id, item.quantity)
        
        return updated_order
    
    @staticmethod
    async def _create_order_tracking(order_id: str, order_number: str, customer_id: str):
        """Create order tracking record"""
        from controllers.tracking_controller import TrackingController
        
        tracking_data = {
            "order_id": order_id,
            "order_number": order_number,
            "customer_id": customer_id,
            "current_status": TrackingStatus.ORDER_CREATED
        }
        
        await TrackingController.create_tracking(tracking_data)
    
    @staticmethod
    async def _update_order_tracking(order_id: str, status: OrderStatus):
        """Update order tracking status"""
        from controllers.tracking_controller import TrackingController
        
        # Status mapping
        status_mapping = {
            OrderStatus.PAID: TrackingStatus.PAYMENT_RECEIVED,
            OrderStatus.PROCESSING: TrackingStatus.PROCESSING,
            OrderStatus.SHIPPED: TrackingStatus.SHIPPED,
            OrderStatus.DELIVERED: TrackingStatus.DELIVERED,
            OrderStatus.CANCELLED: TrackingStatus.CANCELLED,
            OrderStatus.REFUNDED: TrackingStatus.REFUNDED
        }
        
        if status in status_mapping:
            await TrackingController.update_tracking_by_order_id(
                order_id, 
                status_mapping[status],
                f"Order status updated to: {status.value}"
            ) 