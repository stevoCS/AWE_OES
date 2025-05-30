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
    """Get tracking information by order ID"""
    tracking = await TrackingController.get_tracking_by_order_id(order_id)
    return success_response(data=tracking.dict(), message="Tracking information retrieved successfully")

@router.get("/number/{order_number}", response_model=APIResponse)
async def get_tracking_by_order_number(order_number: str):
    """Get tracking information by order number (public interface)"""
    tracking = await TrackingController.get_tracking_by_number(order_number)
    return success_response(data=tracking.dict(), message="Tracking information retrieved successfully")

@router.get("/tracking/{tracking_number}", response_model=APIResponse)
async def get_tracking_by_tracking_number(tracking_number: str):
    """Get tracking information by tracking number (public interface)"""
    tracking = await TrackingController.get_tracking_by_tracking_number(tracking_number)
    return success_response(data=tracking.dict(), message="Tracking information retrieved successfully")

@router.get("/summary", response_model=APIResponse)
async def get_tracking_summary(current_user_id: str = Depends(get_current_user_id)):
    """Get user's order tracking summary"""
    summaries = await TrackingController.get_tracking_summary(current_user_id)
    summary_list = [summary.dict() for summary in summaries]
    return success_response(data=summary_list, message="Tracking summary retrieved successfully")

@router.get("/", response_model=APIResponse)
async def search_tracking(
    order_number: Optional[str] = Query(None, description="Order number"),
    tracking_number: Optional[str] = Query(None, description="Tracking number"),
    status: Optional[TrackingEventType] = Query(None, description="Tracking status"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Search tracking records"""
    search_params = TrackingSearch(
        order_number=order_number,
        tracking_number=tracking_number,
        customer_id=current_user_id,
        status=status
    )
    
    tracking_records, total = await TrackingController.search_tracking(search_params, page, size)
    tracking_list = [tracking.dict() for tracking in tracking_records]
    
    return paginate_response(tracking_list, total, page, size, "Tracking records search completed successfully")

@router.get("/estimate/{order_number}", response_model=APIResponse)
async def get_delivery_estimate(order_number: str):
    """Get delivery estimate information"""
    estimate = await TrackingController.get_delivery_estimate(order_number)
    return success_response(data=estimate.dict(), message="Delivery estimate retrieved successfully")

# Admin-only interfaces
@router.put("/order/{order_id}", response_model=APIResponse)
async def update_tracking_status(
    order_id: str,
    update_data: TrackingUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update order tracking status (admin function)"""
    tracking = await TrackingController.update_tracking_by_order_id(
        order_id=order_id,
        event_type=update_data.event_type,
        description=update_data.description,
        location=update_data.location,
        operator=update_data.operator,
        tracking_number=update_data.tracking_number
    )
    return success_response(data=tracking.dict(), message="Tracking status updated successfully")

@router.get("/admin/all", response_model=APIResponse)
async def admin_search_tracking(
    order_number: Optional[str] = Query(None, description="Order number"),
    tracking_number: Optional[str] = Query(None, description="Tracking number"),
    customer_id: Optional[str] = Query(None, description="Customer ID"),
    status: Optional[TrackingEventType] = Query(None, description="Tracking status"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Admin search all tracking records"""
    search_params = TrackingSearch(
        order_number=order_number,
        tracking_number=tracking_number,
        customer_id=customer_id,
        status=status
    )
    
    tracking_records, total = await TrackingController.search_tracking(search_params, page, size)
    tracking_list = [tracking.dict() for tracking in tracking_records]
    
    return paginate_response(tracking_list, total, page, size, "Tracking records search completed successfully") 