from fastapi import APIRouter, Depends, HTTPException, status
from server.models.protein_expression import ProteinExpressionRequest, ProteinExpressionResult
from server.services.protein_expression_service import protein_expression_service, ProteinExpressionService

router = APIRouter(
    prefix="/api/expression",
    tags=["Protein Expression"],
)

@router.post("/workflow", response_model=ProteinExpressionResult)
async def generate_protein_expression_workflow(
    request: ProteinExpressionRequest,
    service: ProteinExpressionService = Depends(lambda: protein_expression_service),
):
    """
    Endpoint to generate a protein expression workflow based on gene sequence and host.
    """
    try:
        result = await service.generate_expression_workflow(request)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Replace with proper logging
        print(f"Unhandled exception in protein expression workflow generation: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during workflow generation."
        ) 