from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId

from server.config.database import MongoRepository
from server.models.simulation import (
    SimulationDB,
    SimulationCreate,
    SimulationResponse,
    SimulationSummary,
    SimulationStatus,
    SimulationResults
)


class SimulationRepository(MongoRepository):
    """
    Repository per l'accesso alle simulazioni in MongoDB.
    """
    collection_name = "simulations"

    async def create_simulation(self, user_id: str, simulation: SimulationCreate) -> str:
        """
        Crea una nuova simulazione.
        """
        simulation_data = {
            "design_id": simulation.design_id,
            "user_id": user_id,
            "status": SimulationStatus.PENDING,
            "method": simulation.method,
            "parameters": [param.dict() for param in simulation.parameters],
            "description": simulation.description
        }
        
        return await self.create(simulation_data)

    async def get_simulation(self, simulation_id: str) -> Optional[SimulationResponse]:
        """
        Ottiene una simulazione per ID.
        """
        result = await self.get_by_id(simulation_id)
        if not result:
            return None
        
        return SimulationResponse(
            id=result["_id"],
            design_id=result["design_id"],
            status=result["status"],
            method=result["method"],
            parameters=result["parameters"],
            results=result.get("results"),
            start_time=result.get("start_time"),
            end_time=result.get("end_time"),
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            error_message=result.get("error_message")
        )

    async def get_design_simulations(
        self, design_id: str, skip: int = 0, limit: int = 20
    ) -> List[SimulationSummary]:
        """
        Ottiene le simulazioni per un design specifico.
        """
        filter_dict = {"design_id": design_id}
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            SimulationSummary(
                id=item["_id"],
                design_id=item["design_id"],
                status=item["status"],
                method=item["method"],
                created_at=item["created_at"],
                description=item.get("description")
            )
            for item in results
        ]

    async def update_simulation_status(
        self, simulation_id: str, status: SimulationStatus, error_message: Optional[str] = None
    ) -> bool:
        """
        Aggiorna lo stato di una simulazione.
        """
        update_data = {"status": status}
        
        if status == SimulationStatus.RUNNING:
            update_data["start_time"] = datetime.utcnow()
        
        if status in [SimulationStatus.COMPLETED, SimulationStatus.FAILED, SimulationStatus.CANCELED]:
            update_data["end_time"] = datetime.utcnow()
        
        if error_message and status == SimulationStatus.FAILED:
            update_data["error_message"] = error_message
        
        return await self.update(simulation_id, update_data)

    async def update_simulation_results(
        self, simulation_id: str, results: SimulationResults
    ) -> bool:
        """
        Aggiorna i risultati di una simulazione.
        """
        update_data = {
            "results": results.dict(),
            "status": SimulationStatus.COMPLETED,
            "end_time": datetime.utcnow()
        }
        
        return await self.update(simulation_id, update_data)

    async def get_pending_simulations(self, limit: int = 10) -> List[SimulationResponse]:
        """
        Ottiene le simulazioni in attesa di elaborazione.
        """
        filter_dict = {"status": SimulationStatus.PENDING}
        results = await self.get_many(filter_dict, 0, limit, sort_field="created_at", sort_order=1)
        
        return [
            SimulationResponse(
                id=item["_id"],
                design_id=item["design_id"],
                status=item["status"],
                method=item["method"],
                parameters=item["parameters"],
                results=item.get("results"),
                start_time=item.get("start_time"),
                end_time=item.get("end_time"),
                created_at=item["created_at"],
                updated_at=item["updated_at"],
                error_message=item.get("error_message")
            )
            for item in results
        ] 