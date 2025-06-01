from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
from fastapi import status

from database.connection import get_collection
from models.tracking import (
    OrderTracking, OrderTrackingResponse, TrackingUpdate, TrackingSearch,
    TrackingStatus, TrackingEvent, TrackingSummary, DeliveryEstimate
)
from utils.response import APIException

class TrackingController:
    """Order tracking controller"""
    
    @staticmethod
    async def create_tracking(tracking_data: dict) -> OrderTrackingResponse:
        """Create order tracking record"""
        collection = await get_collection("tracking")
        
        # Create initial tracking event
        initial_event = TrackingEvent(
            status=TrackingStatus.ORDER_CREATED,
            timestamp=datetime.now(),
            description="Order has been created",
            location="Online Store"
        )
        
        tracking = OrderTracking(
            order_id=tracking_data["order_id"],
            order_number=tracking_data["order_number"],
            customer_id=tracking_data["customer_id"],
            current_status=TrackingStatus.ORDER_CREATED,
            events=[initial_event],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Insert into database
        result = await collection.insert_one(tracking.dict(by_alias=True, exclude={"id"}))
        
        # Return created tracking record
        tracking_doc = await collection.find_one({"_id": result.inserted_id})
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def get_tracking_by_order_id(order_id: str) -> OrderTrackingResponse:
        """Get tracking information by order ID"""
        collection = await get_collection("tracking")
        
        tracking_doc = await collection.find_one({"order_id": order_id})
        if not tracking_doc:
            raise APIException("Tracking information not found", status.HTTP_404_NOT_FOUND)
        
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        # Add estimated delivery time
        estimated_delivery = TrackingController._calculate_delivery_estimate(
            tracking_doc["current_status"], 
            tracking_doc["created_at"]
        )
        tracking_doc["estimated_delivery"] = estimated_delivery
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def get_tracking_by_number(order_number: str) -> OrderTrackingResponse:
        """Get tracking information by order number"""
        collection = await get_collection("tracking")
        
        tracking_doc = await collection.find_one({"order_number": order_number})
        if not tracking_doc:
            raise APIException("Tracking information not found", status.HTTP_404_NOT_FOUND)
        
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        # Add estimated delivery time
        estimated_delivery = TrackingController._calculate_delivery_estimate(
            tracking_doc["current_status"], 
            tracking_doc["created_at"]
        )
        tracking_doc["estimated_delivery"] = estimated_delivery
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def get_tracking_by_tracking_number(tracking_number: str) -> OrderTrackingResponse:
        """Get tracking information by tracking number"""
        collection = await get_collection("tracking")
        
        tracking_doc = await collection.find_one({"tracking_number": tracking_number})
        if not tracking_doc:
            raise APIException("Tracking information not found", status.HTTP_404_NOT_FOUND)
        
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def update_tracking_by_order_id(
        order_id: str, 
        status: TrackingStatus, 
        description: str,
        location: Optional[str] = None,
        operator: Optional[str] = None,
        tracking_number: Optional[str] = None
    ) -> OrderTrackingResponse:
        """Update order tracking status"""
        collection = await get_collection("tracking")
        
        # Create new tracking event
        new_event = TrackingEvent(
            status=status,
            timestamp=datetime.now(),
            description=description,
            location=location or "AWE Warehouse"
        )
        
        # Update fields
        update_data = {
            "$push": {"events": new_event.dict()},
            "$set": {
                "current_status": status,
                "updated_at": datetime.now()
            }
        }
        
        # If tracking number is provided, also update it
        if tracking_number:
            update_data["$set"]["tracking_number"] = tracking_number
        
        # Update tracking record
        result = await collection.update_one(
            {"order_id": order_id},
            update_data
        )
        
        if result.matched_count == 0:
            raise APIException("Tracking record not found", status.HTTP_404_NOT_FOUND)
        
        return await TrackingController.get_tracking_by_order_id(order_id)
    
    @staticmethod
    async def search_tracking(
        search_params: TrackingSearch,
        page: int = 1,
        size: int = 20
    ) -> tuple[List[OrderTrackingResponse], int]:
        """Search tracking records"""
        collection = await get_collection("tracking")
        
        # Build query conditions
        query = {}
        
        if search_params.order_number:
            query["order_number"] = {"$regex": search_params.order_number, "$options": "i"}
        
        if search_params.tracking_number:
            query["tracking_number"] = search_params.tracking_number
        
        if search_params.customer_id:
            query["customer_id"] = search_params.customer_id
        
        if search_params.status:
            query["current_status"] = search_params.status
        
        # Calculate pagination parameters
        skip = (page - 1) * size
        
        # Execute query
        cursor = collection.find(query).sort("updated_at", -1).skip(skip).limit(size)
        tracking_records = await cursor.to_list(length=size)
        
        # Calculate total
        total = await collection.count_documents(query)
        
        # Convert to response format
        tracking_responses = []
        for tracking_doc in tracking_records:
            tracking_doc["id"] = str(tracking_doc["_id"])
            del tracking_doc["_id"]
            
            # Add estimated delivery time
            estimated_delivery = TrackingController._calculate_delivery_estimate(
                tracking_doc["current_status"], 
                tracking_doc["created_at"]
            )
            tracking_doc["estimated_delivery"] = estimated_delivery
            
            tracking_responses.append(OrderTrackingResponse(**tracking_doc))
        
        return tracking_responses, total
    
    @staticmethod
    async def get_tracking_summary(customer_id: str) -> List[TrackingSummary]:
        """Get user's order tracking summary"""
        collection = await get_collection("tracking")
        
        # Query user's all tracking records
        cursor = collection.find({"customer_id": customer_id}).sort("updated_at", -1)
        tracking_records = await cursor.to_list(length=None)
        
        summaries = []
        for tracking_doc in tracking_records:
            # Calculate progress percentage
            progress = TrackingController._calculate_progress_percentage(tracking_doc["current_status"])
            
            # Calculate estimated delivery time
            estimated_delivery = TrackingController._calculate_delivery_estimate(
                tracking_doc["current_status"], 
                tracking_doc["created_at"]
            )
            
            summary = TrackingSummary(
                order_number=tracking_doc["order_number"],
                current_status=tracking_doc["current_status"],
                last_update=tracking_doc["updated_at"],
                estimated_delivery=estimated_delivery,
                progress_percentage=progress
            )
            summaries.append(summary)
        
        return summaries
    
    @staticmethod
    def _calculate_delivery_estimate(status: TrackingStatus, created_at: datetime) -> Optional[datetime]:
        """Calculate estimated delivery time"""
        # Calculate estimated delivery time based on order status
        status_days = {
            TrackingStatus.ORDER_CREATED: 7,
            TrackingStatus.PAYMENT_RECEIVED: 6,
            TrackingStatus.ORDER_CONFIRMED: 5,
            TrackingStatus.PROCESSING: 4,
            TrackingStatus.PACKED: 3,
            TrackingStatus.SHIPPED: 2,
            TrackingStatus.IN_TRANSIT: 1,
            TrackingStatus.OUT_FOR_DELIVERY: 0.5,
        }
        
        if status in status_days:
            return created_at + timedelta(days=status_days[status])
        elif status in [TrackingStatus.DELIVERED, TrackingStatus.CANCELLED, TrackingStatus.REFUNDED]:
            return None
        else:
            return created_at + timedelta(days=7)  # Default 7 days
    
    @staticmethod
    def _calculate_progress_percentage(status: TrackingStatus) -> int:
        """Calculate delivery progress percentage"""
        progress_map = {
            TrackingStatus.ORDER_CREATED: 10,
            TrackingStatus.PAYMENT_RECEIVED: 20,
            TrackingStatus.ORDER_CONFIRMED: 30,
            TrackingStatus.PROCESSING: 40,
            TrackingStatus.PACKED: 50,
            TrackingStatus.SHIPPED: 60,
            TrackingStatus.IN_TRANSIT: 80,
            TrackingStatus.OUT_FOR_DELIVERY: 90,
            TrackingStatus.DELIVERED: 100,
            TrackingStatus.CANCELLED: 0,
            TrackingStatus.REFUNDED: 0,
        }
        
        return progress_map.get(status, 0)
    
    @staticmethod
    async def get_delivery_estimate(order_number: str) -> DeliveryEstimate:
        """Get delivery estimate information"""
        tracking = await TrackingController.get_tracking_by_number(order_number)
        
        # Calculate estimated delivery based on current status
        status_days = {
            TrackingStatus.ORDER_CREATED: 7,
            TrackingStatus.PAYMENT_RECEIVED: 6,
            TrackingStatus.ORDER_CONFIRMED: 5,
            TrackingStatus.PROCESSING: 4,
            TrackingStatus.PACKED: 3,
            TrackingStatus.SHIPPED: 2,
            TrackingStatus.IN_TRANSIT: 1,
            TrackingStatus.OUT_FOR_DELIVERY: 0.5,
        }
        
        estimated_days = status_days.get(tracking.current_status, 7)
        estimated_date = datetime.now() + timedelta(days=estimated_days)
        
        # Determine shipping method
        shipping_method = "Standard Shipping"
        if estimated_days <= 1:
            shipping_method = "Express Shipping"
        elif estimated_days <= 3:
            shipping_method = "Fast Shipping"
        
        return DeliveryEstimate(
            estimated_days=int(estimated_days),
            estimated_delivery_date=estimated_date,
            shipping_method=shipping_method
        ) 