from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path, BackgroundTasks
from fastapi.responses import JSONResponse
import logging
from datetime import datetime

from server.models.simulation import (
    SimulationCreate,
    SimulationResponse,
    SimulationSummary,
    SimulationStatus,
    SimulationResults,
    SimulationParameter,
    SimulationMethod
)
from server.repositories.simulation_repository import SimulationRepository
from server.repositories.design_repository import DesignRepository
from server.services.simulation_engine import SimulationEngine

router = APIRouter(prefix="/api/simulations", tags=["simulations"])
logger = logging.getLogger(__name__)


class SimulationManager:
    """
    Gestore per le simulazioni genetiche.
    """
    
    @staticmethod
    async def run_simulation(
        simulation_id: str,
        nodes: List[Dict],
        edges: List[Dict],
        method: SimulationMethod,
        parameters: List[SimulationParameter],
        repository: SimulationRepository
    ):
        """
        Esegue una simulazione di un circuito genetico.
        """
        logger.info(f"Avvio simulazione {simulation_id} con metodo {method}")
        
        try:
            # Aggiorna lo stato a "in esecuzione"
            await repository.update_simulation_status(simulation_id, SimulationStatus.RUNNING)
            
            # Esegui la simulazione
            results = SimulationEngine.simulate_circuit(nodes, edges, method, parameters)
            
            # Aggiorna i risultati della simulazione
            await repository.update_simulation_results(simulation_id, results)
            
            logger.info(f"Simulazione {simulation_id} completata con successo")
        except Exception as e:
            logger.error(f"Errore durante l'esecuzione della simulazione {simulation_id}: {str(e)}")
            await repository.update_simulation_status(simulation_id, SimulationStatus.FAILED, str(e))


# Inizializza il gestore delle simulazioni
simulation_manager = SimulationManager()


@router.post("/", response_model=SimulationResponse)
async def create_simulation(
    simulation: SimulationCreate,
    background_tasks: BackgroundTasks,
    simulation_repository: SimulationRepository = Depends(lambda: SimulationRepository()),
    design_repository: DesignRepository = Depends(lambda: DesignRepository())
):
    """
    Crea una nuova simulazione per un design genetico.
    """
    # Verifica che il design esista
    design = await design_repository.get_design(simulation.design_id)
    if not design:
        raise HTTPException(status_code=404, detail=f"Design con ID {simulation.design_id} non trovato")
    
    try:
        # Temporaneamente useremo un user_id di test
        user_id = "test_user"
        simulation_id = await simulation_repository.create_simulation(user_id, simulation)
        
        # Avvia la simulazione in background
        background_tasks.add_task(
            simulation_manager.run_simulation,
            simulation_id,
            design.nodes,
            design.edges,
            simulation.method,
            simulation.parameters,
            simulation_repository
        )
        
        return await simulation_repository.get_simulation(simulation_id)
    except Exception as e:
        logger.error(f"Errore durante la creazione della simulazione: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante la creazione della simulazione: {str(e)}")


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: str = Path(..., description="ID della simulazione"),
    repository: SimulationRepository = Depends(lambda: SimulationRepository())
):
    """
    Ottiene una simulazione per ID.
    """
    simulation = await repository.get_simulation(simulation_id)
    if not simulation:
        raise HTTPException(status_code=404, detail=f"Simulazione con ID {simulation_id} non trovata")
    
    return simulation


@router.get("/design/{design_id}", response_model=List[SimulationSummary])
async def get_design_simulations(
    design_id: str = Path(..., description="ID del design genetico"),
    skip: int = Query(0, ge=0, description="Numero di simulazioni da saltare"),
    limit: int = Query(20, ge=1, le=100, description="Numero massimo di simulazioni da restituire"),
    repository: SimulationRepository = Depends(lambda: SimulationRepository())
):
    """
    Ottiene le simulazioni per un design specifico.
    """
    try:
        return await repository.get_design_simulations(design_id, skip, limit)
    except Exception as e:
        logger.error(f"Errore durante il recupero delle simulazioni: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero delle simulazioni: {str(e)}")


