from typing import List, Dict, Any, Optional, Tuple
import re
# Biopython non è attualmente disponibile nell'ambiente di esecuzione, quindi le sue funzioni verranno simulate o implementate manualmente.
# from Bio.Seq import Seq 
# from Bio.SeqUtils import GC
import math

from server.models.sequence_analysis import (
    CodonOptimizationRequest,
    CodonOptimizationResult,
    CodonChangeDetail # Assicurati che sia importato
    # Assicuriamoci che il modello CodonOptimizationResult abbia un campo per i dettagli dei cambiamenti, es:
    # class CodonChangeDetail(BaseModel):
    #     position: int
    #     aa: str
    #     original: str
    #     optimized: str
    # class CodonOptimizationResult(BaseModel):
    #     ...
    #     codon_change_details: List[CodonChangeDetail] = []
)


# Tabelle di utilizzo dei codoni per diversi organismi
CODON_TABLES = {
    "ecoli": {
        "name": "Escherichia coli",
        "codons": {
            "GCA": 0.21, "GCC": 0.27, "GCG": 0.36, "GCT": 0.16, "AGA": 0.04, "AGG": 0.02, "CGA": 0.06, "CGC": 0.4, "CGG": 0.1, "CGT": 0.38,
            "AAC": 0.55, "AAT": 0.45, "GAC": 0.37, "GAT": 0.63, "TGC": 0.55, "TGT": 0.45, "GAA": 0.68, "GAG": 0.32, "CAA": 0.34, "CAG": 0.66,
            "GGA": 0.11, "GGC": 0.4, "GGG": 0.15, "GGT": 0.34, "CAC": 0.43, "CAT": 0.57, "ATA": 0.07, "ATC": 0.42, "ATT": 0.51,
            "CTA": 0.04, "CTC": 0.1, "CTG": 0.5, "CTT": 0.1, "TTA": 0.13, "TTG": 0.13, "AAA": 0.74, "AAG": 0.26, "ATG": 1.0,
            "TTC": 0.43, "TTT": 0.57, "CCA": 0.19, "CCC": 0.12, "CCG": 0.52, "CCT": 0.16, "AGC": 0.28, "AGT": 0.15, "TCA": 0.12,
            "TCC": 0.15, "TCG": 0.15, "TCT": 0.15, "ACA": 0.13, "ACC": 0.4, "ACG": 0.27, "ACT": 0.19, "TGG": 1.0, "TAC": 0.43,
            "TAT": 0.57, "GTA": 0.15, "GTC": 0.22, "GTG": 0.37, "GTT": 0.26, "TAA": 0.61, "TAG": 0.09, "TGA": 0.3,
        }
    },
    "yeast": {
        "name": "Saccharomyces cerevisiae",
        "codons": {
            "GCA":0.21,"GCC":0.26,"GCG":0.11,"GCT":0.42,"AGA":0.48,"AGG":0.21,"CGA":0.07,"CGC":0.06,"CGG":0.04,"CGT":0.14,
            "AAC":0.41,"AAT":0.59,"GAC":0.35,"GAT":0.65,"TGC":0.37,"TGT":0.63,"GAA":0.7,"GAG":0.3,"CAA":0.69,"CAG":0.31,
            "GGA":0.22,"GGC":0.19,"GGG":0.12,"GGT":0.47,"CAC":0.35,"CAT":0.65,"ATA":0.27,"ATC":0.26,"ATT":0.47,
            "CTA":0.14,"CTC":0.06,"CTG":0.11,"CTT":0.13,"TTA":0.28,"TTG":0.29,"AAA":0.58,"AAG":0.42,"ATG":1.0,
            "TTC":0.4,"TTT":0.6,"CCA":0.42,"CCC":0.15,"CCG":0.12,"CCT":0.31,"AGC":0.11,"AGT":0.16,"TCA":0.21,
            "TCC":0.16,"TCG":0.1,"TCT":0.26,"ACA":0.3,"ACC":0.22,"ACG":0.13,"ACT":0.35,"TGG":1.0,"TAC":0.43,
            "TAT":0.57,"GTA":0.21,"GTC":0.18,"GTG":0.19,"GTT":0.42,"TAA":0.47,"TAG":0.23,"TGA":0.3,
        }
    },
    "human": {
        "name": "Homo sapiens",
        "codons": {
            "GCA":0.23,"GCC":0.4,"GCG":0.11,"GCT":0.26,"AGA":0.2,"AGG":0.2,"CGA":0.11,"CGC":0.19,"CGG":0.21,"CGT":0.08,
            "AAC":0.53,"AAT":0.47,"GAC":0.54,"GAT":0.46,"TGC":0.55,"TGT":0.45,"GAA":0.42,"GAG":0.58,"CAA":0.27,"CAG":0.73,
            "GGA":0.25,"GGC":0.34,"GGG":0.25,"GGT":0.16,"CAC":0.58,"CAT":0.42,"ATA":0.16,"ATC":0.48,"ATT":0.36,
            "CTA":0.07,"CTC":0.2,"CTG":0.41,"CTT":0.13,"TTA":0.07,"TTG":0.13,"AAA":0.42,"AAG":0.58,"ATG":1.0,
            "TTC":0.54,"TTT":0.46,"CCA":0.27,"CCC":0.33,"CCG":0.11,"CCT":0.29,"AGC":0.24,"AGT":0.15,"TCA":0.15,
            "TCC":0.22,"TCG":0.06,"TCT":0.18,"ACA":0.28,"ACC":0.36,"ACG":0.12,"ACT":0.24,"TGG":1.0,"TAC":0.56,
            "TAT":0.44,"GTA":0.11,"GTC":0.24,"GTG":0.47,"GTT":0.18,"TAA":0.28,"TAG":0.2,"TGA":0.52,
        }
    },
}


