from typing import List, Optional, Dict, Any

from server.models.external_search import (
    ExternalDatabase,
    ExternalComponentSearchResult,
    ExternalComponentDetail,
    ExternalComponentImportRequest
)
from server.models.genetic_component import ComponentType # Assuming ComponentType is defined here

# Mock external database APIs - Replicating structure from databaseSearchController.js
EXTERNAL_DATABASES = {
  "IGEM": "iGEM Registry",
  "ADDGENE": "Addgene",
  "NCBI": "NCBI GenBank",
  "UNIPROT": "UniProt",
  "KEGG": "KEGG"
}

# Sample mock data, similar to databaseSearchController.js
MOCK_DB_RESULTS = {
    "promoter": [
        {
            "id": "BBa_R0010", "name": "LacI-responsive promoter", "type": "promoter", "database": "IGEM",
            "description": "LacI-repressible promoter", "preview": "CAATACGCAAACCGCCTCTCCCCGCGCGTT...",
            "properties": {"strength": "medium", "inducible": True, "inducer": "IPTG"}
        },
        {
            "id": "BBa_J23100", "name": "J23100 Constitutive Promoter", "type": "promoter", "database": "IGEM",
            "description": "Anderson promoter - constitutive, medium strength", "preview": "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC",
            "properties": {"strength": "medium", "inducible": False}
        }
    ],
    "gene": [
        {
            "id": "BBa_E0040", "name": "GFP (Green Fluorescent Protein)", "type": "gene", "database": "IGEM",
            "description": "GFP derived from Aequorea victoria", "preview": "ATGCGTAAAGGAGAAGAACTTTTCACTGGA...",
            "properties": {"function": "reporter", "color": "green"}
        },
        {
            "id": "BBa_E1010", "name": "RFP (Red Fluorescent Protein)", "type": "gene", "database": "IGEM",
            "description": "RFP derived from Discosoma sp.", "preview": "ATGGCTTCCTCCGAAGACGTTATCAAAGAG...",
            "properties": {"function": "reporter", "color": "red"}
        }
    ],
    "terminator": [
        {
            "id": "BBa_B0010", "name": "T1 Terminator", "type": "terminator", "database": "IGEM",
            "description": "Rho-independent terminator from E. coli rrnB", "preview": "CCAGGCATCAAATAAAACGAAAGGCTCAGTCG...",
            "properties": {"efficiency": "medium"}
        }
    ],
    "regulatory": [
        {
            "id": "BBa_B0034", "name": "RBS (Ribosome Binding Site)", "type": "regulatory", "database": "IGEM",
            "description": "Medium strength ribosome binding site", "preview": "AAAGAGGAGAAA",
            "properties": {"function": "translation", "strength": "medium"}
        }
    ]
}

