from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ProteinExpressionHost(BaseModel):
    name: str = Field(..., description="Name of the expression host, e.g., E. coli BL21(DE3), S. cerevisiae")
    type: str = Field(..., description="Type of host, e.g., bacteria, yeast, mammalian")

class ProteinExpressionPlasmid(BaseModel):
    name: str = Field(..., description="Name or ID of the plasmid construct.")
    promoter: str = Field(..., description="Promoter used for expression.")
    resistance_marker: Optional[str] = Field(None, description="Antibiotic resistance marker.")

class ProteinExpressionRequest(BaseModel):
    gene_sequence: str = Field(..., description="DNA sequence of the gene to be expressed.")
    target_protein_name: str = Field(..., description="Name of the target protein.")
    host_system: ProteinExpressionHost = Field(..., description="Selected host system for expression.")
    plasmid_construct: ProteinExpressionPlasmid = Field(..., description="Plasmid construct details.")
    expression_parameters: Optional[Dict[str, any]] = Field(None, description="Parameters like temperature, induction conditions, etc.")
    desired_yield_mg_l: Optional[float] = Field(None, description="Desired protein yield in mg/L.")

    model_config = {
        "arbitrary_types_allowed": True
    }

class ProteinExpressionStep(BaseModel):
    step_number: int
    name: str
    description: str
    duration_hours: Optional[float] = None
    status: str = "Pending"
    notes: Optional[str] = None

class ProteinExpressionResult(BaseModel):
    workflow_id: str = Field(..., description="Unique ID for the expression workflow.")
    request_details: ProteinExpressionRequest
    predicted_success_rate: Optional[float] = Field(None, description="Predicted probability of successful expression.")
    estimated_yield_mg_l: Optional[float] = Field(None, description="Estimated protein yield.")
    workflow_steps: List[ProteinExpressionStep] = Field(..., description="Detailed steps of the expression workflow.")
    warnings: Optional[List[str]] = Field(None, description="Potential issues or warnings.")
    next_steps_recommendations: Optional[List[str]] = Field(None, description="Recommendations for proceeding.") 