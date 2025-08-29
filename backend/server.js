const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const similarityRoutes = require('./routes/similarity');
const promptRoutes = require('./routes/prompts');
const documentRoutes = require('./routes/documents');
const promptingRoutes = require('./routes/prompting');

app.use('/api/similarity', similarityRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/prompting', promptingRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Smart Document Q&A Assistant Backend'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Document Q&A Assistant API',
    version: '1.0.0',
    endpoints: {
      similarity: {
        'POST /api/similarity/test': 'Test similarity functions with sample vectors',
        'POST /api/similarity/search': 'Search for similar document chunks',
        'POST /api/similarity/compare': 'Compare all similarity methods'
      },
      prompts: {
        'POST /api/prompts/generate': 'Generate dynamic prompt based on context',
        'POST /api/prompts/test-variations': 'Test prompt variations for different expertise levels',
        'POST /api/prompts/analyze-question': 'Analyze question type and complexity',
        'POST /api/prompts/demonstrate': 'Demonstrate dynamic prompt adaptation'
      },
      documents: {
        'POST /api/documents/upload': 'Upload document and generate embeddings',
        'GET /api/documents': 'List all documents',
        'GET /api/documents/:id': 'Get document details and chunks',
        'POST /api/documents/query': 'Query documents using embeddings',
        'DELETE /api/documents/:id': 'Delete document and chunks',
        'POST /api/documents/embedding-demo': 'Generate embedding for demo text'
      },
      prompting: {
        'POST /api/prompting/zero-shot': 'Generate zero-shot prompt',
        'POST /api/prompting/one-shot': 'Generate one-shot prompt with example',
        'POST /api/prompting/multi-shot': 'Generate multi-shot prompt with multiple examples',
        'POST /api/prompting/chain-of-thought': 'Generate chain-of-thought reasoning prompt',
        'POST /api/prompting/compare': 'Compare all prompting techniques',
        'POST /api/prompting/demonstrate': 'Demonstrate multi-shot evolution',
        'POST /api/prompting/adaptive': 'Generate adaptive prompt based on user level'
      }
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
    });
} else {
  console.warn('⚠️  MONGODB_URI not provided. Database features will not work.');
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API documentation: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
