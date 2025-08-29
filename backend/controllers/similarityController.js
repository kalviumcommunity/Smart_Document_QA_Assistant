const SimilarityService = require('../services/similarityService');
const EmbeddingService = require('../services/embeddingService');
const Chunk = require('../models/Chunk');

class SimilarityController {
  static async testSimilarityFunctions(req, res) {
    try {
      const { 
        vectorA = [1, 2, 3, 4, 5], 
        vectorB = [2, 3, 4, 5, 6],
        method = 'dot_product'
      } = req.body;

      console.log(`Testing ${method} similarity with vectors:`, { vectorA, vectorB });

      let result;
      let explanation;

      switch (method.toLowerCase()) {
        case 'dot_product':
          result = SimilarityService.dotProductSimilarity(vectorA, vectorB);
          explanation = {
            formula: "A · B = Σ(Ai * Bi)",
            calculation: vectorA.map((a, i) => `${a} × ${vectorB[i]} = ${a * vectorB[i]}`).join(' + '),
            interpretation: "Higher values indicate greater similarity"
          };
          break;
        
        case 'cosine':
          result = SimilarityService.cosineSimilarity(vectorA, vectorB);
          explanation = {
            formula: "cos(θ) = (A · B) / (||A|| × ||B||)",
            interpretation: "Range: [-1, 1]. 1 = identical, 0 = orthogonal, -1 = opposite"
          };
          break;
        
        case 'euclidean':
          result = SimilarityService.euclideanDistance(vectorA, vectorB);
          explanation = {
            formula: "d = √(Σ(Ai - Bi)²)",
            interpretation: "Lower values indicate greater similarity"
          };
          break;
        
        default:
          return res.status(400).json({ 
            error: 'Invalid method. Use: dot_product, cosine, or euclidean' 
          });
      }

      const comparison = {
        dot_product: SimilarityService.dotProductSimilarity(vectorA, vectorB),
        cosine: SimilarityService.cosineSimilarity(vectorA, vectorB),
        euclidean: SimilarityService.euclideanDistance(vectorA, vectorB)
      };

      res.json({
        method,
        result,
        explanation,
        vectorA,
        vectorB,
        comparison,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error testing similarity functions:', error);
      res.status(500).json({ 
        error: 'Failed to test similarity functions',
        details: error.message 
      });
    }
  }

  static async searchSimilarChunks(req, res) {
    try {
      const { 
        query, 
        method = 'dot_product', 
        topK = 5,
        documentId = null 
      } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log(`Searching for similar chunks: "${query}" using ${method}`);

      const embeddingService = new EmbeddingService();
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const filter = documentId ? { documentId } : {};
      const chunks = await Chunk.find(filter).select('text embedding metadata documentId');

      if (chunks.length === 0) {
        return res.json({
          query,
          method,
          results: [],
          message: 'No document chunks found in database'
        });
      }

      const embeddingsData = chunks.map(chunk => ({
        embedding: chunk.embedding,
        metadata: {
          chunkId: chunk._id,
          documentId: chunk.documentId,
          text: chunk.text,
          ...chunk.metadata
        }
      }));

      const startTime = Date.now();
      const similarResults = SimilarityService.findMostSimilar(
        queryEmbedding,
        embeddingsData,
        method,
        topK
      );
      const searchTime = Date.now() - startTime;

      const results = similarResults.map(result => ({
        chunkId: result.metadata.chunkId,
        documentId: result.metadata.documentId,
        text: result.metadata.text.substring(0, 500) + (result.metadata.text.length > 500 ? '...' : ''),
        similarity: result.similarity,
        method: result.method
      }));

      res.json({
        query,
        method,
        topK,
        results,
        searchTime,
        totalChunks: chunks.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error searching similar chunks:', error);
      res.status(500).json({ 
        error: 'Failed to search similar chunks',
        details: error.message 
      });
    }
  }

  static async compareAllMethods(req, res) {
    try {
      const { query, topK = 3 } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log(`Comparing all similarity methods for: "${query}"`);

      const embeddingService = new EmbeddingService();
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const chunks = await Chunk.find({}).select('text embedding metadata documentId');

      if (chunks.length === 0) {
        return res.json({
          query,
          comparison: {},
          message: 'No document chunks found in database'
        });
      }

      const embeddingsData = chunks.map(chunk => ({
        embedding: chunk.embedding,
        metadata: {
          chunkId: chunk._id,
          documentId: chunk.documentId,
          text: chunk.text.substring(0, 200) + '...',
          ...chunk.metadata
        }
      }));

      const comparison = SimilarityService.compareAllMethods(
        queryEmbedding,
        embeddingsData,
        topK
      );

      const methodExplanations = {
        dot_product: {
          description: "Direct multiplication and summation of vector elements",
          advantages: ["Fast computation", "Preserves magnitude information"],
          bestFor: "High-dimensional spaces with similar vector scales"
        },
        cosine: {
          description: "Measures angle between vectors (normalized dot product)",
          advantages: ["Scale invariant", "Range [-1,1]", "Good for text similarity"],
          bestFor: "Text similarity and semantic matching"
        },
        euclidean: {
          description: "Geometric distance between points in n-dimensional space",
          advantages: ["Intuitive distance measure", "Good for clustering"],
          bestFor: "Low-dimensional data and clustering applications"
        }
      };

      const methods = ['dot_product', 'cosine', 'euclidean'];
      const bestMethod = methods.reduce((best, method) => {
        const score = comparison[method].topScore;
        const bestScore = comparison[best].topScore;
        
        if (method === 'euclidean') {
          return score > bestScore ? method : best;
        }
        return score > bestScore ? method : best;
      });

      res.json({
        query,
        comparison,
        methodExplanations,
        analysis: {
          bestMethod,
          totalChunks: chunks.length,
          recommendation: methodExplanations[bestMethod].bestFor
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error comparing similarity methods:', error);
      res.status(500).json({ 
        error: 'Failed to compare similarity methods',
        details: error.message 
      });
    }
  }
}

module.exports = SimilarityController;
