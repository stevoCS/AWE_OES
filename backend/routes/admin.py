from fastapi import APIRouter, HTTPException
from database.connection import get_database

router = APIRouter()

@router.post("/fix-image-paths")
async def fix_image_paths():
    """Fix image paths in products collection"""
    
    try:
        db = await get_database()
        collection = db["products"]
        
        # Find all products with /src/assets/ paths
        cursor = collection.find({"images": {"$regex": "^/src/assets/"}})
        
        updated_count = 0
        products = await cursor.to_list(length=100)
        
        for product in products:
            # Fix image paths
            new_images = []
            for image_path in product.get("images", []):
                if image_path.startswith("/src/assets/"):
                    # Keep the /src/assets/ path - this is what the frontend expects
                    new_images.append(image_path)
                else:
                    new_images.append(image_path)
            
            # Update if needed (though in this case we're keeping the same paths)
            if new_images != product.get("images", []):
                await collection.update_one(
                    {"_id": product["_id"]},
                    {"$set": {"images": new_images}}
                )
                updated_count += 1
        
        return {
            "success": True,
            "message": f"Image paths checked. Products found: {len(products)}",
            "updated_count": updated_count,
            "sample_paths": [p.get("images", []) for p in products[:3]] if products else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fixing image paths: {str(e)}")

@router.get("/check-image-paths")
async def check_image_paths():
    """Check current image paths in products"""
    
    try:
        db = await get_database()
        collection = db["products"]
        
        # Get all products
        cursor = collection.find({})
        products = await cursor.to_list(length=100)
        
        image_paths = []
        for product in products:
            if product.get("images"):
                image_paths.extend(product["images"])
        
        return {
            "success": True,
            "total_products": len(products),
            "image_paths": list(set(image_paths)),  # Unique paths
            "sample_products": [
                {
                    "name": p.get("name"),
                    "images": p.get("images", [])
                } for p in products[:5]
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking image paths: {str(e)}") 