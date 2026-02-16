from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_maps_api_key: str
    frontend_origin: str = "http://localhost:5173"

    model_config = {"env_file": ".env"}


settings = Settings()
