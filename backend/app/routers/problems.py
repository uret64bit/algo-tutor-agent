from fastapi import APIRouter

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("/")
async def list_problems():
    return {"message": "Problems API - coming soon"}
