from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]


class Edge(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = "default"


class DesignProperties(BaseModel):
    name: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    organism: Optional[str] = None
    is_public: bool = False
    version: str = "1.0.0"
    status: str = "draft"  # draft, in_progress, completed, verified


class GeneticDesignDB(BaseModel):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    user_id: str
    nodes: List[Node]
    edges: List[Edge]
    properties: DesignProperties
    
    class Config:
        populate_by_name = True


class GeneticDesignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[Node]
    edges: List[Edge]
    organism: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: bool = False


class GeneticDesignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None
    properties: Optional[Dict[str, Any]] = None


class GeneticDesignResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[Node]
    edges: List[Edge]
    properties: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    user_id: str


class GeneticDesignSummary(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    organism: Optional[str] = None
    component_count: int
    status: str
    created_at: datetime
    updated_at: datetime 