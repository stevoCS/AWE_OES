# AWE Electronics Online Store - 后端API

这是AWE Electronics在线商城的Python后端服务，基于FastAPI框架开发，使用MongoDB作为数据存储。

## 功能特性

### 核心功能模块

1. **用户认证管理** (`/api/auth`)
   - 用户注册和登录
   - JWT令牌认证
   - 用户资料管理
   - 令牌刷新

2. **商品管理** (`/api/products`)
   - 商品的增删改查
   - 商品搜索和筛选
   - 分类和品牌管理
   - 库存管理

3. **购物车管理** (`/api/cart`)
   - 添加/移除商品
   - 更新商品数量
   - 购物车结算
   - 价格计算（含税费和运费）

4. **订单管理** (`/api/orders`)
   - 从购物车创建订单
   - 订单状态管理
   - 订单查询和搜索
   - 订单取消和退款

5. **订单跟踪** (`/api/tracking`)
   - 实时物流跟踪
   - 订单状态更新
   - 配送进度显示
   - 预计送达时间

## 技术栈

- **Web框架**: FastAPI 0.104.1
- **数据库**: MongoDB (使用Motor异步驱动)
- **认证**: JWT (python-jose)
- **密码加密**: Bcrypt (passlib)
- **数据验证**: Pydantic 2.5.0
- **异步支持**: Python asyncio
- **API文档**: Swagger UI (自动生成)

## 项目结构

```
backend/
├── main.py                 # FastAPI应用入口
├── run.py                  # 启动脚本
├── requirements.txt        # Python依赖
├── config.env.example      # 环境变量示例
├── database/
│   └── connection.py       # MongoDB连接管理
├── models/                 # 数据模型
│   ├── customer.py         # 用户模型
│   ├── product.py          # 商品模型
│   ├── cart.py            # 购物车模型
│   ├── order.py           # 订单模型
│   └── tracking.py        # 跟踪模型
├── controllers/           # 业务逻辑控制器
│   ├── auth_controller.py  # 认证控制器
│   ├── product_controller.py # 商品控制器
│   ├── cart_controller.py  # 购物车控制器
│   ├── order_controller.py # 订单控制器
│   └── tracking_controller.py # 跟踪控制器
├── routes/                # API路由
│   ├── auth.py            # 认证路由
│   ├── products.py        # 商品路由
│   ├── cart.py           # 购物车路由
│   ├── orders.py         # 订单路由
│   └── tracking.py       # 跟踪路由
└── utils/                # 工具函数
    ├── auth.py           # 认证工具
    └── response.py       # 响应格式化
```

## 快速开始

### 1. 环境要求

- Python 3.8+
- MongoDB 4.4+

### 2. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 配置环境变量

复制环境变量示例文件并配置：

```bash
cp config.env.example .env
```

编辑 `.env` 文件：

```env
# MongoDB配置
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=awe_electronics_store

# JWT配置
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 应用配置
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 4. 启动MongoDB

确保MongoDB服务正在运行：

```bash
# 使用Docker启动MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 或使用本地安装的MongoDB
mongod
```

### 5. 启动应用

```bash
# 方式1: 使用启动脚本
python run.py

# 方式2: 直接运行
python main.py

# 方式3: 使用uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. 访问API文档

应用启动后，访问以下地址查看API文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API 使用示例

### 用户注册

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "email": "test@example.com",
  "full_name": "Test User",
  "password": "password123"
}'
```

### 用户登录

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "password": "password123"
}'
```

### 搜索商品

```bash
curl -X GET "http://localhost:8000/api/products/?keyword=手机&page=1&size=10"
```

### 添加商品到购物车

```bash
curl -X POST "http://localhost:8000/api/cart/items" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "product_id": "product_id_here",
  "quantity": 2
}'
```

## 数据库设计

### 集合结构

1. **customers** - 用户信息
2. **products** - 商品信息
3. **carts** - 购物车
4. **orders** - 订单
5. **tracking** - 订单跟踪

### 索引建议

```javascript
// 用户集合索引
db.customers.createIndex({ "username": 1 }, { unique: true })
db.customers.createIndex({ "email": 1 }, { unique: true })

// 商品集合索引
db.products.createIndex({ "name": "text", "description": "text" })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "brand": 1 })
db.products.createIndex({ "price": 1 })

// 订单集合索引
db.orders.createIndex({ "customer_id": 1 })
db.orders.createIndex({ "order_number": 1 }, { unique: true })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "created_at": -1 })

// 跟踪集合索引
db.tracking.createIndex({ "order_id": 1 }, { unique: true })
db.tracking.createIndex({ "order_number": 1 })
db.tracking.createIndex({ "tracking_number": 1 })
```

## 部署

### 使用Docker

1. 创建 `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
```

2. 构建和运行：

```bash
docker build -t awe-backend .
docker run -p 8000:8000 awe-backend
```

### 使用docker-compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

运行：

```bash
docker-compose up -d
```

## 开发说明

### 添加新功能

1. 在 `models/` 中定义数据模型
2. 在 `controllers/` 中实现业务逻辑
3. 在 `routes/` 中定义API路由
4. 在 `main.py` 中注册路由

### 测试

```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest
```

### 代码风格

项目使用以下代码规范：
- PEP 8 Python代码风格
- 类型注解 (Type Hints)
- 详细的文档字符串

## 故障排除

### 常见问题

1. **MongoDB连接失败**
   - 检查MongoDB服务是否运行
   - 验证连接URL配置

2. **JWT令牌错误**
   - 检查SECRET_KEY配置
   - 确认令牌未过期

3. **导入错误**
   - 确保所有依赖已安装
   - 检查Python路径配置

## 许可证

MIT License

## 联系方式

如有问题，请创建Issue或联系开发团队。 