from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class SimulationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"


class SimulationMethod(str, Enum):
    ODE = "ordinary_differential_equation"
    SSA = "stochastic_simulation_algorithm"
    HYBRID = "hybrid"
    FBA = "flux_balance_analysis"


class SimulationParameter(BaseModel):
    name: str
    value: float
    description: Optional[str] = None
    unit: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None


class TimeSeries(BaseModel):
    time: List[float]
    values: Dict[str, List[float]]  # Component/species name -> concentration values


class SimulationResults(BaseModel):
    time_series: TimeSeries
    steady_states: Optional[Dict[str, float]] = None
    metrics: Optional[Dict[str, Any]] = None


class SimulationDB(BaseModel):
    id: str = Field(..., alias="_id")
    design_id: str
    user_id: str
    status: SimulationStatus
    method: SimulationMethod
    parameters: List[SimulationParameter]
    results: Optional[SimulationResults] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None
    
    class Config:
        populate_by_name = True


class SimulationCreate(BaseModel):
    design_id: str
    method: SimulationMethod = SimulationMethod.ODE
    parameters: List[SimulationParameter]
    description: Optional[str] = None


class SimulationUpdate(BaseModel):
    status: Optional[SimulationStatus] = None
    results: Optional[SimulationResults] = None
    end_time: Optional[datetime] = None
    error_message: Optional[str] = None


class SimulationResponse(BaseModel):
    id: str
    design_id: str
    status: SimulationStatus
    method: SimulationMethod
    parameters: List[SimulationParameter]
    results: Optional[SimulationResults] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None


class SimulationSummary(BaseModel):
    id: str
    design_id: str
    status: SimulationStatus
    method: SimulationMethod
    created_at: datetime
    description: Optional[str] = None 