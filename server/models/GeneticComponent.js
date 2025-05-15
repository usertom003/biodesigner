const mongoose = require('mongoose');

const GeneticComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Component type is required'],
    enum: ['promoter', 'gene', 'terminator', 'regulatory'],
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  sequence: {
    type: String,
    required: [true, 'DNA sequence is required'],
    trim: true
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  source: {
    type: String,
    default: 'user-defined'
  },
  sourceId: {
    type: String,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes for efficient searching
GeneticComponentSchema.index({ name: 'text', description: 'text', sequence: 'text' });

module.exports = mongoose.model('GeneticComponent', GeneticComponentSchema); 