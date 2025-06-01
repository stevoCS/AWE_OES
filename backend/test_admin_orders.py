import asyncio
from database.connection import connect_to_mongo, close_mongo_connection, get_collection
from controllers.order_controller import OrderController
from models.order import OrderSearch

async def test_admin_orders():
    # 初始化数据库连接
    await connect_to_mongo()
    
    try:
        # 测试基本的数据库查询
        collection = await get_collection('orders')
        count = await collection.count_documents({})
        print(f"📊 订单集合中有 {count} 个文档")
        
        # 列出所有订单
        orders = await collection.find().to_list(length=None)
        for order in orders:
            print(f"📦 订单: {order.get('order_number')} - 状态: {order.get('status')}")
        
        # 测试OrderController.search_orders方法
        print("\n🔍 测试 OrderController.search_orders 方法...")
        search_params = OrderSearch()
        try:
            results, total = await OrderController.search_orders(search_params, 1, 20)
            print(f"✅ 搜索成功：找到 {total} 个订单，返回 {len(results)} 个结果")
            for order in results:
                print(f"   - {order.order_number}: {order.status}")
        except Exception as e:
            print(f"❌ 搜索失败: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_admin_orders()) 