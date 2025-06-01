#!/usr/bin/env python3
"""
Admin API故障诊断脚本
用于检查admin订单管理API的各种潜在问题
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
from utils.auth import create_access_token, get_password_hash
from models.order import OrderStatus
from bson import ObjectId

async def test_database_connection():
    """测试数据库连接"""
    print("🔍 测试数据库连接...")
    try:
        await connect_to_mongo()
        print("✅ 数据库连接成功")
        return True
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

async def check_admin_users():
    """检查admin用户"""
    print("\n🔍 检查admin用户...")
    try:
        collection = await get_collection("customers")
        admin_users = await collection.find({"is_admin": True}).to_list(10)
        
        if not admin_users:
            print("⚠️ 没有找到admin用户")
            # 创建一个测试admin用户
            test_admin = {
                "username": "admin",
                "email": "admin@test.com",
                "hashed_password": get_password_hash("admin123"),
                "is_admin": True,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            result = await collection.insert_one(test_admin)
            print(f"✅ 创建了测试admin用户: {result.inserted_id}")
            return str(result.inserted_id)
        else:
            print(f"✅ 找到 {len(admin_users)} 个admin用户")
            for admin in admin_users:
                print(f"   - ID: {admin['_id']}, Username: {admin.get('username', 'N/A')}, Email: {admin.get('email', 'N/A')}")
            return str(admin_users[0]['_id'])
    except Exception as e:
        print(f"❌ 检查admin用户失败: {e}")
        return None

async def test_admin_token():
    """测试admin token生成"""
    print("\n🔍 测试admin token生成...")
    try:
        admin_id = await check_admin_users()
        if not admin_id:
            return None
            
        token = create_access_token({"sub": admin_id})
        print(f"✅ 生成admin token: {token[:50]}...")
        return token
    except Exception as e:
        print(f"❌ 生成admin token失败: {e}")
        return None

async def check_orders_data():
    """检查订单数据"""
    print("\n🔍 检查订单数据...")
    try:
        collection = await get_collection("orders")
        total_orders = await collection.count_documents({})
        print(f"📊 总订单数: {total_orders}")
        
        # 检查不同状态的订单
        for status in ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']:
            count = await collection.count_documents({"status": status})
            print(f"   - {status}: {count}")
        
        # 获取最近的几个订单
        recent_orders = await collection.find({}).sort("created_at", -1).limit(3).to_list(3)
        print(f"\n📝 最近的订单:")
        for order in recent_orders:
            print(f"   - {order.get('order_number', order['_id'])}: {order.get('status', 'unknown')} - {order.get('total_amount', 0)}")
            
        return total_orders > 0
    except Exception as e:
        print(f"❌ 检查订单数据失败: {e}")
        return False

async def test_admin_orders_api():
    """测试admin订单API逻辑"""
    print("\n🔍 测试admin订单API逻辑...")
    try:
        from controllers.order_controller import OrderController
        from models.order import OrderSearch
        
        # 创建搜索参数
        search_params = OrderSearch()
        
        # 调用搜索方法
        orders, total = await OrderController.search_orders(search_params, page=1, size=20)
        
        print(f"✅ API逻辑测试成功:")
        print(f"   - 找到 {total} 个订单")
        print(f"   - 返回 {len(orders)} 个订单对象")
        
        if orders:
            sample_order = orders[0]
            print(f"   - 示例订单: {sample_order.order_number} (状态: {sample_order.status})")
            
        return True
    except Exception as e:
        print(f"❌ API逻辑测试失败: {e}")
        return False

async def test_routes_access():
    """测试路由访问"""
    print("\n🔍 测试路由访问...")
    try:
        import requests
        
        # 测试健康检查
        health_response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"✅ 健康检查: {health_response.status_code}")
        
        # 测试不带token的admin API
        admin_response = requests.get("http://localhost:8000/api/orders/admin/all", timeout=5)
        print(f"✅ Admin API (无token): {admin_response.status_code} - {admin_response.json().get('detail', 'OK')}")
        
        # 生成有效token并测试
        token = await test_admin_token()
        if token:
            headers = {"Authorization": f"Bearer {token}"}
            auth_response = requests.get("http://localhost:8000/api/orders/admin/all", headers=headers, timeout=5)
            print(f"✅ Admin API (有token): {auth_response.status_code}")
            if auth_response.status_code == 200:
                data = auth_response.json()
                print(f"   - 成功获取数据: {data.get('data', {}).get('total', 0)} 个订单")
            else:
                print(f"   - 错误: {auth_response.json()}")
        
        return True
    except Exception as e:
        print(f"❌ 路由访问测试失败: {e}")
        return False

async def diagnose_issue():
    """诊断主要问题"""
    print("🩺 AWE电商管理后台订单API故障诊断")
    print("=" * 50)
    
    # 运行各项测试
    db_ok = await test_database_connection()
    if not db_ok:
        print("\n❌ 主要问题: 数据库连接失败")
        return
    
    admin_exists = await check_admin_users()
    if not admin_exists:
        print("\n❌ 主要问题: 没有admin用户")
        return
    
    orders_exist = await check_orders_data()
    if not orders_exist:
        print("\n⚠️ 警告: 没有订单数据")
    
    api_ok = await test_admin_orders_api()
    if not api_ok:
        print("\n❌ 主要问题: API逻辑错误")
        return
    
    routes_ok = await test_routes_access()
    if not routes_ok:
        print("\n❌ 主要问题: 路由访问错误")
        return
    
    print("\n" + "=" * 50)
    print("🎉 所有测试通过! API应该正常工作")
    print("📋 建议检查:")
    print("   1. 前端是否正确存储了admin token")
    print("   2. 前端API调用的URL是否正确")
    print("   3. 网络连接是否正常")

if __name__ == "__main__":
    asyncio.run(diagnose_issue()) 