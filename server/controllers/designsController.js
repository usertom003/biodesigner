const Design = require('../models/Design');

// @desc    Get all designs
// @route   GET /api/designs
// @access  Public (should be Private in production)
exports.getDesigns = async (req, res) => {
  try {
    const { limit = 20, page = 1, isPublic } = req.query;
    
    // Build query
    const query = {};
    
    if (isPublic === 'true') {
      query.isPublic = true;
    }
    
    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    
    const designs = await Design.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    
    const total = await Design.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: designs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      page: parseInt(page, 10),
      data: designs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch designs',
      error: error.message
    });
  }
};

// @desc    Get single design
// @route   GET /api/designs/:id
// @access  Public (should be Private in production)
exports.getDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: design
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch design',
      error: error.message
    });
  }
};

// @desc    Create new design
// @route   POST /api/designs
// @access  Public (should be Private in production)
exports.createDesign = async (req, res) => {
  try {
    const design = await Design.create(req.body);
    
    res.status(201).json({
      success: true,
      data: design
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create design',
      error: error.message
    });
  }
};

// @desc    Update design
// @route   PUT /api/designs/:id
// @access  Public (should be Private in production)
exports.updateDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: design
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update design',
      error: error.message
    });
  }
};

// @desc    Delete design
// @route   DELETE /api/designs/:id
// @access  Public (should be Private in production)
exports.deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete design',
      error: error.message
    });
  }
};

// @desc    Clone a design
// @route   POST /api/designs/:id/clone
// @access  Public (should be Private in production)
exports.cloneDesign = async (req, res) => {
  try {
    const sourceDesign = await Design.findById(req.params.id);
    
    if (!sourceDesign) {
      return res.status(404).json({
        success: false,
        message: 'Source design not found'
      });
    }
    
    // Create a new design based on the source, but with a new name
    const newDesign = new Design({
      name: `${sourceDesign.name} (clone)`,
      description: sourceDesign.description,
      nodes: sourceDesign.nodes,
      edges: sourceDesign.edges,
      createdBy: req.body.createdBy || 'admin',
      isPublic: false,
      tags: sourceDesign.tags
    });
    
    await newDesign.save();
    
    res.status(201).json({
      success: true,
      data: newDesign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clone design',
      error: error.message
    });
  }
}; 