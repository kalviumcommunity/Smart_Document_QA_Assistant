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
app.use('/api/similarity', similarityRoutes);

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
