from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from datetime import datetime

from controllers.order_controller import OrderController
from models.order import OrderCreate, OrderUpdate, OrderSearch, OrderStatus
from utils.auth import get_current_user_id, get_current_admin_user_id
from utils.response import success_response, paginate_response, APIResponse

router = APIRouter()

@router.post("/", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create order from shopping cart"""
    order = await OrderController.create_order(current_user_id, order_data)
    return success_response(data=order.dict(), message="Order created successfully")

# Admin-only interfaces - MUST come before generic routes
@router.get("/admin/all", response_model=APIResponse)
async def admin_search_orders(
    customer_id: Optional[str] = Query(None, description="Customer ID"),
    status_filter: Optional[OrderStatus] = Query(None, alias="status", description="Order status"),
    order_number: Optional[str] = Query(None, description="Order number"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort direction"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin_id: str = Depends(get_current_admin_user_id)
):
    """Admin search all orders"""
    search_params = OrderSearch(
        customer_id=customer_id,
        status=status_filter,
        order_number=order_number,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    orders, total = await OrderController.search_orders(search_params, page, size)
    order_list = [order.dict() for order in orders]
    
    return paginate_response(order_list, total, page, size, "Order search completed successfully")

@router.get("/number/{order_number}", response_model=APIResponse)
async def get_order_by_number(
    order_number: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Get order by order number"""
    order = await OrderController.get_order_by_number(order_number, current_user_id)
    return success_response(data=order.dict(), message="Order details retrieved successfully")

@router.get("/", response_model=APIResponse)
async def search_orders(
    status_filter: Optional[OrderStatus] = Query(None, alias="status", description="Order status"),
    order_number: Optional[str] = Query(None, description="Order number"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort direction"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Search orders"""
    search_params = OrderSearch(
        customer_id=current_user_id,
        status=status_filter,
        order_number=order_number,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    orders, total = await OrderController.search_orders(search_params, page, size)
    order_list = [order.dict() for order in orders]
    
    return paginate_response(order_list, total, page, size, "Order search completed successfully")

@router.get("/{order_id}", response_model=APIResponse)
async def get_order(
    order_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Get order details"""
    order = await OrderController.get_order(order_id, current_user_id)
    return success_response(data=order.dict(), message="Order details retrieved successfully")

@router.put("/{order_id}/status", response_model=APIResponse)
async def update_order_status(
    order_id: str,
    update_data: OrderUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update order status (admin function)"""
    order = await OrderController.update_order_status(order_id, update_data)
    return success_response(data=order.dict(), message="Order status updated successfully")

@router.post("/{order_id}/cancel", response_model=APIResponse)
async def cancel_order(
    order_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Cancel order"""
    order = await OrderController.cancel_order(order_id, current_user_id)
    return success_response(data=order.dict(), message="Order has been cancelled") 