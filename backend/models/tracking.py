from pydantic import BaseModel, validator, ConfigDict, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _info=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class TrackingStatus(str, Enum):
    """Tracking status enumeration"""
    ORDER_CREATED = "order_created"         # Order created
    ORDER_RECEIVED = "order_received"       # Order received
    PAYMENT_RECEIVED = "payment_received"   # Payment received
    ORDER_CONFIRMED = "order_confirmed"     # Order confirmed
    PROCESSING = "processing"               # Processing
    PREPARING = "preparing"                 # Preparing
    PACKED = "packed"                       # Packed
    SHIPPED = "shipped"                     # Shipped
    IN_TRANSIT = "in_transit"              # In transit
    OUT_FOR_DELIVERY = "out_for_delivery"  # Out for delivery
    DELIVERED = "delivered"                 # Delivered
    DELIVERY_FAILED = "delivery_failed"     # Delivery failed
    CANCELLED = "cancelled"                 # Cancelled
    REFUNDED = "refunded"                   # Refunded
    RETURNED = "returned"                   # Returned

class TrackingEventBase(BaseModel):
    """Tracking event base model"""
    status: TrackingStatus
    location: str
    description: str
    timestamp: datetime

class TrackingEvent(TrackingEventBase):
    """Tracking event complete model"""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class TrackingEventResponse(TrackingEventBase):
    """Tracking event response model"""
    id: str
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class OrderTrackingBase(BaseModel):
    """Order tracking base model"""
    order_id: str
    order_number: str
    tracking_number: str
    carrier: str
    current_status: TrackingStatus
    estimated_delivery: Optional[datetime] = None
    events: List[TrackingEvent] = []

class OrderTracking(OrderTrackingBase):
    """Order tracking complete model"""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class OrderTrackingResponse(OrderTrackingBase):
    """Order tracking response model"""
    id: str
    created_at: datetime
    updated_at: datetime
    events: List[TrackingEventResponse]

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class TrackingCreate(BaseModel):
    """Create tracking model"""
    order_id: str
    carrier: str = "AWE Express"
    estimated_delivery: Optional[datetime] = None

class TrackingUpdate(BaseModel):
    """Update tracking model"""
    status: Optional[TrackingStatus] = None
    description: Optional[str] = None
    location: Optional[str] = None
    operator: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

class TrackingSearch(BaseModel):
    """Tracking search model"""
    tracking_number: Optional[str] = None
    order_number: Optional[str] = None
    customer_id: Optional[str] = None
    status: Optional[TrackingStatus] = None

class DeliveryEstimate(BaseModel):
    """Delivery estimate model"""
    estimated_days: int
    estimated_delivery_date: datetime
    shipping_method: str

class TrackingSummary(BaseModel):
    """Tracking summary model"""
    order_number: str
    current_status: TrackingStatus
    last_update: datetime
    estimated_delivery: Optional[datetime] = None
    progress_percentage: int 