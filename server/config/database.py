import motor.motor_asyncio
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from typing import Optional, Dict, Any, List
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Client asincrono per operazioni API
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
db = mongo_client.get_database()

# Client sincrono per operazioni in background
sync_client = MongoClient(settings.MONGODB_URI)
sync_db = sync_client.get_default_database()


def get_collection(collection_name: str):
    """
    Ottiene una collezione asincrona dal database.
    """
    return db[collection_name]


def get_sync_collection(collection_name: str):
    """
    Ottiene una collezione sincrona dal database.
    """
    return sync_db[collection_name]


class MongoRepository:
    """
    Repository base per operazioni CRUD su MongoDB.
    """
    collection_name: str

    async def create(self, data: Dict[str, Any]) -> str:
        """
        Crea un nuovo documento nella collezione.
        """
        collection = get_collection(self.collection_name)
        
        # Aggiungi timestamp
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        
        result = await collection.insert_one(data)
        return str(result.inserted_id)

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """
        Recupera un documento per ID.
        """
        collection = get_collection(self.collection_name)
        result = await collection.find_one({"_id": ObjectId(id)})
        
        if result:
            result["_id"] = str(result["_id"])
            return result
        return None

    async def get_many(self, 
                      filter_dict: Dict[str, Any] = None, 
                      skip: int = 0, 
                      limit: int = 100, 
                      sort_field: str = "created_at", 
                      sort_order: int = -1) -> List[Dict[str, Any]]:
        """
        Recupera multipli documenti con opzioni di paginazione e ordinamento.
        """
        collection = get_collection(self.collection_name)
        cursor = collection.find(filter_dict or {}).skip(skip).limit(limit).sort(sort_field, sort_order)
        
        results = []
        async for document in cursor:
            document["_id"] = str(document["_id"])
            results.append(document)
        
        return results

    async def update(self, id: str, data: Dict[str, Any]) -> bool:
        """
        Aggiorna un documento per ID.
        """
        collection = get_collection(self.collection_name)
        
        # Aggiungi timestamp di aggiornamento
        data["updated_at"] = datetime.utcnow()
        
        # Evita di sovrascrivere il created_at
        if "created_at" in data:
            del data["created_at"]
        
        result = await collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )
        
        return result.modified_count > 0

    async def delete(self, id: str) -> bool:
        """
        Elimina un documento per ID.
        """
        collection = get_collection(self.collection_name)
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def count(self, filter_dict: Dict[str, Any] = None) -> int:
        """
        Conta i documenti che soddisfano il filtro.
        """
        collection = get_collection(self.collection_name)
        return await collection.count_documents(filter_dict or {}) 