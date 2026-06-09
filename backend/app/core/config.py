"""全局配置管理，使用 Pydantic Settings 加载环境变量。"""

from pydantic import model_validator
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

    @model_validator(mode="after")
    def _validate_auth_secret(self):
        """auth_enabled 为 True 时，AUTH_SECRET 不能为空。"""
        if self.auth_enabled and not self.auth_secret:
            raise ValueError("auth_enabled 为 True 时，AUTH_SECRET 不能为空")
        return self


settings = Settings()
