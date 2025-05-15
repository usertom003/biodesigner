const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

// Import routes
const geneticComponentsRoutes = require('./routes/geneticComponents');
const designsRoutes = require('./routes/designs');
const simulationsRoutes = require('./routes/simulations');
const sequenceRoutes = require('./routes/sequences');
const optimizationRoutes = require('./routes/optimization');
const databaseSearchRoutes = require('./routes/databaseSearch');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/components', geneticComponentsRoutes);
app.use('/api/designs', designsRoutes);
app.use('/api/simulations', simulationsRoutes);
app.use('/api/sequences', sequenceRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/search', databaseSearchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 