const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class EmbeddingService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
  }

  async generateEmbedding(text) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Text input is required and must be a string');
      }

      const cleanText = text.trim().replace(/\s+/g, ' ');
      
      if (cleanText.length === 0) {
        throw new Error('Text cannot be empty after cleaning');
      }

      console.log(`Generating embedding for text (${cleanText.length} chars)`);

      const result = await this.model.embedContent(cleanText);
      const embedding = result.embedding.values;

      console.log(`Generated embedding with ${embedding.length} dimensions`);
      return embedding;

    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  async generateBatchEmbeddings(texts) {
    try {
      if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error('Texts must be a non-empty array');
      }

      const cleanTexts = texts.map(text => {
        if (typeof text !== 'string') {
          throw new Error('All texts must be strings');
        }
        return text.trim().replace(/\s+/g, ' ');
      }).filter(text => text.length > 0);

      if (cleanTexts.length === 0) {
        throw new Error('No valid texts after cleaning');
      }

      console.log(`Generating ${cleanTexts.length} embeddings`);

      const embeddings = [];
      for (const text of cleanTexts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }

      return embeddings;

    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
  }

  chunkText(text, maxChars = 8000, overlap = 200) {
    const chunks = [];
    
    if (text.length <= maxChars) {
      return [text];
    }

    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + maxChars, text.length);
      
      if (end < text.length) {
        const lastSentence = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastSentence, lastNewline);
        
        if (breakPoint > start + maxChars * 0.5) {
          end = breakPoint + 1;
        }
      }
      
      chunks.push(text.slice(start, end).trim());
      start = Math.max(start + maxChars - overlap, end);
    }

    return chunks.filter(chunk => chunk.length > 0);
  }
}

module.exports = EmbeddingService;
