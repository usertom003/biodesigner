const GeneticComponent = require('../models/GeneticComponent');

// Mock external database APIs
const EXTERNAL_DATABASES = {
  IGEM: 'iGEM Registry',
  ADDGENE: 'Addgene',
  NCBI: 'NCBI GenBank',
  UNIPROT: 'UniProt',
  KEGG: 'KEGG'
};

// @desc    Search components in external databases
// @route   GET /api/search/external
// @access  Public
exports.searchExternalDatabases = async (req, res) => {
  try {
    const { query, database = 'all', type, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // This is a mock implementation. In a real scenario, you would connect to actual external APIs.
    const results = await mockExternalDatabaseSearch(query, database, type, limit);
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search external databases',
      error: error.message
    });
  }
};

// @desc    Import component from external database
// @route   POST /api/search/import
// @access  Public (should be Private in production)
exports.importFromExternalDatabase = async (req, res) => {
  try {
    const { externalId, database, type } = req.body;
    
    if (!externalId || !database || !type) {
      return res.status(400).json({
        success: false,
        message: 'External ID, database, and type are required'
      });
    }
    
    // Check if component already exists in our database
    const existingComponent = await GeneticComponent.findOne({
      sourceId: externalId,
      source: database
    });
    
    if (existingComponent) {
      return res.status(200).json({
        success: true,
        message: 'Component already exists in database',
        data: existingComponent
      });
    }
    
    // This is a mock implementation. In a real scenario, you would fetch from actual external APIs.
    const externalComponent = await mockFetchExternalComponent(externalId, database, type);
    
    if (!externalComponent) {
      return res.status(404).json({
        success: false,
        message: 'Component not found in external database'
      });
    }
    
    // Create component in our database
    const newComponent = await GeneticComponent.create({
      name: externalComponent.name,
      type: externalComponent.type,
      description: externalComponent.description,
      sequence: externalComponent.sequence,
      properties: externalComponent.properties,
      source: database,
      sourceId: externalId,
      verified: true
    });
    
    res.status(201).json({
      success: true,
      data: newComponent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to import component',
      error: error.message
    });
  }
};

// @desc    Get available databases
// @route   GET /api/search/databases
// @access  Public
exports.getDatabases = async (req, res) => {
  try {
    const databases = Object.entries(EXTERNAL_DATABASES).map(([id, name]) => ({
      id,
      name
    }));
    
    res.status(200).json({
      success: true,
      count: databases.length,
      data: databases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch databases',
      error: error.message
    });
  }
};

// Mock implementation of external database search
// In a real implementation, this would be replaced with actual API calls to external databases
async function mockExternalDatabaseSearch(query, database, type, limit) {
  // Sample data - in a real implementation, this would be fetched from external APIs
  const mockResults = {
    promoters: [
      {
        id: 'BBa_R0010',
        name: 'LacI-responsive promoter',
        type: 'promoter',
        database: 'IGEM',
        description: 'LacI-repressible promoter',
        preview: 'CAATACGCAAACCGCCTCTCCCCGCGCGTT...',
        properties: {
          strength: 'medium',
          inducible: true,
          inducer: 'IPTG'
        }
      },
      {
        id: 'BBa_J23100',
        name: 'J23100 Constitutive Promoter',
        type: 'promoter',
        database: 'IGEM',
        description: 'Anderson promoter - constitutive, medium strength',
        preview: 'TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC',
        properties: {
          strength: 'medium',
          inducible: false
        }
      }
    ],
    genes: [
      {
        id: 'BBa_E0040',
        name: 'GFP (Green Fluorescent Protein)',
        type: 'gene',
        database: 'IGEM',
        description: 'GFP derived from Aequorea victoria',
        preview: 'ATGCGTAAAGGAGAAGAACTTTTCACTGGA...',
        properties: {
          function: 'reporter',
          color: 'green'
        }
      },
      {
        id: 'BBa_E1010',
        name: 'RFP (Red Fluorescent Protein)',
        type: 'gene',
        database: 'IGEM',
        description: 'RFP derived from Discosoma sp.',
        preview: 'ATGGCTTCCTCCGAAGACGTTATCAAAGAG...',
        properties: {
          function: 'reporter',
          color: 'red'
        }
      }
    ],
    terminators: [
      {
        id: 'BBa_B0010',
        name: 'T1 Terminator',
        type: 'terminator',
        database: 'IGEM',
        description: 'Rho-independent terminator from E. coli rrnB',
        preview: 'CCAGGCATCAAATAAAACGAAAGGCTCAGTCG...',
        properties: {
          efficiency: 'medium'
        }
      }
    ],
    regulatory: [
      {
        id: 'BBa_B0034',
        name: 'RBS (Ribosome Binding Site)',
        type: 'regulatory',
        database: 'IGEM',
        description: 'Medium strength ribosome binding site',
        preview: 'AAAGAGGAGAAA',
        properties: {
          function: 'translation',
          strength: 'medium'
        }
      }
    ]
  };
  
  // Filter by type if specified
  let results = [];
  if (type && mockResults[type]) {
    results = [...mockResults[type]];
  } else {
    // Combine all results
    Object.values(mockResults).forEach(items => {
      results = [...results, ...items];
    });
  }
  
  // Filter by database if specified and not 'all'
  if (database !== 'all') {
    results = results.filter(item => item.database.toUpperCase() === database.toUpperCase());
  }
  
  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery) ||
      item.id.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Apply limit
  return results.slice(0, parseInt(limit, 10));
}

