from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "算法教练平台"
    API_V1_STR: str = "/api/v1"

    POSTGRES_USER: str = "algo_tutor"
    POSTGRES_PASSWORD: str = "algo_tutor_secret"
    POSTGRES_DB: str = "algo_tutor"
    DATABASE_URL: str = "postgresql+asyncpg://algo_tutor:algo_tutor_secret@postgres:5432/algo_tutor"

    JWT_SECRET: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    REDIS_URL: str = "redis://redis:6379/0"

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
