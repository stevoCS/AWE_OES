from typing import Any, Optional
from fastapi import HTTPException, status
from pydantic import BaseModel

class APIResponse(BaseModel):
    """Standard API response model"""
    success: bool
    message: str
    data: Optional[Any] = None
    code: int = 200

def success_response(data: Any = None, message: str = "Operation successful", code: int = 200) -> APIResponse:
    """Success response"""
    return APIResponse(
        success=True,
        message=message,
        data=data,
        code=code
    )

def error_response(message: str = "Operation failed", code: int = 400, data: Any = None) -> APIResponse:
    """Error response"""
    return APIResponse(
        success=False,
        message=message,
        data=data,
        code=code
    )

class APIException(HTTPException):
    """Custom API exception"""
    def __init__(self, message: str = "Operation failed", status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        super().__init__(status_code=status_code, detail=message)

def validate_object_id(obj_id: str) -> str:
    """Validate ObjectId format"""
    from bson import ObjectId
    try:
        ObjectId(obj_id)
        return obj_id
    except Exception:
        raise APIException("Invalid ID format", status.HTTP_400_BAD_REQUEST)

def paginate_response(items: list, total: int, page: int, size: int, message: str = "Query successful"):
    """Pagination response"""
    return success_response(
        data={
            "items": items,
            "pagination": {
                "total": total,
                "page": page,
                "size": size,
                "pages": (total + size - 1) // size if size > 0 else 0
            }
        },
        message=message
    ) 