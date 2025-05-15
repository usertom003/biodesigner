const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['promoter', 'gene', 'terminator', 'regulatory']
  },
  position: {
    x: Number,
    y: Number
  },
  data: mongoose.Schema.Types.Mixed
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  sourceHandle: String,
  targetHandle: String,
  type: String,
  data: mongoose.Schema.Types.Mixed
}, { _id: false });

const DesignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Design name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  nodes: {
    type: [NodeSchema],
    default: []
  },
  edges: {
    type: [EdgeSchema],
    default: []
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Design', DesignSchema); 