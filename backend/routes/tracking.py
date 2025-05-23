from fastapi import APIRouter, Depends, Query
from typing import Optional

from controllers.tracking_controller import TrackingController
from models.tracking import TrackingUpdate, TrackingSearch, TrackingEventType
from utils.auth import get_current_user_id
from utils.response import success_response, paginate_response, APIResponse

router = APIRouter()

@router.get("/order/{order_id}", response_model=APIResponse)
async def get_tracking_by_order(
    order_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """根据订单ID获取跟踪信息"""
    tracking = await TrackingController.get_tracking_by_order_id(order_id)
    return success_response(data=tracking.dict(), message="获取跟踪信息成功")

@router.get("/number/{order_number}", response_model=APIResponse)
async def get_tracking_by_order_number(order_number: str):
    """根据订单号获取跟踪信息（公开接口）"""
    tracking = await TrackingController.get_tracking_by_number(order_number)
    return success_response(data=tracking.dict(), message="获取跟踪信息成功")

@router.get("/tracking/{tracking_number}", response_model=APIResponse)
async def get_tracking_by_tracking_number(tracking_number: str):
    """根据物流单号获取跟踪信息（公开接口）"""
    tracking = await TrackingController.get_tracking_by_tracking_number(tracking_number)
    return success_response(data=tracking.dict(), message="获取跟踪信息成功")

@router.get("/summary", response_model=APIResponse)
async def get_tracking_summary(current_user_id: str = Depends(get_current_user_id)):
    """获取用户的订单跟踪摘要"""
    summaries = await TrackingController.get_tracking_summary(current_user_id)
    summary_list = [summary.dict() for summary in summaries]
    return success_response(data=summary_list, message="获取跟踪摘要成功")

@router.get("/", response_model=APIResponse)
async def search_tracking(
    order_number: Optional[str] = Query(None, description="订单号"),
    tracking_number: Optional[str] = Query(None, description="物流单号"),
    status: Optional[TrackingEventType] = Query(None, description="跟踪状态"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user_id: str = Depends(get_current_user_id)
):
    """搜索跟踪记录"""
    search_params = TrackingSearch(
        order_number=order_number,
        tracking_number=tracking_number,
        customer_id=current_user_id,
        status=status
    )
    
    tracking_records, total = await TrackingController.search_tracking(search_params, page, size)
    tracking_list = [tracking.dict() for tracking in tracking_records]
    
    return paginate_response(tracking_list, total, page, size, "跟踪记录搜索成功")

@router.get("/estimate/{order_number}", response_model=APIResponse)
async def get_delivery_estimate(order_number: str):
    """获取配送预估信息"""
    estimate = await TrackingController.get_delivery_estimate(order_number)
    return success_response(data=estimate.dict(), message="获取配送预估成功")

# 管理员专用接口
@router.put("/order/{order_id}", response_model=APIResponse)
async def update_tracking_status(
    order_id: str,
    update_data: TrackingUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """更新订单跟踪状态（管理员功能）"""
    tracking = await TrackingController.update_tracking_by_order_id(
        order_id=order_id,
        event_type=update_data.event_type,
        description=update_data.description,
        location=update_data.location,
        operator=update_data.operator,
        tracking_number=update_data.tracking_number
    )
    return success_response(data=tracking.dict(), message="跟踪状态更新成功")

@router.get("/admin/all", response_model=APIResponse)
async def admin_search_tracking(
    order_number: Optional[str] = Query(None, description="订单号"),
    tracking_number: Optional[str] = Query(None, description="物流单号"),
    customer_id: Optional[str] = Query(None, description="客户ID"),
    status: Optional[TrackingEventType] = Query(None, description="跟踪状态"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user_id: str = Depends(get_current_user_id)
):
    """管理员搜索所有跟踪记录"""
    search_params = TrackingSearch(
        order_number=order_number,
        tracking_number=tracking_number,
        customer_id=customer_id,
        status=status
    )
    
    tracking_records, total = await TrackingController.search_tracking(search_params, page, size)
    tracking_list = [tracking.dict() for tracking in tracking_records]
    
    return paginate_response(tracking_list, total, page, size, "跟踪记录搜索成功") 