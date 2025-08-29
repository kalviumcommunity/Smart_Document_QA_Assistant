const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const EmbeddingService = require('../services/embeddingService');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

class DocumentController {
  static async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { originalname, filename, size, mimetype } = req.file;
      const filePath = req.file.path;

      console.log(`Processing uploaded file: ${originalname}`);

      let text = '';
      if (mimetype === 'text/plain' || originalname.endsWith('.txt')) {
        text = fs.readFileSync(filePath, 'utf-8');
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Only text files are supported' });
      }

      const document = new Document({
        filename: originalname,
        originalText: text,
        fileSize: size,
        mimeType: mimetype,
        metadata: {
          processingStatus: 'processing'
        }
      });

      await document.save();
      fs.unlinkSync(filePath);

      const embeddingService = new EmbeddingService();
      const chunks = embeddingService.chunkText(text);
      
      console.log(`Created ${chunks.length} chunks for document ${document._id}`);

      const chunkPromises = chunks.map(async (chunkText, index) => {
        try {
          const embedding = await embeddingService.generateEmbedding(chunkText);
          
          const chunk = new Chunk({
            documentId: document._id,
            text: chunkText,
            embedding: embedding,
            chunkIndex: index,
            metadata: {
              startChar: 0,
              endChar: chunkText.length,
              tokenCount: Math.ceil(chunkText.length / 4)
            }
          });

          return await chunk.save();
        } catch (error) {
          console.error(`Error processing chunk ${index}:`, error);
          throw error;
        }
      });

      await Promise.all(chunkPromises);

      document.metadata.totalChunks = chunks.length;
      document.metadata.totalTokens = chunks.reduce((sum, chunk) => sum + Math.ceil(chunk.length / 4), 0);
      document.metadata.processingStatus = 'completed';
      await document.save();

      console.log(`Document ${document._id} processed successfully with ${chunks.length} chunks`);

      res.json({
        success: true,
        document: {
          id: document._id,
          filename: document.filename,
          fileSize: document.fileSize,
          totalChunks: document.metadata.totalChunks,
          totalTokens: document.metadata.totalTokens,
          processingStatus: document.metadata.processingStatus
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ 
        error: 'Failed to upload and process document',
        details: error.message 
      });
    }
  }

  static async listDocuments(req, res) {
    try {
      const documents = await Document.find({})
        .select('filename fileSize metadata createdAt')
        .sort({ createdAt: -1 });

      res.json({
        documents: documents.map(doc => ({
          id: doc._id,
          filename: doc.filename,
          fileSize: doc.fileSize,
          totalChunks: doc.metadata.totalChunks,
          totalTokens: doc.metadata.totalTokens,
          processingStatus: doc.metadata.processingStatus,
          createdAt: doc.createdAt
        })),
        total: documents.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error listing documents:', error);
      res.status(500).json({ 
        error: 'Failed to list documents',
        details: error.message 
      });
    }
  }

  static async getDocument(req, res) {
    try {
      const { id } = req.params;
      
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const chunks = await Chunk.find({ documentId: id })
        .select('text chunkIndex metadata')
        .sort({ chunkIndex: 1 });

      res.json({
        document: {
          id: document._id,
          filename: document.filename,
          fileSize: document.fileSize,
          totalChunks: document.metadata.totalChunks,
          totalTokens: document.metadata.totalTokens,
          processingStatus: document.metadata.processingStatus,
          createdAt: document.createdAt
        },
        chunks: chunks.map(chunk => ({
          id: chunk._id,
          text: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : ''),
          chunkIndex: chunk.chunkIndex,
          tokenCount: chunk.metadata.tokenCount
        })),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({ 
        error: 'Failed to get document',
        details: error.message 
      });
    }
  }

  static async queryDocument(req, res) {
    try {
      const { question, documentId, similarity_method = 'dot_product', topK = 5 } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      console.log(`Querying document with question: "${question}"`);

      const embeddingService = new EmbeddingService();
      const questionEmbedding = await embeddingService.generateEmbedding(question);

      const filter = documentId ? { documentId } : {};
      const chunks = await Chunk.find(filter).select('text embedding documentId metadata');

      if (chunks.length === 0) {
        return res.json({
          question,
          answer: 'No documents found to query.',
          relevantChunks: [],
          timestamp: new Date().toISOString()
        });
      }

      const SimilarityService = require('../services/similarityService');
      const embeddingsData = chunks.map(chunk => ({
        embedding: chunk.embedding,
        metadata: {
          chunkId: chunk._id,
          documentId: chunk.documentId,
          text: chunk.text,
          ...chunk.metadata
        }
      }));

      const similarChunks = SimilarityService.findMostSimilar(
        questionEmbedding,
        embeddingsData,
        similarity_method,
        topK
      );

      const context = similarChunks.map(chunk => chunk.metadata.text).join('\n\n');
      
      const answer = `Based on the document content, here's what I found regarding "${question}":

${context}

This information comes from ${similarChunks.length} relevant sections of the document(s).`;

      res.json({
        question,
        answer,
        relevantChunks: similarChunks.map(chunk => ({
          chunkId: chunk.metadata.chunkId,
          text: chunk.metadata.text.substring(0, 300) + '...',
          similarity: chunk.similarity,
          method: similarity_method
        })),
        metadata: {
          totalChunksSearched: chunks.length,
          similarityMethod: similarity_method,
          topK
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error querying document:', error);
      res.status(500).json({ 
        error: 'Failed to query document',
        details: error.message 
      });
    }
  }

  static async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      await Chunk.deleteMany({ documentId: id });
      await Document.findByIdAndDelete(id);

      console.log(`Deleted document ${id} and its chunks`);

      res.json({
        success: true,
        message: 'Document and associated chunks deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ 
        error: 'Failed to delete document',
        details: error.message 
      });
    }
  }

  static async generateEmbeddingDemo(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      console.log(`Generating embedding demo for text: "${text.substring(0, 50)}..."`);

      const embeddingService = new EmbeddingService();
      const startTime = Date.now();
      const embedding = await embeddingService.generateEmbedding(text);
      const endTime = Date.now();

      res.json({
        text,
        embedding: {
          values: embedding,
          dimensions: embedding.length,
          sample: embedding.slice(0, 10),
          statistics: {
            min: Math.min(...embedding),
            max: Math.max(...embedding),
            mean: embedding.reduce((sum, val) => sum + val, 0) / embedding.length
          }
        },
        metadata: {
          processingTime: endTime - startTime,
          textLength: text.length,
          estimatedTokens: Math.ceil(text.length / 4)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating embedding demo:', error);
      res.status(500).json({ 
        error: 'Failed to generate embedding',
        details: error.message 
      });
    }
  }
}

DocumentController.upload = upload.single('file');

module.exports = DocumentController;
