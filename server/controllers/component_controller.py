from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path
from fastapi.responses import JSONResponse
import logging

from server.models.genetic_component import (
    GeneticComponentCreate,
    GeneticComponentResponse,
    GeneticComponentUpdate,
    ComponentType
)
from server.repositories.component_repository import ComponentRepository

router = APIRouter(prefix="/api/components", tags=["components"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=GeneticComponentResponse)
async def create_component(
    component: GeneticComponentCreate,
    repository: ComponentRepository = Depends(lambda: ComponentRepository())
):
    """
    Crea un nuovo componente genetico.
    """
    try:
        # Temporaneamente useremo un user_id di test
        user_id = "test_user"
        component_id = await repository.create_component(user_id, component)
        
        return await repository.get_component(component_id)
    except Exception as e:
        logger.error(f"Errore durante la creazione del componente: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante la creazione del componente: {str(e)}")


@router.get("/{component_id}", response_model=GeneticComponentResponse)
async def get_component(
    component_id: str = Path(..., description="ID del componente genetico"),
    repository: ComponentRepository = Depends(lambda: ComponentRepository())
):
    """
    Ottiene un componente genetico per ID.
    """
    component = await repository.get_component(component_id)
    if not component:
        raise HTTPException(status_code=404, detail=f"Componente con ID {component_id} non trovato")
    
    return component


@router.get("/", response_model=List[GeneticComponentResponse])
async def get_components(
    component_type: Optional[ComponentType] = Query(None, description="Filtra per tipo di componente"),
    skip: int = Query(0, ge=0, description="Numero di componenti da saltare"),
    limit: int = Query(50, ge=1, le=100, description="Numero massimo di componenti da restituire"),
    repository: ComponentRepository = Depends(lambda: ComponentRepository())
):
    """
    Ottiene componenti genetici con opzioni di filtro.
    """
    try:
        if component_type:
            return await repository.get_components_by_type(component_type, skip, limit)
        else:
            # Temporaneamente useremo un user_id di test
            user_id = "test_user"
            return await repository.get_user_components(user_id, skip, limit)
    except Exception as e:
        logger.error(f"Errore durante il recupero dei componenti: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero dei componenti: {str(e)}")


@router.put("/{component_id}", response_model=GeneticComponentResponse)
async def update_component(
    component_id: str = Path(..., description="ID del componente genetico"),
    component: GeneticComponentUpdate = Body(...),
    repository: ComponentRepository = Depends(lambda: ComponentRepository())
):
    """
    Aggiorna un componente genetico esistente.
    """
    # Verifica che il componente esista
    existing = await repository.get_component(component_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Componente con ID {component_id} non trovato")
    
    try:
        # Converti l'oggetto di aggiornamento in un dizionario e rimuovi i campi None
        update_data = component.dict(exclude_unset=True)
        
        # Aggiorna il componente
        update_success = await repository.update(component_id, update_data)
        
        if not update_success:
            raise HTTPException(status_code=500, detail="Impossibile aggiornare il componente")
        
        # Restituisci il componente aggiornato
        return await repository.get_component(component_id)
    except Exception as e:
        logger.error(f"Errore durante l'aggiornamento del componente: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'aggiornamento del componente: {str(e)}")


@router.delete("/{component_id}")
async def delete_component(
    component_id: str = Path(..., description="ID del componente genetico"),
    repository: ComponentRepository = Depends(lambda: ComponentRepository())
):
    """
    Elimina un componente genetico.
    """
    # Verifica che il componente esista
    existing = await repository.get_component(component_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Componente con ID {component_id} non trovato")
    
    try:
        delete_success = await repository.delete(component_id)
        
        if not delete_success:
            raise HTTPException(status_code=500, detail="Impossibile eliminare il componente")
        
        return JSONResponse(content={"message": f"Componente con ID {component_id} eliminato con successo"})
    except Exception as e:
        logger.error(f"Errore durante l'eliminazione del componente: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'eliminazione del componente: {str(e)}")


@router.get("/search/{query}", response_model=List[GeneticComponentResponse])
async def search_components(
    query: str = Path(..., description="Testo da cercare"),
    component_type: Optional[ComponentType] = Query(None, description="Filtra per tipo di componente"),
    skip: int = Query(0, ge=0, description="Numero di componenti da saltare"),
    limit: int = Query(50, ge=1, le=100, description="Numero massimo di componenti da restituire"),
    repository: ComponentRepository = Depends(lambda: ComponentRepository())
):
    """
    Cerca componenti genetici per testo.
    """
    try:
        return await repository.search_components(query, component_type, skip, limit)
    except Exception as e:
        logger.error(f"Errore durante la ricerca dei componenti: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante la ricerca dei componenti: {str(e)}") 