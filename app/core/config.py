from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os
from functools import lru_cache

class Settings(BaseSettings):
    """
    Impostazioni dell'applicazione, caricate da variabili d'ambiente o valori di default.
    """
    # Informazioni generali
    PROJECT_NAME: str = "BioDesigner"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = Field(default=True)
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    MONGODB_URI: str = "mongodb://localhost:27017/biodesigner"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Token JWT per autenticazione (futura implementazione)
    SECRET_KEY: str = Field(default="secret_key_for_development", env="SECRET_KEY")
    TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 giorni
    
    # Impostazioni per simulazione
    MAX_SIMULATION_TIME: float = 1000.0  # Tempo massimo di simulazione in secondi
    MAX_SIMULATION_NODES: int = 100  # Numero massimo di nodi in un circuito
    
    # Opzioni per ottimizzazioni
    MAX_SEQUENCE_LENGTH: int = 50000  # Lunghezza massima per l'ottimizzazione dei codoni
    
    # Percorsi file
    STATIC_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    TEMP_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Crea un'istanza singleton delle impostazioni.
    """
    return Settings()


settings = get_settings() 