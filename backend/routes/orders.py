from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from datetime import datetime

from controllers.order_controller import OrderController
from models.order import OrderCreate, OrderUpdate, OrderSearch, OrderStatus
from utils.auth import get_current_user_id
from utils.response import success_response, paginate_response, APIResponse

router = APIRouter()

@router.post("/", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """从购物车创建订单"""
    order = await OrderController.create_order(current_user_id, order_data)
    return success_response(data=order.dict(), message="订单创建成功")

@router.get("/{order_id}", response_model=APIResponse)
async def get_order(
    order_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """获取订单详情"""
    order = await OrderController.get_order(order_id, current_user_id)
    return success_response(data=order.dict(), message="获取订单详情成功")

@router.get("/number/{order_number}", response_model=APIResponse)
async def get_order_by_number(
    order_number: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """根据订单号获取订单"""
    order = await OrderController.get_order_by_number(order_number, current_user_id)
    return success_response(data=order.dict(), message="获取订单详情成功")

@router.put("/{order_id}/status", response_model=APIResponse)
async def update_order_status(
    order_id: str,
    update_data: OrderUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """更新订单状态（管理员功能）"""
    order = await OrderController.update_order_status(order_id, update_data)
    return success_response(data=order.dict(), message="订单状态更新成功")

@router.post("/{order_id}/cancel", response_model=APIResponse)
async def cancel_order(
    order_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """取消订单"""
    order = await OrderController.cancel_order(order_id, current_user_id)
    return success_response(data=order.dict(), message="订单已取消")

@router.get("/", response_model=APIResponse)
async def search_orders(
    status_filter: Optional[OrderStatus] = Query(None, alias="status", description="订单状态"),
    order_number: Optional[str] = Query(None, description="订单号"),
    start_date: Optional[datetime] = Query(None, description="开始日期"),
    end_date: Optional[datetime] = Query(None, description="结束日期"),
    sort_by: Optional[str] = Query("created_at", description="排序字段"),
    sort_order: Optional[str] = Query("desc", description="排序方向"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user_id: str = Depends(get_current_user_id)
):
    """搜索订单"""
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
    
    return paginate_response(order_list, total, page, size, "订单搜索成功")

# 管理员专用接口
@router.get("/admin/all", response_model=APIResponse)
async def admin_search_orders(
    customer_id: Optional[str] = Query(None, description="客户ID"),
    status_filter: Optional[OrderStatus] = Query(None, alias="status", description="订单状态"),
    order_number: Optional[str] = Query(None, description="订单号"),
    start_date: Optional[datetime] = Query(None, description="开始日期"),
    end_date: Optional[datetime] = Query(None, description="结束日期"),
    sort_by: Optional[str] = Query("created_at", description="排序字段"),
    sort_order: Optional[str] = Query("desc", description="排序方向"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user_id: str = Depends(get_current_user_id)
):
    """管理员搜索所有订单"""
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
    
    return paginate_response(order_list, total, page, size, "订单搜索成功") 