"""全局配置管理，使用 Pydantic Settings 加载环境变量。"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置，所有变量可从 .env 文件或环境变量覆盖。"""

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "spec_agent"
    auth_enabled: bool = True
    auth_token_expire_hours: int = 12
    auth_secret: str = ""
    cors_origins: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
