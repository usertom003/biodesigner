from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path, BackgroundTasks
from fastapi.responses import JSONResponse
import logging
# import re # Non più necessario qui se tutta la validazione è nel servizio

from server.models.sequence_analysis import (
    SequenceValidationRequest,
    SequenceAnalysisResponse,
    SequenceType, # Importato per essere usato dal servizio, ma non direttamente qui
    SequenceValidationResult,
    SequenceValidationIssue, # Importato per il caso di sequenza vuota
    SequenceStatistics,    # Importato per il caso di sequenza vuota
    CodonOptimizationRequest,
    CodonOptimizationResult,
    SequenceAnalysisDB
)
from server.repositories.sequence_repository import SequenceRepository
from server.services.sequence_validator import SequenceValidator # Importa il servizio di validazione
from server.services.codon_optimizer import CodonOptimizer # Importa il servizio

router = APIRouter(prefix="/api/sequences", tags=["sequences"])
logger = logging.getLogger(__name__)

# --- Logica di Ottimizzazione Codoni RIMOSSA da qui ---
# CODON_TABLES, GENETIC_CODE, AMINO_ACID_TO_CODONS, e le funzioni helper
# _calculate_gc_content, _translate_sequence, _calculate_cai, _does_sequence_contain_site
# sono state spostate in server.services.codon_optimizer.py

# La funzione _calculate_gc_content è stata rimossa poiché gestita da SequenceValidator.

@router.post("/validate", response_model=SequenceValidationResult)
async def validate_sequence_route(
    request: SequenceValidationRequest,
    # repository: SequenceRepository = Depends(lambda: SequenceRepository()), # Opzionale
    # save_result: bool = Query(True, description="Salva il risultato della validazione nel database")
):
    logger.info(f"Richiesta di validazione per sequenza: {request.sequence[:30] if request.sequence else 'EMPTY'}, tipo: {request.sequence_type}, componente: {request.component_type}")
    
    if not request.sequence:
        error = SequenceValidationIssue(type="empty_sequence", message="La sequenza fornita è vuota.")
        empty_stats = SequenceStatistics(length=0, gc_content=0.0, invalid_bases=0, start_codon=False, stop_codon=False, open_reading_frames=None, repeats=None, palindromes=None)
        return SequenceValidationResult(is_valid=False, errors=[error], warnings=[], info=[], stats=empty_stats)

    try:
        validation_result = SequenceValidator.validate_sequence(
            sequence=request.sequence, 
            sequence_type=request.sequence_type, 
            component_type=request.component_type
        )
        logger.info(f"Risultato validazione da SequenceValidator: isValid={validation_result.is_valid}, Errors: {len(validation_result.errors)}, Warnings: {len(validation_result.warnings)}")
        
        # TODO: Gestire opzionalmente il salvataggio del risultato se `save_result` è True e `repository` è fornito.
        # if save_result and repository:
        #     try:
        #         user_id_placeholder = "guest_user" # Sostituire con auth
        #         # Si potrebbe creare un nuovo record o aggiornarne uno esistente.
        #         # await repository.save_validation_result(user_id_placeholder, request, validation_result)
        #         logger.info(f"Risultato validazione salvato per {user_id_placeholder}")
        #     except Exception as e_save:
        #         logger.error(f"Errore nel salvare il risultato della validazione: {str(e_save)}", exc_info=True)

        return validation_result
    except ValueError as ve: # Errori specifici di validazione o logica dal servizio
        logger.warning(f"Errore di validazione in validate_sequence_route: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Errore imprevisto durante la validazione della sequenza: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Errore interno del server durante la validazione: {str(e)}")

@router.post("/optimize-codons", response_model=CodonOptimizationResult)
async def optimize_codons_route(
    request: CodonOptimizationRequest,
    repository: SequenceRepository = Depends(lambda: SequenceRepository()),
    save_result: bool = Query(True, description="Salva il risultato dell'ottimizzazione nel database")
):
    logger.info(f"Richiesta ottimizzazione codoni per: {request.target_organism}, seq: {request.sequence[:30] if request.sequence else 'EMPTY'}...")
    if not request.sequence:
        raise HTTPException(status_code=400, detail="La sequenza per l'ottimizzazione non può essere vuota.")

    try:
        optimization_result = CodonOptimizer.optimize_sequence(request)

        if save_result and repository:
            try:
                user_id_placeholder = "guest_user" 
                await repository.save_codon_optimization(user_id_placeholder, request, optimization_result)
                logger.info(f"Risultato ottimizzazione salvato per {user_id_placeholder} e sequenza originale.")
            except Exception as e_save:
                logger.error(f"Errore nel salvare il risultato dell'ottimizzazione: {str(e_save)}", exc_info=True)

        return optimization_result

    except ValueError as ve: 
        logger.warning(f"Errore durante l'ottimizzazione dei codoni: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Errore imprevisto durante l'ottimizzazione dei codoni: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Errore interno del server durante l'ottimizzazione dei codoni.")


@router.get("/analyses", response_model=List[SequenceAnalysisResponse])
async def get_user_analyses_route(
    skip: int = Query(0, ge=0, description="Numero di analisi da saltare"),
    limit: int = Query(20, ge=1, le=100, description="Numero massimo di analisi da restituire"),
    repository: SequenceRepository = Depends(lambda: SequenceRepository())
):
    logger.warning("get_user_analyses_route chiamato senza un user_id reale. Richiede integrazione con autenticazione.")
    raise HTTPException(status_code=501, detail="Funzionalità non implementata: richiede autenticazione utente.")

@router.get("/analyses/{analysis_id}", response_model=SequenceAnalysisResponse)
async def get_sequence_analysis_route(
    analysis_id: str = Path(..., description="ID dell'analisi"),
    repository: SequenceRepository = Depends(lambda: SequenceRepository())
):
    analysis = await repository.get_sequence_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analisi non trovata.")
    return analysis

# TODO: Considerare altre route come la ricerca di analisi o l'eliminazione, se necessarie.

# ... (altre route come search e delete verranno riviste/implementate successivamente) ... 