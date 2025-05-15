const express = require('express');
const router = express.Router();
const {
  getGeneticComponents,
  getGeneticComponent,
  createGeneticComponent,
  updateGeneticComponent,
  deleteGeneticComponent,
  searchGeneticComponents
} = require('../controllers/geneticComponentsController');

// Get all genetic components and search
router.route('/').get(getGeneticComponents).post(createGeneticComponent);

// Search components
router.route('/search').get(searchGeneticComponents);

// Get, update, delete single component
router.route('/:id').get(getGeneticComponent).put(updateGeneticComponent).delete(deleteGeneticComponent);

module.exports = router; 