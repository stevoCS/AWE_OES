from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
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

class CartItem(BaseModel):
    """Shopping cart item model"""
    product_id: str
    product_name: str
    product_price: float
    quantity: int
    selected: bool = True

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

    @property
    def subtotal(self) -> float:
        """Calculate item subtotal"""
        return self.product_price * self.quantity

class CartItemUpdate(BaseModel):
    """Shopping cart item update model"""
    quantity: Optional[int] = None
    selected: Optional[bool] = None

    @validator('quantity')
    def validate_quantity(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Product quantity must be greater than 0')
        return v

class CartAddItem(BaseModel):
    """Add item to cart model"""
    product_id: str
    quantity: int = 1

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Product quantity must be greater than 0')
        return v

class ShoppingCartBase(BaseModel):
    """Shopping cart base model"""
    customer_id: str
    items: List[CartItem] = []

class ShoppingCart(ShoppingCartBase):
    """Shopping cart complete model"""
    id: Optional[PyObjectId] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

    @property
    def total_items(self) -> int:
        """Calculate total number of items in cart"""
        return sum(item.quantity for item in self.items if item.selected)

    @property
    def total_price(self) -> float:
        """Calculate cart total price (excluding tax and shipping)"""
        return sum(item.subtotal for item in self.items if item.selected)

    @property
    def tax_amount(self) -> float:
        """Calculate tax (assuming 8% tax rate)"""
        return self.total_price * 0.08

    @property
    def shipping_fee(self) -> float:
        """Calculate shipping fee (free shipping over $100, otherwise $10)"""
        return 0.0 if self.total_price >= 100 else 10.0

    @property
    def final_total(self) -> float:
        """Calculate final total (including tax and shipping)"""
        return self.total_price + self.tax_amount + self.shipping_fee

class ShoppingCartResponse(ShoppingCartBase):
    """Shopping cart response model"""
    id: str
    created_at: datetime
    updated_at: datetime
    total_items: int
    total_price: float
    tax_amount: float
    shipping_fee: float
    final_total: float

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CartSummary(BaseModel):
    """Cart summary model"""
    total_items: int
    total_price: float
    tax_amount: float
    shipping_fee: float
    final_total: float 