from pydantic import BaseModel, EmailStr, validator, ConfigDict, Field
from typing import Optional, Annotated
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

class CustomerBase(BaseModel):
    """Customer base information model"""
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        return v

    @validator('full_name')
    def validate_full_name(cls, v):
        if len(v) < 2:
            raise ValueError('Full name must be at least 2 characters long')
        return v

class CustomerCreate(CustomerBase):
    """Customer creation model"""
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class CustomerUpdate(BaseModel):
    """Customer update model"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None

class CustomerSearch(BaseModel):
    """Customer search model"""
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    keyword: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"

class CustomerLogin(BaseModel):
    """Customer login model - supports both username and email"""
    username: str  # Can be username or email
    password: str

class Customer(CustomerBase):
    """Customer complete model"""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class CustomerResponse(CustomerBase):
    """Customer response model (without sensitive information)"""
    id: str
    is_active: bool
    is_admin: Optional[bool] = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    ) 