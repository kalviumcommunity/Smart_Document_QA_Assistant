-- Initialize pgvector extension and create tables
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
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

-- Create vector_chunks table with pgvector support
CREATE TABLE IF NOT EXISTS vector_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding VECTOR(768),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vector_chunks_document_id ON vector_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_vector_chunks_embedding ON vector_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(processing_status);

-- Insert sample data for testing
INSERT INTO documents (filename, content, file_size, mime_type, total_chunks, processing_status) 
VALUES ('sample.txt', 'This is a sample document for testing vector database functionality.', 100, 'text/plain', 1, 'completed');

-- Note: Sample vector embedding would be inserted via application code
