import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export const documentAPI = {
  uploadDocument: (formData) => {
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDocuments: () => api.get('/documents'),
  getDocument: (id) => api.get(`/documents/${id}`),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  queryDocument: (data) => api.post('/documents/query', data),
  generateEmbeddingDemo: (data) => api.post('/documents/embedding-demo', data)
};

export const vectorAPI = {
  uploadToVector: (formData) => {
    return api.post('/vector/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  searchVectors: (data) => api.post('/vector/search', data),
  getVectorDocuments: () => api.get('/vector/documents'),
  getVectorDocument: (id) => api.get(`/vector/documents/${id}`),
  deleteVectorDocument: (id) => api.delete(`/vector/documents/${id}`),
  getVectorStats: () => api.get('/vector/stats'),
  compareVectorOps: (data) => api.post('/vector/compare', data),
  initializeVectorDB: () => api.post('/vector/initialize')
};

export const promptAPI = {
  generateZeroShot: (data) => api.post('/prompting/zero-shot', data),
  generateOneShot: (data) => api.post('/prompting/one-shot', data),
  generateMultiShot: (data) => api.post('/prompting/multi-shot', data),
  generateChainOfThought: (data) => api.post('/prompting/chain-of-thought', data),
  comparePrompts: (data) => api.post('/prompting/compare', data),
  demonstrateEvolution: (data) => api.post('/prompting/demonstrate', data),
  generateAdaptive: (data) => api.post('/prompting/adaptive', data)
};

export const similarityAPI = {
  testSimilarity: (data) => api.post('/similarity/test', data),
  searchSimilar: (data) => api.post('/similarity/search', data),
  compareAllMethods: (data) => api.post('/similarity/compare', data),
  getSimilarityStats: () => api.get('/similarity/stats')
};

export const llmAPI = {
  generateStructured: (data) => api.post('/llm/structured', data),
  generateWithParams: (data) => api.post('/llm/generate', data),
  analyzeDocument: (data) => api.post('/llm/analyze-document', data),
  evaluateResponse: (data) => api.post('/llm/evaluate', data),
  compareSimilarity: (data) => api.post('/llm/compare-similarity', data),
  getSchemas: () => api.get('/llm/schemas'),
  demonstrateStructured: (data) => api.post('/llm/demonstrate', data)
};

export const dynamicPromptAPI = {
  generate: (data) => api.post('/prompts/generate', data),
  testVariations: (data) => api.post('/prompts/test-variations', data),
  analyzeQuestion: (data) => api.post('/prompts/analyze-question', data),
  demonstrate: (data) => api.post('/prompts/demonstrate', data)
};

export default api;
