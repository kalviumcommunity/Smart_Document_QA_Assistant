const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: 'text/plain'
  },
  metadata: {
    totalChunks: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    processingStatus: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    embeddingModel: { type: String, default: 'embedding-001' }
  }
}, {
  timestamps: true
});

documentSchema.index({ filename: 1 });
documentSchema.index({ 'metadata.processingStatus': 1 });

module.exports = mongoose.model('Document', documentSchema);
