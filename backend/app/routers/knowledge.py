from fastapi import APIRouter

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/")
async def list_knowledge_points():
    return {"message": "Knowledge points API - coming soon"}
