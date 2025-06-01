from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database.connection import connect_to_mongo, close_mongo_connection
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.cart import router as cart_router
from routes.admin import router as admin_router
from routes.orders import router as orders_router
from routes.tracking import router as tracking_router
from routes.customers import router as customers_router

# Load environment variables from config.env
load_dotenv("config.env")

app = FastAPI(
    title="AWE Electronics Online Store API",
    description="AWE Electronics online store backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Get CORS origins from environment
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5174")
allowed_origins = [
    "http://localhost:3000",  # React development server
    "http://localhost:5173",  # Vite development server
    "http://localhost:5174",  # Vite development server (current)
    "https://awe-oes.vercel.app",  # Vercel production
    "https://awe-76f7p55bb-stevocs-projects.vercel.app",  # Current Vercel URL
    "https://*.vercel.app",  # All Vercel subdomains
    frontend_url,
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174", 
    "http://127.0.0.1:3000",
    "https://awe-oes.onrender.com",
]

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products_router, prefix="/api/products", tags=["Product Management"])
app.include_router(cart_router, prefix="/api/cart", tags=["Shopping Cart"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin Management"])
app.include_router(orders_router, prefix="/api/orders", tags=["Order Management"])
app.include_router(tracking_router, prefix="/api/tracking", tags=["Order Tracking"])
app.include_router(customers_router, prefix="/api/customers", tags=["Customer Management"])

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