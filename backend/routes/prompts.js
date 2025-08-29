const express = require('express');
const router = express.Router();
const PromptController = require('../controllers/promptController');

router.post('/generate', PromptController.generateDynamicPrompt);
router.post('/test-variations', PromptController.testPromptVariations);
router.post('/analyze-question', PromptController.analyzeQuestion);
router.post('/demonstrate', PromptController.demonstrateAdaptation);

module.exports = router;
