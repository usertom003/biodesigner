// @desc    Optimize genetic circuit performance
// @route   POST /api/optimization/circuit
// @access  Public
exports.optimizeCircuit = async (req, res) => {
  try {
    const { nodes, edges, optimizationGoal, constraints = {} } = req.body;

    if (!nodes || !edges || !optimizationGoal) {
      return res.status(400).json({
        success: false,
        message: 'Nodes, edges, and optimization goal are required'
      });
    }

    // Run the optimization algorithm
    const optimizationResult = await simulateAndOptimize(nodes, edges, optimizationGoal, constraints);

    res.status(200).json({
      success: true,
      data: optimizationResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to optimize genetic circuit',
      error: error.message
    });
  }
};

// @desc    Optimize protein expression
// @route   POST /api/optimization/expression
// @access  Public
exports.optimizeExpression = async (req, res) => {
  try {
    const { geneSequence, hostOrganism = 'e_coli', expressionGoal, constraints = {} } = req.body;

    if (!geneSequence) {
      return res.status(400).json({
        success: false,
        message: 'Gene sequence is required'
      });
    }

    // Run the expression optimization algorithm
    const expressionResult = await optimizeProteinExpression(geneSequence, hostOrganism, expressionGoal, constraints);

    res.status(200).json({
      success: true,
      data: expressionResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to optimize protein expression',
      error: error.message
    });
  }
};

// Helper functions

// Simulates and optimizes a genetic circuit based on goals and constraints
async function simulateAndOptimize(nodes, edges, optimizationGoal, constraints) {
  // Start with initial design
  let currentDesign = {
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges))
  };

  let currentScore = evaluateDesign(currentDesign, optimizationGoal);
  
  // Keep track of the best design found
  let bestDesign = currentDesign;
  let bestScore = currentScore;
  
  // Simple hill-climbing optimization algorithm
  const iterations = 50;
  
  for (let i = 0; i < iterations; i++) {
    // Generate a modified version of the current design
    const modifiedDesign = modifyDesign(currentDesign, constraints);
    
    // Evaluate the modified design
    const modifiedScore = evaluateDesign(modifiedDesign, optimizationGoal);
    
    // If better, accept the new design
    if (modifiedScore > currentScore) {
      currentDesign = modifiedDesign;
      currentScore = modifiedScore;
      
      // Update best design if current is the best so far
      if (currentScore > bestScore) {
        bestDesign = currentDesign;
        bestScore = currentScore;
      }
    }
  }
  
  return {
    originalDesign: {
      nodes,
      edges
    },
    optimizedDesign: bestDesign,
    improvements: {
      originalScore: evaluateDesign({ nodes, edges }, optimizationGoal),
      optimizedScore: bestScore
    },
    stats: {
      iterations,
      optimizationGoal
    }
  };
}

// Evaluates a genetic circuit design based on specified goals
function evaluateDesign(design, optimizationGoal) {
  const { nodes, edges } = design;
  
  // Different evaluation strategies based on optimization goal
  switch (optimizationGoal) {
    case 'maxExpression': {
      // Find reporter genes
      const reporters = nodes.filter(node => node.type === 'gene' && node.data.function === 'reporter');
      
      if (reporters.length === 0) {
        return 0; // No reporters, no expression to optimize
      }
      
      // Simulate the circuit to get expression levels
      const simulationResult = simulateExpressionLevels(nodes, edges);
      
      // Sum up the expression of all reporters
      const totalExpression = reporters.reduce((sum, reporter) => {
        return sum + (simulationResult[reporter.id] || 0);
      }, 0);
      
      return totalExpression;
    }
    
    case 'minLeakage': {
      // Simulate the circuit with and without induction
      const uninducedResult = simulateExpressionLevels(nodes, edges, { induced: false });
      const inducedResult = simulateExpressionLevels(nodes, edges, { induced: true });
      
      // Find reporter genes
      const reporters = nodes.filter(node => node.type === 'gene' && node.data.function === 'reporter');
      
      if (reporters.length === 0) {
        return 0; // No reporters
      }
      
      // Calculate fold-change in expression
      let foldChange = 0;
      
      reporters.forEach(reporter => {
        const uninducedLevel = uninducedResult[reporter.id] || 0.1; // Avoid division by zero
        const inducedLevel = inducedResult[reporter.id] || 0.1;
        
        foldChange += inducedLevel / uninducedLevel;
      });
      
      return foldChange;
    }
    
    case 'stability': {
      // Evaluate circuit stability
      // More connections between components can indicate more stability
      const connectionCount = edges.length;
      
      // Repressor nodes add stability
      const repressors = nodes.filter(node => node.type === 'gene' && node.data.function === 'repressor');
      
      return connectionCount * 2 + repressors.length * 5;
    }
    
    default:
      return 0;
  }
}