# Tabella codice genetico standard
GENETIC_CODE = {
    "TTT":"F","TTC":"F","TTA":"L","TTG":"L", "CTT":"L","CTC":"L","CTA":"L","CTG":"L", "ATT":"I","ATC":"I","ATA":"I","ATG":"M",
    "GTT":"V","GTC":"V","GTA":"V","GTG":"V", "TCT":"S","TCC":"S","TCA":"S","TCG":"S", "CCT":"P","CCC":"P","CCA":"P","CCG":"P",
    "ACT":"T","ACC":"T","ACA":"T","ACG":"T", "GCT":"A","GCC":"A","GCA":"A","GCG":"A", "TAT":"Y","TAC":"Y","TAA":"*","TAG":"*",
    "CAT":"H","CAC":"H","CAA":"Q","CAG":"Q", "AAT":"N","AAC":"N","AAA":"K","AAG":"K", "GAT":"D","GAC":"D","GAA":"E","GAG":"E",
    "TGT":"C","TGC":"C","TGA":"*","TGG":"W", "CGT":"R","CGC":"R","CGA":"R","CGG":"R", "AGT":"S","AGC":"S","AGA":"R","AGG":"R",
    "GGT":"G","GGC":"G","GGA":"G","GGG":"G",
}


# Codoni inversi per ogni amminoacido
AMINO_ACID_TO_CODONS = {}
for codon, aa in GENETIC_CODE.items():
    if aa not in AMINO_ACID_TO_CODONS: AMINO_ACID_TO_CODONS[aa] = []
    AMINO_ACID_TO_CODONS[aa].append(codon)


