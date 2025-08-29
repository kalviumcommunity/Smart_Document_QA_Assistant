const SimilarityService = require('../services/similarityService');

describe('SimilarityService', () => {
  
  describe('Dot Product Similarity', () => {
    test('should calculate dot product correctly', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [4, 5, 6];
      const result = SimilarityService.dotProductSimilarity(vectorA, vectorB);
      expect(result).toBe(32);
    });

    test('should handle identical vectors', () => {
      const vector = [1, 2, 3, 4];
      const result = SimilarityService.dotProductSimilarity(vector, vector);
      expect(result).toBe(30);
    });

    test('should handle orthogonal vectors', () => {
      const vectorA = [1, 0];
      const vectorB = [0, 1];
      const result = SimilarityService.dotProductSimilarity(vectorA, vectorB);
      expect(result).toBe(0);
    });

    test('should handle negative values', () => {
      const vectorA = [-1, -2];
      const vectorB = [3, 4];
      const result = SimilarityService.dotProductSimilarity(vectorA, vectorB);
      expect(result).toBe(-11);
    });

    test('should throw error for different dimensions', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [4, 5];
      expect(() => {
        SimilarityService.dotProductSimilarity(vectorA, vectorB);
      }).toThrow('Vector dimensions must match');
    });

    test('should throw error for empty vectors', () => {
      expect(() => {
        SimilarityService.dotProductSimilarity([], []);
      }).toThrow('Vectors cannot be empty');
    });

    test('should handle large vectors efficiently', () => {
      const size = 1536;
      const vectorA = new Array(size).fill(1);
      const vectorB = new Array(size).fill(2);
      
      const startTime = Date.now();
      const result = SimilarityService.dotProductSimilarity(vectorA, vectorB);
      const endTime = Date.now();
      
      expect(result).toBe(size * 2);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Cosine Similarity', () => {
    test('should calculate cosine similarity correctly', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [4, 5, 6];
      
      const result = SimilarityService.cosineSimilarity(vectorA, vectorB);
      const expected = 32 / (Math.sqrt(14) * Math.sqrt(77));
      
      expect(result).toBeCloseTo(expected, 6);
    });

    test('should return 1 for identical vectors', () => {
      const vector = [3, 4, 5];
      const result = SimilarityService.cosineSimilarity(vector, vector);
      expect(result).toBeCloseTo(1, 6);
    });

    test('should return 0 for orthogonal vectors', () => {
      const vectorA = [1, 0, 0];
      const vectorB = [0, 1, 0];
      const result = SimilarityService.cosineSimilarity(vectorA, vectorB);
      expect(result).toBeCloseTo(0, 6);
    });
  });

  describe('Euclidean Distance', () => {
    test('should calculate euclidean distance correctly', () => {
      const vectorA = [1, 2];
      const vectorB = [4, 6];
      const result = SimilarityService.euclideanDistance(vectorA, vectorB);
      expect(result).toBe(5);
    });

    test('should return 0 for identical vectors', () => {
      const vector = [1, 2, 3, 4];
      const result = SimilarityService.euclideanDistance(vector, vector);
      expect(result).toBe(0);
    });
  });

  describe('findMostSimilar', () => {
    const sampleEmbeddings = [
      { embedding: [1, 2, 3], metadata: { id: 1, text: 'First chunk' } },
      { embedding: [2, 3, 4], metadata: { id: 2, text: 'Second chunk' } },
      { embedding: [10, 20, 30], metadata: { id: 3, text: 'Third chunk' } },
      { embedding: [1, 1, 1], metadata: { id: 4, text: 'Fourth chunk' } }
    ];

    test('should find most similar using dot product', () => {
      const query = [1, 2, 3];
      const results = SimilarityService.findMostSimilar(query, sampleEmbeddings, 'dot_product', 2);

      expect(results).toHaveLength(2);
      expect(results[0].metadata.id).toBe(3);
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    });

    test('should handle empty embeddings array', () => {
      const query = [1, 2, 3];
      const results = SimilarityService.findMostSimilar(query, [], 'dot_product', 5);
      expect(results).toHaveLength(0);
    });

    test('should respect topK parameter', () => {
      const query = [1, 2, 3];
      const results = SimilarityService.findMostSimilar(query, sampleEmbeddings, 'dot_product', 2);
      expect(results).toHaveLength(2);
    });
  });

  describe('compareAllMethods', () => {
    test('should compare all three similarity methods', () => {
      const query = [1, 2, 3];
      const embeddings = [
        { embedding: [2, 3, 4], metadata: { id: 1 } },
        { embedding: [10, 20, 30], metadata: { id: 2 } }
      ];

      const comparison = SimilarityService.compareAllMethods(query, embeddings, 2);

      expect(comparison).toHaveProperty('dot_product');
      expect(comparison).toHaveProperty('cosine');
      expect(comparison).toHaveProperty('euclidean');

      Object.keys(comparison).forEach(method => {
        expect(comparison[method]).toHaveProperty('results');
        expect(comparison[method]).toHaveProperty('executionTime');
        expect(comparison[method]).toHaveProperty('topScore');
        expect(comparison[method].results).toHaveLength(2);
      });
    });
  });
});

console.log('🧪 Testing Dot Product Similarity and related functions');
console.log('🎯 Focus: Mathematical correctness and performance');