MOCK_FULL_COMPONENTS = {
    "BBa_R0010": {
        "id": "BBa_R0010", "name": "LacI-responsive promoter", "type": "promoter", "database": "IGEM",
        "description": "LacI-repressible promoter",
        "sequence": "CAATACGCAAACCGCCTCTCCCCGCGCGTTGGCCGATTCATTAATGCAGCTGGCACGACAGGTTTCCCGACTGGAAAGCGGGCAGTGAGCGCAACGCAATTAATGTGAGTTAGCTCACTCATTAGGCACCCCAGGCTTTACACTTTATGCTTCCGGCTCGTATGTTGTGTGGAATTGTGAGCGGATAACAATTTCACACA",
        "properties": {"strength": "medium", "inducible": True, "inducer": "IPTG"}
    },
    "BBa_E0040": {
        "id": "BBa_E0040", "name": "GFP (Green Fluorescent Protein)", "type": "gene", "database": "IGEM",
        "description": "GFP derived from Aequorea victoria",
        "sequence": "ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCACAAATTTTCTGTCAGTGGAGAGGGTGAAGGTGATGCAACATACGGAAAACTTACCCTTAAATTTATTTGCACTACTGGAAAACTACCTGTTCCATGGCCAACACTTGTCACTACTTTCGGTTATGGTGTTCAATGCTTTGCGAGATACCCAGATCATATGAAACAGCATGACTTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACAGGAAAGAACTATATTTTTCAAAGATGACGGGAACTACAAGACACGTGCTGAAGTCAAGTTTGAAGGTGATACCCTTGTTAATAGAATCGAGTTAAAAGGTATTGATTTTAAAGAAGATGGAAACATTCTTGGACACAAATTGGAATACAACTATAACTCACACAATGTATACATCATGGCAGACAAACAAAAGAATGGAATCAAAGTTAACTTCAAAATTAGACACAACATTGAAGATGGAAGCGTTCAACTAGCAGACCATTATCAACAAAATACTCCAATTGGCGATGGCCCTGTCCTTTTACCAGACAACCATTACCTGTCCACACAATCTGCCCTTTCGAAAGATCCCAACGAAAAGAGAGACCACATGGTCCTTCTTGAGTTTGTAACAGCTGCTGGGATTACACATGGCATGGATGAACTATACAAATAATAA",
        "properties": {"function": "reporter", "color": "green"}
    },
     "BBa_B0010": {
        "id": "BBa_B0010", "name": "T1 Terminator", "type": "terminator", "database": "IGEM",
        "description": "Rho-independent terminator from E. coli rrnB",
        "sequence": "CCAGGCATCAAATAAAACGAAAGGCTCAGTCGAAAGACTGGGCCTTTCGTTTTATCTGTTGTTTGTCGGTGAACGCTCTC",
        "properties": {"efficiency": "medium"}
    },
    "BBa_B0034": {
        "id": "BBa_B0034", "name": "RBS (Ribosome Binding Site)", "type": "regulatory", "database": "IGEM",
        "description": "Medium strength ribosome binding site",
        "sequence": "AAAGAGGAGAAA",
        "properties": {"function": "translation", "strength": "medium"}
    }
}


class ExternalSearchRepository:
    """
    Repository for searching and importing components from mock external databases.
    """

    async def get_available_databases(self) -> List[ExternalDatabase]:
        """
        Returns a list of available mock external databases.
        """
        return [ExternalDatabase(id=id, name=name) for id, name in EXTERNAL_DATABASES.items()]

    async def search_external(
        self,
        query: str,
        database: Optional[str] = "all",
        component_type: Optional[str] = None, # Using str for component_type to match mock data
        limit: int = 20
    ) -> List[ExternalComponentSearchResult]:
        """
        Mocks searching components in external databases.
        """
        results = []
        
        # Gather results based on component_type or all types
        if component_type and component_type in MOCK_DB_RESULTS:
            results.extend(MOCK_DB_RESULTS[component_type])
        elif not component_type:
            for type_results in MOCK_DB_RESULTS.values():
                results.extend(type_results)

        # Filter by database if specified and not 'all'
        if database and database.upper() != "ALL":
            results = [item for item in results if item["database"].upper() == database.upper()]

        # Filter by search query (name, description, id)
        if query:
            lower_query = query.lower()
            results = [
                item for item in results if
                lower_query in item["name"].lower() or
                (item.get("description") and lower_query in item["description"].lower()) or
                lower_query in item["id"].lower()
            ]
        
        # Apply limit
        return [ExternalComponentSearchResult(**item) for item in results[:limit]]

    async def fetch_external_component_detail(
        self,
        external_id: str,
        database: str,
        component_type: str # Using str for component_type to match mock data
    ) -> Optional[ExternalComponentDetail]:
        """
        Mocks fetching full details of a component from an external database.
        """
        component_data = MOCK_FULL_COMPONENTS.get(external_id)
        if component_data and component_data["database"].upper() == database.upper() and component_data["type"] == component_type:
            return ExternalComponentDetail(**component_data)
        return None 