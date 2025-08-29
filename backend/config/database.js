const { Pool } = require('pg');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USER || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      database: process.env.POSTGRES_DB || 'smart_qa_vector',
      password: process.env.POSTGRES_PASSWORD || 'password',
      port: process.env.POSTGRES_PORT || 5432,
    });
  }

  async initializeDatabase() {
    try {
      await this.enablePgVector();
      await this.createTables();
      console.log('✅ Vector database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing vector database:', error);
      throw error;
    }
  }

  async enablePgVector() {
    try {
      await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('✅ pgvector extension enabled');
    } catch (error) {
      console.error('❌ Error enabling pgvector extension:', error);
      throw error;
    }
  }

  async createTables() {
    const createDocumentsTable = `
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        mime_type VARCHAR(100) DEFAULT 'text/plain',
        total_chunks INTEGER DEFAULT 0,
        processing_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createVectorChunksTable = `
      CREATE TABLE IF NOT EXISTS vector_chunks (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
        chunk_text TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        embedding VECTOR(768),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_vector_chunks_document_id ON vector_chunks(document_id);
      CREATE INDEX IF NOT EXISTS idx_vector_chunks_embedding ON vector_chunks USING ivfflat (embedding vector_cosine_ops);
      CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(processing_status);
    `;

    try {
      await this.pool.query(createDocumentsTable);
      await this.pool.query(createVectorChunksTable);
      await this.pool.query(createIndexes);
      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  getPool() {
    return this.pool;
  }

  async closeConnection() {
    await this.pool.end();
  }
}

module.exports = DatabaseConfig;
