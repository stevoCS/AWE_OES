#!/usr/bin/env python3
"""
订单创建诊断脚本
检查订单创建过程中的问题
"""

import asyncio
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv("config.env")

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import connect_to_mongo, get_collection
from models.order import OrderStatus
from bson import ObjectId

async def check_recent_orders():
    """检查最近的订单创建情况"""
    print("🔍 检查最近的订单创建情况...")
    
    try:
        await connect_to_mongo()
        collection = await get_collection("orders")
        
        # 获取最近5个订单
        recent_orders = await collection.find({}).sort("created_at", -1).limit(5).to_list(5)
        
        print(f"📊 找到最近的 {len(recent_orders)} 个订单:")
        print("-" * 80)
        
        for i, order in enumerate(recent_orders, 1):
            print(f"\n订单 {i}:")
            print(f"  Order Number: {order.get('order_number', 'N/A')}")
            print(f"  Customer ID: {order.get('customer_id', 'N/A')}")
            print(f"  Status: {order.get('status', 'N/A')}")
            print(f"  Total Amount: ${order.get('total_amount', 0):.2f}")
            print(f"  Created At: {order.get('created_at', 'N/A')}")
            print(f"  Updated At: {order.get('updated_at', 'N/A')}")
            print(f"  Items Count: {len(order.get('items', []))}")
            
            # 检查时间字段格式
            created_at = order.get('created_at')
            if created_at:
                if isinstance(created_at, datetime):
                    print(f"  ✅ created_at 是 datetime 对象")
                    print(f"  📅 格式化后: {created_at.strftime('%Y-%m-%d %H:%M:%S')}")
                elif isinstance(created_at, str):
                    print(f"  ⚠️ created_at 是字符串: {created_at}")
                    try:
                        parsed_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        print(f"  ✅ 可以解析为: {parsed_date.strftime('%Y-%m-%d %H:%M:%S')}")
                    except Exception as e:
                        print(f"  ❌ 无法解析时间: {e}")
                else:
                    print(f"  ❌ created_at 类型未知: {type(created_at)}")
            
            # 检查订单项
            items = order.get('items', [])
            if items:
                print(f"  📦 订单项:")
                for j, item in enumerate(items):
                    print(f"    {j+1}. {item.get('product_name', 'Unknown')} x{item.get('quantity', 0)} = ${item.get('subtotal', 0):.2f}")
            
            # 检查收货地址
            shipping_address = order.get('shipping_address', {})
            if shipping_address:
                print(f"  🏠 收货地址: {shipping_address.get('recipient_name', 'N/A')}")
            
            print("-" * 40)
        
    except Exception as e:
        print(f"❌ 检查订单失败: {e}")

async def check_order_validation():
    """检查订单数据验证"""
    print("\n🔍 检查订单数据验证...")
    
    try:
        from models.order import OrderResponse
        collection = await get_collection("orders")
        
        # 获取一个最新订单进行验证测试
        latest_order = await collection.find_one({}, sort=[("created_at", -1)])
        
        if latest_order:
            print(f"📋 测试订单: {latest_order.get('order_number', 'N/A')}")
            
            # 准备订单响应数据
            order_doc = latest_order.copy()
            order_doc["id"] = str(order_doc["_id"])
            del order_doc["_id"]
            
            # 确保所有必需字段存在
            order_doc.setdefault("tracking_number", None)
            order_doc.setdefault("paid_at", None)
            order_doc.setdefault("shipped_at", None)
            order_doc.setdefault("delivered_at", None)
            order_doc.setdefault("notes", None)
            
            try:
                order_response = OrderResponse(**order_doc)
                print("✅ 订单响应验证成功")
                print(f"  Order Number: {order_response.order_number}")
                print(f"  Status: {order_response.status}")
                print(f"  Created At: {order_response.created_at}")
            except Exception as e:
                print(f"❌ 订单响应验证失败: {e}")
                print(f"  问题字段可能包含: {str(e)}")
                
                # 检查状态值
                status = order_doc.get('status')
                print(f"  Status 值: '{status}' (类型: {type(status)})")
                
                # 检查是否是有效的枚举值
                valid_statuses = [s.value for s in OrderStatus]
                print(f"  有效状态列表: {valid_statuses}")
                print(f"  Status 是否有效: {status in valid_statuses}")
        else:
            print("⚠️ 没有找到订单数据")
            
    except Exception as e:
        print(f"❌ 订单验证检查失败: {e}")

