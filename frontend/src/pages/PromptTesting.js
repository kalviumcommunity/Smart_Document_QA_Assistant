import React, { useState } from 'react';
import { MessageSquare, Zap, Target, Brain, Settings } from 'lucide-react';
import { promptAPI } from '../services/api';

const PromptTesting = () => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [promptType, setPromptType] = useState('multi-shot');
  const [domain, setDomain] = useState('general');
  const [numExamples, setNumExamples] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!question.trim() || !context.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setComparison(null);

    try {
      let response;
      const data = { question: question.trim(), context: context.trim(), domain };

      switch (promptType) {
        case 'zero-shot':
          response = await promptAPI.generateZeroShot(data);
          break;
        case 'one-shot':
          response = await promptAPI.generateOneShot(data);
          break;
        case 'multi-shot':
          response = await promptAPI.generateMultiShot({ ...data, numExamples });
          break;
        case 'chain-of-thought':
          response = await promptAPI.generateChainOfThought({ ...data, includeExamples: true });
          break;
        default:
          response = await promptAPI.generateMultiShot({ ...data, numExamples });
      }

      setResult(response.data);
    } catch (error) {
      console.error('Prompt generation error:', error);
      setError(error.response?.data?.details || error.message || 'Failed to generate prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!question.trim() || !context.trim()) return;

    setLoading(true);
    setError(null);
    setComparison(null);

    try {
      const response = await promptAPI.comparePrompts({
        question: question.trim(),
        context: context.trim(),
        domain
      });

      setComparison(response.data);
    } catch (error) {
      console.error('Comparison error:', error);
      setError(error.response?.data?.details || error.message || 'Failed to compare prompts');
    } finally {
      setLoading(false);
    }
  };

  const getPromptTypeIcon = (type) => {
    switch (type) {
      case 'zero-shot': return <Target size={20} />;
      case 'one-shot': return <Zap size={20} />;
      case 'multi-shot': return <Settings size={20} />;
      case 'chain-of-thought': return <Brain size={20} />;
      default: return <MessageSquare size={20} />;
    }
  };

  const getPromptTypeColor = (type) => {
    switch (type) {
      case 'zero-shot': return '#f56565';
      case 'one-shot': return '#ed8936';
      case 'multi-shot': return '#48bb78';
      case 'chain-of-thought': return '#667eea';
      default: return '#718096';
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">
        <MessageSquare className="title-icon" />
        Prompt Testing
      </h1>
      <p className="page-subtitle">
        Test zero-shot, one-shot, multi-shot, and chain-of-thought prompting techniques
      </p>

      <div className="prompt-form-section">
        <form onSubmit={handleGenerate} className="prompt-form">
          <div className="form-group">
            <label className="form-label">Question</label>
            <textarea
              className="form-textarea"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Context</label>
            <textarea
              className="form-textarea"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Enter the context or background information..."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prompt Type</label>
              <select
                className="form-select"
                value={promptType}
                onChange={(e) => setPromptType(e.target.value)}
              >
                <option value="zero-shot">Zero-shot</option>
                <option value="one-shot">One-shot</option>
                <option value="multi-shot">Multi-shot</option>
                <option value="chain-of-thought">Chain-of-thought</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Domain</label>
              <select
                className="form-select"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="academic">Academic</option>
              </select>
            </div>

            {promptType === 'multi-shot' && (
              <div className="form-group">
                <label className="form-label">Number of Examples</label>
                <select
                  className="form-select"
                  value={numExamples}
                  onChange={(e) => setNumExamples(parseInt(e.target.value))}
                >
                  <option value={2}>2 examples</option>
                  <option value={3}>3 examples</option>
                  <option value={4}>4 examples</option>
                  <option value={5}>5 examples</option>
                </select>
              </div>
            )}
          </div>

          <div className="button-row">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !question.trim() || !context.trim()}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  {getPromptTypeIcon(promptType)}
                  Generate {promptType.replace('-', ' ')} Prompt
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCompare}
              disabled={loading || !question.trim() || !context.trim()}
            >
              <Settings size={20} />
              Compare All Methods
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error">
          <MessageSquare size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="result-section">
          <div className="result-header">
            <h3>Generated Prompt</h3>
            <div className="prompt-type-badge" style={{ background: getPromptTypeColor(promptType) }}>
              {getPromptTypeIcon(promptType)}
              {promptType.replace('-', ' ')}
            </div>
          </div>

          <div className="prompt-display">
            <pre>{result.prompt}</pre>
          </div>

          <div className="result-metadata">
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="label">Type:</span>
                <span className="value">{result.metadata?.type || promptType}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Domain:</span>
                <span className="value">{result.metadata?.domain || domain}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Examples:</span>
                <span className="value">{result.metadata?.numExamples || 0}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Prompt Length:</span>
                <span className="value">{result.metadata?.promptLength || result.prompt?.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {comparison && (
        <div className="comparison-section">
          <h3>Prompt Comparison</h3>
          <div className="comparison-grid">
            {Object.entries(comparison.comparison).map(([method, data]) => (
              <div key={method} className="comparison-card">
                <div className="comparison-header">
                  <div className="method-badge" style={{ background: getPromptTypeColor(method) }}>
                    {getPromptTypeIcon(method)}
                    {method.replace('-', ' ')}
                  </div>
                </div>

                <div className="comparison-stats">
                  <div className="stat-item">
                    <span className="stat-label">Length:</span>
                    <span className="stat-value">{data.length} chars</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Words:</span>
                    <span className="stat-value">{data.wordCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Examples:</span>
                    <span className="stat-value">{data.exampleCount}</span>
                  </div>
                </div>

                <div className="comparison-prompt">
                  <pre>{data.prompt.substring(0, 200)}...</pre>
                </div>
              </div>
            ))}
          </div>

          <div className="analysis-section">
            <h4>Analysis & Recommendations</h4>
            <div className="analysis-grid">
              {Object.entries(comparison.analysis).map(([method, analysis]) => (
                <div key={method} className="analysis-card">
                  <h5>{method.replace('-', ' ')}</h5>
                  <div className="pros-cons">
                    <div className="pros">
                      <strong>Pros:</strong>
                      <ul>
                        {analysis.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="cons">
                      <strong>Cons:</strong>
                      <ul>
                        {analysis.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="best-for">
                    <strong>Best for:</strong> {analysis.bestFor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .prompt-form-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .prompt-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .button-row {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }

        .button-row .btn {
          flex: 1;
          padding: 15px;
          font-size: 1rem;
        }

        .result-section, .comparison-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
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

        .result-header h3 {
          color: #2d3748;
          margin: 0;
        }

        .prompt-type-badge, .method-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: capitalize;
        }

        .prompt-display {
          background: #1a202c;
          color: #e2e8f0;
          padding: 25px;
          border-radius: 10px;
          margin-bottom: 25px;
          overflow-x: auto;
        }

        .prompt-display pre {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          white-space: pre-wrap;
          margin: 0;
        }

        .result-metadata {
          background: #f7fafc;
          border-radius: 10px;
          padding: 20px;
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

        .comparison-section h3 {
          color: #2d3748;
          margin-bottom: 25px;
          text-align: center;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .comparison-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          background: #fafafa;
        }

        .comparison-header {
          margin-bottom: 15px;
        }

        .comparison-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          padding: 15px;
          background: white;
          border-radius: 8px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: #718096;
          margin-bottom: 5px;
        }

        .stat-value {
          font-weight: 600;
          color: #2d3748;
        }

        .comparison-prompt {
          background: #1a202c;
          color: #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          overflow: hidden;
        }

        .comparison-prompt pre {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          line-height: 1.4;
          margin: 0;
        }

        .analysis-section {
          border-top: 2px solid #f7fafc;
          padding-top: 25px;
        }

        .analysis-section h4 {
          color: #2d3748;
          margin-bottom: 20px;
          text-align: center;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .analysis-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
        }

        .analysis-card h5 {
          color: #2d3748;
          margin-bottom: 15px;
          text-transform: capitalize;
          font-size: 1.1rem;
        }

        .pros-cons {
          margin-bottom: 15px;
        }

        .pros, .cons {
          margin-bottom: 15px;
        }

        .pros strong, .cons strong {
          color: #2d3748;
          display: block;
          margin-bottom: 8px;
        }

        .pros ul, .cons ul {
          margin: 0;
          padding-left: 20px;
        }

        .pros li, .cons li {
          color: #4a5568;
          margin-bottom: 5px;
          font-size: 0.9rem;
        }

        .best-for {
          background: #f0fff4;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #48bb78;
        }

        .best-for strong {
          color: #2f855a;
        }

        @media (max-width: 768px) {
          .button-row {
            flex-direction: column;
          }
          
          .result-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .comparison-stats {
            flex-direction: column;
            gap: 10px;
          }
          
          .metadata-grid {
            grid-template-columns: 1fr;
          }
          
          .comparison-grid, .analysis-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PromptTesting;
