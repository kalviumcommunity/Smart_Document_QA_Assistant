const VectorDatabaseService = require('../services/vectorDatabaseService');
const EmbeddingService = require('../services/embeddingService');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

class VectorController {
  static async uploadToVectorDB(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { originalname, filename, size, mimetype } = req.file;
      const filePath = req.file.path;

      let text = '';
      if (mimetype === 'text/plain' || originalname.endsWith('.txt')) {
        text = fs.readFileSync(filePath, 'utf-8');
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Only text files are supported' });
      }

      const vectorDB = new VectorDatabaseService();
      const embeddingService = new EmbeddingService();

      const document = await vectorDB.insertDocument(originalname, text, size, mimetype);
      fs.unlinkSync(filePath);

      const chunks = embeddingService.chunkText(text);
      console.log(`Created ${chunks.length} chunks for document ${document.id}`);

      const chunksWithEmbeddings = [];
      for (let i = 0; i < chunks.length; i++) {
        try {
          const embedding = await embeddingService.generateEmbedding(chunks[i]);
          chunksWithEmbeddings.push({
            text: chunks[i],
            embedding: embedding,
            metadata: {
              startChar: 0,
              endChar: chunks[i].length,
              tokenCount: Math.ceil(chunks[i].length / 4)
            }
          });
        } catch (error) {
          console.error(`Error processing chunk ${i}:`, error);
        }
      }

      await vectorDB.insertBatchVectorChunks(document.id, chunksWithEmbeddings);

      console.log(`Document ${document.id} processed and stored in vector database`);

      res.json({
        success: true,
        document: {
          id: document.id,
          filename: document.filename,
          fileSize: size,
          totalChunks: chunksWithEmbeddings.length,
          processingStatus: 'completed'
        },
        vectorDatabase: 'PostgreSQL + pgvector',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error uploading to vector database:', error);
      res.status(500).json({ 
        error: 'Failed to upload to vector database',
        details: error.message 
      });
    }
  }

  static async searchVectors(req, res) {
    try {
      const { 
        query, 
        similarity_method = 'cosine', 
        limit = 5,
        document_id = null 
      } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const vectorDB = new VectorDatabaseService();
      const embeddingService = new EmbeddingService();

      console.log(`Searching vectors for: "${query}" using ${similarity_method}`);

      const queryEmbedding = await embeddingService.generateEmbedding(query);

      let results;
      if (document_id) {
        results = await vectorDB.searchSimilarInDocument(
          document_id, 
          queryEmbedding, 
          limit, 
          similarity_method
        );
      } else {
        results = await vectorDB.searchSimilarVectors(
          queryEmbedding, 
          limit, 
          similarity_method
        );
      }

      const formattedResults = results.map(result => ({
        id: result.id,
        documentId: result.documentId,
        filename: result.filename,
        chunkText: result.chunkText.substring(0, 300) + (result.chunkText.length > 300 ? '...' : ''),
        chunkIndex: result.chunkIndex,
        similarity: result.similarity,
        distance: result.distance,
        method: similarity_method
      }));

      res.json({
        query,
        similarity_method,
        limit,
        document_id,
        results: formattedResults,
        metadata: {
          totalResults: results.length,
          vectorDatabase: 'PostgreSQL + pgvector',
          embeddingDimensions: queryEmbedding.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error searching vectors:', error);
      res.status(500).json({ 
        error: 'Failed to search vectors',
        details: error.message 
      });
    }
  }

  static async getVectorDocuments(req, res) {
    try {
      const vectorDB = new VectorDatabaseService();
      const documents = await vectorDB.getDocuments();

      res.json({
        documents: documents.map(doc => ({
          id: doc.id,
          filename: doc.filename,
          fileSize: doc.file_size,
          mimeType: doc.mime_type,
          totalChunks: doc.total_chunks,
          processingStatus: doc.processing_status,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at
        })),
        total: documents.length,
        vectorDatabase: 'PostgreSQL + pgvector',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting vector documents:', error);
      res.status(500).json({ 
        error: 'Failed to get vector documents',
        details: error.message 
      });
    }
  }

  static async getVectorDocument(req, res) {
    try {
      const { id } = req.params;
      const vectorDB = new VectorDatabaseService();

      const document = await vectorDB.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const chunks = await vectorDB.getDocumentChunks(id, 20);

      res.json({
        document: {
          id: document.id,
          filename: document.filename,
          fileSize: document.file_size,
          mimeType: document.mime_type,
          totalChunks: document.total_chunks,
          processingStatus: document.processing_status,
          createdAt: document.created_at,
          chunkCount: document.chunk_count
        },
        chunks: chunks.map(chunk => ({
          id: chunk.id,
          text: chunk.chunk_text.substring(0, 200) + (chunk.chunk_text.length > 200 ? '...' : ''),
          chunkIndex: chunk.chunk_index,
          metadata: chunk.metadata,
          createdAt: chunk.created_at
        })),
        vectorDatabase: 'PostgreSQL + pgvector',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting vector document:', error);
      res.status(500).json({ 
        error: 'Failed to get vector document',
        details: error.message 
      });
    }
  }

  static async deleteVectorDocument(req, res) {
    try {
      const { id } = req.params;
      const vectorDB = new VectorDatabaseService();

      const deletedDoc = await vectorDB.deleteDocument(id);

      res.json({
        success: true,
        message: `Document "${deletedDoc.filename}" and all associated vectors deleted`,
        vectorDatabase: 'PostgreSQL + pgvector',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error deleting vector document:', error);
      res.status(500).json({ 
        error: 'Failed to delete vector document',
        details: error.message 
      });
    }
  }

  static async getVectorStats(req, res) {
    try {
      const vectorDB = new VectorDatabaseService();
      const stats = await vectorDB.getVectorDatabaseStats();

      res.json({
        vectorDatabase: 'PostgreSQL + pgvector',
        statistics: stats,
        capabilities: {
          vectorOperations: ['cosine_similarity', 'euclidean_distance', 'dot_product'],
          indexTypes: ['IVFFlat', 'HNSW'],
          maxDimensions: 16000,
          supportedTypes: ['vector', 'halfvec', 'sparsevec']
        },
        performance: {
          indexedSearch: true,
          approximateNearestNeighbor: true,
          exactSearch: true
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting vector stats:', error);
      res.status(500).json({ 
        error: 'Failed to get vector statistics',
        details: error.message 
      });
    }
  }

  static async compareVectorOperations(req, res) {
    try {
      const { vector1, vector2 } = req.body;

      if (!vector1 || !vector2 || !Array.isArray(vector1) || !Array.isArray(vector2)) {
        return res.status(400).json({ error: 'Two arrays of numbers are required' });
      }

      if (vector1.length !== vector2.length) {
        return res.status(400).json({ error: 'Vectors must have the same dimensions' });
      }

      const vectorDB = new VectorDatabaseService();

      const operations = ['cosine_similarity', 'euclidean_distance', 'dot_product'];
      const results = {};

      for (const operation of operations) {
        const result = await vectorDB.performVectorOperations(vector1, vector2, operation);
        results[operation] = result;
      }

      res.json({
        vector1: vector1.slice(0, 5).concat(['...']),
        vector2: vector2.slice(0, 5).concat(['...']),
        dimensions: vector1.length,
        results,
        explanations: {
          cosine_similarity: 'Measures angle between vectors (0-1, higher = more similar)',
          euclidean_distance: 'Straight-line distance between vectors (lower = more similar)',
          dot_product: 'Sum of element-wise multiplication (higher = more similar)'
        },
        vectorDatabase: 'PostgreSQL + pgvector',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error comparing vector operations:', error);
      res.status(500).json({ 
        error: 'Failed to compare vector operations',
        details: error.message 
      });
    }
  }

  static async initializeVectorDB(req, res) {
    try {
      const vectorDB = new VectorDatabaseService();
      await vectorDB.dbConfig.initializeDatabase();

      res.json({
        success: true,
        message: 'Vector database initialized successfully',
        vectorDatabase: 'PostgreSQL + pgvector',
        features: [
          'pgvector extension enabled',
          'Vector similarity search',
          'Cosine, L2, and dot product distance metrics',
          'IVFFlat indexing for performance',
          'JSONB metadata support'
        ],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error initializing vector database:', error);
      res.status(500).json({ 
        error: 'Failed to initialize vector database',
        details: error.message 
      });
    }
  }
}

VectorController.upload = upload.single('file');

module.exports = VectorController;
