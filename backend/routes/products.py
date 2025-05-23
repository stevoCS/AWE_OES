from fastapi import APIRouter, Depends, Query, status
from typing import Optional

from controllers.product_controller import ProductController
from models.product import ProductCreate, ProductUpdate, ProductSearch
from utils.auth import get_current_user_id
from utils.response import success_response, paginate_response, APIResponse

router = APIRouter()

@router.post("/", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create product (requires admin privileges)"""
    product = await ProductController.create_product(product_data)
    return success_response(data=product.dict(), message="Product created successfully")

@router.get("/{product_id}", response_model=APIResponse)
async def get_product(product_id: str):
    """Get product details"""
    product = await ProductController.get_product(product_id)
    return success_response(data=product.dict(), message="Product details retrieved successfully")

@router.put("/{product_id}", response_model=APIResponse)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update product information (requires admin privileges)"""
    product = await ProductController.update_product(product_id, update_data)
    return success_response(data=product.dict(), message="Product updated successfully")

@router.delete("/{product_id}", response_model=APIResponse)
async def delete_product(
    product_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Delete product (requires admin privileges)"""
    await ProductController.delete_product(product_id)
    return success_response(message="Product deleted successfully")

@router.get("/", response_model=APIResponse)
async def search_products(
    keyword: Optional[str] = Query(None, description="Search keyword"),
    category: Optional[str] = Query(None, description="Product category"),
    brand: Optional[str] = Query(None, description="Brand"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    in_stock_only: bool = Query(False, description="Show only in-stock products"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort direction"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Search products"""
    search_params = ProductSearch(
        keyword=keyword,
        category=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        in_stock_only=in_stock_only,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    products, total = await ProductController.search_products(search_params, page, size)
    product_list = [product.dict() for product in products]
    
    return paginate_response(product_list, total, page, size, "Products searched successfully")

@router.get("/meta/categories", response_model=APIResponse)
async def get_categories():
    """Get product category list"""
    categories = await ProductController.get_categories()
    return success_response(data=categories, message="Category list retrieved successfully")

@router.get("/meta/brands", response_model=APIResponse)
async def get_brands():
    """Get brand list"""
    brands = await ProductController.get_brands()
    return success_response(data=brands, message="Brand list retrieved successfully")

@router.patch("/{product_id}/stock", response_model=APIResponse)
async def update_stock(
    product_id: str,
    quantity_change: int,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update product stock (requires admin privileges)"""
    product = await ProductController.update_stock(product_id, quantity_change)
    return success_response(data=product.dict(), message="Stock updated successfully") 