class CodonOptimizer:
    """
    Servizio per l'ottimizzazione dei codoni per diversi organismi.
    """
    
    @staticmethod
    def _calculate_gc_content(sequence: str) -> float:
        """Calcola il contenuto GC di una sequenza."""
        if not sequence:
            return 0.0
        gc_count = sequence.upper().count("G") + sequence.upper().count("C")
        return (gc_count / len(sequence)) * 100

    @staticmethod
    def _translate_sequence(sequence: str) -> List[str]:
        """Traduce una sequenza DNA in una lista di amminoacidi."""
        amino_acids = []
        if len(sequence) % 3 != 0:
            raise ValueError("La lunghezza della sequenza di input per la traduzione non è un multiplo di 3.")
        for i in range(0, len(sequence), 3):
            codon = sequence[i:i+3].upper() # Ensure codon is uppercase for GENETIC_CODE lookup
            aa = GENETIC_CODE.get(codon)
            if aa is None:
                raise ValueError(f"Codone non valido '{codon}' trovato nella sequenza al nucleotide {i+1}.")
            amino_acids.append(aa)
        return amino_acids

    @staticmethod
    def _calculate_cai(sequence: str, organism_codon_table: Dict[str, float]) -> float:
        """Calcola l'Indice di Adattamento dei Codoni (CAI) per una sequenza."""
        if not sequence or len(sequence) % 3 != 0:
            return 0.0

        optimal_codons_for_aa: Dict[str, str] = {}
        for aa, codons in AMINO_ACID_TO_CODONS.items():
            if aa == "*" or not codons : continue
            valid_codons_for_aa = [c for c in codons if organism_codon_table.get(c, 0.0) > 0]
            if not valid_codons_for_aa:
                 continue
            optimal_codons_for_aa[aa] = max(valid_codons_for_aa, key=lambda c: organism_codon_table.get(c, 0.0))
        
        log_sum_relative_adaptiveness = 0.0
        num_codons_in_cai_calc = 0

        for i in range(0, len(sequence), 3):
            codon = sequence[i:i+3].upper() # Ensure codon is uppercase
            aa = GENETIC_CODE.get(codon)

            if not aa or aa in ("*", "M", "W"): 
                continue 
            
            current_codon_freq = organism_codon_table.get(codon, 1e-9) # Use 1e-9 to avoid log(0)

            optimal_codon_for_this_aa = optimal_codons_for_aa.get(aa)
            if not optimal_codon_for_this_aa:
                continue
            
            max_freq_for_aa = organism_codon_table.get(optimal_codon_for_this_aa, 1.0)
            if max_freq_for_aa == 0: max_freq_for_aa = 1.0

            relative_adaptiveness = current_codon_freq / max_freq_for_aa
            if relative_adaptiveness > 0: 
                log_sum_relative_adaptiveness += math.log(relative_adaptiveness)
                num_codons_in_cai_calc += 1
        
        if num_codons_in_cai_calc == 0:
            return 1.0 
        
        cai = math.exp(log_sum_relative_adaptiveness / num_codons_in_cai_calc)
        return cai

    @staticmethod
    def _does_sequence_contain_site(sequence_segment: str, site: str) -> bool:
        """Verifica se un segmento di sequenza contiene un sito specifico, case-insensitive."""
        return site.upper() in sequence_segment.upper()

    @staticmethod
    def optimize_sequence(request: CodonOptimizationRequest) -> CodonOptimizationResult:
        """
        Ottimizza una sequenza DNA per un organismo target.
        """
        sequence = request.sequence.strip().upper()
        if not re.fullmatch(r"[ATGC]+", sequence):
            raise ValueError("La sequenza DNA contiene caratteri non validi. Solo A, T, G, C sono permessi.")
        if len(sequence) % 3 != 0:
            raise ValueError("La lunghezza della sequenza DNA deve essere un multiplo di 3.")

        target_organism_key = request.target_organism.lower()
        if target_organism_key not in CODON_TABLES:
            available_organisms = ", ".join(CODON_TABLES.keys())
            raise ValueError(f"Organismo target '{request.target_organism}' non supportato. Disponibili: {available_organisms}")
        
        organism_data = CODON_TABLES[target_organism_key]
        organism_codon_table = organism_data["codons"]
        
        original_amino_acids = CodonOptimizer._translate_sequence(sequence)
        
        cai_before = CodonOptimizer._calculate_cai(sequence, organism_codon_table)
        gc_content_before = CodonOptimizer._calculate_gc_content(sequence)
        sites_to_avoid_upper = [site.upper() for site in request.restriction_sites_to_avoid if site]

        optimized_codons_list = []
        codon_changes_details_list: List[CodonChangeDetail] = []
        changes_made_count = 0

        for i, aa in enumerate(original_amino_acids):
            original_codon = sequence[i*3 : i*3+3]
            
            if aa == "*" or aa == "M" or aa == "W":
                optimized_codons_list.append(original_codon)
                continue

            synonymous_codons = AMINO_ACID_TO_CODONS.get(aa, [])
            if not synonymous_codons or len(synonymous_codons) == 1:
                optimized_codons_list.append(original_codon)
                continue
            
            # Incorporate optimization_strength:
            # Higher strength means stronger bias towards the most optimal codon.
            # Lower strength allows more diversity or closer adherence to original if optimal is problematic.
            # This can be implemented by adjusting scores or by a probabilistic choice.
            # For now, a simpler approach: sort by frequency, then apply checks.
            # A more advanced strength application might involve a weighted random choice from sorted_syn_codons.
            
            sorted_syn_codons = sorted(
                synonymous_codons, 
                key=lambda c: organism_codon_table.get(c, 0.0), 
                reverse=True
            )
            
            chosen_codon = original_codon 

            for candidate_codon in sorted_syn_codons:
                # Check for restriction sites
                creates_restriction_site = False
                if sites_to_avoid_upper:
                    temp_optimized_sequence_prefix = "".join(optimized_codons_list)
                    # Check if the new codon *completes* a restriction site
                    # This requires checking a window that includes parts of the prefix and the candidate
                    # Max length of a site to avoid.
                    max_len_site = 0
                    if sites_to_avoid_upper: # Ensure list is not empty
                         max_len_site = max(len(s) for s in sites_to_avoid_upper) if sites_to_avoid_upper else 0
                    
                    # Construct a window around the candidate codon
                    # (max_len_site - 1) prefix + candidate_codon + (max_len_site - 1) suffix (from original for lookahead)
                    # For simplicity in this iterative build, we check (prefix + candidate)
                    
                    # Start index in the full (potential) sequence for the candidate codon
                    candidate_start_index_in_full_seq = len(temp_optimized_sequence_prefix)
                    
                    for site_to_avoid in sites_to_avoid_upper:
                        # Iterate through all possible start positions of site_to_avoid
                        # such that it overlaps with candidate_codon
                        for offset in range(len(site_to_avoid)):
                            # Position where site_to_avoid would start in the temp_optimized_sequence_prefix + candidate_codon
                            site_start_in_temp = candidate_start_index_in_full_seq + len(candidate_codon) - len(site_to_avoid) + offset
                            
                            if site_start_in_temp < 0 : continue # Site starts before sequence begin

                            # The segment of (prefix + candidate) to check
                            check_segment = (temp_optimized_sequence_prefix + candidate_codon)[site_start_in_temp : site_start_in_temp + len(site_to_avoid)]
                            
                            if len(check_segment) == len(site_to_avoid) and check_segment == site_to_avoid:
                                # Make sure this site involves the candidate_codon
                                # Site ends after candidate starts, site starts before candidate ends
                                site_end_in_temp = site_start_in_temp + len(site_to_avoid)
                                if site_end_in_temp > candidate_start_index_in_full_seq and \
                                   site_start_in_temp < (candidate_start_index_in_full_seq + len(candidate_codon)):
                                    creates_restriction_site = True
                                    break
                        if creates_restriction_site: break
                
                # TODO: Implement RNA secondary structure avoidance if request.avoid_rna_secondary_structures
                # This is complex and would typically involve tools like ViennaRNA or mfold,
                # or at least heuristics (e.g., avoiding long stable GC-rich hairpins).
                # For now, this check is skipped.

                if not creates_restriction_site:
                    chosen_codon = candidate_codon
                    break  # Found a suitable codon
            
            optimized_codons_list.append(chosen_codon)
            if chosen_codon != original_codon:
                changes_made_count += 1
                codon_changes_details_list.append(CodonChangeDetail(
                    position=(i // 3) + 1, # 1-indexed amino acid position
                    aa=aa,
                    original=original_codon,
                    optimized=chosen_codon
                ))

        optimized_sequence_str = "".join(optimized_codons_list)
        cai_after = CodonOptimizer._calculate_cai(optimized_sequence_str, organism_codon_table)
        gc_content_after = CodonOptimizer._calculate_gc_content(optimized_sequence_str)

        return CodonOptimizationResult(
            original_sequence=request.sequence,
            optimized_sequence=optimized_sequence_str,
            cai_before=cai_before,
            cai_after=cai_after,
            gc_content_before=gc_content_before,
            gc_content_after=gc_content_after,
            changes_made=changes_made_count,
            organism=organism_data["name"],
            codon_change_details=codon_changes_details_list
        )