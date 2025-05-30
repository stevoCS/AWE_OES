from pydantic import BaseModel, validator, ConfigDict, Field
from typing import List, Optional
from datetime import datetime
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

class CartItemBase(BaseModel):
    """Cart item base model"""
    customer_id: str
    product_id: str
    product_name: str
    product_price: float
    quantity: int

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

class CartItemCreate(BaseModel):
    """Cart item creation model"""
    product_id: str
    quantity: int

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Product quantity must be greater than 0')
        return v

class CartItemUpdate(BaseModel):
    """Cart item update model"""
    quantity: int

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Product quantity must be greater than 0')
        return v

class CartItem(CartItemBase):
    """Cart item complete model"""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @property
    def subtotal(self) -> float:
        """Calculate item subtotal"""
        return self.product_price * self.quantity

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class CartItemResponse(CartItemBase):
    """Cart item response model"""
    id: str
    created_at: datetime
    updated_at: datetime
    subtotal: float

class CartSummary(BaseModel):
    """Shopping cart summary model"""
    items: List[CartItemResponse]
    total_items: int
    subtotal: float
    estimated_tax: float
    estimated_shipping: float
    estimated_total: float

class Cart(BaseModel):
    """Shopping cart model"""
    customer_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @property
    def total_items(self) -> int:
        """Total number of items in cart"""
        return sum(item.quantity for item in self.items)

    @property
    def subtotal(self) -> float:
        """Calculate cart subtotal"""
        return sum(item.subtotal for item in self.items)

    @property
    def estimated_tax(self) -> float:
        """Calculate estimated tax (8.5%)"""
        return round(self.subtotal * 0.085, 2)

    @property
    def estimated_shipping(self) -> float:
        """Calculate estimated shipping fee"""
        if self.subtotal >= 50:
            return 0.0  # Free shipping for orders over $50
        return 9.99

    @property
    def estimated_total(self) -> float:
        """Calculate estimated total"""
        return self.subtotal + self.estimated_tax + self.estimated_shipping

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    ) 