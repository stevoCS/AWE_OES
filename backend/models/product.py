from pydantic import BaseModel, validator, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
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

class ProductCategory(BaseModel):
    """Product category model"""
    name: str
    description: Optional[str] = None

class ProductBase(BaseModel):
    """Product base information model"""
    name: str
    description: str
    price: float
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    specifications: Optional[dict] = {}
    features: Optional[List[str]] = []
    images: Optional[List[str]] = []
    stock_quantity: int = 0
    is_available: bool = True
    homepage_section: Optional[str] = None  # "new", "best", or None for not displayed on homepage

    @validator('name')
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('Product name must be at least 2 characters long')
        return v

    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Product price must be greater than 0')
        return v

    @validator('stock_quantity')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError('Stock quantity cannot be negative')
        return v

    @validator('homepage_section')
    def validate_homepage_section(cls, v):
        if v is not None and v not in ['new', 'best']:
            raise ValueError('Homepage section must be "new", "best", or None')
        return v

class ProductCreate(ProductBase):
    """Product creation model"""
    pass

class ProductUpdate(BaseModel):
    """Product update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    specifications: Optional[dict] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    stock_quantity: Optional[int] = None
    is_available: Optional[bool] = None
    homepage_section: Optional[str] = None

    @validator('homepage_section')
    def validate_homepage_section(cls, v):
        if v is not None and v not in ['new', 'best']:
            raise ValueError('Homepage section must be "new", "best", or None')
        return v

    @validator('name')
    def validate_name(cls, v):
        if v is not None and len(v) < 2:
            raise ValueError('Product name must be at least 2 characters long')
        return v

    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Product price must be greater than 0')
        return v

    @validator('stock_quantity')
    def validate_stock(cls, v):
        if v is not None and v < 0:
            raise ValueError('Stock quantity cannot be negative')
        return v

class Product(ProductBase):
    """Product complete model"""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    views_count: int = 0
    sales_count: int = 0

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ProductResponse(ProductBase):
    """Product response model"""
    id: str
    stock: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    views_count: int
    sales_count: int

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ProductSearch(BaseModel):
    """Product search model"""
    keyword: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    brand: Optional[str] = None
    in_stock_only: bool = False
    sort_by: Optional[str] = "created_at"  # name, price, created_at, sales_count
    sort_order: Optional[str] = "desc"  # asc, desc 