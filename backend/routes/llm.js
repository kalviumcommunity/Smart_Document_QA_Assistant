const express = require('express');
const router = express.Router();
const LLMController = require('../controllers/llmController');

router.post('/structured', LLMController.generateStructuredResponse);
router.post('/generate', LLMController.generateWithParameters);
router.post('/analyze-document', LLMController.analyzeDocument);
router.post('/evaluate', LLMController.evaluateResponse);
router.post('/compare-similarity', LLMController.compareSimilarity);
router.get('/schemas', LLMController.getAvailableSchemas);
router.post('/demonstrate', LLMController.demonstrateStructuredOutput);

module.exports = router;
