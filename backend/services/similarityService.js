class SimilarityService {
  static dotProductSimilarity(vectorA, vectorB) {
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
      throw new Error('Both inputs must be arrays');
    }
    
    if (vectorA.length !== vectorB.length) {
      throw new Error(`Vector dimensions must match. Got ${vectorA.length} and ${vectorB.length}`);
    }
    
    if (vectorA.length === 0) {
      throw new Error('Vectors cannot be empty');
    }

    let dotProduct = 0;
    for (let i = 0; i < vectorA.length; i++) {
      const a = Number(vectorA[i]);
      const b = Number(vectorB[i]);
      
      if (isNaN(a) || isNaN(b)) {
        throw new Error(`Invalid number at position ${i}: ${vectorA[i]}, ${vectorB[i]}`);
      }
      
      dotProduct += a * b;
    }
    
    return dotProduct;
  }

  static cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error(`Vector dimensions must match. Got ${vectorA.length} and ${vectorB.length}`);
    }

    const dotProduct = this.dotProductSimilarity(vectorA, vectorB);
    
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  static euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error(`Vector dimensions must match. Got ${vectorA.length} and ${vectorB.length}`);
    }

    let sumSquaredDiffs = 0;
    for (let i = 0; i < vectorA.length; i++) {
      const diff = vectorA[i] - vectorB[i];
      sumSquaredDiffs += diff * diff;
    }
    
    return Math.sqrt(sumSquaredDiffs);
  }

  static findMostSimilar(queryEmbedding, embeddings, method = 'dot_product', topK = 5) {
    if (!Array.isArray(embeddings) || embeddings.length === 0) {
      return [];
    }

    const results = embeddings.map((item, index) => {
      let similarity;
      
      try {
        switch (method.toLowerCase()) {
          case 'dot_product':
            similarity = this.dotProductSimilarity(queryEmbedding, item.embedding);
            break;
          case 'cosine':
            similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
            break;
          case 'euclidean':
            const distance = this.euclideanDistance(queryEmbedding, item.embedding);
            similarity = 1 / (1 + distance);
            break;
          default:
            throw new Error(`Unknown similarity method: ${method}`);
        }
        
        return {
          similarity,
          metadata: item.metadata,
          index,
          method
        };
      } catch (error) {
        console.error(`Error calculating similarity for item ${index}:`, error);
        return {
          similarity: -Infinity,
          metadata: item.metadata,
          index,
          error: error.message,
          method
        };
      }
    });

    results.sort((a, b) => {
      if (method.toLowerCase() === 'euclidean') {
        return b.similarity - a.similarity;
      }
      return b.similarity - a.similarity;
    });

    return results.slice(0, topK);
  }

  static compareAllMethods(queryEmbedding, embeddings, topK = 5) {
    const methods = ['dot_product', 'cosine', 'euclidean'];
    const comparison = {};

    methods.forEach(method => {
      const startTime = Date.now();
      const results = this.findMostSimilar(queryEmbedding, embeddings, method, topK);
      const endTime = Date.now();

      comparison[method] = {
        results,
        executionTime: endTime - startTime,
        topScore: results.length > 0 ? results[0].similarity : null,
        averageScore: results.length > 0 
          ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length 
          : null
      };
    });

    return comparison;
  }
}

module.exports = SimilarityService;