// Simulates expression levels in a genetic circuit
function simulateExpressionLevels(nodes, edges, options = { induced: true }) {
  const { induced } = options;
  
  // Create a map of connections
  const connections = {};
  edges.forEach(edge => {
    if (!connections[edge.target]) {
      connections[edge.target] = [];
    }
    connections[edge.target].push(edge.source);
  });
  
  // Find promoters, genes, and regulatory elements
  const promoters = nodes.filter(node => node.type === 'promoter');
  const genes = nodes.filter(node => node.type === 'gene');
  const regulatoryElements = nodes.filter(node => node.type === 'regulatory');
  
  // Expression levels for each node
  const expressionLevels = {};
  
  // Calculate promoter activities first
  promoters.forEach(promoter => {
    let activity = getBasePromoterActivity(promoter);
    
    // If the promoter is inducible, adjust activity based on induction state
    if (promoter.data.inducible) {
      if (induced && promoter.data.inducer) {
        // Promoter is induced, increase activity
        activity *= 10;
      } else if (!induced) {
        // Promoter is not induced, lower activity (leakage)
        activity *= 0.1;
      }
    }
    
    // Check for repressors targeting this promoter
    const repressors = genes.filter(gene => 
      gene.data.function === 'repressor' && 
      gene.data.targets && 
      gene.data.targets.includes(promoter.data.id)
    );
    
    if (repressors.length > 0) {
      // Calculate repression level
      const repressionFactor = repressors.length * 0.8;
      activity *= (1 - repressionFactor);
    }
    
    expressionLevels[promoter.id] = Math.max(0, Math.min(100, activity));
  });
  
  // Calculate gene expression levels based on connected promoters
  genes.forEach(gene => {
    let expressionLevel = 0;
    
    // Check for connected promoters
    if (connections[gene.id]) {
      const connectedPromoters = promoters.filter(promoter => 
        connections[gene.id].includes(promoter.id)
      );
      
      if (connectedPromoters.length > 0) {
        // Sum up promoter activities
        expressionLevel = connectedPromoters.reduce((sum, promoter) => 
          sum + expressionLevels[promoter.id], 0
        );
        
        // Adjust by RBS strength if connected
        const connectedRBS = regulatoryElements.filter(element => 
          element.data.function === 'translation' && 
          connections[gene.id].includes(element.id)
        );
        
        if (connectedRBS.length > 0) {
          const rbsStrengthFactor = connectedRBS.reduce((factor, rbs) => {
            const strengthFactors = {
              low: 0.5,
              medium: 1.0,
              high: 2.0,
              'very high': 3.0
            };
            return factor * (strengthFactors[rbs.data.strength] || 1.0);
          }, 1.0);
          
          expressionLevel *= rbsStrengthFactor;
        }
      }
    }
    
    expressionLevels[gene.id] = Math.max(0, Math.min(100, expressionLevel));
  });
  
  return expressionLevels;
}

// Get the base activity level of a promoter
function getBasePromoterActivity(promoter) {
  const strengthLevels = {
    low: 20,
    medium: 50,
    high: 80,
    'very high': 100
  };
  
  return strengthLevels[promoter.data.strength] || 50;
}

// Modifies a circuit design to try to improve it
function modifyDesign(design, constraints) {
  const { nodes, edges } = design;
  
  // Clone the design
  const newNodes = JSON.parse(JSON.stringify(nodes));
  const newEdges = JSON.parse(JSON.stringify(edges));
  
  // Randomly choose a modification strategy
  const modificationStrategies = [
    'adjustPromoterStrength',
    'adjustRBSStrength',
    'addConnection',
    'removeConnection'
  ];
  
  const strategy = modificationStrategies[Math.floor(Math.random() * modificationStrategies.length)];
  
  switch (strategy) {
    case 'adjustPromoterStrength': {
      // Find promoters
      const promoters = newNodes.filter(node => node.type === 'promoter');
      
      if (promoters.length > 0) {
        // Select a random promoter
        const promoter = promoters[Math.floor(Math.random() * promoters.length)];
        
        // Adjust its strength
        const strengthLevels = ['low', 'medium', 'high', 'very high'];
        const currentIndex = strengthLevels.indexOf(promoter.data.strength);
        
        // Choose a different strength
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * strengthLevels.length);
        } while (newIndex === currentIndex);
        
        promoter.data.strength = strengthLevels[newIndex];
      }
      break;
    }
    
    case 'adjustRBSStrength': {
      // Find RBS elements
      const rbsElements = newNodes.filter(node => 
        node.type === 'regulatory' && 
        node.data.function === 'translation'
      );
      
      if (rbsElements.length > 0) {
        // Select a random RBS
        const rbs = rbsElements[Math.floor(Math.random() * rbsElements.length)];
        
        // Adjust its strength
        const strengthLevels = ['low', 'medium', 'high', 'very high'];
        const currentIndex = strengthLevels.indexOf(rbs.data.strength);
        
        // Choose a different strength
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * strengthLevels.length);
        } while (newIndex === currentIndex);
        
        rbs.data.strength = strengthLevels[newIndex];
      }
      break;
    }
    
    case 'addConnection': {
      // Find possible source and target nodes
      const possibleSources = newNodes.filter(node => 
        node.type === 'promoter' || 
        node.type === 'regulatory'
      );
      
      const possibleTargets = newNodes.filter(node => 
        node.type === 'gene'
      );
      
      if (possibleSources.length > 0 && possibleTargets.length > 0) {
        // Select random source and target
        const source = possibleSources[Math.floor(Math.random() * possibleSources.length)];
        const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        
        // Check if connection already exists
        const connectionExists = newEdges.some(edge => 
          edge.source === source.id && edge.target === target.id
        );
        
        if (!connectionExists) {
          // Add new edge
          newEdges.push({
            id: `e${Date.now()}`,
            source: source.id,
            target: target.id
          });
        }
      }
      break;
    }
    
    case 'removeConnection': {
      if (newEdges.length > 0) {
        // Select a random edge to remove
        const edgeIndex = Math.floor(Math.random() * newEdges.length);
        newEdges.splice(edgeIndex, 1);
      }
      break;
    }
  }
  
  return {
    nodes: newNodes,
    edges: newEdges
  };
}