// Mock implementation of fetching a component from an external database
// In a real implementation, this would be replaced with actual API calls
async function mockFetchExternalComponent(externalId, database, type) {
  // Full sequence data for components
  const mockComponents = {
    'BBa_R0010': {
      name: 'LacI-responsive promoter',
      type: 'promoter',
      database: 'IGEM',
      description: 'LacI-repressible promoter',
      sequence: 'CAATACGCAAACCGCCTCTCCCCGCGCGTTGGCCGATTCATTAATGCAGCTGGCACGACAGGTTTCCCGACTGGAAAGCGGGCAGTGAGCGCAACGCAATTAATGTGAGTTAGCTCACTCATTAGGCACCCCAGGCTTTACACTTTATGCTTCCGGCTCGTATGTTGTGTGGAATTGTGAGCGGATAACAATTTCACACA',
      properties: {
        strength: 'medium',
        inducible: true,
        inducer: 'IPTG'
      }
    },
    'BBa_E0040': {
      name: 'GFP (Green Fluorescent Protein)',
      type: 'gene',
      database: 'IGEM',
      description: 'GFP derived from Aequorea victoria',
      sequence: 'ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCACAAATTTTCTGTCAGTGGAGAGGGTGAAGGTGATGCAACATACGGAAAACTTACCCTTAAATTTATTTGCACTACTGGAAAACTACCTGTTCCATGGCCAACACTTGTCACTACTTTCGGTTATGGTGTTCAATGCTTTGCGAGATACCCAGATCATATGAAACAGCATGACTTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACAGGAAAGAACTATATTTTTCAAAGATGACGGGAACTACAAGACACGTGCTGAAGTCAAGTTTGAAGGTGATACCCTTGTTAATAGAATCGAGTTAAAAGGTATTGATTTTAAAGAAGATGGAAACATTCTTGGACACAAATTGGAATACAACTATAACTCACACAATGTATACATCATGGCAGACAAACAAAAGAATGGAATCAAAGTTAACTTCAAAATTAGACACAACATTGAAGATGGAAGCGTTCAACTAGCAGACCATTATCAACAAAATACTCCAATTGGCGATGGCCCTGTCCTTTTACCAGACAACCATTACCTGTCCACACAATCTGCCCTTTCGAAAGATCCCAACGAAAAGAGAGACCACATGGTCCTTCTTGAGTTTGTAACAGCTGCTGGGATTACACATGGCATGGATGAACTATACAAATAATAA',
      properties: {
        function: 'reporter',
        color: 'green'
      }
    },
    'BBa_B0010': {
      name: 'T1 Terminator',
      type: 'terminator',
      database: 'IGEM',
      description: 'Rho-independent terminator from E. coli rrnB',
      sequence: 'CCAGGCATCAAATAAAACGAAAGGCTCAGTCGAAAGACTGGGCCTTTCGTTTTATCTGTTGTTTGTCGGTGAACGCTCTC',
      properties: {
        efficiency: 'medium'
      }
    },
    'BBa_B0034': {
      name: 'RBS (Ribosome Binding Site)',
      type: 'regulatory',
      database: 'IGEM',
      description: 'Medium strength ribosome binding site',
      sequence: 'AAAGAGGAGAAA',
      properties: {
        function: 'translation',
        strength: 'medium'
      }
    }
  };
  
  // Return component if found
  return mockComponents[externalId] || null;
} 