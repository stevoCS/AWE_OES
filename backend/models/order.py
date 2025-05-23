from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId
import uuid

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

class OrderStatus(str, Enum):
    """Order status enumeration"""
    PENDING = "pending"           # Pending payment
    PAID = "paid"                # Paid
    PROCESSING = "processing"     # Processing
    SHIPPED = "shipped"          # Shipped
    DELIVERED = "delivered"      # Delivered
    COMPLETED = "completed"      # Completed
    CANCELLED = "cancelled"      # Cancelled
    REFUNDED = "refunded"        # Refunded

class PaymentMethod(str, Enum):
    """Payment method enumeration"""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    WECHAT_PAY = "wechat_pay"
    ALIPAY = "alipay"
    BANK_TRANSFER = "bank_transfer"

class OrderItem(BaseModel):
    """Order item model"""
    product_id: str
    product_name: str
    product_price: float
    quantity: int
    subtotal: float

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Product quantity must be greater than 0')
        return v

    @validator('product_price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Product price must be greater than 0')
        return v

class ShippingAddress(BaseModel):
    """Shipping address model"""
    recipient_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "United States"

class OrderBase(BaseModel):
    """Order base model"""
    customer_id: str
    order_number: str
    items: List[OrderItem]
    shipping_address: ShippingAddress
    payment_method: PaymentMethod
    subtotal: float
    tax_amount: float
    shipping_fee: float
    total_amount: float
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    """Order creation model"""
    shipping_address: ShippingAddress
    payment_method: PaymentMethod
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    """Order update model"""
    status: Optional[OrderStatus] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None

class Order(OrderBase):
    """Order complete model"""
    id: Optional[PyObjectId] = None
    status: OrderStatus = OrderStatus.PENDING
    tracking_number: Optional[str] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

    @classmethod
    def generate_order_number(cls) -> str:
        """Generate order number"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"AWE{timestamp}{unique_id}"

class OrderResponse(OrderBase):
    """Order response model"""
    id: str
    status: OrderStatus
    tracking_number: Optional[str]
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OrderSearch(BaseModel):
    """Order search model"""
    customer_id: Optional[str] = None
    status: Optional[OrderStatus] = None
    order_number: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"

class OrderSummary(BaseModel):
    """Order summary model"""
    order_number: str
    status: OrderStatus
    total_amount: float
    created_at: datetime
    item_count: int 