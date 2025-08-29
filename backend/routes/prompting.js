const express = require('express');
const router = express.Router();
const PromptingController = require('../controllers/promptingController');

router.post('/multi-shot', PromptingController.generateMultiShotPrompt);
router.post('/one-shot', PromptingController.generateOneShotPrompt);
router.post('/zero-shot', PromptingController.generateZeroShotPrompt);
router.post('/chain-of-thought', PromptingController.generateChainOfThoughtPrompt);
router.post('/compare', PromptingController.comparePromptingTechniques);
router.post('/demonstrate', PromptingController.demonstrateMultiShotEvolution);
router.post('/adaptive', PromptingController.generateAdaptivePrompt);

module.exports = router;
