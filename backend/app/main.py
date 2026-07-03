from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import knowledge, problems

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(knowledge.router, prefix=settings.API_V1_STR)
app.include_router(problems.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "算法教练平台 API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
