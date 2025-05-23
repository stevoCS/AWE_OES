from pydantic import BaseModel, EmailStr, validator
from typing import Optional
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

class CustomerBase(BaseModel):
    """Customer base information model"""
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

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

class CustomerLogin(BaseModel):
    """Customer login model"""
    username: str
    password: str

class Customer(CustomerBase):
    """Customer complete model"""
    id: Optional[PyObjectId] = None
    hashed_password: str
    is_active: bool = True
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CustomerResponse(CustomerBase):
    """Customer response model (without sensitive information)"""
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str} 