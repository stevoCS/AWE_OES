from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from datetime import datetime

from controllers.customer_controller import CustomerController
from models.customer import CustomerCreate, CustomerUpdate, CustomerSearch
from utils.auth import get_current_admin_user_id
from utils.response import success_response, paginate_response, APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def search_customers(
    keyword: Optional[str] = Query(None, description="Search keyword (name, email)"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort direction"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin_id: str = Depends(get_current_admin_user_id)
):
    """Search customers (admin only)"""
    search_params = CustomerSearch(
        keyword=keyword,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    customers, total = await CustomerController.search_customers(search_params, page, size)
    customer_list = [customer.dict() for customer in customers]
    
    return paginate_response(customer_list, total, page, size, "Customers retrieved successfully")

@router.get("/{customer_id}", response_model=APIResponse)
async def get_customer(
    customer_id: str,
    current_admin_id: str = Depends(get_current_admin_user_id)
):
    """Get customer details (admin only)"""
    customer = await CustomerController.get_customer(customer_id)
    return success_response(data=customer.dict(), message="Customer details retrieved successfully")

@router.get("/{customer_id}/orders", response_model=APIResponse)
async def get_customer_orders(
    customer_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=50, description="Items per page"),
    current_admin_id: str = Depends(get_current_admin_user_id)
):
    """Get customer order history (admin only)"""
    orders, total = await CustomerController.get_customer_orders(customer_id, page, size)
    order_list = [order.dict() for order in orders]
    
    return paginate_response(order_list, total, page, size, "Customer orders retrieved successfully")

@router.put("/{customer_id}", response_model=APIResponse)
async def update_customer(
    customer_id: str,
    update_data: CustomerUpdate,
    current_admin_id: str = Depends(get_current_admin_user_id)
):
    """Update customer information (admin only)"""
    customer = await CustomerController.update_customer(customer_id, update_data)
    return success_response(data=customer.dict(), message="Customer updated successfully")

@router.delete("/{customer_id}", response_model=APIResponse)
async def delete_customer(
    customer_id: str,
    current_admin_id: str = Depends(get_current_admin_user_id)
):
    """Delete customer (admin only)"""
    await CustomerController.delete_customer(customer_id)
    return success_response(message="Customer deleted successfully") 