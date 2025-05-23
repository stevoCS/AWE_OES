from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database.connection import connect_to_mongo, close_mongo_connection
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.cart import router as cart_router
from routes.orders import router as orders_router
from routes.tracking import router as tracking_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AWE Electronics Online Store API",
    description="AWE Electronics online store backend API",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products_router, prefix="/api/products", tags=["Product Management"])
app.include_router(cart_router, prefix="/api/cart", tags=["Shopping Cart"])
app.include_router(orders_router, prefix="/api/orders", tags=["Order Management"])
app.include_router(tracking_router, prefix="/api/tracking", tags=["Order Tracking"])

@app.on_event("startup")
async def startup_db_client():
    """Connect to database on application startup"""
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Disconnect from database on application shutdown"""
    await close_mongo_connection()

@app.get("/")
async def root():
    """API root endpoint"""
    return {"message": "Welcome to AWE Electronics Online Store API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API service is running normally"}

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug
    ) 