from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class SequenceType(str, Enum):
    DNA = "dna"
    RNA = "rna"
    PROTEIN = "protein"


class SequenceValidationIssue(BaseModel):
    type: str
    message: str
    position: Optional[List[int]] = None
    details: Optional[Dict[str, Any]] = None


class ORF(BaseModel):
    start: int
    end: int
    frame: int
    length: int
    sequence: str


class RepeatSequence(BaseModel):
    sequence: str
    positions: List[int]
    length: int
    count: int


class PalindromicSequence(BaseModel):
    sequence: str
    position: int
    length: int


class SequenceStatistics(BaseModel):
    length: int
    gc_content: float
    invalid_bases: int
    start_codon: bool
    stop_codon: bool
    open_reading_frames: Optional[List[ORF]] = None
    repeats: Optional[List[RepeatSequence]] = None
    palindromes: Optional[List[PalindromicSequence]] = None


class CodonChangeDetail(BaseModel):
    position: int
    aa: str
    original: str
    optimized: str


class SequenceValidationResult(BaseModel):
    is_valid: bool
    errors: List[SequenceValidationIssue]
    warnings: List[SequenceValidationIssue]
    info: List[SequenceValidationIssue]
    stats: SequenceStatistics


class CodonOptimizationResult(BaseModel):
    original_sequence: str
    optimized_sequence: str
    cai_before: float
    cai_after: float
    gc_content_before: float
    gc_content_after: float
    changes_made: int
    organism: str
    codon_change_details: List[CodonChangeDetail] = Field(default_factory=list)


class PrimerDesignRequest(BaseModel):
    sequence: str
    region_start: Optional[int] = None
    region_end: Optional[int] = None
    min_tm: float = 55.0
    max_tm: float = 65.0
    optimal_length: int = 20


class Primer(BaseModel):
    sequence: str
    position: int
    tm: float
    gc_content: float
    length: int
    direction: str  # "forward" or "reverse"
    issues: Optional[List[str]] = None


class PrimerDesignResult(BaseModel):
    forward_primers: List[Primer]
    reverse_primers: List[Primer]
    target_sequence: str
    amplicon_length: int


class SequenceAnalysisDB(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: Optional[str] = None
    sequence: str
    sequence_type: SequenceType
    sequence_name: Optional[str] = None
    validation_result: Optional[SequenceValidationResult] = None
    optimization_result: Optional[CodonOptimizationResult] = None
    primer_design_result: Optional[PrimerDesignResult] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class SequenceValidationRequest(BaseModel):
    sequence: str
    sequence_type: SequenceType = SequenceType.DNA
    component_type: Optional[str] = None
    sequence_name: Optional[str] = None


class CodonOptimizationRequest(BaseModel):
    sequence: str
    target_organism: str
    restriction_sites_to_avoid: Optional[List[str]] = Field(default_factory=list, description="Lista di sequenze di siti di restrizione da evitare (es. GAATTC)")
    optimization_strength: float = Field(default=0.8, ge=0, le=1, description="Livello di aggressività dell'ottimizzazione (0: minima, 1: massima preferenza per codoni ottimali)")
    avoid_rna_secondary_structures: bool = Field(default=True, description="Tenta di minimizzare strutture secondarie dell'RNA")


class SequenceAnalysisResponse(BaseModel):
    id: str
    sequence_name: Optional[str] = None
    sequence_type: SequenceType
    created_at: datetime
    validation_result: Optional[SequenceValidationResult] = None
    optimization_result: Optional[CodonOptimizationResult] = None
    primer_design_result: Optional[PrimerDesignResult] = None 