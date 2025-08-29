import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Database,
  FileText,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vectorStats, documentsStats] = await Promise.all([
        api.get('/vector/stats').catch(() => ({ data: { statistics: { totalDocuments: 0, totalChunks: 0 } } })),
        api.get('/documents').catch(() => ({ data: { total: 0 } }))
      ]);

      setStats({
        vectorDocuments: vectorStats.data.statistics?.totalDocuments || 0,
        vectorChunks: vectorStats.data.statistics?.totalChunks || 0,
        mongoDocuments: documentsStats.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ vectorDocuments: 0, vectorChunks: 0, mongoDocuments: 0 });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Upload,
      title: 'Document Upload',
      description: 'Upload documents and generate embeddings automatically using Gemini API',
      link: '/upload',
      color: '#48bb78'
    },
    {
      icon: Search,
      title: 'Vector Search',
      description: 'Search similar content using PostgreSQL + pgvector with multiple similarity methods',
      link: '/search',
      color: '#667eea'
    },
    {
      icon: MessageSquare,
      title: 'Dynamic Prompting',
      description: 'Test zero-shot, one-shot, multi-shot, and chain-of-thought prompting techniques',
      link: '/prompts',
      color: '#764ba2'
    },
    {
      icon: BarChart3,
      title: 'Similarity Functions',
      description: 'Compare dot product, cosine, and euclidean distance similarity calculations',
      link: '/similarity',
      color: '#f093fb'
    },
    {
      icon: Settings,
      title: 'Structured Output',
      description: 'Generate structured JSON responses with schema validation',
      link: '/structured',
      color: '#4facfe'
    },
    {
      icon: Database,
      title: 'Embeddings Demo',
      description: 'Generate and visualize text embeddings with statistical analysis',
      link: '/embeddings',
      color: '#43e97b'
    }
  ];

  const llmConcepts = [
    { name: 'Embeddings', status: 'completed', description: 'Text to vector conversion' },
    { name: 'Dot Product Similarity', status: 'completed', description: 'Vector similarity calculation' },
    { name: 'Dynamic Prompting', status: 'completed', description: 'Context-aware prompt generation' },
    { name: 'Multi-shot Prompting', status: 'completed', description: 'Multiple example guidance' },
    { name: 'Structured Output', status: 'completed', description: 'JSON schema enforcement' },
    { name: 'Vector Database', status: 'completed', description: 'PostgreSQL + pgvector integration' },
    { name: 'One-shot Prompting', status: 'completed', description: 'Single example guidance' },
  ];

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 className="page-title">
          <Brain className="title-icon" />
          Smart Document Q&A Assistant
        </h1>
        <p className="page-subtitle">
          Upload docs, ask questions, get AI answers using embeddings, vector similarity, and advanced LLM techniques
        </p>
        
        <div className="hero-stats">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              Loading statistics...
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <FileText className="stat-icon" />
                <div className="stat-number">{stats?.vectorDocuments + stats?.mongoDocuments || 0}</div>
                <div className="stat-label">Total Documents</div>
              </div>
              <div className="stat-card">
                <Database className="stat-icon" />
                <div className="stat-number">{stats?.vectorChunks || 0}</div>
                <div className="stat-label">Vector Chunks</div>
              </div>
              <div className="stat-card">
                <Target className="stat-icon" />
                <div className="stat-number">7</div>
                <div className="stat-label">LLM Concepts</div>
              </div>
              <div className="stat-card">
                <Zap className="stat-icon" />
                <div className="stat-number">100%</div>
                <div className="stat-label">Functional</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Features</h2>
        <div className="grid grid-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.link} className="feature-card">
                <div className="feature-icon" style={{ color: feature.color }}>
                  <Icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="concepts-section">
        <h2 className="section-title">Implemented LLM Concepts</h2>
        <div className="concepts-grid">
          {llmConcepts.map((concept, index) => (
            <div key={index} className="concept-card">
              <div className="concept-status">
                <span className={`badge badge-${concept.status}`}>
                  {concept.status === 'completed' ? '✅' : '🔄'} {concept.status}
                </span>
              </div>
              <h4 className="concept-name">{concept.name}</h4>
              <p className="concept-description">{concept.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="tech-stack-section">
        <h2 className="section-title">Technology Stack</h2>
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-title">Frontend</h3>
            <div className="tech-list">
              <span className="tech-badge">React.js</span>
              <span className="tech-badge">React Router</span>
              <span className="tech-badge">Axios</span>
              <span className="tech-badge">Lucide Icons</span>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">Backend</h3>
            <div className="tech-list">
              <span className="tech-badge">Node.js</span>
              <span className="tech-badge">Express.js</span>
              <span className="tech-badge">Gemini API</span>
              <span className="tech-badge">PostgreSQL</span>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">Vector Database</h3>
            <div className="tech-list">
              <span className="tech-badge">pgvector</span>
              <span className="tech-badge">IVFFlat Index</span>
              <span className="tech-badge">Vector Similarity</span>
              <span className="tech-badge">JSONB Metadata</span>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">LLM Features</h3>
            <div className="tech-list">
              <span className="tech-badge">Embeddings</span>
              <span className="tech-badge">Dynamic Prompts</span>
              <span className="tech-badge">Structured Output</span>
              <span className="tech-badge">Similarity Search</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          text-align: center;
          margin-bottom: 60px;
        }

        .title-icon {
          margin-right: 15px;
          vertical-align: middle;
        }

        .hero-stats {
          margin-top: 40px;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features-section {
          margin-bottom: 60px;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .feature-icon {
          margin-bottom: 20px;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 15px;
        }

        .feature-description {
          color: #718096;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .feature-arrow {
          font-size: 1.5rem;
          color: #667eea;
          font-weight: bold;
          position: absolute;
          bottom: 20px;
          right: 25px;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(5px);
        }

        .concepts-section {
          margin-bottom: 60px;
        }

        .concepts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .concept-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .concept-card:hover {
          border-color: #667eea;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
        }

        .concept-status {
          margin-bottom: 15px;
        }

        .concept-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 10px;
        }

        .concept-description {
          color: #718096;
          font-size: 0.95rem;
        }

        .tech-stack-section {
          margin-bottom: 40px;
        }

        .tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }

        .tech-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .stat-icon {
          width: 24px;
          height: 24px;
          color: #667eea;
          margin-bottom: 10px;
        }

        .badge-completed {
          background: #c6f6d5;
          color: #2f855a;
        }

        .badge-progress {
          background: #faf089;
          color: #744210;
        }

        @media (max-width: 768px) {
          .hero-stats {
            margin-top: 30px;
          }
          
          .concepts-grid {
            grid-template-columns: 1fr;
          }
          
          .tech-list {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