async def check_time_consistency():
    """检查时间一致性"""
    print("\n🔍 检查时间一致性...")
    
    try:
        collection = await get_collection("orders")
        
        # 检查不同时间字段的一致性
        orders_with_times = await collection.find({
            "created_at": {"$exists": True}
        }).limit(3).to_list(3)
        
        for order in orders_with_times:
            print(f"\n📋 订单 {order.get('order_number', order['_id'])}:")
            
            created_at = order.get('created_at')
            updated_at = order.get('updated_at')
            paid_at = order.get('paid_at')
            
            print(f"  Created At: {created_at} ({type(created_at)})")
            print(f"  Updated At: {updated_at} ({type(updated_at)})")
            print(f"  Paid At: {paid_at} ({type(paid_at)})")
            
            # 检查时间逻辑
            if created_at and updated_at:
                if isinstance(created_at, datetime) and isinstance(updated_at, datetime):
                    if updated_at >= created_at:
                        print("  ✅ updated_at >= created_at")
                    else:
                        print("  ⚠️ updated_at < created_at (可能有问题)")
                        
    except Exception as e:
        print(f"❌ 时间一致性检查失败: {e}")

async def simulate_order_creation():
    """模拟订单创建过程"""
    print("\n🔍 模拟订单创建过程...")
    
    try:
        from controllers.order_controller import OrderController
        from models.order import OrderCreate, ShippingAddress, PaymentMethod
        
        # 检查是否有用户和购物车数据
        customers_collection = await get_collection("customers")
        carts_collection = await get_collection("carts")
        
        # 找一个有购物车的用户
        user = await customers_collection.find_one({"is_admin": {"$ne": True}})
        if not user:
            print("⚠️ 没有找到普通用户")
            return
            
        user_id = str(user["_id"])
        print(f"📋 使用用户: {user.get('username', user.get('email', user_id))}")
        
        # 检查购物车
        cart = await carts_collection.find_one({"customer_id": user_id})
        if not cart or not cart.get('items'):
            print("⚠️ 用户没有购物车项目")
            return
            
        print(f"🛒 购物车有 {len(cart['items'])} 个项目")
        
        # 创建测试订单数据
        test_address = ShippingAddress(
            recipient_name="Test Customer",
            phone="1234567890",
            address_line1="123 Test St",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="United States"
        )
        
        test_order_data = OrderCreate(
            shipping_address=test_address,
            payment_method=PaymentMethod.CREDIT_CARD,
            notes="Test order creation"
        )
        
        print("🔄 尝试创建订单...")
        
        # 注意：这只是模拟，不会真正创建订单
        print("✅ 订单创建流程检查完成（模拟）")
        
    except Exception as e:
        print(f"❌ 订单创建模拟失败: {e}")

async def main():
    """主诊断函数"""
    print("🩺 订单创建和时间显示诊断")
    print("=" * 50)
    
    await check_recent_orders()
    await check_order_validation()
    await check_time_consistency()
    await simulate_order_creation()
    
    print("\n" + "=" * 50)
    print("🎯 诊断建议:")
    print("1. 检查前端时间格式化逻辑")
    print("2. 确保订单状态枚举值正确")
    print("3. 验证数据库时间字段一致性")
    print("4. 检查订单创建错误处理")

if __name__ == "__main__":
    asyncio.run(main()) 