from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from controllers.auth_controller import AuthController
from models.customer import CustomerCreate, CustomerLogin, CustomerUpdate
from utils.auth import get_current_user_id
from utils.response import success_response, APIResponse

router = APIRouter()

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register(customer_data: CustomerCreate):
    """User registration"""
    result = await AuthController.register_customer(customer_data)
    return success_response(data=result, message="Registration successful")

@router.post("/login", response_model=APIResponse)
async def login(login_data: CustomerLogin):
    """User login"""
    result = await AuthController.login_customer(login_data)
    return success_response(data=result, message="Login successful")

@router.get("/profile", response_model=APIResponse)
async def get_profile(current_user_id: str = Depends(get_current_user_id)):
    """Get user profile"""
    user_profile = await AuthController.get_user_profile(current_user_id)
    return success_response(data=user_profile.dict(), message="User profile retrieved successfully")

@router.put("/profile", response_model=APIResponse)
async def update_profile(
    update_data: CustomerUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update user profile"""
    updated_profile = await AuthController.update_user_profile(
        current_user_id, 
        update_data.dict(exclude_unset=True)
    )
    return success_response(data=updated_profile.dict(), message="User profile updated successfully")

@router.post("/refresh", response_model=APIResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token"""
    result = await AuthController.refresh_token(request.refresh_token)
    return success_response(data=result, message="Token refreshed successfully")

@router.post("/logout", response_model=APIResponse)
async def logout(current_user_id: str = Depends(get_current_user_id)):
    """User logout"""
    # In a real application, this could add the token to a blacklist
    return success_response(message="Logout successful")

@router.get("/verify", response_model=APIResponse)
async def verify_token(current_user_id: str = Depends(get_current_user_id)):
    """Verify token validity"""
    return success_response(data={"user_id": current_user_id}, message="Token is valid") 