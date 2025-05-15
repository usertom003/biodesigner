from pydantic import BaseModel, Field
from typing import List, Optional

class AntibodyDesignRequest(BaseModel):
    target_antigen_sequence: str = Field(..., description="Sequence of the target antigen.")
    design_parameters: Optional[dict] = Field(None, description="Optional parameters for the antibody design process.")
    # Add other relevant fields, e.g., desired affinity, species, etc.

class DesignedAntibodyCandidate(BaseModel):
    vh_sequence: str = Field(..., description="Sequence of the Variable Heavy chain (VH).")
    vl_sequence: str = Field(..., description="Sequence of the Variable Light chain (VL).")
    predicted_affinity: Optional[float] = Field(None, description="Predicted affinity to the target antigen.")
    score: Optional[float] = Field(None, description="A score representing the quality of the design.")
    # Add other relevant details, e.g., CDR sequences, stability predictions

class AntibodyDesignResult(BaseModel):
    request_id: str = Field(..., description="Identifier for the design request.")
    candidates: List[DesignedAntibodyCandidate] = Field(..., description="List of designed antibody candidates.")
    warnings: Optional[List[str]] = Field(None, description="Any warnings generated during the design process.") 