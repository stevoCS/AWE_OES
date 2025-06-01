from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException, status

from database.connection import get_collection
from models.customer import Customer, CustomerCreate, CustomerLogin, CustomerResponse
from utils.auth import verify_password, get_password_hash, create_access_token, create_refresh_token
from utils.response import APIException

class AuthController:
    """User authentication controller"""
    
    @staticmethod
    async def register_customer(customer_data: CustomerCreate) -> dict:
        """User registration"""
        collection = await get_collection("customers")
        
        # Check if username already exists
        existing_username = await collection.find_one({"username": customer_data.username})
        if existing_username:
            raise APIException("Username already exists", status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        existing_email = await collection.find_one({"email": customer_data.email})
        if existing_email:
            raise APIException("Email already exists", status.HTTP_400_BAD_REQUEST)
        
        # Create new user
        hashed_password = get_password_hash(customer_data.password)
        customer = Customer(
            username=customer_data.username,
            email=customer_data.email,
            full_name=customer_data.full_name,
            phone=customer_data.phone,
            address=customer_data.address,
            hashed_password=hashed_password,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Insert into database
        result = await collection.insert_one(customer.dict(by_alias=True, exclude={"id"}))
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(result.inserted_id)})
        refresh_token = create_refresh_token(data={"sub": str(result.inserted_id)})
        
        # Get user information
        user_doc = await collection.find_one({"_id": result.inserted_id})
        user_doc["id"] = str(user_doc["_id"])
        del user_doc["_id"]
        del user_doc["hashed_password"]
        
        return {
            "user": user_doc,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    async def login_customer(login_data: CustomerLogin) -> dict:
        """User login - supports both username and email"""
        collection = await get_collection("customers")
        
        # Find user by username or email
        user_doc = await collection.find_one({
            "$or": [
                {"username": login_data.username},
                {"email": login_data.username}
            ]
        })
        
        if not user_doc:
            raise APIException("Incorrect username or password", status.HTTP_401_UNAUTHORIZED)
        
        # Verify password
        if not verify_password(login_data.password, user_doc["hashed_password"]):
            raise APIException("Incorrect username or password", status.HTTP_401_UNAUTHORIZED)
        
        # Check user status
        if not user_doc.get("is_active", True):
            raise APIException("Account has been disabled", status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(user_doc["_id"])})
        refresh_token = create_refresh_token(data={"sub": str(user_doc["_id"])})
        
        # Return user information
        user_doc["id"] = str(user_doc["_id"])
        del user_doc["_id"]
        del user_doc["hashed_password"]
        
        return {
            "user": user_doc,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    async def get_user_profile(user_id: str) -> CustomerResponse:
        """Get user profile"""
        collection = await get_collection("customers")
        
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            raise APIException("User not found", status.HTTP_404_NOT_FOUND)
        
        user_doc["id"] = str(user_doc["_id"])
        del user_doc["_id"]
        del user_doc["hashed_password"]
        
        return CustomerResponse(**user_doc)
    
    @staticmethod
    async def update_user_profile(user_id: str, update_data: dict) -> CustomerResponse:
        """Update user profile"""
        collection = await get_collection("customers")
        
        # Update data
        update_data["updated_at"] = datetime.now()
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise APIException("User not found", status.HTTP_404_NOT_FOUND)
        
        # Return updated user information
        return await AuthController.get_user_profile(user_id)
    
    @staticmethod
    async def refresh_token(refresh_token: str) -> dict:
        """Refresh access token"""
        from utils.auth import verify_refresh_token
        
        # Verify refresh token
        payload = verify_refresh_token(refresh_token)
        user_id = payload.get("sub")
        
        # Check if user exists
        collection = await get_collection("customers")
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            raise APIException("User not found", status.HTTP_404_NOT_FOUND)
        
        # Generate new access token
        access_token = create_access_token(data={"sub": user_id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    async def change_password(user_id: str, current_password: str, new_password: str) -> dict:
        """Change user password"""
        collection = await get_collection("customers")
        
        # Get user
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            raise APIException("User not found", status.HTTP_404_NOT_FOUND)
        
        # Verify current password
        if not verify_password(current_password, user_doc["hashed_password"]):
            raise APIException("Current password is incorrect", status.HTTP_400_BAD_REQUEST)
        
        # Hash new password
        new_hashed_password = get_password_hash(new_password)
        
        # Update password in database
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "hashed_password": new_hashed_password,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.matched_count == 0:
            raise APIException("Failed to update password", status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return {"message": "Password changed successfully"} 