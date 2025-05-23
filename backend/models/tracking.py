from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class TrackingEventType(str, Enum):
    """Tracking event type enumeration"""
    ORDER_CREATED = "order_created"         # Order created
    PAYMENT_RECEIVED = "payment_received"   # Payment received
    ORDER_CONFIRMED = "order_confirmed"     # Order confirmed
    PROCESSING = "processing"               # Processing
    PACKED = "packed"                       # Packed
    SHIPPED = "shipped"                     # Shipped
    IN_TRANSIT = "in_transit"               # In transit
    OUT_FOR_DELIVERY = "out_for_delivery"   # Out for delivery
    DELIVERED = "delivered"                 # Delivered
    CANCELLED = "cancelled"                 # Cancelled
    REFUNDED = "refunded"                   # Refunded

class TrackingEvent(BaseModel):
    """Tracking event model"""
    event_type: TrackingEventType
    timestamp: datetime
    location: Optional[str] = None
    description: str
    operator: Optional[str] = None  # Operator
    
    class Config:
        use_enum_values = True

class OrderTrackingBase(BaseModel):
    """Order tracking base model"""
    order_id: str
    order_number: str
    customer_id: str
    tracking_number: Optional[str] = None
    current_status: TrackingEventType
    events: List[TrackingEvent] = []

class OrderTracking(OrderTrackingBase):
    """Order tracking complete model"""
    id: Optional[PyObjectId] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        use_enum_values = True

    def add_event(self, event_type: TrackingEventType, description: str, 
                  location: Optional[str] = None, operator: Optional[str] = None):
        """Add tracking event"""
        event = TrackingEvent(
            event_type=event_type,
            timestamp=datetime.now(),
            location=location,
            description=description,
            operator=operator
        )
        self.events.append(event)
        self.current_status = event_type
        self.updated_at = datetime.now()

class OrderTrackingResponse(OrderTrackingBase):
    """Order tracking response model"""
    id: str
    created_at: datetime
    updated_at: datetime
    estimated_delivery: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        use_enum_values = True

class TrackingUpdate(BaseModel):
    """Tracking update model"""
    event_type: TrackingEventType
    description: str
    location: Optional[str] = None
    operator: Optional[str] = None
    tracking_number: Optional[str] = None

class TrackingSearch(BaseModel):
    """Tracking search model"""
    order_number: Optional[str] = None
    tracking_number: Optional[str] = None
    customer_id: Optional[str] = None
    status: Optional[TrackingEventType] = None

class DeliveryEstimate(BaseModel):
    """Delivery estimate model"""
    estimated_days: int
    estimated_delivery_date: datetime
    shipping_method: str

class TrackingSummary(BaseModel):
    """Tracking summary model"""
    order_number: str
    current_status: TrackingEventType
    last_update: datetime
    estimated_delivery: Optional[datetime] = None
    progress_percentage: int  # Delivery progress percentage 