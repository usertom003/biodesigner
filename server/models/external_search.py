from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class ExternalDatabase(BaseModel):
    id: str
    name: str

class ExternalComponentProperty(BaseModel):
    key: str
    value: Any

class ExternalComponentSearchResult(BaseModel):
    id: str
    name: str
    type: str  # e.g., promoter, gene, terminator
    database: str # e.g., IGEM, ADDGENE
    description: Optional[str] = None
    preview: Optional[str] = None # Short sequence preview or identifier
    properties: Optional[Dict[str, Any]] = None # e.g. strength, inducible

class ExternalComponentDetail(ExternalComponentSearchResult):
    sequence: Optional[str] = None
    # Add any other detailed fields that might be fetched

class ExternalComponentImportRequest(BaseModel):
    external_id: str
    database: str
    type: str # Component type 