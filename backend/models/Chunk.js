const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 10000
  },
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length > 0 && arr.every(num => typeof num === 'number');
      },
      message: 'Embedding must be an array of numbers'
    }
  },
  chunkIndex: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    startChar: { type: Number, default: 0 },
    endChar: { type: Number, default: 0 },
    tokenCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

chunkSchema.index({ documentId: 1, chunkIndex: 1 });

module.exports = mongoose.model('Chunk', chunkSchema);
