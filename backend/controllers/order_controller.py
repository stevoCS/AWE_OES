from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import status

from database.connection import get_collection
from models.order import Order, OrderCreate, OrderUpdate, OrderResponse, OrderSearch, OrderItem, OrderStatus
from models.tracking import OrderTracking, TrackingEventType
from controllers.cart_controller import CartController
from controllers.product_controller import ProductController
from utils.response import APIException

class OrderController:
    """订单管理控制器"""
    
    @staticmethod
    async def create_order(customer_id: str, order_data: OrderCreate) -> OrderResponse:
        """从购物车创建订单"""
        # 获取购物车
        cart = await CartController.get_cart(customer_id)
        
        if not cart.items or cart.total_items == 0:
            raise APIException("购物车为空，无法创建订单", status.HTTP_400_BAD_REQUEST)
        
        # 检查选中的商品库存
        selected_items = [item for item in cart.items if item.selected]
        if not selected_items:
            raise APIException("请选择要购买的商品", status.HTTP_400_BAD_REQUEST)
        
        order_items = []
        for cart_item in selected_items:
            # 验证商品和库存
            product = await ProductController.get_product(cart_item.product_id)
            if not product.is_available:
                raise APIException(f"商品 {product.name} 已下架", status.HTTP_400_BAD_REQUEST)
            
            if product.stock_quantity < cart_item.quantity:
                raise APIException(f"商品 {product.name} 库存不足", status.HTTP_400_BAD_REQUEST)
            
            order_item = OrderItem(
                product_id=cart_item.product_id,
                product_name=cart_item.product_name,
                product_price=cart_item.product_price,
                quantity=cart_item.quantity,
                subtotal=cart_item.subtotal
            )
            order_items.append(order_item)
        
        # 计算订单金额
        subtotal = sum(item.subtotal for item in order_items)
        tax_amount = subtotal * 0.08  # 8%税费
        shipping_fee = 0.0 if subtotal >= 100 else 10.0  # 满100免运费
        total_amount = subtotal + tax_amount + shipping_fee
        
        # 生成订单号
        order_number = Order.generate_order_number()
        
        # 创建订单
        order = Order(
            customer_id=customer_id,
            order_number=order_number,
            items=order_items,
            shipping_address=order_data.shipping_address,
            payment_method=order_data.payment_method,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_fee=shipping_fee,
            total_amount=total_amount,
            notes=order_data.notes,
            status=OrderStatus.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # 保存订单到数据库
        collection = await get_collection("orders")
        result = await collection.insert_one(order.dict(by_alias=True, exclude={"id"}))
        
        # 更新商品库存
        for item in order_items:
            await ProductController.update_stock(item.product_id, -item.quantity)
        
        # 创建订单跟踪
        await OrderController._create_order_tracking(str(result.inserted_id), order_number, customer_id)
        
        # 清空购物车中已选中的商品
        cart_collection = await get_collection("carts")
        remaining_items = [item for item in cart.items if not item.selected]
        await cart_collection.update_one(
            {"customer_id": customer_id},
            {"$set": {"items": [item.dict() for item in remaining_items], "updated_at": datetime.now()}}
        )
        
        # 返回订单信息
        order_doc = await collection.find_one({"_id": result.inserted_id})
        order_doc["id"] = str(order_doc["_id"])
        del order_doc["_id"]
        
        return OrderResponse(**order_doc)
    
    @staticmethod
    async def get_order(order_id: str, customer_id: Optional[str] = None) -> OrderResponse:
        """获取订单详情"""
        collection = await get_collection("orders")
        
        query = {"_id": ObjectId(order_id)}
        if customer_id:
            query["customer_id"] = customer_id
        
        order_doc = await collection.find_one(query)
        if not order_doc:
            raise APIException("订单不存在", status.HTTP_404_NOT_FOUND)
        
        order_doc["id"] = str(order_doc["_id"])
        del order_doc["_id"]
        
        return OrderResponse(**order_doc)
    
    @staticmethod
    async def get_order_by_number(order_number: str, customer_id: Optional[str] = None) -> OrderResponse:
        """根据订单号获取订单"""
        collection = await get_collection("orders")
        
        query = {"order_number": order_number}
        if customer_id:
            query["customer_id"] = customer_id
        
        order_doc = await collection.find_one(query)
        if not order_doc:
            raise APIException("订单不存在", status.HTTP_404_NOT_FOUND)
        
        order_doc["id"] = str(order_doc["_id"])
        del order_doc["_id"]
        
        return OrderResponse(**order_doc)
    
    @staticmethod
    async def update_order_status(order_id: str, update_data: OrderUpdate) -> OrderResponse:
        """更新订单状态"""
        collection = await get_collection("orders")
        
        # 准备更新数据
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updated_at"] = datetime.now()
        
        # 根据状态更新时间戳
        if update_data.status:
            if update_data.status == OrderStatus.PAID:
                update_dict["paid_at"] = datetime.now()
            elif update_data.status == OrderStatus.SHIPPED:
                update_dict["shipped_at"] = datetime.now()
            elif update_data.status == OrderStatus.DELIVERED:
                update_dict["delivered_at"] = datetime.now()
        
        # 更新订单
        result = await collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise APIException("订单不存在", status.HTTP_404_NOT_FOUND)
        
        # 更新订单跟踪
        if update_data.status:
            await OrderController._update_order_tracking(order_id, update_data.status)
        
        return await OrderController.get_order(order_id)
    
    @staticmethod
    async def search_orders(
        search_params: OrderSearch,
        page: int = 1,
        size: int = 20
    ) -> tuple[List[OrderResponse], int]:
        """搜索订单"""
        collection = await get_collection("orders")
        
        # 构建查询条件
        query = {}
        
        if search_params.customer_id:
            query["customer_id"] = search_params.customer_id
        
        if search_params.status:
            query["status"] = search_params.status
        
        if search_params.order_number:
            query["order_number"] = {"$regex": search_params.order_number, "$options": "i"}
        
        if search_params.start_date or search_params.end_date:
            date_query = {}
            if search_params.start_date:
                date_query["$gte"] = search_params.start_date
            if search_params.end_date:
                date_query["$lte"] = search_params.end_date
            query["created_at"] = date_query
        
        # 构建排序条件
        sort_direction = 1 if search_params.sort_order == "asc" else -1
        sort_field = search_params.sort_by or "created_at"
        
        # 计算分页参数
        skip = (page - 1) * size
        
        # 执行查询
        cursor = collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(size)
        orders = await cursor.to_list(length=size)
        
        # 计算总数
        total = await collection.count_documents(query)
        
        # 转换为响应格式
        order_responses = []
        for order_doc in orders:
            order_doc["id"] = str(order_doc["_id"])
            del order_doc["_id"]
            order_responses.append(OrderResponse(**order_doc))
        
        return order_responses, total
    
    @staticmethod
    async def cancel_order(order_id: str, customer_id: str) -> OrderResponse:
        """取消订单"""
        # 获取订单
        order = await OrderController.get_order(order_id, customer_id)
        
        # 检查订单状态
        if order.status not in [OrderStatus.PENDING, OrderStatus.PAID]:
            raise APIException("订单状态不允许取消", status.HTTP_400_BAD_REQUEST)
        
        # 更新订单状态
        update_data = OrderUpdate(status=OrderStatus.CANCELLED)
        updated_order = await OrderController.update_order_status(order_id, update_data)
        
        # 恢复库存
        for item in order.items:
            await ProductController.update_stock(item.product_id, item.quantity)
        
        return updated_order
    
    @staticmethod
    async def _create_order_tracking(order_id: str, order_number: str, customer_id: str):
        """创建订单跟踪记录"""
        from controllers.tracking_controller import TrackingController
        
        tracking_data = {
            "order_id": order_id,
            "order_number": order_number,
            "customer_id": customer_id,
            "current_status": TrackingEventType.ORDER_CREATED
        }
        
        await TrackingController.create_tracking(tracking_data)
    
    @staticmethod
    async def _update_order_tracking(order_id: str, status: OrderStatus):
        """更新订单跟踪状态"""
        from controllers.tracking_controller import TrackingController
        
        # 状态映射
        status_mapping = {
            OrderStatus.PAID: TrackingEventType.PAYMENT_RECEIVED,
            OrderStatus.PROCESSING: TrackingEventType.PROCESSING,
            OrderStatus.SHIPPED: TrackingEventType.SHIPPED,
            OrderStatus.DELIVERED: TrackingEventType.DELIVERED,
            OrderStatus.CANCELLED: TrackingEventType.CANCELLED,
            OrderStatus.REFUNDED: TrackingEventType.REFUNDED
        }
        
        if status in status_mapping:
            await TrackingController.update_tracking_by_order_id(
                order_id, 
                status_mapping[status],
                f"订单状态更新为: {status.value}"
            ) 