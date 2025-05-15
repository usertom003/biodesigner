const GeneticComponent = require('../models/GeneticComponent');

// @desc    Get all genetic components
// @route   GET /api/components
// @access  Public
exports.getGeneticComponents = async (req, res) => {
  try {
    const { type, limit = 20, page = 1, search, verified } = req.query;
    
    // Build query
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (verified === 'true') {
      query.verified = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    
    const components = await GeneticComponent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    
    const total = await GeneticComponent.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: components.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      page: parseInt(page, 10),
      data: components
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genetic components',
      error: error.message
    });
  }
};

// @desc    Get single genetic component
// @route   GET /api/components/:id
// @access  Public
exports.getGeneticComponent = async (req, res) => {
  try {
    const component = await GeneticComponent.findById(req.params.id);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Genetic component not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genetic component',
      error: error.message
    });
  }
};

// @desc    Create new genetic component
// @route   POST /api/components
// @access  Public (should be Private in production)
exports.createGeneticComponent = async (req, res) => {
  try {
    const component = await GeneticComponent.create(req.body);
    
    res.status(201).json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create genetic component',
      error: error.message
    });
  }
};

// @desc    Update genetic component
// @route   PUT /api/components/:id
// @access  Public (should be Private in production)
exports.updateGeneticComponent = async (req, res) => {
  try {
    const component = await GeneticComponent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Genetic component not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update genetic component',
      error: error.message
    });
  }
};

// @desc    Delete genetic component
// @route   DELETE /api/components/:id
// @access  Public (should be Private in production)
exports.deleteGeneticComponent = async (req, res) => {
  try {
    const component = await GeneticComponent.findByIdAndDelete(req.params.id);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Genetic component not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete genetic component',
      error: error.message
    });
  }
};

// @desc    Search genetic components
// @route   GET /api/components/search
// @access  Public
exports.searchGeneticComponents = async (req, res) => {
  try {
    const { query, type, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Build search query
    const searchQuery = {
      $text: { $search: query }
    };
    
    if (type) {
      searchQuery.type = type;
    }
    
    const components = await GeneticComponent.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit, 10));
    
    res.status(200).json({
      success: true,
      count: components.length,
      data: components
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search genetic components',
      error: error.message
    });
  }
}; 