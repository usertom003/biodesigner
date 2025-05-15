from fastapi import APIRouter, Depends, HTTPException, status
from server.models.antibody_design import AntibodyDesignRequest, AntibodyDesignResult
from server.services.antibody_designer_service import antibody_designer_service, AntibodyDesignerService
# Potrebbe essere necessario importare modelli di autenticazione/utente se l'endpoint è protetto
# from server.models.user import User
# from server.core.auth import get_current_active_user

router = APIRouter(
    prefix="/api/antibodies",
    tags=["Antibody Design"],
)

@router.post("/design", response_model=AntibodyDesignResult)
async def design_new_antibody(
    request: AntibodyDesignRequest,
    service: AntibodyDesignerService = Depends(lambda: antibody_designer_service),
    # current_user: User = Depends(get_current_active_user) # Uncomment if auth is needed
):
    """
    Endpoint to design novel antibody candidates based on a target antigen.
    """
    try:
        result = await service.design_antibody(request)
        if not result.candidates:
            # Potremmo voler restituire 200 OK con una lista vuota e warnings,
            # oppure un 404 se nessun candidato è considerato un fallimento.
            # Per ora, consideriamo una lista vuota come un risultato valido con possibili warning.
            pass # O solleva HTTPException se appropriato
        return result
    except ValueError as ve:
        # Specific errors from the service layer
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Log l'eccezione e
        print(f"Unhandled exception in antibody design: {e}") # Sostituire con un logger appropriato
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during antibody design."
        ) 