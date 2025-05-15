from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId

from server.config.database import MongoRepository
from server.models.genetic_design import (
    GeneticDesignDB,
    GeneticDesignCreate,
    GeneticDesignResponse,
    GeneticDesignSummary,
    Node,
    Edge,
    DesignProperties
)


class DesignRepository(MongoRepository):
    """
    Repository per l'accesso ai design genetici in MongoDB.
    """
    collection_name = "genetic_designs"

    async def create_design(self, user_id: str, design: GeneticDesignCreate) -> str:
        """
        Crea un nuovo design genetico.
        """
        properties = DesignProperties(
            name=design.name,
            description=design.description,
            tags=design.tags,
            organism=design.organism,
            is_public=design.is_public
        )
        
        design_data = {
            "user_id": user_id,
            "nodes": [node.dict() for node in design.nodes],
            "edges": [edge.dict() for edge in design.edges],
            "properties": properties.dict()
        }
        
        return await self.create(design_data)

    async def get_design(self, design_id: str) -> Optional[GeneticDesignResponse]:
        """
        Ottiene un design genetico per ID.
        """
        result = await self.get_by_id(design_id)
        if not result:
            return None
        
        # Converti le liste di nodi ed archi dai dizionari
        nodes = [Node(**node) for node in result.get("nodes", [])]
        edges = [Edge(**edge) for edge in result.get("edges", [])]
        
        return GeneticDesignResponse(
            id=result["_id"],
            name=result["properties"]["name"],
            description=result["properties"].get("description"),
            nodes=nodes,
            edges=edges,
            properties=result["properties"],
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            user_id=result["user_id"]
        )

    async def get_user_designs(
        self, user_id: str, skip: int = 0, limit: int = 20
    ) -> List[GeneticDesignSummary]:
        """
        Ottiene i design genetici creati dall'utente.
        """
        filter_dict = {"user_id": user_id}
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            GeneticDesignSummary(
                id=item["_id"],
                name=item["properties"]["name"],
                description=item["properties"].get("description"),
                organism=item["properties"].get("organism"),
                component_count=len(item.get("nodes", [])),
                status=item["properties"].get("status", "draft"),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            )
            for item in results
        ]

    async def get_public_designs(
        self, skip: int = 0, limit: int = 20
    ) -> List[GeneticDesignSummary]:
        """
        Ottiene i design genetici pubblici.
        """
        filter_dict = {"properties.is_public": True}
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            GeneticDesignSummary(
                id=item["_id"],
                name=item["properties"]["name"],
                description=item["properties"].get("description"),
                organism=item["properties"].get("organism"),
                component_count=len(item.get("nodes", [])),
                status=item["properties"].get("status", "draft"),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            )
            for item in results
        ]

    async def update_design(self, design_id: str, data: Dict[str, Any]) -> bool:
        """
        Aggiorna un design genetico.
        """
        update_data = {}
        
        if "name" in data:
            update_data["properties.name"] = data["name"]
        
        if "description" in data:
            update_data["properties.description"] = data["description"]
        
        if "nodes" in data:
            update_data["nodes"] = [node.dict() for node in data["nodes"]]
        
        if "edges" in data:
            update_data["edges"] = [edge.dict() for edge in data["edges"]]
        
        if "properties" in data:
            for key, value in data["properties"].items():
                update_data[f"properties.{key}"] = value
        
        if not update_data:
            return False
        
        # Usa update per aggiornare solo i campi specificati
        return await self.update(design_id, update_data)

    async def search_designs(
        self, query: str, skip: int = 0, limit: int = 20, user_id: Optional[str] = None
    ) -> List[GeneticDesignSummary]:
        """
        Cerca design genetici per testo.
        """
        filter_dict = {
            "$or": [
                {"properties.name": {"$regex": query, "$options": "i"}},
                {"properties.description": {"$regex": query, "$options": "i"}},
                {"properties.tags": {"$regex": query, "$options": "i"}},
                {"properties.organism": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if user_id:
            filter_dict["$and"] = [
                {"$or": [
                    {"user_id": user_id},
                    {"properties.is_public": True}
                ]}
            ]
        else:
            filter_dict["properties.is_public"] = True
        
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            GeneticDesignSummary(
                id=item["_id"],
                name=item["properties"]["name"],
                description=item["properties"].get("description"),
                organism=item["properties"].get("organism"),
                component_count=len(item.get("nodes", [])),
                status=item["properties"].get("status", "draft"),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            )
            for item in results
        ] 