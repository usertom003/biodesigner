const Simulation = require('../models/Simulation');
const Design = require('../models/Design');

// Simulation engine
const simulateGeneExpression = (nodes, edges, duration, timeStep) => {
  // Find reporter genes (GFP, RFP, etc.)
  const reporters = nodes.filter((node) => node.type === 'gene' && node.data.function === 'reporter');

  // Find repressors
  const repressors = nodes.filter((node) => node.type === 'gene' && node.data.function === 'repressor');

  // Find promoters
  const promoters = nodes.filter((node) => node.type === 'promoter');

  // Create a map of connections
  const connections = {};
  edges.forEach((edge) => {
    if (!connections[edge.target]) {
      connections[edge.target] = [];
    }
    connections[edge.target].push(edge.source);
  });

  // Generate time-series data
  const timePoints = [];
  const totalPoints = Math.floor(duration / timeStep);

  for (let i = 0; i <= totalPoints; i++) {
    const time = i * timeStep;
    const dataPoint = { time };
    const values = new Map();

    reporters.forEach((reporter) => {
      const reporterName = reporter.data.name;

      // Find if this reporter is connected to a promoter
      let connectedPromoter = null;
      if (connections[reporter.id]) {
        const sourceIds = connections[reporter.id];
        connectedPromoter = promoters.find((p) => sourceIds.includes(p.id));
      }

      // Calculate expression level based on promoter strength and time
      let expressionLevel = 0;

      if (connectedPromoter) {
        const baseStrength = {
          low: 20,
          medium: 50,
          high: 80,
          'very high': 100,
        }[connectedPromoter.data.strength || 'medium'];

        // Add some noise and time-dependent behavior
        const noise = Math.sin(time * 0.1) * 10 + Math.random() * 5;
        expressionLevel = baseStrength + noise;

        // If the promoter is inducible, check if it's being repressed
        if (connectedPromoter.data.inducible) {
          // Find if any repressor targets this promoter
          const repressorsTargetingThisPromoter = repressors.filter(
            (repressor) =>
              repressor.data.targets && repressor.data.targets.includes(connectedPromoter.data.id)
          );

          if (repressorsTargetingThisPromoter.length > 0) {
            // Apply repression
            expressionLevel *= 0.3;
          }
        }

        // Ensure expression level is within bounds
        expressionLevel = Math.max(0, Math.min(100, expressionLevel));
      }

      values.set(reporterName, expressionLevel);
    });

    dataPoint.values = values;
    timePoints.push(dataPoint);
  }

  // Calculate basic statistics
  const statistics = {
    reporters: {},
  };

  reporters.forEach((reporter) => {
    const reporterName = reporter.data.name;
    const values = timePoints.map((point) => point.values.get(reporterName) || 0);
    
    statistics.reporters[reporterName] = {
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
    };
  });

  return {
    timePoints,
    statistics,
  };
};

// @desc    Get all simulations
// @route   GET /api/simulations
// @access  Public (should be Private in production)
exports.getSimulations = async (req, res) => {
  try {
    const { limit = 20, page = 1, designId } = req.query;
    
    // Build query
    const query = {};
    
    if (designId) {
      query.designId = designId;
    }
    
    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    
    const simulations = await Simulation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    
    const total = await Simulation.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: simulations.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      page: parseInt(page, 10),
      data: simulations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch simulations',
      error: error.message
    });
  }
};

// @desc    Get single simulation
// @route   GET /api/simulations/:id
// @access  Public (should be Private in production)
exports.getSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: simulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch simulation',
      error: error.message
    });
  }
};

// @desc    Create and run a simulation
// @route   POST /api/simulations
// @access  Public (should be Private in production)
exports.createSimulation = async (req, res) => {
  try {
    const { designId, name, description, duration = 100, timeStep = 0.1, method = 'stochastic' } = req.body;
    
    // Validate inputs
    if (!designId) {
      return res.status(400).json({
        success: false,
        message: 'Design ID is required'
      });
    }
    
    // Find the design
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }
    
    // Create simulation
    const simulation = new Simulation({
      designId,
      name: name || `Simulation of ${design.name}`,
      description: description || `Stochastic simulation of gene expression in ${design.name}`,
      status: 'running',
      method,
      duration,
      timeStep,
      parameters: {
        // Additional parameters could be added here
      },
      results: {
        timePoints: [],
        statistics: {}
      }
    });
    
    // Save initial state
    await simulation.save();
    
    // Run simulation
    try {
      const simulationResults = simulateGeneExpression(
        design.nodes,
        design.edges,
        duration,
        timeStep
      );
      
      // Update with results
      simulation.results = simulationResults;
      simulation.status = 'completed';
      await simulation.save();
      
      res.status(201).json({
        success: true,
        data: simulation
      });
    } catch (simulationError) {
      // Update status if simulation fails
      simulation.status = 'failed';
      simulation.parameters.error = simulationError.message;
      await simulation.save();
      
      throw simulationError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create or run simulation',
      error: error.message
    });
  }
};

// @desc    Delete simulation
// @route   DELETE /api/simulations/:id
// @access  Public (should be Private in production)
exports.deleteSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findByIdAndDelete(req.params.id);
    
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete simulation',
      error: error.message
    });
  }
}; 