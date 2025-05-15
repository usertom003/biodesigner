const mongoose = require('mongoose');

const DataPointSchema = new mongoose.Schema({
  time: {
    type: Number,
    required: true
  },
  values: {
    type: Map,
    of: Number,
    default: {}
  }
}, { _id: false });

const SimulationSchema = new mongoose.Schema({
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: [true, 'Design ID is required']
  },
  name: {
    type: String,
    required: [true, 'Simulation name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['stochastic', 'deterministic', 'hybrid'],
    default: 'stochastic'
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  results: {
    timePoints: [DataPointSchema],
    statistics: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  duration: {
    type: Number,
    default: 100 // simulation duration in seconds
  },
  timeStep: {
    type: Number,
    default: 0.1 // simulation time step
  },
  createdBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Simulation', SimulationSchema); 