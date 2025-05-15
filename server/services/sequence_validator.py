from typing import List, Dict, Any, Optional, Tuple
import re

from server.models.sequence_analysis import (
    SequenceType,
    SequenceValidationResult,
    SequenceValidationIssue,
    SequenceStatistics,
    ORF,
    RepeatSequence,
    PalindromicSequence
)

# Codice genetico standard
GENETIC_CODE: Dict[str, str] = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*', # * = Stop codon
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W', # * = Stop codon
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
}

STANDARD_AMINO_ACIDS: set[str] = set("ACDEFGHIKLMNPQRSTVWY")
DNA_BASES: set[str] = set("ATGC")
RNA_BASES: set[str] = set("AUGC")
START_CODONS: List[str] = ["ATG"] # Per DNA
STOP_CODONS: List[str] = ["TAA", "TAG", "TGA"] # Per DNA

class SequenceValidator:
    """
    Servizio per la validazione completa delle sequenze genetiche e proteiche.
    Implementa calcoli di GC content, ricerca di ORF, ripetizioni, palindromi
    e validazione dei caratteri senza dipendenze esterne come Biopython.
    """

    @staticmethod
    def _reverse_complement(sequence: str, sequence_type: SequenceType) -> str:
        """Calcola il reverse complement di una sequenza di DNA o RNA."""
        if not sequence or sequence_type not in [SequenceType.DNA, SequenceType.RNA]:
            return ""

        complement_map_dna = {"A": "T", "T": "A", "C": "G", "G": "C"}
        complement_map_rna = {"A": "U", "U": "A", "C": "G", "G": "C"}
        
        actual_map = complement_map_dna if sequence_type == SequenceType.DNA else complement_map_rna
        
        # Assicurati che sequence sia stringa prima di upper()
        seq_upper = sequence.upper() if isinstance(sequence, str) else ""
        return "".join(actual_map.get(base, base) for base in reversed(seq_upper))

    @staticmethod
    def _translate_codon(codon: str) -> Optional[str]:
        """Traduce un singolo codone nell'amminoacido corrispondente."""
        return GENETIC_CODE.get(codon.upper())

    @staticmethod
    def _calculate_gc_content_manual(sequence: str, sequence_type: SequenceType) -> float:
        """Calcola manualmente il contenuto GC di una sequenza DNA o RNA."""
        if not sequence or sequence_type not in [SequenceType.DNA, SequenceType.RNA]:
            return 0.0
        
        seq_upper = sequence.upper()
        g_count = seq_upper.count('G')
        c_count = seq_upper.count('C')
        
        if len(seq_upper) == 0:
            return 0.0
        return ((g_count + c_count) / len(seq_upper)) * 100

    @staticmethod
    def _count_invalid_characters(sequence: str, sequence_type: SequenceType) -> int:
        """Conta i caratteri non validi in una sequenza."""
        valid_set = set()
        if sequence_type == SequenceType.DNA:
            valid_set = DNA_BASES
        elif sequence_type == SequenceType.RNA:
            valid_set = RNA_BASES
        elif sequence_type == SequenceType.PROTEIN:
            valid_set = STANDARD_AMINO_ACIDS
        
        count = 0
        seq_upper = sequence.upper() # Assicurati che sequence sia una stringa
        for char in seq_upper:
            if char not in valid_set:
                count += 1
        return count

    @staticmethod
    def _find_invalid_character_positions(sequence: str, sequence_type: SequenceType) -> List[int]:
        """Trova le posizioni (1-based) dei caratteri non validi."""
        positions: List[int] = []
        valid_set = set()
        if sequence_type == SequenceType.DNA:
            valid_set = DNA_BASES
        elif sequence_type == SequenceType.RNA:
            valid_set = RNA_BASES
        elif sequence_type == SequenceType.PROTEIN:
            valid_set = STANDARD_AMINO_ACIDS
        
        seq_upper = sequence.upper() # Assicurati che sequence sia una stringa
        for i, char in enumerate(seq_upper):
            if char not in valid_set:
                positions.append(i + 1)
        return positions

    @staticmethod
    def _translate_sequence_to_protein(dna_sequence: str, frame: int, direction: str) -> Tuple[str, int, int]:
        """
        Traduce una sequenza di DNA in una proteina, partendo da un frame specifico.
        Restituisce la proteina, l'indice di inizio (0-based) nella sequenza DNA originale,
        e l'indice di fine (0-based) nella sequenza DNA originale.
        Nota: la sequenza DNA in input è già orientata (forward o reverse complement).
        """
        protein = []
        start_index_in_dna = -1
        # frame è l'offset 0, 1, or 2. direction è "forward" o "reverse"
        # La dna_sequence passata qui è già la sequenza[frame:] o il suo rev_comp[frame:]
        
        for i in range(0, len(dna_sequence) - 2, 3):
            codon = dna_sequence[i:i+3]
            # Non chiamare self._translate_codon perché siamo in un metodo statico
            # e GENETIC_CODE è globale.
            amino_acid = SequenceValidator._translate_codon(codon) 
            
            if amino_acid == 'M' and not protein: # Inizio potenziale
                protein.append(amino_acid)
                start_index_in_dna = i 
            elif protein: # Continua la traduzione se abbiamo già iniziato
                if amino_acid == '*': # Stop codon
                    end_index_in_dna = i + 2 
                    return "".join(protein), start_index_in_dna, end_index_in_dna
                elif amino_acid:
                    protein.append(amino_acid)
                else: # Codone non valido incontrato dopo l'inizio (es. contiene N)
                    # In questo caso, l'ORF è interrotto e non valido da questo punto.
                    return "", -1, -1 
        
        # Se non c'è stop codon e l'ORF è iniziato, potrebbe essere parziale
        if protein and start_index_in_dna != -1:
            end_index_in_dna = i + 2 # Fine dell'ultimo codone completo tradotto
            # Verifica che end_index_in_dna non superi la lunghezza della sequenza DNA
            if end_index_in_dna >= len(dna_sequence):
                end_index_in_dna = len(dna_sequence) -1 
            return "".join(protein), start_index_in_dna, end_index_in_dna

        return "", -1, -1 # Nessun ORF valido trovato

    @staticmethod
    def _find_open_reading_frames(sequence: str, min_protein_len: int = 25) -> List[ORF]:
        """
        Trova Open Reading Frames (ORF) in una sequenza di DNA in tutti e 6 i frame.
        Un ORF inizia con un codone di start (ATG), termina con un codone di stop,
        e codifica per una proteina di lunghezza minima specificata.
        """
        if not sequence or len(sequence) < 3:
            return []
        
        orfs: List[ORF] = []
        sequence_upper = sequence.upper()
        
        # Frames forward (0, 1, 2)
        for frame_offset in range(3):
            dna_sub_sequence_fwd = sequence_upper[frame_offset:]
            current_pos_in_sub_fwd = 0
            while current_pos_in_sub_fwd < len(dna_sub_sequence_fwd):
                atg_pos = dna_sub_sequence_fwd.find("ATG", current_pos_in_sub_fwd)
                if atg_pos == -1 or atg_pos % 3 != 0: 
                    break 

                protein, orf_start_rel_to_atg, orf_end_rel_to_atg = SequenceValidator._translate_sequence_to_protein(
                    dna_sub_sequence_fwd[atg_pos:], frame=0, direction="forward"
                )

                if protein and len(protein) >= min_protein_len and orf_start_rel_to_atg == 0: 
                    start_abs = frame_offset + atg_pos 
                    end_abs = frame_offset + atg_pos + orf_end_rel_to_atg
                    orf_dna_seq = sequence_upper[start_abs : end_abs + 1]
                    
                    orfs.append(ORF(
                        start=start_abs + 1, 
                        end=end_abs + 1,     
                        length=len(orf_dna_seq),
                        frame=frame_offset + 1,
                        direction="forward",
                        protein_sequence=protein,
                        protein_length=len(protein)
                    ))
                    current_pos_in_sub_fwd = atg_pos + ( (orf_end_rel_to_atg // 3) + 1) * 3 
                elif atg_pos != -1 :
                    current_pos_in_sub_fwd = atg_pos + 3 
                else: 
                    break
            
        rev_comp_seq = SequenceValidator._reverse_complement(sequence_upper, SequenceType.DNA)
        for frame_offset in range(3):
            dna_sub_sequence_rev = rev_comp_seq[frame_offset:]
            current_pos_in_sub_rev = 0
            while current_pos_in_sub_rev < len(dna_sub_sequence_rev):
                atg_pos = dna_sub_sequence_rev.find("ATG", current_pos_in_sub_rev)
                if atg_pos == -1 or atg_pos % 3 != 0:
                    break

                protein, orf_start_rel_to_atg, orf_end_rel_to_atg = SequenceValidator._translate_sequence_to_protein(
                    dna_sub_sequence_rev[atg_pos:], frame=0, direction="reverse" 
                )

                if protein and len(protein) >= min_protein_len and orf_start_rel_to_atg == 0:
                    start_abs_on_forward = len(sequence_upper) - 1 - (frame_offset + atg_pos + orf_end_rel_to_atg)
                    end_abs_on_forward = len(sequence_upper) - 1 - (frame_offset + atg_pos)
                    
                    orf_dna_seq = sequence_upper[start_abs_on_forward : end_abs_on_forward + 1]
                    
                    orfs.append(ORF(
                        start=start_abs_on_forward + 1, 
                        end=end_abs_on_forward + 1,     
                        length=len(orf_dna_seq),
                        frame=-(frame_offset + 1),
                        direction="reverse",
                        protein_sequence=protein,
                        protein_length=len(protein)
                    ))
                    current_pos_in_sub_rev = atg_pos + ( (orf_end_rel_to_atg // 3) + 1) * 3
                elif atg_pos != -1:
                    current_pos_in_sub_rev = atg_pos + 3
                else:
                    break

        orfs.sort(key=lambda o: o.start)
        return orfs

    @staticmethod
    def _find_repeats(sequence: str, min_length: int = 10, min_count: int = 2) -> List[RepeatSequence]:
        """
        Trova sequenze ripetute (match esatti diretti) in una sequenza.
        Logica di base per identificare ripetizioni non sovrapposte.
        Potrebbe essere ulteriormente raffinata per gestire ripetizioni complesse o sovrapposte.
        """
        if not sequence or len(sequence) < min_length * min_count:
            return []

        n = len(sequence)
        repeats_found: List[RepeatSequence] = []
        # Mappa per tenere traccia delle sottosequenze già processate come parte di una ripetizione
        # per evitare di aggiungere sottoripetizioni se una più grande è già stata trovata.
        processed_indices = [False] * n 

        # Itera su possibili lunghezze di ripetizione
        for length in range(min_length, n // min_count + 1):
            # Itera attraverso la sequenza per trovare la prima occorrenza di una potenziale unità ripetuta
            for i in range(n - length + 1):
                # Se l'inizio di questa potenziale ripetizione è già stato contato come parte di un'altra, salta
                if processed_indices[i]:
                    continue

                sub_sequence = sequence[i : i + length]
                occurrences: List[Tuple[int, int]] = []
                current_pos = i
                
                temp_processed_for_this_sub = [False] * n
                num_occurrences = 0

                search_offset = i
                while search_offset <= n - length:
                    found_at = sequence.find(sub_sequence, search_offset)
                    if found_at != -1:
                        # Verifica che questa occorrenza non si sovrapponga a una già marcata come "usata"
                        # per questa specifica sub_sequence, per contare occorrenze distinte.
                        # Questo è un approccio semplice per evitare sovrapposizioni nel conteggio della stessa unità.
                        is_already_covered_for_this_sub = False
                        for start_idx in range(found_at, found_at + length):
                            if temp_processed_for_this_sub[start_idx]:
                                is_already_covered_for_this_sub = True
                                break
                        
                        if not is_already_covered_for_this_sub:
                            occurrences.append((found_at + 1, found_at + length)) # 1-based
                            num_occurrences +=1
                            # Marca questa regione come usata per *questa* sub_sequence
                            for k_idx in range(found_at, found_at + length):
                                temp_processed_for_this_sub[k_idx] = True
                            search_offset = found_at + length # Cerca la prossima dopo questa
                        else:
                            search_offset = found_at + 1 # Continua la ricerca poco dopo
                    else:
                        break # sub_sequence non più trovata
                
                if num_occurrences >= min_count:
                    # Verifica se questa ripetizione è una sottoripetizione di una già trovata e più lunga
                    is_sub_repeat_of_longer = False
                    for r_exist in repeats_found:
                        if sub_sequence in r_exist.sequence and len(sub_sequence) < len(r_exist.sequence):
                            # Controlla se le posizioni sono coperte
                            is_covered = True
                            for occ_new_start, occ_new_end in occurrences:
                                new_is_inside_existing = False
                                for occ_e_start, occ_e_end in r_exist.occurrences:
                                    if occ_new_start >= occ_e_start and occ_new_end <= occ_e_end:
                                        new_is_inside_existing = True
                                        break
                                if not new_is_inside_existing:
                                    is_covered = False
                                    break
                            if is_covered:
                                is_sub_repeat_of_longer = True
                                break
                    
                    if not is_sub_repeat_of_longer:
                        # Rimuovi eventuali ripetizioni più corte che sono completamente coperte da questa nuova
                        repeats_found = [r for r in repeats_found 
                                         if not (r.sequence in sub_sequence and len(r.sequence) < len(sub_sequence) and 
                                                 all(any(o_r_start <= o_s_start and o_r_end >= o_s_end 
                                                         for o_s_start, o_s_end in occurrences) 
                                                     for o_r_start, o_r_end in r.occurrences)                                                   
                                                )
                                        ]
                        
                        repeats_found.append(RepeatSequence(
                            sequence=sub_sequence,
                            length=length,
                            count=num_occurrences,
                            occurrences=sorted(occurrences)
                        ))
                        # Marca gli indici globali per le occorrenze di questa ripetizione trovata
                        # Questo aiuta a dare priorità a ripetizioni più lunghe se trovate prima.
                        # Tuttavia, l'ordine di iterazione per `length` è crescente.
                        # Questa logica di `processed_indices` è per evitare di ricominciare da zero
                        # sottostringhe che sono già state identificate come parte di una ripetizione.
                        for occ_start, occ_end in occurrences:
                            for k_idx in range(occ_start -1, occ_end -1 +1):
                                processed_indices[k_idx] = True 
        
        # Ordina per lunghezza (decrescente) e poi per conteggio (decrescente)
        repeats_found.sort(key=lambda r: (r.length, r.count), reverse=True)
        return repeats_found

    @staticmethod
    def _find_palindromes(sequence: str, min_length: int = 6) -> List[PalindromicSequence]:
        """
        Trova sequenze palindromiche (che sono uguali al loro reverse complement)
        in una sequenza DNA o RNA.
        """
        if not sequence or len(sequence) < min_length:
            return []

        palindromes_found: List[PalindromicSequence] = []
        n = len(sequence)
        sequence_upper = sequence.upper()

        seq_type_for_rc = SequenceType.RNA if 'U' in sequence_upper else SequenceType.DNA
        
        valid_bases = RNA_BASES if seq_type_for_rc == SequenceType.RNA else DNA_BASES

        for length in range(min_length, n + 1):
            for i in range(n - length + 1):
                sub_sequence = sequence_upper[i : i + length]
                
                if not all(base in valid_bases for base in sub_sequence):
                    continue

                rev_comp_sub = SequenceValidator._reverse_complement(sub_sequence, seq_type_for_rc)
                if sub_sequence == rev_comp_sub:
                    is_contained_in_longer = False
                    for p_existing in palindromes_found:
                        if i >= (p_existing.start -1) and (i + length) <= p_existing.end and length < p_existing.length:
                            is_contained_in_longer = True
                            break
                    if not is_contained_in_longer:
                        palindromes_found = [p for p in palindromes_found 
                                             if not (p.start -1 >= i and p.end <= i + length and p.length < length)]
                        
                        palindromes_found.append(PalindromicSequence(
                            start=i + 1, 
                            end=i + length, 
                            length=length,
                            sequence=sub_sequence
                        ))
        
        palindromes_found.sort(key=lambda p: (p.start, -p.length))
        return palindromes_found

    @staticmethod
    def _calculate_stats(sequence: str, sequence_type: SequenceType, component_type: Optional[str] = None, min_protein_len_orf: int = 25) -> SequenceStatistics:
        """Calcola tutte le statistiche della sequenza."""
        length = len(sequence)
        gc_content = SequenceValidator._calculate_gc_content_manual(sequence, sequence_type)
        invalid_bases_count = SequenceValidator._count_invalid_characters(sequence, sequence_type)
        
        orfs: List[ORF] = []
        if sequence_type == SequenceType.DNA: # ORF sono definiti per DNA
            # Assumiamo che la sequenza passata a _find_open_reading_frames sia già uppercased e valida
            orfs = SequenceValidator._find_open_reading_frames(sequence, min_protein_len=min_protein_len_orf)
        
        repeats: List[RepeatSequence] = []
        palindromes: List[PalindromicSequence] = []
        if sequence_type in [SequenceType.DNA, SequenceType.RNA]:
            # Assumiamo che la sequenza passata qui sia già uppercased
            repeats = SequenceValidator._find_repeats(sequence, min_length=10, min_count=2)
            palindromes = SequenceValidator._find_palindromes(sequence, min_length=6)
        
        return SequenceStatistics(
            length=length,
            gc_content=round(gc_content, 2) if gc_content is not None else 0.0,
            invalid_bases=invalid_bases_count,
            open_reading_frames=orfs,
            repeats=repeats,
            palindromes=palindromes
        )

    @staticmethod
    def validate_sequence(sequence: str, sequence_type: SequenceType, component_type: Optional[str] = None, min_protein_len_orf: int = 25) -> SequenceValidationResult:
        """
        Valida una sequenza, calcola statistiche e identifica potenziali problemi.
        """
        sequence_upper = sequence.strip().upper() if isinstance(sequence, str) else ""
        
        is_valid_overall = True 
        errors: List[SequenceValidationIssue] = []
        warnings: List[SequenceValidationIssue] = []
        info: List[SequenceValidationIssue] = []

        if not sequence_upper:
            errors.append(SequenceValidationIssue(type="empty_sequence", message="La sequenza fornita è vuota."))
            empty_stats = SequenceStatistics(length=0, gc_content=0.0, invalid_bases=0, open_reading_frames=[], repeats=[], palindromes=[])
            return SequenceValidationResult(is_valid=False, errors=errors, warnings=warnings, info=info, stats=empty_stats)
        
        stats = SequenceValidator._calculate_stats(sequence_upper, sequence_type, component_type, min_protein_len_orf)
        
        if stats.invalid_bases > 0:
            is_valid_overall = False
            invalid_positions = SequenceValidator._find_invalid_character_positions(sequence_upper, sequence_type)
            base_type_msg = "basi/amminoacidi"
            allowed_chars_msg = "ATGC (DNA), AUGC (RNA), o ACDEFGHIKLMNPQRSTVWY (Proteina)"
            if sequence_type == SequenceType.DNA: 
                base_type_msg = "basi DNA"
                allowed_chars_msg = ", ".join(sorted(list(DNA_BASES)))
            elif sequence_type == SequenceType.RNA: 
                base_type_msg = "basi RNA"
                allowed_chars_msg = ", ".join(sorted(list(RNA_BASES)))
            elif sequence_type == SequenceType.PROTEIN:
                base_type_msg = "amminoacidi"
                allowed_chars_msg = "i 20 standard (" + ", ".join(sorted(list(STANDARD_AMINO_ACIDS))) + ")"

            errors.append(
                SequenceValidationIssue(
                    type="invalid_characters",
                    message=f"La sequenza contiene {stats.invalid_bases} {base_type_msg} non validi. Solo {allowed_chars_msg} sono permessi.",
                    details={"positions": invalid_positions} if invalid_positions else None
                )
            )
        
        if sequence_type in [SequenceType.DNA, SequenceType.RNA] and stats.gc_content is not None:
            gc_content = stats.gc_content
            if gc_content < 20.0: 
                warnings.append(
                    SequenceValidationIssue(type="very_low_gc_content", message=f"Contenuto GC estremamente basso ({gc_content:.1f}%). Potrebbe indicare problemi.")
                )
            elif gc_content < 35.0:
                 warnings.append(
                    SequenceValidationIssue(type="low_gc_content", message=f"Contenuto GC basso ({gc_content:.1f}%).")
                )
            elif gc_content > 75.0:
                warnings.append(
                    SequenceValidationIssue(type="very_high_gc_content", message=f"Contenuto GC estremamente alto ({gc_content:.1f}%). Potrebbe causare problemi.")
                )
            elif gc_content > 65.0:
                 warnings.append(
                    SequenceValidationIssue(type="high_gc_content", message=f"Contenuto GC alto ({gc_content:.1f}%).")
                )
        
        if sequence_type == SequenceType.DNA:
            if component_type and "gene" in component_type.lower():
                if not stats.open_reading_frames:
                    warnings.append(
                        SequenceValidationIssue(
                            type="no_orfs_found_in_gene",
                            message=f"Nessun ORF (proteina >= {min_protein_len_orf}aa) trovato per il gene."
                        )
                    )
                else:
                    info.append(
                         SequenceValidationIssue(
                            type="orfs_analysis",
                            message=f"Trovati {len(stats.open_reading_frames)} ORF(s) con proteina >= {min_protein_len_orf}aa.",
                            details={"orf_summary": [f"ORF frame {orf.frame} ({orf.direction}): {orf.start}-{orf.end} ({orf.length}nt), proteina {orf.protein_length}aa" for orf in stats.open_reading_frames]}
                        )
                    )
            elif stats.open_reading_frames: 
                 info.append(
                    SequenceValidationIssue(
                        type="orfs_present",
                        message=f"Trovati {len(stats.open_reading_frames)} ORF(s) con proteina >= {min_protein_len_orf}aa.",
                        details={"orf_count": len(stats.open_reading_frames)}
                    )
                )

        if stats.repeats:
            warnings.append(
                SequenceValidationIssue(
                    type="repeats_found",
                    message=f"Trovate {len(stats.repeats)} tipologie di sequenze ripetute (dettagli in statistiche).",
                    details={"repeat_summary": [f"{r.count}x '{r.sequence}' (len {r.length}) at {r.occurrences}" for r in stats.repeats]}
                )
            )
        
        if stats.palindromes:
            info.append(
                SequenceValidationIssue(
                    type="palindromes_found",
                    message=f"Trovate {len(stats.palindromes)} sequenze palindromiche (dettagli in statistiche).",
                     details={"palindrome_summary": [f"'{p.sequence}' (pos {p.start}-{p.end}, len {p.length})" for p in stats.palindromes]}
                )
            )

        seq_len = stats.length
        if component_type:
            ct_lower = component_type.lower()
            # Esempi di warning basati sulla lunghezza e tipo di componente
            if ct_lower == "promoter" and (seq_len < 20 or seq_len > 1000):
                warnings.append(SequenceValidationIssue(type="promoter_length_check", message=f"Lunghezza promotore ({seq_len}bp) atipica."))
            elif ct_lower == "gene" and seq_len < min_protein_len_orf * 3 :
                 warnings.append(SequenceValidationIssue(type="gene_too_short_for_orf", message=f"Gene ({seq_len}bp) troppo corto per codificare una proteina di {min_protein_len_orf}aa."))
            elif "cds" in ct_lower and seq_len > 0 and seq_len % 3 != 0:
                 warnings.append(SequenceValidationIssue(type="cds_not_multiple_of_3", message=f"Lunghezza CDS ({seq_len}bp) non multiplo di 3."))
            elif ct_lower == "terminator" and (seq_len < 15 or seq_len > 500):
                warnings.append(SequenceValidationIssue(type="terminator_length_check", message=f"Lunghezza terminatore ({seq_len}bp) atipica."))

        return SequenceValidationResult(
            is_valid=is_valid_overall, 
            errors=errors, 
            warnings=warnings, 
            info=info, 
            stats=stats
        )

# Rimuoviamo i commenti finali ora che la classe è completa. 