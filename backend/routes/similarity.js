const express = require('express');
const router = express.Router();
const SimilarityController = require('../controllers/similarityController');

router.post('/test', SimilarityController.testSimilarityFunctions);
router.post('/search', SimilarityController.searchSimilarChunks);
router.post('/compare', SimilarityController.compareAllMethods);

module.exports = router;