// Optimizes protein expression
async function optimizeProteinExpression(geneSequence, hostOrganism, expressionGoal, constraints) {
  // TODO: Implement a more sophisticated protein expression optimization algorithm
  
  // For now, we'll focus on codon optimization, which is a key factor in protein expression
  
  // Get codon usage table for the selected organism
  const codonTable = getCodonUsageTable(hostOrganism);
  
  // Optimize the sequence
  const optimizedSequence = optimizeSequence(geneSequence, codonTable);
  
  // Calculate metrics
  const originalCAI = calculateCAI(geneSequence, codonTable);
  const optimizedCAI = calculateCAI(optimizedSequence, codonTable);
  
  // Predict expression improvement (simplified model)
  const predictedImprovement = optimizedCAI / originalCAI;
  
  return {
    originalSequence: geneSequence,
    optimizedSequence,
    organism: hostOrganism,
    metrics: {
      originalCAI,
      optimizedCAI,
      predictedExpressionImprovement: predictedImprovement
    },
    recommendations: [
      {
        type: 'codon_optimization',
        description: 'Codon optimization for improved translation efficiency',
        impact: 'high'
      },
      {
        type: 'promoter_selection',
        description: `For ${hostOrganism}, consider using a strong ${getRecommendedPromoter(hostOrganism)} promoter`,
        impact: 'high'
      },
      {
        type: 'rbs_selection',
        description: 'Use a strong ribosome binding site for increased translation initiation',
        impact: 'medium'
      }
    ]
  };
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
    yeast: {
      // Simplified yeast codon usage
      'AAA': 0.58, 'AAG': 0.42,
      'AAC': 0.59, 'AAT': 0.41,
      // Additional codons would be defined here
    },
    human: {
      // Simplified human codon usage
      'AAA': 0.43, 'AAG': 0.57,
      'AAC': 0.71, 'AAT': 0.29,
      // Additional codons would be defined here
    }
  };
  
  return tables[organism] || tables.e_coli;
}

// Optimize a DNA sequence based on codon usage table
function optimizeSequence(sequence, codonTable) {
  // Split into codons
  const codons = [];
  for (let i = 0; i < sequence.length; i += 3) {
    if (i + 3 <= sequence.length) {
      codons.push(sequence.substring(i, i + 3).toUpperCase());
    }
  }
  
  // Map codon to amino acid
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
  
  // Map amino acid to codons
  const aaToCodon = {};
  Object.entries(codonToAA).forEach(([codon, aa]) => {
    if (!aaToCodon[aa]) aaToCodon[aa] = [];
    aaToCodon[aa].push(codon);
  });
  
  // Optimize each codon
  const optimizedCodons = codons.map(codon => {
    const aa = codonToAA[codon];
    
    if (!aa) return codon; // Unknown codon
    
    const possibleCodons = aaToCodon[aa];
    
    if (possibleCodons.length <= 1) return codon; // Only one possible codon
    
    // Find the optimal codon
    let bestCodon = codon;
    let highestFreq = codonTable[codon] || 0;
    
    possibleCodons.forEach(possibleCodon => {
      const freq = codonTable[possibleCodon] || 0;
      
      if (freq > highestFreq) {
        highestFreq = freq;
        bestCodon = possibleCodon;
      }
    });
    
    return bestCodon;
  });
  
  return optimizedCodons.join('');
}

// Calculate Codon Adaptation Index (CAI)
function calculateCAI(sequence, codonTable) {
  // Split into codons
  const codons = [];
  for (let i = 0; i < sequence.length; i += 3) {
    if (i + 3 <= sequence.length) {
      codons.push(sequence.substring(i, i + 3).toUpperCase());
    }
  }
  
  // Calculate product of relative adaptiveness values
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

// Get recommended promoter for organism
function getRecommendedPromoter(organism) {
  const promoters = {
    e_coli: 'T7',
    yeast: 'GAL1',
    human: 'CMV'
  };
  
  return promoters[organism] || 'T7';
} 