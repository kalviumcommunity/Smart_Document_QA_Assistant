const EmbeddingService = require('../services/embeddingService');

describe('EmbeddingService', () => {
  let embeddingService;

  beforeEach(() => {
    embeddingService = new EmbeddingService();
  });

  describe('Text Chunking', () => {
    test('should return single chunk for short text', () => {
      const shortText = 'This is a short text that should not be chunked.';
      const chunks = embeddingService.chunkText(shortText);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(shortText);
    });

    test('should chunk long text properly', () => {
      const longText = 'A'.repeat(10000);
      const chunks = embeddingService.chunkText(longText, 1000);
      
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(1200);
      });
    });

    test('should handle text with sentence boundaries', () => {
      const textWithSentences = 'First sentence. Second sentence. Third sentence. ' + 'A'.repeat(5000) + '. Final sentence.';
      const chunks = embeddingService.chunkText(textWithSentences, 1000);
      
      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0]).toContain('First sentence');
    });

    test('should filter out empty chunks', () => {
      const textWithSpaces = '   \n\n   Some content   \n\n   ';
      const chunks = embeddingService.chunkText(textWithSpaces);
      
      chunks.forEach(chunk => {
        expect(chunk.trim().length).toBeGreaterThan(0);
      });
    });

    test('should handle overlap correctly', () => {
      const longText = 'A'.repeat(2000);
      const chunks = embeddingService.chunkText(longText, 1000, 200);
      
      if (chunks.length > 1) {
        expect(chunks[0].length).toBeLessThanOrEqual(1000);
        expect(chunks[1].length).toBeLessThanOrEqual(1000);
      }
    });
  });

  describe('Embedding Generation', () => {
    test('should validate input text', async () => {
      await expect(embeddingService.generateEmbedding('')).rejects.toThrow('Text cannot be empty');
      await expect(embeddingService.generateEmbedding(null)).rejects.toThrow('Text input is required');
      await expect(embeddingService.generateEmbedding(123)).rejects.toThrow('must be a string');
    });

    test('should clean input text', async () => {
      const messyText = '   Multiple    spaces   and\n\nnewlines   ';
      
      try {
        const embedding = await embeddingService.generateEmbedding(messyText);
        expect(Array.isArray(embedding)).toBe(true);
        expect(embedding.length).toBeGreaterThan(0);
      } catch (error) {
        console.log('Skipping API test - no valid API key');
        expect(error.message).toContain('API key');
      }
    }, 10000);

    test('should handle batch embedding validation', async () => {
      await expect(embeddingService.generateBatchEmbeddings([])).rejects.toThrow('non-empty array');
      await expect(embeddingService.generateBatchEmbeddings(['text', 123])).rejects.toThrow('must be strings');
    });

    test('should process batch embeddings', async () => {
      const texts = ['First text', 'Second text', 'Third text'];
      
      try {
        const embeddings = await embeddingService.generateBatchEmbeddings(texts);
        expect(embeddings).toHaveLength(3);
        embeddings.forEach(embedding => {
          expect(Array.isArray(embedding)).toBe(true);
          expect(embedding.length).toBeGreaterThan(0);
        });
      } catch (error) {
        console.log('Skipping API test - no valid API key');
        expect(error.message).toContain('API key');
      }
    }, 15000);
  });

  describe('Performance Tests', () => {
    test('should chunk text efficiently', () => {
      const largeText = 'Sample text. '.repeat(10000);
      
      const startTime = Date.now();
      const chunks = embeddingService.chunkText(largeText);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
      expect(chunks.length).toBeGreaterThan(0);
    });

    test('should handle various text sizes', () => {
      const testSizes = [100, 1000, 5000, 10000];
      
      testSizes.forEach(size => {
        const text = 'A'.repeat(size);
        const chunks = embeddingService.chunkText(text, 2000);
        
        if (size <= 2000) {
          expect(chunks).toHaveLength(1);
        } else {
          expect(chunks.length).toBeGreaterThan(1);
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      const invalidService = new EmbeddingService();
      invalidService.genAI = null;
      
      await expect(invalidService.generateEmbedding('test')).rejects.toThrow();
    });

    test('should validate chunk parameters', () => {
      const text = 'Sample text';
      
      expect(() => embeddingService.chunkText(text, -1)).not.toThrow();
      expect(() => embeddingService.chunkText(text, 0)).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should process document workflow', async () => {
      const sampleDocument = `
        This is a sample document for testing embeddings.
        It contains multiple sentences and paragraphs.
        
        The embedding service should be able to chunk this text
        and generate embeddings for each chunk effectively.
        
        This helps in creating a searchable knowledge base
        where users can query documents using natural language.
      `;

      const chunks = embeddingService.chunkText(sampleDocument);
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      
      chunks.forEach(chunk => {
        expect(typeof chunk).toBe('string');
        expect(chunk.trim().length).toBeGreaterThan(0);
      });
    });

    test('should maintain text integrity during chunking', () => {
      const originalText = 'Important information. Critical details. Essential facts.';
      const chunks = embeddingService.chunkText(originalText);
      const reconstructed = chunks.join('');
      
      expect(reconstructed.replace(/\s+/g, ' ').trim())
        .toContain('Important information');
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters', () => {
      const specialText = 'Text with émojis 🚀 and spëcial çharactërs!';
      const chunks = embeddingService.chunkText(specialText);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toContain('émojis');
      expect(chunks[0]).toContain('🚀');
    });

    test('should handle very short chunks', () => {
      const shortChunks = embeddingService.chunkText('A. B. C.', 10);
      expect(shortChunks.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle text with only whitespace', () => {
      const whitespaceText = '   \n\t   \r\n   ';
      const chunks = embeddingService.chunkText(whitespaceText);
      
      expect(chunks.length).toBe(0);
    });
  });
});

console.log('🧪 Testing Embedding Generation and Text Processing');
console.log('🎯 Focus: Text chunking, embedding generation, and error handling');
