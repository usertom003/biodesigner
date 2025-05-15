from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path
from fastapi.responses import JSONResponse
import logging

from server.models.genetic_design import (
    GeneticDesignCreate,
    GeneticDesignResponse,
    GeneticDesignUpdate,
    GeneticDesignSummary
)
from server.repositories.design_repository import DesignRepository

router = APIRouter(prefix="/api/designs", tags=["designs"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=GeneticDesignResponse)
async def create_design(
    design: GeneticDesignCreate,
    repository: DesignRepository = Depends(lambda: DesignRepository())
):
    """
    Crea un nuovo design genetico.
    """
    try:
        # Temporaneamente useremo un user_id di test
        user_id = "test_user"
        design_id = await repository.create_design(user_id, design)
        
        return await repository.get_design(design_id)
    except Exception as e:
        logger.error(f"Errore durante la creazione del design: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante la creazione del design: {str(e)}")


@router.get("/{design_id}", response_model=GeneticDesignResponse)
async def get_design(
    design_id: str = Path(..., description="ID del design genetico"),
    repository: DesignRepository = Depends(lambda: DesignRepository())
):
    """
    Ottiene un design genetico per ID.
    """
    design = await repository.get_design(design_id)
    if not design:
        raise HTTPException(status_code=404, detail=f"Design con ID {design_id} non trovato")
    
    return design


@router.get("/", response_model=List[GeneticDesignSummary])
async def get_designs(
    skip: int = Query(0, ge=0, description="Numero di design da saltare"),
    limit: int = Query(20, ge=1, le=100, description="Numero massimo di design da restituire"),
    repository: DesignRepository = Depends(lambda: DesignRepository()),
    public_only: bool = Query(False, description="Restituisce solo i design pubblici")
):
    """
    Ottiene una lista di design genetici.
    """
    try:
        if public_only:
            return await repository.get_public_designs(skip, limit)
        else:
            # Temporaneamente useremo un user_id di test
            user_id = "test_user"
            return await repository.get_user_designs(user_id, skip, limit)
    except Exception as e:
        logger.error(f"Errore durante il recupero dei design: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero dei design: {str(e)}")


@router.put("/{design_id}", response_model=GeneticDesignResponse)
async def update_design(
    design_id: str = Path(..., description="ID del design genetico"),
    design: GeneticDesignUpdate = Body(...),
    repository: DesignRepository = Depends(lambda: DesignRepository())
):
    """
    Aggiorna un design genetico esistente.
    """
    # Verifica che il design esista
    existing = await repository.get_design(design_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Design con ID {design_id} non trovato")
    
    try:
        # Converti l'oggetto di aggiornamento in un dizionario e rimuovi i campi None
        update_data = design.dict(exclude_unset=True)
        
        # Aggiorna il design
        update_success = await repository.update_design(design_id, update_data)
        
        if not update_success:
            raise HTTPException(status_code=500, detail="Impossibile aggiornare il design")
        
        # Restituisci il design aggiornato
        return await repository.get_design(design_id)
    except Exception as e:
        logger.error(f"Errore durante l'aggiornamento del design: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'aggiornamento del design: {str(e)}")


@router.delete("/{design_id}")
async def delete_design(
    design_id: str = Path(..., description="ID del design genetico"),
    repository: DesignRepository = Depends(lambda: DesignRepository())
):
    """
    Elimina un design genetico.
    """
    # Verifica che il design esista
    existing = await repository.get_design(design_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Design con ID {design_id} non trovato")
    
    try:
        delete_success = await repository.delete(design_id)
        
        if not delete_success:
            raise HTTPException(status_code=500, detail="Impossibile eliminare il design")
        
        return JSONResponse(content={"message": f"Design con ID {design_id} eliminato con successo"})
    except Exception as e:
        logger.error(f"Errore durante l'eliminazione del design: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'eliminazione del design: {str(e)}")


@router.get("/search/{query}", response_model=List[GeneticDesignSummary])
async def search_designs(
    query: str = Path(..., description="Testo da cercare"),
    skip: int = Query(0, ge=0, description="Numero di design da saltare"),
    limit: int = Query(20, ge=1, le=100, description="Numero massimo di design da restituire"),
    repository: DesignRepository = Depends(lambda: DesignRepository())
):
    """
    Cerca design genetici per testo.
    """
    try:
        # Temporaneamente useremo un user_id di test
        user_id = "test_user"
        return await repository.search_designs(query, skip, limit, user_id)
    except Exception as e:
        logger.error(f"Errore durante la ricerca dei design: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante la ricerca dei design: {str(e)}") 