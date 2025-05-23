#!/usr/bin/env python3
"""
AWE Electronics Online Store Backend
Startup script
"""

import uvicorn
import os
from dotenv import load_dotenv

def main():
    """Start FastAPI application"""
    # Load environment variables
    load_dotenv()
    
    # Get configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print("🚀 Starting AWE Electronics online store backend service...")
    print(f"📍 Service address: http://{host}:{port}")
    print(f"📚 API documentation: http://{host}:{port}/docs")
    print(f"🔧 Debug mode: {'Enabled' if debug else 'Disabled'}")
    
    # Start server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning"
    )

if __name__ == "__main__":
    main() 