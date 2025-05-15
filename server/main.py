from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import traceback
from datetime import datetime

from server.controllers import (
    component_controller,
    design_controller,
    simulation_controller,
    sequence_controller,
    external_search_controller,
    antibody_controller,
    protein_expression_controller
)
from app.core.config import settings

# Configurazione del logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("biodesigner")

# Creazione dell'app FastAPI
app = FastAPI(
    title="BioDesigner API",
    description="API per la progettazione e simulazione di circuiti genetici",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra i router dei controller
app.include_router(component_controller.router)
app.include_router(design_controller.router)
app.include_router(simulation_controller.router)
app.include_router(sequence_controller.router)
app.include_router(external_search_controller.router)
app.include_router(antibody_controller.router)
app.include_router(protein_expression_controller.router)

# Endpoint di health check
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": settings.VERSION
    }

# Middleware per la gestione globale delle eccezioni
@app.middleware("http")
async def exception_handling_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Errore non gestito: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Errore interno del server",
                "message": str(e) if settings.DEBUG else "Si è verificato un errore durante l'elaborazione della richiesta."
            }
        )

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Avvio del server BioDesigner")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Arresto del server BioDesigner")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    ) 