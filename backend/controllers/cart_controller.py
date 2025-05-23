from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import status

from database.connection import get_collection
from models.cart import ShoppingCart, CartItem, CartAddItem, CartItemUpdate, ShoppingCartResponse, CartSummary
from models.product import ProductResponse
from controllers.product_controller import ProductController
from utils.response import APIException

class CartController:
    """购物车管理控制器"""
    
    @staticmethod
    async def get_or_create_cart(customer_id: str) -> ShoppingCart:
        """获取或创建购物车"""
        collection = await get_collection("carts")
        
        # 查找现有购物车
        cart_doc = await collection.find_one({"customer_id": customer_id})
        
        if cart_doc:
            cart_doc["id"] = str(cart_doc["_id"])
            del cart_doc["_id"]
            return ShoppingCart(**cart_doc)
        else:
            # 创建新购物车
            cart = ShoppingCart(
                customer_id=customer_id,
                items=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            result = await collection.insert_one(cart.dict(by_alias=True, exclude={"id"}))
            cart.id = result.inserted_id
            return cart
    
    @staticmethod
    async def add_item_to_cart(customer_id: str, add_item: CartAddItem) -> ShoppingCartResponse:
        """添加商品到购物车"""
        # 获取商品信息
        product = await ProductController.get_product(add_item.product_id)
        
        # 检查库存
        if product.stock_quantity < add_item.quantity:
            raise APIException("库存不足", status.HTTP_400_BAD_REQUEST)
        
        if not product.is_available:
            raise APIException("商品已下架", status.HTTP_400_BAD_REQUEST)
        
        collection = await get_collection("carts")
        cart = await CartController.get_or_create_cart(customer_id)
        
        # 检查商品是否已在购物车中
        existing_item = None
        for item in cart.items:
            if item.product_id == add_item.product_id:
                existing_item = item
                break
        
        if existing_item:
            # 更新数量
            new_quantity = existing_item.quantity + add_item.quantity
            if new_quantity > product.stock_quantity:
                raise APIException("库存不足", status.HTTP_400_BAD_REQUEST)
            
            await collection.update_one(
                {
                    "customer_id": customer_id,
                    "items.product_id": add_item.product_id
                },
                {
                    "$set": {
                        "items.$.quantity": new_quantity,
                        "updated_at": datetime.now()
                    }
                }
            )
        else:
            # 添加新商品
            cart_item = CartItem(
                product_id=add_item.product_id,
                product_name=product.name,
                product_price=product.price,
                quantity=add_item.quantity
            )
            
            await collection.update_one(
                {"customer_id": customer_id},
                {
                    "$push": {"items": cart_item.dict()},
                    "$set": {"updated_at": datetime.now()}
                }
            )
        
        return await CartController.get_cart(customer_id)
    
    @staticmethod
    async def get_cart(customer_id: str) -> ShoppingCartResponse:
        """获取购物车"""
        cart = await CartController.get_or_create_cart(customer_id)
        
        # 计算购物车摘要
        summary = CartSummary(
            total_items=cart.total_items,
            total_price=cart.total_price,
            tax_amount=cart.tax_amount,
            shipping_fee=cart.shipping_fee,
            final_total=cart.final_total
        )
        
        return ShoppingCartResponse(
            id=str(cart.id),
            customer_id=cart.customer_id,
            items=cart.items,
            created_at=cart.created_at,
            updated_at=cart.updated_at,
            total_items=summary.total_items,
            total_price=summary.total_price,
            tax_amount=summary.tax_amount,
            shipping_fee=summary.shipping_fee,
            final_total=summary.final_total
        )
    
    @staticmethod
    async def update_cart_item(
        customer_id: str,
        product_id: str,
        update_data: CartItemUpdate
    ) -> ShoppingCartResponse:
        """更新购物车商品项"""
        collection = await get_collection("carts")
        
        # 如果需要更新数量，先检查库存
        if update_data.quantity is not None:
            product = await ProductController.get_product(product_id)
            if update_data.quantity > product.stock_quantity:
                raise APIException("库存不足", status.HTTP_400_BAD_REQUEST)
        
        # 构建更新数据
        update_fields = {}
        if update_data.quantity is not None:
            update_fields["items.$.quantity"] = update_data.quantity
        if update_data.selected is not None:
            update_fields["items.$.selected"] = update_data.selected
        
        update_fields["updated_at"] = datetime.now()
        
        # 更新购物车商品项
        result = await collection.update_one(
            {
                "customer_id": customer_id,
                "items.product_id": product_id
            },
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise APIException("购物车中没有该商品", status.HTTP_404_NOT_FOUND)
        
        return await CartController.get_cart(customer_id)
    
    @staticmethod
    async def remove_cart_item(customer_id: str, product_id: str) -> ShoppingCartResponse:
        """从购物车移除商品"""
        collection = await get_collection("carts")
        
        result = await collection.update_one(
            {"customer_id": customer_id},
            {
                "$pull": {"items": {"product_id": product_id}},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        if result.matched_count == 0:
            raise APIException("购物车不存在", status.HTTP_404_NOT_FOUND)
        
        return await CartController.get_cart(customer_id)
    
    @staticmethod
    async def clear_cart(customer_id: str) -> bool:
        """清空购物车"""
        collection = await get_collection("carts")
        
        result = await collection.update_one(
            {"customer_id": customer_id},
            {
                "$set": {
                    "items": [],
                    "updated_at": datetime.now()
                }
            }
        )
        
        return result.matched_count > 0
    
    @staticmethod
    async def get_cart_summary(customer_id: str) -> CartSummary:
        """获取购物车摘要"""
        cart = await CartController.get_or_create_cart(customer_id)
        
        return CartSummary(
            total_items=cart.total_items,
            total_price=cart.total_price,
            tax_amount=cart.tax_amount,
            shipping_fee=cart.shipping_fee,
            final_total=cart.final_total
        ) 