#!/usr/bin/env python3
"""
专门调试admin订单查询的脚本
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment
load_dotenv("config.env")

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import connect_to_mongo, get_collection
from utils.auth import create_access_token
from models.order import OrderSearch
from controllers.order_controller import OrderController
import requests

async def debug_admin_query():
    """调试admin查询问题"""
    print("🔍 调试admin订单查询问题")
    print("=" * 40)
    
    # 连接数据库
    await connect_to_mongo()
    
    # 1. 直接查询数据库
    print("\n1️⃣ 直接查询数据库:")
    collection = await get_collection("orders")
    all_orders = await collection.find({}).to_list(100)
    print(f"   数据库中总订单数: {len(all_orders)}")
    
    for order in all_orders:
        print(f"   - {order.get('order_number', order['_id'])}: {order.get('status')}")
    
    # 2. 测试OrderController的search_orders方法
    print("\n2️⃣ 测试OrderController.search_orders:")
    try:
        search_params = OrderSearch()
        orders, total = await OrderController.search_orders(search_params, page=1, size=20)
        print(f"   返回订单数: {len(orders)}, 总数: {total}")
        
        for order in orders:
            print(f"   - {order.order_number}: {order.status}")
            
    except Exception as e:
        print(f"   错误: {e}")
    
    # 3. 生成长期有效的token并测试API
    print("\n3️⃣ 测试admin API端点:")
    
    # 获取admin用户
    customers_collection = await get_collection("customers")
    admin_user = await customers_collection.find_one({"is_admin": True})
    
    if admin_user:
        # 生成24小时有效的token
        token_data = {"sub": str(admin_user["_id"])}
        token = create_access_token(token_data, expires_delta=timedelta(hours=24))
        print(f"   生成的token: {token[:50]}...")
        
        # 测试API
        headers = {"Authorization": f"Bearer {token}"}
        try:
            response = requests.get("http://localhost:8000/api/orders/admin/all", headers=headers, timeout=10)
            print(f"   API响应状态码: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   API返回的数据结构: {list(data.keys())}")
                if 'data' in data:
                    items = data['data'].get('items', [])
                    total = data['data'].get('total', 0)
                    print(f"   API返回订单数: {len(items)}, API总数: {total}")
                    
                    for item in items:
                        print(f"   - {item.get('order_number', item.get('id'))}: {item.get('status')}")
                else:
                    print(f"   完整响应: {data}")
            else:
                print(f"   错误响应: {response.text}")
                
        except Exception as e:
            print(f"   API请求失败: {e}")
    
    # 4. 比较路由实现
    print("\n4️⃣ 检查路由实现差异:")
    
    print("   检查admin.py中的get_all_orders方法...")
    # 这里我们模拟admin.py中的查询逻辑
    try:
        query = {}
        skip = 0
        limit = 10
        
        total = await collection.count_documents(query)
        cursor = collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
        orders = await cursor.to_list(limit)
        
        print(f"   admin.py逻辑 - 总数: {total}, 返回: {len(orders)}")
        
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
            print(f"   - {order.get('order_number', order.get('id'))}: {order.get('status')}")
            
    except Exception as e:
        print(f"   admin.py逻辑测试失败: {e}")

if __name__ == "__main__":
    asyncio.run(debug_admin_query()) 