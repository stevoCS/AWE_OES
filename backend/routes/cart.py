from fastapi import APIRouter, Depends

from controllers.cart_controller import CartController
from models.cart import CartItemCreate, CartItemUpdate
from utils.auth import get_current_user_id
from utils.response import success_response, APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_cart(current_user_id: str = Depends(get_current_user_id)):
    """Get shopping cart"""
    cart = await CartController.get_cart_summary(current_user_id)
    return success_response(data=cart.dict(), message="Shopping cart retrieved successfully")

@router.post("/items", response_model=APIResponse)
async def add_item_to_cart(
    add_item: CartItemCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Add item to shopping cart"""
    cart = await CartController.add_item_to_cart(current_user_id, add_item)
    return success_response(data=cart.dict(), message="Item added to cart successfully")

@router.put("/items/{product_id}", response_model=APIResponse)
async def update_cart_item(
    product_id: str,
    update_data: CartItemUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update cart item"""
    cart = await CartController.update_cart_item(current_user_id, product_id, update_data)
    return success_response(data=cart.dict(), message="Cart item updated successfully")

@router.delete("/items/{product_id}", response_model=APIResponse)
async def remove_cart_item(
    product_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Remove item from cart"""
    cart = await CartController.remove_cart_item(current_user_id, product_id)
    return success_response(data=cart.dict(), message="Item removed from cart successfully")

@router.delete("/", response_model=APIResponse)
async def clear_cart(current_user_id: str = Depends(get_current_user_id)):
    """Clear shopping cart"""
    result = await CartController.clear_cart(current_user_id)
    return success_response(message="Shopping cart cleared successfully")

@router.get("/summary", response_model=APIResponse)
async def get_cart_summary(current_user_id: str = Depends(get_current_user_id)):
    """Get cart summary"""
    summary = await CartController.get_cart_summary(current_user_id)
    return success_response(data=summary.dict(), message="Cart summary retrieved successfully") 