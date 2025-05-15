from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId

from server.config.database import MongoRepository
from server.models.sequence_analysis import (
    SequenceAnalysisDB,
    SequenceValidationRequest,
    SequenceAnalysisResponse,
    SequenceType,
    SequenceValidationResult,
    CodonOptimizationRequest,
    CodonOptimizationResult
)


class SequenceRepository(MongoRepository):
    """
    Repository per l'accesso alle analisi di sequenze in MongoDB.
    """
    collection_name = "sequence_analyses"

    async def create_sequence_analysis(
        self, user_id: Optional[str], request: SequenceValidationRequest
    ) -> str:
        """
        Crea una nuova analisi di sequenza.
        """
        analysis_data = {
            "user_id": user_id,
            "sequence": request.sequence,
            "sequence_type": request.sequence_type,
            "sequence_name": request.sequence_name
        }
        
        return await self.create(analysis_data)

    async def get_sequence_analysis(self, analysis_id: str) -> Optional[SequenceAnalysisResponse]:
        """
        Ottiene un'analisi di sequenza per ID.
        """
        result = await self.get_by_id(analysis_id)
        if not result:
            return None
        
        return SequenceAnalysisResponse(
            id=result["_id"],
            sequence_name=result.get("sequence_name"),
            sequence_type=result["sequence_type"],
            created_at=result["created_at"],
            validation_result=result.get("validation_result"),
            optimization_result=result.get("optimization_result"),
            primer_design_result=result.get("primer_design_result")
        )

    async def get_user_analyses(
        self, user_id: str, skip: int = 0, limit: int = 20
    ) -> List[SequenceAnalysisResponse]:
        """
        Ottiene le analisi di sequenza dell'utente.
        """
        filter_dict = {"user_id": user_id}
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            SequenceAnalysisResponse(
                id=item["_id"],
                sequence_name=item.get("sequence_name"),
                sequence_type=item["sequence_type"],
                created_at=item["created_at"],
                validation_result=item.get("validation_result"),
                optimization_result=item.get("optimization_result"),
                primer_design_result=item.get("primer_design_result")
            )
            for item in results
        ]

    async def update_validation_result(
        self, analysis_id: str, validation_result: SequenceValidationResult
    ) -> bool:
        """
        Aggiorna il risultato dell'analisi di validazione.
        """
        update_data = {
            "validation_result": validation_result.dict()
        }
        
        return await self.update(analysis_id, update_data)

    async def update_optimization_result(
        self, analysis_id: str, optimization_result: CodonOptimizationResult
    ) -> bool:
        """
        Aggiorna il risultato dell'ottimizzazione dei codoni.
        """
        update_data = {
            "optimization_result": optimization_result.dict()
        }
        
        return await self.update(analysis_id, update_data)

    async def save_codon_optimization(
        self, user_id: Optional[str], request: CodonOptimizationRequest, result: CodonOptimizationResult
    ) -> str:
        """
        Salva i risultati dell'ottimizzazione dei codoni.
        """
        analysis_data = {
            "user_id": user_id,
            "sequence": request.sequence,
            "sequence_type": SequenceType.DNA,
            "sequence_name": f"Optimized for {request.target_organism}",
            "optimization_result": result.dict()
        }
        
        return await self.create(analysis_data)

    async def search_sequences(
        self, query: str, skip: int = 0, limit: int = 20, sequence_type: Optional[SequenceType] = None
    ) -> List[SequenceAnalysisResponse]:
        """
        Cerca analisi di sequenze.
        """
        filter_dict = {
            "$or": [
                {"sequence": {"$regex": query, "$options": "i"}},
                {"sequence_name": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if sequence_type:
            filter_dict["sequence_type"] = sequence_type
        
        results = await self.get_many(filter_dict, skip, limit)
        
        return [
            SequenceAnalysisResponse(
                id=item["_id"],
                sequence_name=item.get("sequence_name"),
                sequence_type=item["sequence_type"],
                created_at=item["created_at"],
                validation_result=item.get("validation_result"),
                optimization_result=item.get("optimization_result"),
                primer_design_result=item.get("primer_design_result")
            )
            for item in results
        ] 