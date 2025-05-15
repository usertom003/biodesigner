from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
import logging

from server.models.external_search import (
    ExternalDatabase,
    ExternalComponentSearchResult,
    ExternalComponentDetail,
    ExternalComponentImportRequest
)
from server.models.genetic_component import (
    GeneticComponentCreate, 
    GeneticComponentResponse,
    ComponentType
)
from server.repositories.external_search_repository import ExternalSearchRepository
from server.repositories.component_repository import ComponentRepository # To save imported components

router = APIRouter(prefix="/api/search", tags=["external_search"])
logger = logging.getLogger(__name__)

@router.get("/databases", response_model=List[ExternalDatabase])
async def get_external_databases(
    repository: ExternalSearchRepository = Depends(lambda: ExternalSearchRepository())
):
    """
    Ottiene la lista dei database esterni disponibili (mock).
    """
    try:
        return await repository.get_available_databases()
    except Exception as e:
        logger.error(f"Errore nel recuperare i database esterni: {str(e)}")
        raise HTTPException(status_code=500, detail="Errore nel recuperare i database esterni")

@router.get("/external", response_model=List[ExternalComponentSearchResult])
async def search_external_databases_route(
    query: str = Query(..., description="Testo da cercare nei database esterni"),
    database: Optional[str] = Query("all", description="ID del database specifico o 'all' per tutti"),
    type: Optional[ComponentType] = Query(None, description="Filtra per tipo di componente genetico"), # Using ComponentType from genetic_component
    limit: int = Query(20, ge=1, le=100, description="Numero massimo di risultati da restituire"),
    repository: ExternalSearchRepository = Depends(lambda: ExternalSearchRepository())
):
    """
    Cerca componenti nei database esterni (mock).
    """
    try:
        # Convert ComponentType enum to string if provided, as mock data uses strings
        component_type_str = type.value if type else None
        results = await repository.search_external(query, database, component_type_str, limit)
        return results
    except Exception as e:
        logger.error(f"Errore durante la ricerca nei database esterni: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante la ricerca nei database esterni: {str(e)}")

@router.post("/import", response_model=GeneticComponentResponse) # Assuming import returns a GeneticComponentResponse
async def import_from_external_database_route(
    import_request: ExternalComponentImportRequest,
    external_repo: ExternalSearchRepository = Depends(lambda: ExternalSearchRepository()),
    component_repo: ComponentRepository = Depends(lambda: ComponentRepository())
):
    """
    Importa un componente da un database esterno (mock) e lo salva nel database locale.
    """
    try:
        # 1. Verifica se il componente esiste già nel database locale (opzionale, da implementare nel ComponentRepository se necessario)
        # Example: existing_local = await component_repo.get_by_source_id(import_request.external_id, import_request.database)
        # if existing_local: return existing_local
        
        # 2. Recupera i dettagli del componente dal database esterno (mock)
        external_component_detail = await external_repo.fetch_external_component_detail(
            external_id=import_request.external_id,
            database=import_request.database,
            component_type=import_request.type # Assuming type in request is string and matches mock data
        )

        if not external_component_detail:
            raise HTTPException(status_code=404, detail=f"Componente {import_request.external_id} non trovato nel database {import_request.database}")

        # 3. Crea l'oggetto GeneticComponentCreate per il salvataggio
        # Map ComponentType string from external_component_detail.type to ComponentType enum
        try:
            component_type_enum = ComponentType(external_component_detail.type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Tipo di componente non valido: {external_component_detail.type}")

        component_to_create = GeneticComponentCreate(
            name=external_component_detail.name,
            component_type=component_type_enum,
            sequence=external_component_detail.sequence,
            description=external_component_detail.description,
            properties=external_component_detail.properties or {}
            # Potresti voler aggiungere source e sourceId qui
        )
        
        # 4. Salva il componente nel database locale
        # Temporaneamente useremo un user_id di test
        user_id = "test_user_import"
        component_id = await component_repo.create_component(user_id, component_to_create)
        
        # 5. Restituisci il componente salvato
        saved_component = await component_repo.get_component(component_id)
        if not saved_component:
            raise HTTPException(status_code=500, detail="Errore nel salvare il componente importato")
            
        return saved_component

    except HTTPException: # Re-raise HTTPException per mantenere lo status code corretto
        raise
    except ValueError as ve:
        logger.warning(f"Errore di validazione durante l'importazione: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Errore durante l'importazione da database esterno: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'importazione: {str(e)}") 