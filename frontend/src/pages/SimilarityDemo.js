import React, { useState } from 'react';
import { BarChart3, Calculator, Zap } from 'lucide-react';
import { similarityAPI } from '../services/api';

const SimilarityDemo = () => {
  const [vectorA, setVectorA] = useState('[1, 2, 3, 4, 5]');
  const [vectorB, setVectorB] = useState('[2, 3, 4, 5, 6]');
  const [method, setMethod] = useState('dot_product');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedVectorA = JSON.parse(vectorA);
      const parsedVectorB = JSON.parse(vectorB);

      const response = await similarityAPI.testSimilarity({
        vectorA: parsedVectorA,
        vectorB: parsedVectorB,
        method
      });

      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.details || error.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">
        <BarChart3 className="title-icon" />
        Similarity Functions
      </h1>
      <p className="page-subtitle">
        Compare dot product, cosine, and euclidean distance similarity calculations
      </p>

      <div className="similarity-form">
        <form onSubmit={handleTest}>
          <div className="form-group">
            <label className="form-label">Vector A</label>
            <input
              className="form-input"
              value={vectorA}
              onChange={(e) => setVectorA(e.target.value)}
              placeholder="[1, 2, 3, 4, 5]"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vector B</label>
            <input
              className="form-input"
              value={vectorB}
              onChange={(e) => setVectorB(e.target.value)}
              placeholder="[2, 3, 4, 5, 6]"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Method</label>
            <select
              className="form-select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="dot_product">Dot Product</option>
              <option value="cosine">Cosine Similarity</option>
              <option value="euclidean">Euclidean Distance</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator size={20} />
                Calculate Similarity
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
          <h3>Results</h3>
          <div className="result-display">
            <div className="main-result">
              <span className="result-label">{result.method} Result:</span>
              <span className="result-value">{result.result}</span>
            </div>
            
            <div className="comparison-results">
              <h4>All Methods Comparison</h4>
              <div className="comparison-grid">
                <div className="comparison-item">
                  <span className="method-name">Dot Product:</span>
                  <span className="method-value">{result.comparison.dot_product}</span>
                </div>
                <div className="comparison-item">
                  <span className="method-name">Cosine:</span>
                  <span className="method-value">{result.comparison.cosine}</span>
                </div>
                <div className="comparison-item">
                  <span className="method-name">Euclidean:</span>
                  <span className="method-value">{result.comparison.euclidean}</span>
                </div>
              </div>
            </div>

            <div className="explanation">
              <h4>Explanation</h4>
              <p><strong>Formula:</strong> {result.explanation.formula}</p>
              <p><strong>Interpretation:</strong> {result.explanation.interpretation}</p>
              {result.explanation.calculation && (
                <p><strong>Calculation:</strong> {result.explanation.calculation}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .similarity-form {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .result-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .result-display {
          margin-top: 20px;
        }

        .main-result {
          background: #f7fafc;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          text-align: center;
        }

        .result-label {
          font-size: 1.2rem;
          color: #4a5568;
          margin-right: 15px;
        }

        .result-value {
          font-size: 2rem;
          font-weight: 700;
          color: #667eea;
        }

        .comparison-results {
          margin-bottom: 25px;
        }

        .comparison-results h4 {
          color: #2d3748;
          margin-bottom: 15px;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .comparison-item {
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .method-name {
          font-weight: 600;
          color: #4a5568;
        }

        .method-value {
          font-weight: 700;
          color: #2d3748;
        }

        .explanation {
          background: #ebf8ff;
          border: 1px solid #bee3f8;
          border-radius: 10px;
          padding: 20px;
        }

        .explanation h4 {
          color: #2b6cb0;
          margin-bottom: 15px;
        }

        .explanation p {
          color: #2b6cb0;
          margin-bottom: 10px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default SimilarityDemo;