@router.delete("/{simulation_id}")
async def delete_simulation(
    simulation_id: str = Path(..., description="ID della simulazione"),
    repository: SimulationRepository = Depends(lambda: SimulationRepository())
):
    """
    Elimina una simulazione.
    """
    # Verifica che la simulazione esista
    simulation = await repository.get_simulation(simulation_id)
    if not simulation:
        raise HTTPException(status_code=404, detail=f"Simulazione con ID {simulation_id} non trovata")
    
    # Verifica che la simulazione non sia in esecuzione
    if simulation.status == SimulationStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Impossibile eliminare una simulazione in esecuzione")
    
    try:
        delete_success = await repository.delete(simulation_id)
        
        if not delete_success:
            raise HTTPException(status_code=500, detail="Impossibile eliminare la simulazione")
        
        return JSONResponse(content={"message": f"Simulazione con ID {simulation_id} eliminata con successo"})
    except Exception as e:
        logger.error(f"Errore durante l'eliminazione della simulazione: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'eliminazione della simulazione: {str(e)}")


@router.post("/{simulation_id}/cancel")
async def cancel_simulation(
    simulation_id: str = Path(..., description="ID della simulazione"),
    repository: SimulationRepository = Depends(lambda: SimulationRepository())
):
    """
    Annulla una simulazione in corso.
    """
    # Verifica che la simulazione esista
    simulation = await repository.get_simulation(simulation_id)
    if not simulation:
        raise HTTPException(status_code=404, detail=f"Simulazione con ID {simulation_id} non trovata")
    
    # Verifica che la simulazione sia in uno stato valido per l'annullamento
    if simulation.status not in [SimulationStatus.PENDING, SimulationStatus.RUNNING]:
        raise HTTPException(status_code=400, detail=f"Impossibile annullare una simulazione nello stato {simulation.status}")
    
    try:
        cancel_success = await repository.update_simulation_status(simulation_id, SimulationStatus.CANCELED)
        
        if not cancel_success:
            raise HTTPException(status_code=500, detail="Impossibile annullare la simulazione")
        
        return JSONResponse(content={"message": f"Simulazione con ID {simulation_id} annullata con successo"})
    except Exception as e:
        logger.error(f"Errore durante l'annullamento della simulazione: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'annullamento della simulazione: {str(e)}")


@router.post("/{simulation_id}/rerun", response_model=SimulationResponse)
async def rerun_simulation(
    background_tasks: BackgroundTasks,
    simulation_id: str = Path(..., description="ID della simulazione"),
    simulation_repository: SimulationRepository = Depends(lambda: SimulationRepository()),
    design_repository: DesignRepository = Depends(lambda: DesignRepository())
):
    """
    Esegue nuovamente una simulazione esistente.
    """
    # Verifica che la simulazione esista
    simulation = await simulation_repository.get_simulation(simulation_id)
    if not simulation:
        raise HTTPException(status_code=404, detail=f"Simulazione con ID {simulation_id} non trovata")
    
    # Verifica che la simulazione non sia in esecuzione
    if simulation.status == SimulationStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Impossibile riavviare una simulazione in esecuzione")
    
    # Verifica che il design esista ancora
    design = await design_repository.get_design(simulation.design_id)
    if not design:
        raise HTTPException(status_code=404, detail=f"Design con ID {simulation.design_id} non trovato")
    
    try:
        # Aggiorna lo stato della simulazione
        await simulation_repository.update_simulation_status(simulation_id, SimulationStatus.PENDING)
        
        # Avvia la simulazione in background
        background_tasks.add_task(
            simulation_manager.run_simulation,
            simulation_id,
            design.nodes,
            design.edges,
            simulation.method,
            simulation.parameters,
            simulation_repository
        )
        
        return await simulation_repository.get_simulation(simulation_id)
    except Exception as e:
        logger.error(f"Errore durante il riavvio della simulazione: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante il riavvio della simulazione: {str(e)}") 