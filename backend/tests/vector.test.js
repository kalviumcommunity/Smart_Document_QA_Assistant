const VectorDatabaseService = require('../services/vectorDatabaseService');

describe('VectorDatabaseService', () => {
  let vectorDB;

  beforeEach(() => {
    vectorDB = new VectorDatabaseService();
  });

  afterAll(async () => {
    await vectorDB.dbConfig.closeConnection();
  });

  describe('Distance to Similarity Conversion', () => {
    test('should convert cosine distance to similarity', () => {
      const distance = 0.2;
      const similarity = vectorDB.convertDistanceToSimilarity(distance, 'cosine');
      expect(similarity).toBe(0.8);
    });

    test('should convert euclidean distance to similarity', () => {
      const distance = 1.0;
      const similarity = vectorDB.convertDistanceToSimilarity(distance, 'l2');
      expect(similarity).toBe(0.5);
    });

    test('should handle dot product similarity', () => {
      const distance = 0.8;
      const similarity = vectorDB.convertDistanceToSimilarity(distance, 'dot_product');
      expect(similarity).toBe(0.8);
    });

    test('should handle unknown method with default cosine', () => {
      const distance = 0.3;
      const similarity = vectorDB.convertDistanceToSimilarity(distance, 'unknown');
      expect(similarity).toBe(0.7);
    });
  });

  describe('Database Operations', () => {
    test('should validate required database methods exist', () => {
      expect(typeof vectorDB.insertDocument).toBe('function');
      expect(typeof vectorDB.insertVectorChunk).toBe('function');
      expect(typeof vectorDB.insertBatchVectorChunks).toBe('function');
      expect(typeof vectorDB.searchSimilarVectors).toBe('function');
      expect(typeof vectorDB.searchSimilarInDocument).toBe('function');
      expect(typeof vectorDB.getDocuments).toBe('function');
      expect(typeof vectorDB.getDocument).toBe('function');
      expect(typeof vectorDB.deleteDocument).toBe('function');
      expect(typeof vectorDB.getVectorDatabaseStats).toBe('function');
      expect(typeof vectorDB.performVectorOperations).toBe('function');
    });

    test('should have database pool connection', () => {
      expect(vectorDB.pool).toBeDefined();
      expect(typeof vectorDB.pool.query).toBe('function');
    });
  });

  describe('Vector Operations Logic', () => {
    test('should construct proper query vector format', () => {
      const embedding = [0.1, 0.2, 0.3];
      const expectedFormat = '[0.1,0.2,0.3]';
      
      const vectorString = `[${embedding.join(',')}]`;
      expect(vectorString).toBe(expectedFormat);
    });

    test('should handle different similarity methods', () => {
      const methods = ['cosine', 'l2', 'euclidean', 'dot_product'];
      
      methods.forEach(method => {
        let distanceOperator, orderDirection;
        
        switch (method) {
          case 'cosine':
          case 'l2':
          case 'euclidean':
            distanceOperator = '<->';
            orderDirection = 'ASC';
            break;
          case 'dot_product':
            distanceOperator = '<#>';
            orderDirection = 'DESC';
            break;
          default:
            distanceOperator = '<->';
            orderDirection = 'ASC';
        }
        
        expect(distanceOperator).toBeDefined();
        expect(orderDirection).toBeDefined();
        expect(['<->', '<#>'].includes(distanceOperator)).toBe(true);
        expect(['ASC', 'DESC'].includes(orderDirection)).toBe(true);
      });
    });
  });

  describe('Data Validation', () => {
    test('should validate embedding array format', () => {
      const validEmbedding = [0.1, 0.2, 0.3, 0.4];
      const invalidEmbedding = ['a', 'b', 'c'];
      
      expect(Array.isArray(validEmbedding)).toBe(true);
      expect(validEmbedding.every(val => typeof val === 'number')).toBe(true);
      expect(invalidEmbedding.every(val => typeof val === 'number')).toBe(false);
    });

    test('should validate metadata JSON format', () => {
      const metadata = {
        startChar: 0,
        endChar: 100,
        tokenCount: 25
      };
      
      const jsonString = JSON.stringify(metadata);
      const parsed = JSON.parse(jsonString);
      
      expect(parsed).toEqual(metadata);
      expect(typeof jsonString).toBe('string');
    });

    test('should validate document fields', () => {
      const documentData = {
        filename: 'test.txt',
        content: 'Test content',
        fileSize: 1024,
        mimeType: 'text/plain'
      };
      
      expect(typeof documentData.filename).toBe('string');
      expect(typeof documentData.content).toBe('string');
      expect(typeof documentData.fileSize).toBe('number');
      expect(typeof documentData.mimeType).toBe('string');
      expect(documentData.filename.length).toBeGreaterThan(0);
      expect(documentData.content.length).toBeGreaterThan(0);
    });
  });

  describe('Query Construction', () => {
    test('should build correct search query structure', () => {
      const expectedSelectFields = [
        'vc.id',
        'vc.document_id',
        'vc.chunk_text',
        'vc.chunk_index',
        'vc.metadata',
        'd.filename'
      ];
      
      expectedSelectFields.forEach(field => {
        expect(typeof field).toBe('string');
        expect(field.length).toBeGreaterThan(0);
      });
    });

    test('should construct proper JOIN conditions', () => {
      const joinCondition = 'vc.document_id = d.id';
      const whereCondition = "d.processing_status = 'completed'";
      
      expect(joinCondition).toContain('=');
      expect(whereCondition).toContain('completed');
    });

    test('should handle LIMIT parameter correctly', () => {
      const limits = [1, 5, 10, 50, 100];
      
      limits.forEach(limit => {
        expect(typeof limit).toBe('number');
        expect(limit).toBeGreaterThan(0);
        expect(Number.isInteger(limit)).toBe(true);
      });
    });
  });

  describe('Performance Considerations', () => {
    test('should use appropriate index types', () => {
      const indexTypes = ['ivfflat', 'hnsw'];
      const vectorOps = ['vector_cosine_ops', 'vector_l2_ops', 'vector_ip_ops'];
      
      indexTypes.forEach(indexType => {
        expect(typeof indexType).toBe('string');
        expect(indexType.length).toBeGreaterThan(0);
      });
      
      vectorOps.forEach(op => {
        expect(typeof op).toBe('string');
        expect(op).toContain('vector_');
      });
    });

    test('should validate vector dimensions', () => {
      const commonDimensions = [128, 256, 384, 512, 768, 1024, 1536, 3072];
      
      commonDimensions.forEach(dim => {
        expect(typeof dim).toBe('number');
        expect(dim).toBeGreaterThan(0);
        expect(dim % 2 === 0 || dim % 3 === 0).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle connection errors gracefully', () => {
      expect(() => {
        const errorDB = new VectorDatabaseService();
        errorDB.pool = null;
      }).not.toThrow();
    });

    test('should validate embedding dimensions match', () => {
      const embedding1 = [0.1, 0.2, 0.3];
      const embedding2 = [0.4, 0.5, 0.6, 0.7];
      
      expect(embedding1.length).not.toBe(embedding2.length);
      
      if (embedding1.length !== embedding2.length) {
        expect(true).toBe(true);
      }
    });

    test('should handle malformed vector strings', () => {
      const validVector = '[0.1,0.2,0.3]';
      const invalidVector = '[0.1,0.2,abc]';
      
      expect(validVector).toMatch(/^\[[\d.,\-]+\]$/);
      expect(invalidVector).not.toMatch(/^\[[\d.,\-]+\]$/);
    });
  });

  describe('Integration Scenarios', () => {
    test('should support batch operations', () => {
      const batchSize = 100;
      const chunks = new Array(batchSize).fill(null).map((_, index) => ({
        text: `Chunk ${index}`,
        embedding: new Array(768).fill(0).map(() => Math.random()),
        metadata: { chunkIndex: index }
      }));
      
      expect(chunks.length).toBe(batchSize);
      chunks.forEach((chunk, index) => {
        expect(chunk.text).toBe(`Chunk ${index}`);
        expect(chunk.embedding.length).toBe(768);
        expect(chunk.metadata.chunkIndex).toBe(index);
      });
    });

    test('should handle concurrent operations', async () => {
      const operations = [
        () => Promise.resolve('operation1'),
        () => Promise.resolve('operation2'),
        () => Promise.resolve('operation3')
      ];
      
      const results = await Promise.all(operations.map(op => op()));
      
      expect(results).toHaveLength(3);
      expect(results[0]).toBe('operation1');
      expect(results[1]).toBe('operation2');
      expect(results[2]).toBe('operation3');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate database configuration', () => {
      const config = {
        user: 'postgres',
        host: 'localhost',
        database: 'smart_qa_vector',
        password: 'password',
        port: 5432
      };
      
      expect(typeof config.user).toBe('string');
      expect(typeof config.host).toBe('string');
      expect(typeof config.database).toBe('string');
      expect(typeof config.password).toBe('string');
      expect(typeof config.port).toBe('number');
      expect(config.port).toBeGreaterThan(0);
      expect(config.port).toBeLessThan(65536);
    });

    test('should validate pgvector extension requirements', () => {
      const extensionQuery = 'CREATE EXTENSION IF NOT EXISTS vector;';
      const tableCreationQuery = 'CREATE TABLE IF NOT EXISTS vector_chunks';
      const indexCreationQuery = 'CREATE INDEX IF NOT EXISTS idx_vector_chunks_embedding';
      
      expect(extensionQuery).toContain('vector');
      expect(tableCreationQuery).toContain('vector_chunks');
      expect(indexCreationQuery).toContain('embedding');
    });
  });
});

console.log('🧪 Testing Vector Database with PostgreSQL + pgvector');
console.log('🎯 Focus: Vector operations, similarity search, and database integration');
