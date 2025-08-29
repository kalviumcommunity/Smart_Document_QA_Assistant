const DatabaseConfig = require('../config/database');

class VectorDatabaseService {
  constructor() {
    this.dbConfig = new DatabaseConfig();
    this.pool = this.dbConfig.getPool();
  }

  async insertDocument(filename, content, fileSize, mimeType) {
    try {
      const query = `
        INSERT INTO documents (filename, content, file_size, mime_type, processing_status)
        VALUES ($1, $2, $3, $4, 'processing')
        RETURNING id, filename, created_at;
      `;
      
      const result = await this.pool.query(query, [filename, content, fileSize, mimeType]);
      
      console.log(`✅ Document inserted with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error inserting document:', error);
      throw error;
    }
  }

  async insertVectorChunk(documentId, chunkText, chunkIndex, embedding, metadata = {}) {
    try {
      const query = `
        INSERT INTO vector_chunks (document_id, chunk_text, chunk_index, embedding, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      
      const embeddingVector = `[${embedding.join(',')}]`;
      const result = await this.pool.query(query, [
        documentId, 
        chunkText, 
        chunkIndex, 
        embeddingVector, 
        JSON.stringify(metadata)
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error inserting vector chunk:', error);
      throw error;
    }
  }

  async insertBatchVectorChunks(documentId, chunks) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertPromises = chunks.map(async (chunk, index) => {
        const { text, embedding, metadata = {} } = chunk;
        const embeddingVector = `[${embedding.join(',')}]`;
        
        return client.query(`
          INSERT INTO vector_chunks (document_id, chunk_text, chunk_index, embedding, metadata)
          VALUES ($1, $2, $3, $4, $5)
        `, [documentId, text, index, embeddingVector, JSON.stringify(metadata)]);
      });
      
      await Promise.all(insertPromises);
      
      await client.query(`
        UPDATE documents 
        SET total_chunks = $1, processing_status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [chunks.length, documentId]);
      
      await client.query('COMMIT');
      
      console.log(`✅ Inserted ${chunks.length} vector chunks for document ${documentId}`);
      return chunks.length;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error inserting batch vector chunks:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async searchSimilarVectors(queryEmbedding, limit = 5, similarityMethod = 'cosine') {
    try {
      let distanceOperator;
      let orderDirection;
      
      switch (similarityMethod) {
        case 'cosine':
          distanceOperator = '<->';
          orderDirection = 'ASC';
          break;
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

      const queryVector = `[${queryEmbedding.join(',')}]`;
      
      const query = `
        SELECT 
          vc.id,
          vc.document_id,
          vc.chunk_text,
          vc.chunk_index,
          vc.metadata,
          d.filename,
          (vc.embedding ${distanceOperator} $1::vector) as distance
        FROM vector_chunks vc
        JOIN documents d ON vc.document_id = d.id
        WHERE d.processing_status = 'completed'
        ORDER BY vc.embedding ${distanceOperator} $1::vector ${orderDirection}
        LIMIT $2;
      `;
      
      const result = await this.pool.query(query, [queryVector, limit]);
      
      const results = result.rows.map(row => ({
        id: row.id,
        documentId: row.document_id,
        filename: row.filename,
        chunkText: row.chunk_text,
        chunkIndex: row.chunk_index,
        metadata: row.metadata,
        similarity: this.convertDistanceToSimilarity(row.distance, similarityMethod),
        distance: row.distance
      }));
      
      console.log(`✅ Found ${results.length} similar vectors using ${similarityMethod}`);
      return results;
    } catch (error) {
      console.error('❌ Error searching similar vectors:', error);
      throw error;
    }
  }

  convertDistanceToSimilarity(distance, method) {
    switch (method) {
      case 'cosine':
        return 1 - distance;
      case 'l2':
      case 'euclidean':
        return 1 / (1 + distance);
      case 'dot_product':
        return distance;
      default:
        return 1 - distance;
    }
  }

  async searchSimilarInDocument(documentId, queryEmbedding, limit = 5, similarityMethod = 'cosine') {
    try {
      let distanceOperator = '<->';
      let orderDirection = 'ASC';
      
      if (similarityMethod === 'dot_product') {
        distanceOperator = '<#>';
        orderDirection = 'DESC';
      }

      const queryVector = `[${queryEmbedding.join(',')}]`;
      
      const query = `
        SELECT 
          vc.id,
          vc.chunk_text,
          vc.chunk_index,
          vc.metadata,
          (vc.embedding ${distanceOperator} $1::vector) as distance
        FROM vector_chunks vc
        WHERE vc.document_id = $2
        ORDER BY vc.embedding ${distanceOperator} $1::vector ${orderDirection}
        LIMIT $3;
      `;
      
      const result = await this.pool.query(query, [queryVector, documentId, limit]);
      
      const results = result.rows.map(row => ({
        id: row.id,
        chunkText: row.chunk_text,
        chunkIndex: row.chunk_index,
        metadata: row.metadata,
        similarity: this.convertDistanceToSimilarity(row.distance, similarityMethod),
        distance: row.distance
      }));
      
      return results;
    } catch (error) {
      console.error('❌ Error searching similar vectors in document:', error);
      throw error;
    }
  }

  async getDocuments() {
    try {
      const query = `
        SELECT 
          id,
          filename,
          file_size,
          mime_type,
          total_chunks,
          processing_status,
          created_at,
          updated_at
        FROM documents
        ORDER BY created_at DESC;
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      throw error;
    }
  }

  async getDocument(documentId) {
    try {
      const query = `
        SELECT 
          d.*,
          COUNT(vc.id) as chunk_count
        FROM documents d
        LEFT JOIN vector_chunks vc ON d.id = vc.document_id
        WHERE d.id = $1
        GROUP BY d.id;
      `;
      
      const result = await this.pool.query(query, [documentId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error getting document:', error);
      throw error;
    }
  }

  async getDocumentChunks(documentId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          id,
          chunk_text,
          chunk_index,
          metadata,
          created_at
        FROM vector_chunks
        WHERE document_id = $1
        ORDER BY chunk_index ASC
        LIMIT $2 OFFSET $3;
      `;
      
      const result = await this.pool.query(query, [documentId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting document chunks:', error);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      const query = `DELETE FROM documents WHERE id = $1 RETURNING filename;`;
      const result = await this.pool.query(query, [documentId]);
      
      if (result.rows.length === 0) {
        throw new Error('Document not found');
      }
      
      console.log(`✅ Deleted document: ${result.rows[0].filename}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }

  async getVectorDatabaseStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as total_documents FROM documents;',
        'SELECT COUNT(*) as total_chunks FROM vector_chunks;',
        'SELECT processing_status, COUNT(*) as count FROM documents GROUP BY processing_status;',
        'SELECT AVG(total_chunks) as avg_chunks_per_doc FROM documents WHERE processing_status = \'completed\';'
      ];
      
      const results = await Promise.all(queries.map(query => this.pool.query(query)));
      
      return {
        totalDocuments: parseInt(results[0].rows[0].total_documents),
        totalChunks: parseInt(results[1].rows[0].total_chunks),
        statusCounts: results[2].rows.reduce((acc, row) => {
          acc[row.processing_status] = parseInt(row.count);
          return acc;
        }, {}),
        avgChunksPerDoc: parseFloat(results[3].rows[0].avg_chunks_per_doc) || 0
      };
    } catch (error) {
      console.error('❌ Error getting vector database stats:', error);
      throw error;
    }
  }

  async performVectorOperations(vector1, vector2, operation = 'similarity') {
    try {
      const vec1 = `[${vector1.join(',')}]`;
      const vec2 = `[${vector2.join(',')}]`;
      
      let query;
      switch (operation) {
        case 'cosine_similarity':
          query = `SELECT 1 - ($1::vector <-> $2::vector) as result;`;
          break;
        case 'euclidean_distance':
          query = `SELECT $1::vector <-> $2::vector as result;`;
          break;
        case 'dot_product':
          query = `SELECT $1::vector <#> $2::vector as result;`;
          break;
        default:
          query = `SELECT 1 - ($1::vector <-> $2::vector) as result;`;
      }
      
      const result = await this.pool.query(query, [vec1, vec2]);
      return parseFloat(result.rows[0].result);
    } catch (error) {
      console.error('❌ Error performing vector operations:', error);
      throw error;
    }
  }
}

module.exports = VectorDatabaseService;
