from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os

# Custom CORS middleware to handle all CORS issues
class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            response = Response(status_code=200)
        else:
            response = await call_next(request)
        
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "false"
        return response

from database.connection import connect_to_mongo, close_mongo_connection
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.cart import router as cart_router
from routes.admin import router as admin_router
# from routes.orders import router as orders_router
# from routes.tracking import router as tracking_router

# Load environment variables from config.env
load_dotenv("config.env")

app = FastAPI(
    title="AWE Electronics Online Store API",
    description="AWE Electronics online store backend API",
    version="1.0.1",  # Updated version to verify deployment
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add custom CORS middleware
app.add_middleware(CustomCORSMiddleware)

# Also add standard CORS middleware as backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all request headers
    expose_headers=["*"]  # Expose all response headers
)

# Register routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products_router, prefix="/api/products", tags=["Product Management"])
app.include_router(cart_router, prefix="/api/cart", tags=["Shopping Cart"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin Management"])
# app.include_router(orders_router, prefix="/api/orders", tags=["Order Management"])
# app.include_router(tracking_router, prefix="/api/tracking", tags=["Order Tracking"])

@app.on_event("startup")
async def startup_db_client():
    """Connect to database on application startup"""
    print("🚀 Starting AWE Electronics API...")
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Disconnect from database on application shutdown"""
    print("🛑 Shutting down AWE Electronics API...")
    await close_mongo_connection()

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to AWE Electronics Online Store API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from database.connection import test_connection
    
    db_status = "connected" if await test_connection() else "disconnected"
    
    return {
        "status": "healthy",
        "message": "API service is running normally",
        "database": db_status,
        "version": "1.0.0"
    }

@app.get("/healthz")
async def health_check_z():
    """Health check endpoint for Render.com (alternative path)"""
    from database.connection import test_connection
    
    db_status = "connected" if await test_connection() else "disconnected"
    
    return {
        "status": "healthy",
        "message": "API service is running normally",
        "database": db_status,
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"🌟 Starting server on {host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"📄 API docs available at: http://{host}:{port}/docs")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    ) 