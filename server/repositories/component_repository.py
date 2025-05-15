from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId

from server.config.database import MongoRepository
from server.models.genetic_component import (
    GeneticComponentDB,
    GeneticComponentCreate,
    GeneticComponentResponse,
    ComponentType
)


class ComponentRepository(MongoRepository):
    """
    Repository per l'accesso ai componenti genetici in MongoDB.
    """
    collection_name = "genetic_components"

    async def create_component(self, user_id: str, component: GeneticComponentCreate) -> str:
        """
        Crea un nuovo componente genetico.
        """
        component_data = {
            "name": component.name,
            "component_type": component.component_type,
            "sequence": component.sequence,
            "description": component.description,
            "properties": component.properties,
            "user_id": user_id
        }
        
        return await self.create(component_data)

    async def get_component(self, component_id: str) -> Optional[GeneticComponentResponse]:
        """
        Ottiene un componente genetico per ID.
        """
        result = await self.get_by_id(component_id)
        if not result:
            return None
        
        return GeneticComponentResponse(
            id=result["_id"],
            name=result["name"],
            component_type=result["component_type"],
            sequence=result.get("sequence"),
            description=result.get("description"),
            properties=result.get("properties", {}),
            created_at=result["created_at"],
            updated_at=result["updated_at"]
        )

    async def get_components_by_type(
        self, component_type: ComponentType, skip: int = 0, limit: int = 50
    ) -> List[GeneticComponentResponse]:
        """
        Ottiene componenti genetici filtrati per tipo.
        """
        filter_dict = {"component_type": component_type}
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            GeneticComponentResponse(
                id=item["_id"],
                name=item["name"],
                component_type=item["component_type"],
                sequence=item.get("sequence"),
                description=item.get("description"),
                properties=item.get("properties", {}),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            )
            for item in results
        ]

    async def get_user_components(
        self, user_id: str, skip: int = 0, limit: int = 50
    ) -> List[GeneticComponentResponse]:
        """
        Ottiene componenti genetici creati dall'utente.
        """
        filter_dict = {"user_id": user_id}
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            GeneticComponentResponse(
                id=item["_id"],
                name=item["name"],
                component_type=item["component_type"],
                sequence=item.get("sequence"),
                description=item.get("description"),
                properties=item.get("properties", {}),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            )
            for item in results
        ]

    async def search_components(
        self, query: str, component_type: Optional[ComponentType] = None, skip: int = 0, limit: int = 50
    ) -> List[GeneticComponentResponse]:
        """
        Cerca componenti genetici per testo.
        """
        filter_dict = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"sequence": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if component_type:
            filter_dict["component_type"] = component_type
        
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            GeneticComponentResponse(
                id=item["_id"],
                name=item["name"],
                component_type=item["component_type"],
                sequence=item.get("sequence"),
                description=item.get("description"),
                properties=item.get("properties", {}),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            )
            for item in results
        ] 