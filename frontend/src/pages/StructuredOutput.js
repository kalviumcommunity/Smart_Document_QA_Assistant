import React, { useState } from 'react';
import { Settings, Code, CheckCircle } from 'lucide-react';
import { llmAPI } from '../services/api';

const StructuredOutput = () => {
  const [prompt, setPrompt] = useState('');
  const [schemaType, setSchemaType] = useState('qa_response');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await llmAPI.generateStructured({
        prompt: prompt.trim(),
        schema_type: schemaType
      });

      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.details || error.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const schemaOptions = [
    { value: 'qa_response', label: 'Q&A Response', description: 'Answer with confidence and sources' },
    { value: 'document_analysis', label: 'Document Analysis', description: 'Summary and key insights' },
    { value: 'similarity_analysis', label: 'Similarity Analysis', description: 'Text comparison results' },
    { value: 'evaluation_result', label: 'Evaluation Result', description: 'Scores and feedback' },
    { value: 'prompt_analysis', label: 'Prompt Analysis', description: 'Prompt effectiveness analysis' }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">
        <Settings className="title-icon" />
        Structured Output
      </h1>
      <p className="page-subtitle">
        Generate structured JSON responses with schema validation
      </p>

      <div className="structured-form">
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Prompt</label>
            <textarea
              className="form-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Schema Type</label>
            <select
              className="form-select"
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value)}
            >
              {schemaOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Generating...
              </>
            ) : (
              <>
                <Code size={20} />
                Generate Structured Output
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
          <div className="result-header">
            <h3>Structured Output</h3>
            <div className="success-badge">
              <CheckCircle size={16} />
              Schema Validated
            </div>
          </div>

          <div className="json-output">
            <pre>{JSON.stringify(result.response, null, 2)}</pre>
          </div>

          <div className="metadata-section">
            <h4>Metadata</h4>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="label">Schema Type:</span>
                <span className="value">{result.schema_type}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Tokens Used:</span>
                <span className="value">{result.metadata.tokens_used}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Validated:</span>
                <span className="value">
                  {result.metadata.schema_validated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .structured-form {
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

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f7fafc;
        }

        .success-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #c6f6d5;
          color: #2f855a;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .json-output {
          background: #1a202c;
          color: #e2e8f0;
          padding: 25px;
          border-radius: 10px;
          overflow-x: auto;
          margin-bottom: 25px;
        }

        .json-output pre {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        .metadata-section {
          background: #f7fafc;
          border-radius: 10px;
          padding: 20px;
        }

        .metadata-section h4 {
          color: #2d3748;
          margin-bottom: 15px;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .metadata-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metadata-item .label {
          font-weight: 600;
          color: #4a5568;
        }

        .metadata-item .value {
          color: #2d3748;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default StructuredOutput;
