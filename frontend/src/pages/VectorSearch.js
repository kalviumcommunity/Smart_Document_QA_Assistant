import React, { useState, useEffect } from 'react';
import { Search, Database, Zap, BarChart3, FileText, Clock } from 'lucide-react';
import { vectorAPI } from '../services/api';

const VectorSearch = () => {
  const [query, setQuery] = useState('');
  const [similarityMethod, setSimilarityMethod] = useState('cosine');
  const [limit, setLimit] = useState(5);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await vectorAPI.getVectorDocuments();
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    setResults(null);

    try {
      const searchData = {
        query: query.trim(),
        similarity_method: similarityMethod,
        limit: parseInt(limit),
        ...(selectedDocument && { document_id: parseInt(selectedDocument) })
      };

      const response = await vectorAPI.searchVectors(searchData);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.response?.data?.details || error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const getSimilarityColor = (similarity) => {
    if (similarity > 0.8) return '#48bb78';
    if (similarity > 0.6) return '#ed8936';
    if (similarity > 0.4) return '#ecc94b';
    return '#f56565';
  };

  const getSimilarityLabel = (similarity) => {
    if (similarity > 0.8) return 'Excellent';
    if (similarity > 0.6) return 'Good';
    if (similarity > 0.4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="page-container">
      <h1 className="page-title">
        <Search className="title-icon" />
        Vector Search
      </h1>
      <p className="page-subtitle">
        Search similar content using PostgreSQL + pgvector with multiple similarity methods
      </p>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label className="form-label">Search Query</label>
            <textarea
              className="form-textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question or search query..."
              rows={3}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Similarity Method</label>
              <select
                className="form-select"
                value={similarityMethod}
                onChange={(e) => setSimilarityMethod(e.target.value)}
              >
                <option value="cosine">Cosine Similarity</option>
                <option value="l2">L2 Distance (Euclidean)</option>
                <option value="dot_product">Dot Product</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Results Limit</label>
              <select
                className="form-select"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              >
                <option value={3}>3 results</option>
                <option value={5}>5 results</option>
                <option value={10}>10 results</option>
                <option value={20}>20 results</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Document Filter</label>
              <select
                className="form-select"
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
              >
                <option value="">All Documents</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename} ({doc.totalChunks} chunks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary search-btn"
            disabled={searching || !query.trim()}
          >
            {searching ? (
              <>
                <div className="loading-spinner"></div>
                Searching...
              </>
            ) : (
              <>
                <Search size={20} />
                Search Vectors
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="error">
          <Search size={20} />
          <div>
            <strong>Search Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {results && (
        <div className="results-section">
          <div className="results-header">
            <h3>Search Results</h3>
            <div className="results-meta">
              <div className="meta-item">
                <Database size={16} />
                <span>{results.results.length} results found</span>
              </div>
              <div className="meta-item">
                <BarChart3 size={16} />
                <span>{results.similarity_method} similarity</span>
              </div>
              <div className="meta-item">
                <Zap size={16} />
                <span>{results.metadata?.embeddingDimensions} dimensions</span>
              </div>
            </div>
          </div>

          <div className="query-display">
            <strong>Query:</strong> "{results.query}"
          </div>

          {results.results.length === 0 ? (
            <div className="no-results">
              <Search size={48} />
              <h4>No Results Found</h4>
              <p>Try adjusting your query or similarity method</p>
            </div>
          ) : (
            <div className="results-list">
              {results.results.map((result, index) => (
                <div key={result.id} className="result-card">
                  <div className="result-header">
                    <div className="result-rank">#{index + 1}</div>
                    <div className="result-info">
                      <div className="result-filename">
                        <FileText size={16} />
                        {result.filename}
                      </div>
                      <div className="result-chunk">Chunk {result.chunkIndex}</div>
                    </div>
                    <div className="similarity-badge">
                      <div 
                        className="similarity-score"
                        style={{ color: getSimilarityColor(result.similarity) }}
                      >
                        {(result.similarity * 100).toFixed(1)}%
                      </div>
                      <div className="similarity-label">
                        {getSimilarityLabel(result.similarity)}
                      </div>
                    </div>
                  </div>

                  <div className="result-content">
                    <p>{result.chunkText}</p>
                  </div>

                  <div className="result-footer">
                    <div className="result-stats">
                      <span className="stat">
                        <strong>Distance:</strong> {result.distance?.toFixed(4) || 'N/A'}
                      </span>
                      <span className="stat">
                        <strong>Method:</strong> {result.method}
                      </span>
                      <span className="stat">
                        <strong>Doc ID:</strong> {result.documentId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="similarity-explanation">
            <h4>Similarity Method Explanation</h4>
            <div className="explanation-content">
              {similarityMethod === 'cosine' && (
                <p>
                  <strong>Cosine Similarity:</strong> Measures the cosine of the angle between two vectors. 
                  Values range from -1 to 1, where 1 indicates identical direction, 0 indicates orthogonal vectors, 
                  and -1 indicates opposite directions. Best for text similarity as it's not affected by vector magnitude.
                </p>
              )}
              {similarityMethod === 'l2' && (
                <p>
                  <strong>L2 Distance (Euclidean):</strong> Calculates the straight-line distance between two points 
                  in n-dimensional space. Lower values indicate higher similarity. Good for finding exact matches 
                  but sensitive to vector magnitude.
                </p>
              )}
              {similarityMethod === 'dot_product' && (
                <p>
                  <strong>Dot Product:</strong> Sum of element-wise multiplication of two vectors. 
                  Higher values indicate greater similarity. Fast to compute but not normalized, 
                  so affected by vector magnitudes.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .search-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .search-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .search-btn {
          width: 100%;
          margin-top: 20px;
          padding: 15px;
          font-size: 1.1rem;
        }

        .results-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f7fafc;
        }

        .results-header h3 {
          color: #2d3748;
          margin: 0;
        }

        .results-meta {
          display: flex;
          gap: 20px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #718096;
          font-size: 0.9rem;
        }

        .query-display {
          background: #f7fafc;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 25px;
          color: #2d3748;
          font-style: italic;
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #718096;
        }

        .no-results svg {
          color: #cbd5e0;
          margin-bottom: 20px;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .result-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 25px;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .result-card:hover {
          border-color: #667eea;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .result-rank {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .result-info {
          flex: 1;
        }

        .result-filename {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 5px;
        }

        .result-chunk {
          font-size: 0.85rem;
          color: #718096;
        }

        .similarity-badge {
          text-align: right;
        }

        .similarity-score {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
        }

        .similarity-label {
          font-size: 0.8rem;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .result-content {
          margin: 20px 0;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .result-content p {
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }

        .result-footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }

        .result-stats {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .stat {
          font-size: 0.85rem;
          color: #718096;
        }

        .similarity-explanation {
          background: #f0f4f8;
          border-radius: 10px;
          padding: 25px;
          margin-top: 30px;
          border: 1px solid #e2e8f0;
        }

        .similarity-explanation h4 {
          color: #2d3748;
          margin-bottom: 15px;
        }

        .explanation-content p {
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .results-meta {
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }
          
          .result-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .similarity-badge {
            text-align: left;
          }
          
          .result-stats {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default VectorSearch;
