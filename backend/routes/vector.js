const express = require('express');
const router = express.Router();
const VectorController = require('../controllers/vectorController');

router.post('/upload', VectorController.upload, VectorController.uploadToVectorDB);
router.post('/search', VectorController.searchVectors);
router.get('/documents', VectorController.getVectorDocuments);
router.get('/documents/:id', VectorController.getVectorDocument);
router.delete('/documents/:id', VectorController.deleteVectorDocument);
router.get('/stats', VectorController.getVectorStats);
router.post('/compare', VectorController.compareVectorOperations);
router.post('/initialize', VectorController.initializeVectorDB);

module.exports = router;
