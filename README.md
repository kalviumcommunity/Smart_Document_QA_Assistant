# Smart Document Q&A Assistant

Upload docs, ask questions, get AI answers using embeddings, vector similarity, and advanced LLM prompting techniques in MERN stack.

## Features

- Document upload and processing
- Intelligent chunking and embeddings
- Multiple similarity functions (Cosine, Dot Product, L2 Distance)
- Dynamic prompting with user adaptation
- Chain-of-thought reasoning
- LLM parameter tuning (Temperature, Top-K, Top-P)
- Structured output and function calling
- Evaluation framework with judge prompts
- Token tracking and usage monitoring

## Tech Stack

**Frontend**: React.js
**Backend**: Node.js, Express.js  
**Database**: MongoDB
**Vector Search**: Embeddings with similarity functions
**LLM**: GEMINI API

## Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Frontend  
cd ../frontend
npm install

# Start services
npm run dev
```

## API Endpoints

### Similarity
- `POST /api/similarity/test` - Test similarity functions
- `POST /api/similarity/search` - Find similar chunks
- `POST /api/similarity/compare` - Compare methods

### Prompting
- `POST /api/prompts/generate` - Dynamic prompt generation
- `POST /api/prompts/analyze` - Question analysis
- `POST /api/prompts/variations` - Test different approaches

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `POST /api/documents/query` - Ask questions

## LLM Concepts Implemented

1. **Embeddings** - Text to vector conversion
2. **Dot Product Similarity** - Vector similarity calculation
3. **Cosine Similarity** - Normalized similarity measure
4. **L2 Distance** - Euclidean distance similarity
5. **Dynamic Prompting** - Context-aware prompt generation
6. **Chain of Thought** - Step-by-step reasoning
7. **Zero/One/Multi-shot** - Example-based prompting
8. **Temperature/Top-K/Top-P** - LLM parameter control
9. **Structured Output** - JSON response formatting
10. **Function Calling** - Tool integration
11. **Evaluation Framework** - Automated testing
12. **Token Tracking** - Usage monitoring

## Usage Example

```javascript
// Upload document
const doc = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData
});

// Ask question with dynamic prompting
const response = await fetch('/api/documents/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: "What is the main topic?",
    similarity_method: "dot_product",
    user_expertise: "intermediate"
  })
});
```

## Environment Variables

```bash
GEMINI_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017/smart-qa
PORT=5000
NODE_ENV=development
```

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test similarity
npm test prompting
npm test evaluation
```
