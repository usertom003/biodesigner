from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class ComponentType(str, Enum):
    PROMOTER = "promoter"
    GENE = "gene"
    TERMINATOR = "terminator"
    REGULATORY = "regulatory"


class PromoterStrength(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very high"


class GeneFunction(str, Enum):
    REPORTER = "reporter"
    REPRESSOR = "repressor"
    ACTIVATOR = "activator"
    ENZYME = "enzyme"
    OTHER = "other"


class RegulatoryFunction(str, Enum):
    BINDING = "binding"
    TRANSLATION = "translation"
    ACTIVATION = "activation"
    REPRESSION = "repression"


class TerminatorEfficiency(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very high"


class Position(BaseModel):
    x: float
    y: float


class GeneticComponentBase(BaseModel):
    name: str
    component_type: ComponentType
    sequence: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    reference: Optional[str] = None
    experimental: bool = False
    metadata: Optional[Dict[str, Any]] = None


class PromoterData(GeneticComponentBase):
    strength: Optional[PromoterStrength] = PromoterStrength.MEDIUM
    inducible: bool = False
    inducer: Optional[str] = None


class GeneData(GeneticComponentBase):
    function: Optional[GeneFunction] = GeneFunction.OTHER
    color: Optional[str] = None
    protein_id: Optional[str] = None
    expression_level: Optional[float] = None
    molecular_weight: Optional[float] = None


class TerminatorData(GeneticComponentBase):
    efficiency: Optional[TerminatorEfficiency] = TerminatorEfficiency.MEDIUM


class RegulatoryData(GeneticComponentBase):
    function: Optional[RegulatoryFunction] = None
    strength_value: Optional[float] = None
    binding_targets: Optional[List[str]] = None


class GeneticComponentDB(BaseModel):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    user_id: Optional[str] = None
    component_data: Dict[str, Any]
    
    class Config:
        populate_by_name = True


class GeneticComponentCreate(BaseModel):
    component_type: ComponentType
    name: str
    sequence: Optional[str] = None
    description: Optional[str] = None
    properties: Dict[str, Any]


class GeneticComponentResponse(BaseModel):
    id: str
    name: str
    component_type: ComponentType
    sequence: Optional[str] = None
    description: Optional[str] = None
    properties: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class GeneticComponentUpdate(BaseModel):
    name: Optional[str] = None
    sequence: Optional[str] = None
    description: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None 