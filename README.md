# Smart Document Q&A Assistant

Upload docs, ask questions, get AI answers using embeddings, vector similarity, and advanced LLM techniques in MERN stack.

## ✨ Features

- **Document Upload & Processing** - Upload text documents with automatic chunking and embedding generation
- **Vector Search** - PostgreSQL + pgvector for high-performance similarity search
- **Multiple Similarity Methods** - Cosine, Dot Product, L2 Distance comparison
- **Dynamic Prompting** - Context-aware prompt generation with user adaptation
- **Advanced Prompting Techniques** - Zero-shot, One-shot, Multi-shot, Chain-of-thought
- **Structured Output** - JSON schema enforcement with validation
- **Real-time Statistics** - Token tracking and usage monitoring
- **Modern UI** - React frontend with responsive design

## 🛠 Tech Stack

**Frontend**: React.js, React Router, Axios, Lucide Icons
**Backend**: Node.js, Express.js, Mongoose
**Databases**: PostgreSQL + pgvector, MongoDB
**LLM**: Gemini API
**Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js (>=16.0.0)
- npm (>=8.0.0)
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Smart_Document_QA_Assistant

# Install all dependencies
npm run setup

# Start databases (optional - using Docker)
docker-compose up -d

# Start the application
npm run dev
```

### Environment Setup

```bash
# Backend environment
cp backend/.env.example backend/.env

# Add your API keys to backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=smart_qa_vector
```

## 📊 LLM Concepts Implemented

### ✅ Completed (7/18)

1. **📚 Project README** - Comprehensive documentation
2. **🔢 Dot Product Similarity** - Vector similarity calculation
3. **🎯 Dynamic Prompting** - Context-aware prompt generation
4. **🧠 Embeddings** - Text-to-vector conversion using Gemini API
5. **📝 Multi-shot Prompting** - Multiple example guidance
6. **⚙️ Structured Output** - JSON schema enforcement
7. **🗄️ Vector Database** - PostgreSQL + pgvector integration

### 🔄 Available to Implement

8. **📊 Evaluation Dataset & Testing** - Automated testing framework
9. **🔧 Function Calling** - Tool integration capabilities
10. **📐 L2 Distance Similarity** - Euclidean distance calculations
11. **🎯 One-shot Prompting** - Single example guidance
12. **⏹️ Stop Sequence** - Custom stop tokens
13. **👤 System & User Prompts** - RTFC framework
14. **🌡️ Temperature Control** - LLM parameter tuning
15. **🔢 Tokens & Tokenization** - Token tracking system
16. **🔝 Top-K Sampling** - Response diversity control
17. **📈 Top-P Sampling** - Nucleus sampling implementation
18. **❄️ Zero-shot Prompting** - No-example prompting

## 🌐 API Endpoints

### Vector Database
- `POST /api/vector/upload` - Upload document to vector database
- `POST /api/vector/search` - Search similar vectors using pgvector
- `GET /api/vector/documents` - List all vector documents
- `GET /api/vector/stats` - Get vector database statistics

### Document Management
- `POST /api/documents/upload` - Upload document to MongoDB
- `GET /api/documents` - List all documents
- `POST /api/documents/query` - Query documents with Q&A

### Prompting Techniques
- `POST /api/prompting/zero-shot` - Generate zero-shot prompts
- `POST /api/prompting/one-shot` - Generate one-shot prompts
- `POST /api/prompting/multi-shot` - Generate multi-shot prompts
- `POST /api/prompting/chain-of-thought` - Generate reasoning prompts

### LLM Operations
- `POST /api/llm/structured` - Generate structured JSON responses
- `POST /api/llm/generate` - Generate responses with custom parameters
- `GET /api/llm/schemas` - Get available response schemas

### Similarity Functions
- `POST /api/similarity/test` - Test similarity functions
- `POST /api/similarity/compare` - Compare similarity methods

## 💻 Usage Examples

### Upload Document
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/vector/upload', {
  method: 'POST',
  body: formData
});
```

### Search Vectors
```javascript
const response = await fetch('/api/vector/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What is machine learning?",
    similarity_method: "cosine",
    limit: 5
  })
});
```

### Generate Structured Output
```javascript
const response = await fetch('/api/llm/structured', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Analyze this document",
    schema_type: "document_analysis"
  })
});
```

## 🏗 Project Structure

```
Smart_Document_QA_Assistant/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configurations
│   ├── controllers/        # Request handlers
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── tests/             # Test suites
├── frontend/              # React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API clients
│   │   └── App.js        # Main application
├── docker-compose.yml     # Database containers
├── init-db.sql           # PostgreSQL initialization
└── package.json          # Root package configuration
```

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run specific test suite
cd backend && npm test similarity
cd backend && npm test vector
cd backend && npm test prompting
```

## 🐳 Docker Setup

```bash
# Start databases
docker-compose up -d

# Initialize vector database
curl -X POST http://localhost:5000/api/vector/initialize

# Check database status
docker-compose ps
```

## 🔧 Development

```bash
# Start development servers
npm run dev

# Backend only
npm run start:backend

# Frontend only  
npm run start:frontend

# Build for production
npm run build
```

## 📈 Performance Features

- **Vector Indexing** - IVFFlat indexing for fast similarity search
- **Batch Operations** - Efficient bulk vector insertion
- **Connection Pooling** - PostgreSQL connection management
- **Caching** - Response caching for repeated queries
- **Lazy Loading** - Component-based code splitting

## 🎯 Next Steps

1. **Implement Evaluation Framework** - Automated testing with judge prompts
2. **Add Function Calling** - Tool integration capabilities
3. **Enhance UI/UX** - Advanced visualizations and analytics
4. **Performance Optimization** - Caching and query optimization
5. **Deployment** - Production deployment configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Gemini API** for embeddings and LLM capabilities
- **pgvector** for high-performance vector operations
- **React** ecosystem for modern UI development
- **Node.js** community for backend tools

---

**Built with ❤️ using MERN stack + Vector Database + LLM integration**