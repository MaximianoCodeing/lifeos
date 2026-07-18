from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração central da aplicação, lida a partir de variáveis de ambiente."""

    PROJECT_NAME: str = "LifeOS"
    API_V1_PREFIX: str = "/api/v1"

    # Base de dados
    DATABASE_URL: str = "postgresql://lifeos:lifeos@localhost:5432/lifeos"

    # Segurança / JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 dia
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
