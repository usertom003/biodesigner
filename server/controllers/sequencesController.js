// @desc    Validate DNA sequences
// @route   POST /api/sequences/validate
// @access  Public
exports.validateSequence = async (req, res) => {
  try {
    const { sequence } = req.body;

    if (!sequence) {
      return res.status(400).json({
        success: false,
        message: 'Sequence is required'
      });
    }

    // Validate DNA sequence - should only contain A, T, G, C
    const isValidDNA = /^[ATGC]+$/i.test(sequence);
    
    // Check for common restriction sites
    const restrictionSites = findRestrictionSites(sequence);
    
    // Check GC content
    const gcContent = calculateGCContent(sequence);
    
    // Check for repeated sequences
    const repeatedSequences = findRepeatedSequences(sequence);
    
    // Check for palindromic sequences
    const palindromes = findPalindromes(sequence);

    return res.status(200).json({
      success: true,
      data: {
        isValidDNA,
        length: sequence.length,
        gcContent,
        restrictionSites,
        repeatedSequences,
        palindromes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate sequence',
      error: error.message
    });
  }
};

// @desc    Optimize codons for a given organism
// @route   POST /api/sequences/optimize
// @access  Public
exports.optimizeCodons = async (req, res) => {
  try {
    const { sequence, organism = 'e_coli' } = req.body;

    if (!sequence) {
      return res.status(400).json({
        success: false,
        message: 'Sequence is required'
      });
    }

    // Get codon usage table for the selected organism
    const codonTable = getCodonUsageTable(organism);
    
    // Optimize the sequence
    const optimizedSequence = optimizeSequence(sequence, codonTable);
    
    return res.status(200).json({
      success: true,
      data: {
        originalSequence: sequence,
        optimizedSequence,
        organism,
        improvements: {
          originalCAI: calculateCAI(sequence, codonTable),
          optimizedCAI: calculateCAI(optimizedSequence, codonTable)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to optimize codons',
      error: error.message
    });
  }
};

// @desc    Translate DNA to protein
// @route   POST /api/sequences/translate
// @access  Public
exports.translateDNA = async (req, res) => {
  try {
    const { sequence, startCodon = 'ATG' } = req.body;

    if (!sequence) {
      return res.status(400).json({
        success: false,
        message: 'Sequence is required'
      });
    }

    // Translate DNA to protein
    const protein = translateToProtein(sequence, startCodon);
    
    return res.status(200).json({
      success: true,
      data: {
        dnaSequence: sequence,
        proteinSequence: protein,
        length: protein.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to translate sequence',
      error: error.message
    });
  }
};

// Helper functions

// Find restriction sites in a DNA sequence
function findRestrictionSites(sequence) {
  const sites = [
    { name: 'EcoRI', pattern: 'GAATTC' },
    { name: 'BamHI', pattern: 'GGATCC' },
    { name: 'HindIII', pattern: 'AAGCTT' },
    { name: 'XbaI', pattern: 'TCTAGA' },
    { name: 'PstI', pattern: 'CTGCAG' },
    { name: 'SalI', pattern: 'GTCGAC' },
    { name: 'NotI', pattern: 'GCGGCCGC' },
    { name: 'XhoI', pattern: 'CTCGAG' }
  ];

  const results = [];
  const sequenceUpper = sequence.toUpperCase();

  sites.forEach(site => {
    let position = sequenceUpper.indexOf(site.pattern);
    while (position !== -1) {
      results.push({
        name: site.name,
        position,
        pattern: site.pattern
      });
      position = sequenceUpper.indexOf(site.pattern, position + 1);
    }
  });

  return results;
}

// Calculate GC content of a DNA sequence
function calculateGCContent(sequence) {
  const sequenceUpper = sequence.toUpperCase();
  const gcCount = (sequenceUpper.match(/[GC]/g) || []).length;
  return (gcCount / sequenceUpper.length) * 100;
}

// Find repeated sequences in DNA
function findRepeatedSequences(sequence) {
  const sequenceUpper = sequence.toUpperCase();
  const repeats = [];
  const minLength = 8; // Minimum length of repeats to look for
  
  // Look for direct repeats
  for (let i = 0; i < sequenceUpper.length - minLength; i++) {
    const pattern = sequenceUpper.substring(i, i + minLength);
    const restOfSequence = sequenceUpper.substring(i + minLength);
    
    if (restOfSequence.includes(pattern)) {
      // Find all occurrences
      let searchIndex = 0;
      let position = sequenceUpper.indexOf(pattern, searchIndex);
      
      while (position !== -1) {
        repeats.push({
          pattern,
          position,
          length: pattern.length
        });
        searchIndex = position + 1;
        position = sequenceUpper.indexOf(pattern, searchIndex);
      }
    }
  }
  
  return repeats;
}

// Find palindromic sequences in DNA
function findPalindromes(sequence) {
  const sequenceUpper = sequence.toUpperCase();
  const palindromes = [];
  const minLength = 6; // Minimum length of palindromes to look for
  
  for (let i = 0; i < sequenceUpper.length - minLength; i++) {
    for (let j = minLength; j <= 12 && i + j <= sequenceUpper.length; j += 2) {
      const subseq = sequenceUpper.substring(i, i + j);
      const reversed = reverseComplement(subseq);
      
      if (subseq === reversed) {
        palindromes.push({
          sequence: subseq,
          position: i,
          length: subseq.length
        });
      }
    }
  }
  
  return palindromes;
}

// Get reverse complement of a DNA sequence
function reverseComplement(sequence) {
  const complement = {
    'A': 'T',
    'T': 'A',
    'G': 'C',
    'C': 'G'
  };
  
  return sequence
    .split('')
    .reverse()
    .map(base => complement[base] || base)
    .join('');
}

// Get codon usage table for different organisms
function getCodonUsageTable(organism) {
  // Simplified codon usage tables
  const tables = {
    e_coli: {
      // E. coli codon usage frequencies
      'AAA': 0.74, 'AAG': 0.26, // Lys
      'AAC': 0.55, 'AAT': 0.45, // Asn
      'ACA': 0.13, 'ACC': 0.43, 'ACG': 0.27, 'ACT': 0.17, // Thr
      'AGA': 0.04, 'AGG': 0.02, 'CGA': 0.06, 'CGC': 0.38, 'CGG': 0.10, 'CGT': 0.38, // Arg
      'AGC': 0.28, 'AGT': 0.15, 'TCA': 0.14, 'TCC': 0.17, 'TCG': 0.14, 'TCT': 0.15, // Ser
      'ATA': 0.07, 'ATC': 0.42, 'ATT': 0.51, // Ile
      'ATG': 1.00, // Met
      'CAA': 0.34, 'CAG': 0.66, // Gln
      'CAC': 0.43, 'CAT': 0.57, // His
      'CCA': 0.20, 'CCC': 0.12, 'CCG': 0.52, 'CCT': 0.16, // Pro
      'CTA': 0.04, 'CTC': 0.10, 'CTG': 0.50, 'CTT': 0.10, 'TTA': 0.13, 'TTG': 0.13, // Leu
      'GAA': 0.68, 'GAG': 0.32, // Glu
      'GAC': 0.37, 'GAT': 0.63, // Asp
      'GCA': 0.21, 'GCC': 0.27, 'GCG': 0.36, 'GCT': 0.16, // Ala
      'GGA': 0.11, 'GGC': 0.41, 'GGG': 0.15, 'GGT': 0.34, // Gly
      'GTA': 0.15, 'GTC': 0.20, 'GTG': 0.37, 'GTT': 0.28, // Val
      'TAA': 0.61, 'TAG': 0.09, 'TGA': 0.30, // Stop
      'TAC': 0.57, 'TAT': 0.43, // Tyr
      'TGC': 0.55, 'TGT': 0.45, // Cys
      'TGG': 1.00, // Trp
      'TTC': 0.58, 'TTT': 0.42, // Phe
    },
    // You can add more organisms here
    yeast: {
      // Example codon usage for yeast
      // ...
    },
    human: {
      // Example codon usage for humans
      // ...
    }
  };
  
  return tables[organism] || tables.e_coli;
}

// Optimize a DNA sequence based on codon usage table
function optimizeSequence(sequence, codonTable) {
  // First translate to protein to determine the amino acid sequence
  const protein = translateToProtein(sequence);
  
  // Now build optimized DNA sequence codon by codon
  let optimized = '';
  
  // Codon to amino acid mapping
  const codonToAA = {
    'AAA': 'K', 'AAG': 'K', 'AAC': 'N', 'AAT': 'N',
    'ACA': 'T', 'ACC': 'T', 'ACG': 'T', 'ACT': 'T',
    'AGA': 'R', 'AGG': 'R', 'CGA': 'R', 'CGC': 'R', 'CGG': 'R', 'CGT': 'R',
    'AGC': 'S', 'AGT': 'S', 'TCA': 'S', 'TCC': 'S', 'TCG': 'S', 'TCT': 'S',
    'ATA': 'I', 'ATC': 'I', 'ATT': 'I',
    'ATG': 'M',
    'CAA': 'Q', 'CAG': 'Q', 'CAC': 'H', 'CAT': 'H',
    'CCA': 'P', 'CCC': 'P', 'CCG': 'P', 'CCT': 'P',
    'CTA': 'L', 'CTC': 'L', 'CTG': 'L', 'CTT': 'L', 'TTA': 'L', 'TTG': 'L',
    'GAA': 'E', 'GAG': 'E', 'GAC': 'D', 'GAT': 'D',
    'GCA': 'A', 'GCC': 'A', 'GCG': 'A', 'GCT': 'A',
    'GGA': 'G', 'GGC': 'G', 'GGG': 'G', 'GGT': 'G',
    'GTA': 'V', 'GTC': 'V', 'GTG': 'V', 'GTT': 'V',
    'TAA': '*', 'TAG': '*', 'TGA': '*',
    'TAC': 'Y', 'TAT': 'Y', 'TGC': 'C', 'TGT': 'C',
    'TGG': 'W', 'TTC': 'F', 'TTT': 'F'
  };
  
  // Reverse mapping: amino acid to codons
  const aaToCodon = {};
  Object.entries(codonToAA).forEach(([codon, aa]) => {
    if (!aaToCodon[aa]) aaToCodon[aa] = [];
    aaToCodon[aa].push(codon);
  });
  
  // For each amino acid in the protein sequence, find the optimal codon
  for (let i = 0; i < protein.length; i++) {
    const aa = protein[i];
    const possibleCodons = aaToCodon[aa] || [];
    
    if (possibleCodons.length > 0) {
      // Find the codon with highest usage frequency
      let bestCodon = possibleCodons[0];
      let highestFreq = codonTable[bestCodon] || 0;
      
      for (let j = 1; j < possibleCodons.length; j++) {
        const codon = possibleCodons[j];
        const freq = codonTable[codon] || 0;
        
        if (freq > highestFreq) {
          highestFreq = freq;
          bestCodon = codon;
        }
      }
      
      optimized += bestCodon;
    }
  }
  
  return optimized;
}

// Calculate Codon Adaptation Index (CAI)
function calculateCAI(sequence, codonTable) {
  // Simple CAI calculation - product of relative adaptiveness values
  const codons = [];
  for (let i = 0; i < sequence.length; i += 3) {
    if (i + 3 <= sequence.length) {
      codons.push(sequence.substring(i, i + 3).toUpperCase());
    }
  }
  
  // Calculate product of usage frequencies
  let product = 1;
  let count = 0;
  
  codons.forEach(codon => {
    if (codonTable[codon]) {
      product *= codonTable[codon];
      count++;
    }
  });
  
  // CAI is the geometric mean
  return count > 0 ? Math.pow(product, 1/count) : 0;
}

// Translate DNA to protein
function translateToProtein(dnaSequence, startCodon = 'ATG') {
  const geneticCode = {
    'AAA': 'K', 'AAG': 'K', 'AAC': 'N', 'AAT': 'N',
    'ACA': 'T', 'ACC': 'T', 'ACG': 'T', 'ACT': 'T',
    'AGA': 'R', 'AGG': 'R', 'CGA': 'R', 'CGC': 'R', 'CGG': 'R', 'CGT': 'R',
    'AGC': 'S', 'AGT': 'S', 'TCA': 'S', 'TCC': 'S', 'TCG': 'S', 'TCT': 'S',
    'ATA': 'I', 'ATC': 'I', 'ATT': 'I',
    'ATG': 'M',
    'CAA': 'Q', 'CAG': 'Q', 'CAC': 'H', 'CAT': 'H',
    'CCA': 'P', 'CCC': 'P', 'CCG': 'P', 'CCT': 'P',
    'CTA': 'L', 'CTC': 'L', 'CTG': 'L', 'CTT': 'L', 'TTA': 'L', 'TTG': 'L',
    'GAA': 'E', 'GAG': 'E', 'GAC': 'D', 'GAT': 'D',
    'GCA': 'A', 'GCC': 'A', 'GCG': 'A', 'GCT': 'A',
    'GGA': 'G', 'GGC': 'G', 'GGG': 'G', 'GGT': 'G',
    'GTA': 'V', 'GTC': 'V', 'GTG': 'V', 'GTT': 'V',
    'TAA': '*', 'TAG': '*', 'TGA': '*',
    'TAC': 'Y', 'TAT': 'Y', 'TGC': 'C', 'TGT': 'C',
    'TGG': 'W', 'TTC': 'F', 'TTT': 'F'
  };
  
  const sequence = dnaSequence.toUpperCase();
  let protein = '';
  
  // Find start codon
  let startIndex = sequence.indexOf(startCodon);
  
  // If start codon not found, start from beginning
  if (startIndex === -1) startIndex = 0;
  
  // Translate codons
  for (let i = startIndex; i < sequence.length - 2; i += 3) {
    const codon = sequence.substring(i, i + 3);
    const aminoAcid = geneticCode[codon] || 'X'; // X for unknown codons
    
    // Stop at stop codon
    if (aminoAcid === '*') break;
    
    protein += aminoAcid;
  }
  
  return protein;
} 