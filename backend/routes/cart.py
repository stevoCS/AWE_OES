from fastapi import APIRouter, Depends

from controllers.cart_controller import CartController
from models.cart import CartAddItem, CartItemUpdate
from utils.auth import get_current_user_id
from utils.response import success_response, APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_cart(current_user_id: str = Depends(get_current_user_id)):
    """获取购物车"""
    cart = await CartController.get_cart(current_user_id)
    return success_response(data=cart.dict(), message="获取购物车成功")

@router.post("/items", response_model=APIResponse)
async def add_item_to_cart(
    add_item: CartAddItem,
    current_user_id: str = Depends(get_current_user_id)
):
    """添加商品到购物车"""
    cart = await CartController.add_item_to_cart(current_user_id, add_item)
    return success_response(data=cart.dict(), message="商品已添加到购物车")

@router.put("/items/{product_id}", response_model=APIResponse)
async def update_cart_item(
    product_id: str,
    update_data: CartItemUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """更新购物车商品项"""
    cart = await CartController.update_cart_item(current_user_id, product_id, update_data)
    return success_response(data=cart.dict(), message="购物车商品已更新")

@router.delete("/items/{product_id}", response_model=APIResponse)
async def remove_cart_item(
    product_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """从购物车移除商品"""
    cart = await CartController.remove_cart_item(current_user_id, product_id)
    return success_response(data=cart.dict(), message="商品已从购物车移除")

@router.delete("/", response_model=APIResponse)
async def clear_cart(current_user_id: str = Depends(get_current_user_id)):
    """清空购物车"""
    result = await CartController.clear_cart(current_user_id)
    return success_response(message="购物车已清空")

@router.get("/summary", response_model=APIResponse)
async def get_cart_summary(current_user_id: str = Depends(get_current_user_id)):
    """获取购物车摘要"""
    summary = await CartController.get_cart_summary(current_user_id)
    return success_response(data=summary.dict(), message="获取购物车摘要成功") 