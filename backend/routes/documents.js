const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/documentController');

router.post('/upload', DocumentController.upload, DocumentController.uploadDocument);
router.get('/', DocumentController.listDocuments);
router.get('/:id', DocumentController.getDocument);
router.post('/query', DocumentController.queryDocument);
router.delete('/:id', DocumentController.deleteDocument);
router.post('/embedding-demo', DocumentController.generateEmbeddingDemo);

module.exports = router;
