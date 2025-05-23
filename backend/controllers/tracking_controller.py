from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
from fastapi import status

from database.connection import get_collection
from models.tracking import (
    OrderTracking, OrderTrackingResponse, TrackingUpdate, TrackingSearch,
    TrackingEventType, TrackingEvent, TrackingSummary, DeliveryEstimate
)
from utils.response import APIException

class TrackingController:
    """订单跟踪控制器"""
    
    @staticmethod
    async def create_tracking(tracking_data: dict) -> OrderTrackingResponse:
        """创建订单跟踪记录"""
        collection = await get_collection("tracking")
        
        # 创建初始跟踪事件
        initial_event = TrackingEvent(
            event_type=TrackingEventType.ORDER_CREATED,
            timestamp=datetime.now(),
            description="订单已创建",
            location="在线商城"
        )
        
        tracking = OrderTracking(
            order_id=tracking_data["order_id"],
            order_number=tracking_data["order_number"],
            customer_id=tracking_data["customer_id"],
            current_status=TrackingEventType.ORDER_CREATED,
            events=[initial_event],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # 插入数据库
        result = await collection.insert_one(tracking.dict(by_alias=True, exclude={"id"}))
        
        # 返回创建的跟踪记录
        tracking_doc = await collection.find_one({"_id": result.inserted_id})
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def get_tracking_by_order_id(order_id: str) -> OrderTrackingResponse:
        """根据订单ID获取跟踪信息"""
        collection = await get_collection("tracking")
        
        tracking_doc = await collection.find_one({"order_id": order_id})
        if not tracking_doc:
            raise APIException("跟踪信息不存在", status.HTTP_404_NOT_FOUND)
        
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        # 添加预计送达时间
        estimated_delivery = TrackingController._calculate_delivery_estimate(
            tracking_doc["current_status"], 
            tracking_doc["created_at"]
        )
        tracking_doc["estimated_delivery"] = estimated_delivery
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def get_tracking_by_number(order_number: str) -> OrderTrackingResponse:
        """根据订单号获取跟踪信息"""
        collection = await get_collection("tracking")
        
        tracking_doc = await collection.find_one({"order_number": order_number})
        if not tracking_doc:
            raise APIException("跟踪信息不存在", status.HTTP_404_NOT_FOUND)
        
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        # 添加预计送达时间
        estimated_delivery = TrackingController._calculate_delivery_estimate(
            tracking_doc["current_status"], 
            tracking_doc["created_at"]
        )
        tracking_doc["estimated_delivery"] = estimated_delivery
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def get_tracking_by_tracking_number(tracking_number: str) -> OrderTrackingResponse:
        """根据物流单号获取跟踪信息"""
        collection = await get_collection("tracking")
        
        tracking_doc = await collection.find_one({"tracking_number": tracking_number})
        if not tracking_doc:
            raise APIException("跟踪信息不存在", status.HTTP_404_NOT_FOUND)
        
        tracking_doc["id"] = str(tracking_doc["_id"])
        del tracking_doc["_id"]
        
        return OrderTrackingResponse(**tracking_doc)
    
    @staticmethod
    async def update_tracking_by_order_id(
        order_id: str, 
        event_type: TrackingEventType, 
        description: str,
        location: Optional[str] = None,
        operator: Optional[str] = None,
        tracking_number: Optional[str] = None
    ) -> OrderTrackingResponse:
        """更新订单跟踪状态"""
        collection = await get_collection("tracking")
        
        # 创建新的跟踪事件
        new_event = TrackingEvent(
            event_type=event_type,
            timestamp=datetime.now(),
            description=description,
            location=location,
            operator=operator
        )
        
        # 更新字段
        update_data = {
            "$push": {"events": new_event.dict()},
            "$set": {
                "current_status": event_type,
                "updated_at": datetime.now()
            }
        }
        
        # 如果提供了物流单号，也更新它
        if tracking_number:
            update_data["$set"]["tracking_number"] = tracking_number
        
        # 更新跟踪记录
        result = await collection.update_one(
            {"order_id": order_id},
            update_data
        )
        
        if result.matched_count == 0:
            raise APIException("跟踪记录不存在", status.HTTP_404_NOT_FOUND)
        
        return await TrackingController.get_tracking_by_order_id(order_id)
    
    @staticmethod
    async def search_tracking(
        search_params: TrackingSearch,
        page: int = 1,
        size: int = 20
    ) -> tuple[List[OrderTrackingResponse], int]:
        """搜索跟踪记录"""
        collection = await get_collection("tracking")
        
        # 构建查询条件
        query = {}
        
        if search_params.order_number:
            query["order_number"] = {"$regex": search_params.order_number, "$options": "i"}
        
        if search_params.tracking_number:
            query["tracking_number"] = search_params.tracking_number
        
        if search_params.customer_id:
            query["customer_id"] = search_params.customer_id
        
        if search_params.status:
            query["current_status"] = search_params.status
        
        # 计算分页参数
        skip = (page - 1) * size
        
        # 执行查询
        cursor = collection.find(query).sort("updated_at", -1).skip(skip).limit(size)
        tracking_records = await cursor.to_list(length=size)
        
        # 计算总数
        total = await collection.count_documents(query)
        
        # 转换为响应格式
        tracking_responses = []
        for tracking_doc in tracking_records:
            tracking_doc["id"] = str(tracking_doc["_id"])
            del tracking_doc["_id"]
            
            # 添加预计送达时间
            estimated_delivery = TrackingController._calculate_delivery_estimate(
                tracking_doc["current_status"], 
                tracking_doc["created_at"]
            )
            tracking_doc["estimated_delivery"] = estimated_delivery
            
            tracking_responses.append(OrderTrackingResponse(**tracking_doc))
        
        return tracking_responses, total
    
    @staticmethod
    async def get_tracking_summary(customer_id: str) -> List[TrackingSummary]:
        """获取用户的订单跟踪摘要"""
        collection = await get_collection("tracking")
        
        # 查询用户的所有跟踪记录
        cursor = collection.find({"customer_id": customer_id}).sort("updated_at", -1)
        tracking_records = await cursor.to_list(length=None)
        
        summaries = []
        for tracking_doc in tracking_records:
            # 计算进度百分比
            progress = TrackingController._calculate_progress_percentage(tracking_doc["current_status"])
            
            # 计算预计送达时间
            estimated_delivery = TrackingController._calculate_delivery_estimate(
                tracking_doc["current_status"], 
                tracking_doc["created_at"]
            )
            
            summary = TrackingSummary(
                order_number=tracking_doc["order_number"],
                current_status=tracking_doc["current_status"],
                last_update=tracking_doc["updated_at"],
                estimated_delivery=estimated_delivery,
                progress_percentage=progress
            )
            summaries.append(summary)
        
        return summaries
    
    @staticmethod
    def _calculate_delivery_estimate(status: TrackingEventType, created_at: datetime) -> Optional[datetime]:
        """计算预计送达时间"""
        # 根据订单状态计算预计送达时间
        status_days = {
            TrackingEventType.ORDER_CREATED: 7,
            TrackingEventType.PAYMENT_RECEIVED: 6,
            TrackingEventType.ORDER_CONFIRMED: 5,
            TrackingEventType.PROCESSING: 4,
            TrackingEventType.PACKED: 3,
            TrackingEventType.SHIPPED: 2,
            TrackingEventType.IN_TRANSIT: 1,
            TrackingEventType.OUT_FOR_DELIVERY: 0.5,
        }
        
        if status in status_days:
            return created_at + timedelta(days=status_days[status])
        elif status in [TrackingEventType.DELIVERED, TrackingEventType.CANCELLED, TrackingEventType.REFUNDED]:
            return None
        else:
            return created_at + timedelta(days=7)  # 默认7天
    
    @staticmethod
    def _calculate_progress_percentage(status: TrackingEventType) -> int:
        """计算配送进度百分比"""
        progress_map = {
            TrackingEventType.ORDER_CREATED: 10,
            TrackingEventType.PAYMENT_RECEIVED: 20,
            TrackingEventType.ORDER_CONFIRMED: 30,
            TrackingEventType.PROCESSING: 40,
            TrackingEventType.PACKED: 50,
            TrackingEventType.SHIPPED: 60,
            TrackingEventType.IN_TRANSIT: 80,
            TrackingEventType.OUT_FOR_DELIVERY: 90,
            TrackingEventType.DELIVERED: 100,
            TrackingEventType.CANCELLED: 0,
            TrackingEventType.REFUNDED: 0,
        }
        
        return progress_map.get(status, 0)
    
    @staticmethod
    async def get_delivery_estimate(order_number: str) -> DeliveryEstimate:
        """获取配送预估信息"""
        tracking = await TrackingController.get_tracking_by_number(order_number)
        
        # 根据当前状态计算预计送达
        status_days = {
            TrackingEventType.ORDER_CREATED: 7,
            TrackingEventType.PAYMENT_RECEIVED: 6,
            TrackingEventType.ORDER_CONFIRMED: 5,
            TrackingEventType.PROCESSING: 4,
            TrackingEventType.PACKED: 3,
            TrackingEventType.SHIPPED: 2,
            TrackingEventType.IN_TRANSIT: 1,
            TrackingEventType.OUT_FOR_DELIVERY: 0.5,
        }
        
        estimated_days = status_days.get(tracking.current_status, 7)
        estimated_date = datetime.now() + timedelta(days=estimated_days)
        
        # 确定配送方式
        shipping_method = "标准配送"
        if estimated_days <= 1:
            shipping_method = "加急配送"
        elif estimated_days <= 3:
            shipping_method = "快速配送"
        
        return DeliveryEstimate(
            estimated_days=int(estimated_days),
            estimated_delivery_date=estimated_date,
            shipping_method=shipping_method
        ) 