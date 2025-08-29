import React, { useState } from 'react';
import { Database, Zap, BarChart3 } from 'lucide-react';
import { documentAPI } from '../services/api';

const EmbeddingDemo = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await documentAPI.generateEmbeddingDemo({
        text: text.trim()
      });

      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.details || error.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">
        <Database className="title-icon" />
        Embeddings Demo
      </h1>
      <p className="page-subtitle">
        Generate and visualize text embeddings with statistical analysis
      </p>

      <div className="embedding-form">
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Text to Embed</label>
            <textarea
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to generate embeddings..."
              rows={5}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Generating Embeddings...
              </>
            ) : (
              <>
                <Zap size={20} />
                Generate Embeddings
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-section">
          <h3>Embedding Results</h3>
          
          <div className="embedding-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <BarChart3 className="stat-icon" />
                <div className="stat-number">{result.embedding.dimensions}</div>
                <div className="stat-label">Dimensions</div>
              </div>
              <div className="stat-card">
                <Database className="stat-icon" />
                <div className="stat-number">{result.metadata.textLength}</div>
                <div className="stat-label">Characters</div>
              </div>
              <div className="stat-card">
                <Zap className="stat-icon" />
                <div className="stat-number">{result.metadata.estimatedTokens}</div>
                <div className="stat-label">Est. Tokens</div>
              </div>
              <div className="stat-card">
                <Database className="stat-icon" />
                <div className="stat-number">{result.metadata.processingTime}ms</div>
                <div className="stat-label">Process Time</div>
              </div>
            </div>
          </div>

          <div className="embedding-preview">
            <h4>Embedding Preview (First 10 values)</h4>
            <div className="vector-display">
              {result.embedding.sample.map((value, index) => (
                <span key={index} className="vector-value">
                  {value.toFixed(4)}
                </span>
              ))}
              <span className="vector-ellipsis">...</span>
            </div>
          </div>

          <div className="embedding-statistics">
            <h4>Statistical Analysis</h4>
            <div className="stats-table">
              <div className="stats-row">
                <span className="stats-label">Minimum Value:</span>
                <span className="stats-value">{result.embedding.statistics.min.toFixed(6)}</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">Maximum Value:</span>
                <span className="stats-value">{result.embedding.statistics.max.toFixed(6)}</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">Mean Value:</span>
                <span className="stats-value">{result.embedding.statistics.mean.toFixed(6)}</span>
              </div>
            </div>
          </div>

          <div className="text-display">
            <h4>Original Text</h4>
            <div className="text-content">
              {result.text}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .embedding-form {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .result-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .result-section h3 {
          color: #2d3748;
          margin-bottom: 25px;
          text-align: center;
        }

        .embedding-stats {
          margin-bottom: 30px;
        }

        .embedding-preview {
          background: #f7fafc;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .embedding-preview h4 {
          color: #2d3748;
          margin-bottom: 15px;
        }

        .vector-display {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .vector-value {
          background: #667eea;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .vector-ellipsis {
          color: #718096;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .embedding-statistics {
          background: #ebf8ff;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .embedding-statistics h4 {
          color: #2b6cb0;
          margin-bottom: 15px;
        }

        .stats-table {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: white;
          border-radius: 8px;
        }

        .stats-label {
          font-weight: 600;
          color: #4a5568;
        }

        .stats-value {
          font-family: 'Courier New', monospace;
          color: #2d3748;
          font-weight: 500;
        }

        .text-display {
          background: #f0fff4;
          border-radius: 10px;
          padding: 20px;
        }

        .text-display h4 {
          color: #2f855a;
          margin-bottom: 15px;
        }

        .text-content {
          color: #2f855a;
          line-height: 1.6;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default EmbeddingDemo;
