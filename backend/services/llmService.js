const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class LLMService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json'
      }
    });
  }

  async generateStructuredResponse(prompt, schema) {
    try {
      const structuredPrompt = this.createStructuredPrompt(prompt, schema);
      
      console.log(`Generating structured response with schema: ${schema.type}`);
      
      const result = await this.model.generateContent(structuredPrompt);
      const response = result.response.text();
      
      const parsedResponse = JSON.parse(response);
      
      if (!this.validateStructure(parsedResponse, schema)) {
        throw new Error('Response does not match required schema');
      }

      console.log(`Generated structured response: ${JSON.stringify(parsedResponse).substring(0, 100)}...`);
      
      return {
        success: true,
        data: parsedResponse,
        schema: schema.type,
        tokens: this.estimateTokens(response)
      };

    } catch (error) {
      console.error('Error generating structured response:', error);
      throw new Error(`Failed to generate structured response: ${error.message}`);
    }
  }

  createStructuredPrompt(prompt, schema) {
    const schemaDescription = this.generateSchemaDescription(schema);
    
    return `${prompt}

IMPORTANT: Respond ONLY with valid JSON that matches this exact schema:

${schemaDescription}

Requirements:
- Return only valid JSON
- Include all required fields
- Use correct data types
- No additional text or explanation outside the JSON

JSON Response:`;
  }

  generateSchemaDescription(schema) {
    switch (schema.type) {
      case 'qa_response':
        return `{
  "answer": "string - the main answer to the question",
  "confidence": "number - confidence score from 0 to 1",
  "sources": ["array of strings - relevant source references"],
  "reasoning": "string - brief explanation of the reasoning",
  "category": "string - question category (factual, analytical, comparative)",
  "keywords": ["array of strings - key terms from the answer"]
}`;

      case 'document_analysis':
        return `{
  "summary": "string - brief document summary",
  "main_topics": ["array of strings - key topics discussed"],
  "sentiment": "string - overall sentiment (positive, negative, neutral)",
  "complexity": "string - complexity level (low, medium, high)",
  "word_count": "number - estimated word count",
  "key_entities": ["array of strings - important entities mentioned"],
  "actionable_items": ["array of strings - any action items found"]
}`;

      case 'similarity_analysis':
        return `{
  "similarity_score": "number - similarity score from 0 to 1",
  "method_used": "string - similarity method (cosine, dot_product, euclidean)",
  "matching_concepts": ["array of strings - concepts that match"],
  "differences": ["array of strings - key differences found"],
  "recommendation": "string - recommendation based on similarity"
}`;

      case 'evaluation_result':
        return `{
  "accuracy": "number - accuracy score from 0 to 10",
  "completeness": "number - completeness score from 0 to 10",
  "relevance": "number - relevance score from 0 to 10",
  "overall_score": "number - overall score from 0 to 10",
  "strengths": ["array of strings - identified strengths"],
  "weaknesses": ["array of strings - identified weaknesses"],
  "suggestions": ["array of strings - improvement suggestions"]
}`;

      case 'prompt_analysis':
        return `{
  "prompt_type": "string - type of prompt (zero-shot, one-shot, multi-shot, chain-of-thought)",
  "effectiveness": "number - effectiveness score from 0 to 10",
  "clarity": "number - clarity score from 0 to 10",
  "completeness": "number - completeness score from 0 to 10",
  "improvements": ["array of strings - suggested improvements"],
  "optimal_for": ["array of strings - scenarios this prompt works best for"]
}`;

      default:
        return `{
  "result": "string - the main result",
  "status": "string - success or error status",
  "metadata": "object - additional information"
}`;
    }
  }

  validateStructure(response, schema) {
    try {
      switch (schema.type) {
        case 'qa_response':
          return this.validateQAResponse(response);
        case 'document_analysis':
          return this.validateDocumentAnalysis(response);
        case 'similarity_analysis':
          return this.validateSimilarityAnalysis(response);
        case 'evaluation_result':
          return this.validateEvaluationResult(response);
        case 'prompt_analysis':
          return this.validatePromptAnalysis(response);
        default:
          return typeof response === 'object' && response !== null;
      }
    } catch (error) {
      return false;
    }
  }

  validateQAResponse(response) {
    return (
      typeof response.answer === 'string' &&
      typeof response.confidence === 'number' &&
      Array.isArray(response.sources) &&
      typeof response.reasoning === 'string' &&
      typeof response.category === 'string' &&
      Array.isArray(response.keywords)
    );
  }

  validateDocumentAnalysis(response) {
    return (
      typeof response.summary === 'string' &&
      Array.isArray(response.main_topics) &&
      typeof response.sentiment === 'string' &&
      typeof response.complexity === 'string' &&
      typeof response.word_count === 'number' &&
      Array.isArray(response.key_entities) &&
      Array.isArray(response.actionable_items)
    );
  }

  validateSimilarityAnalysis(response) {
    return (
      typeof response.similarity_score === 'number' &&
      typeof response.method_used === 'string' &&
      Array.isArray(response.matching_concepts) &&
      Array.isArray(response.differences) &&
      typeof response.recommendation === 'string'
    );
  }

  validateEvaluationResult(response) {
    return (
      typeof response.accuracy === 'number' &&
      typeof response.completeness === 'number' &&
      typeof response.relevance === 'number' &&
      typeof response.overall_score === 'number' &&
      Array.isArray(response.strengths) &&
      Array.isArray(response.weaknesses) &&
      Array.isArray(response.suggestions)
    );
  }

  validatePromptAnalysis(response) {
    return (
      typeof response.prompt_type === 'string' &&
      typeof response.effectiveness === 'number' &&
      typeof response.clarity === 'number' &&
      typeof response.completeness === 'number' &&
      Array.isArray(response.improvements) &&
      Array.isArray(response.optimal_for)
    );
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  async generateWithParameters(prompt, parameters = {}) {
    try {
      const {
        temperature = 0.7,
        topP = 0.9,
        topK = 40,
        maxTokens = 1000,
        structured = false,
        schema = null
      } = parameters;

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature,
          topP,
          topK,
          maxOutputTokens: maxTokens,
          responseMimeType: structured ? 'application/json' : 'text/plain'
        }
      });

      let finalPrompt = prompt;
      if (structured && schema) {
        finalPrompt = this.createStructuredPrompt(prompt, schema);
      }

      console.log(`Generating response with temp: ${temperature}, topP: ${topP}, topK: ${topK}`);

      const result = await model.generateContent(finalPrompt);
      const response = result.response.text();

      let parsedResponse = response;
      if (structured) {
        parsedResponse = JSON.parse(response);
        if (schema && !this.validateStructure(parsedResponse, schema)) {
          throw new Error('Response does not match required schema');
        }
      }

      return {
        success: true,
        data: parsedResponse,
        parameters: {
          temperature,
          topP,
          topK,
          maxTokens,
          structured
        },
        tokens: this.estimateTokens(response)
      };

    } catch (error) {
      console.error('Error generating response with parameters:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  getAvailableSchemas() {
    return [
      {
        type: 'qa_response',
        description: 'Structured Q&A response with confidence and sources',
        fields: ['answer', 'confidence', 'sources', 'reasoning', 'category', 'keywords']
      },
      {
        type: 'document_analysis',
        description: 'Document analysis with summary and key insights',
        fields: ['summary', 'main_topics', 'sentiment', 'complexity', 'word_count', 'key_entities', 'actionable_items']
      },
      {
        type: 'similarity_analysis',
        description: 'Similarity analysis between texts or concepts',
        fields: ['similarity_score', 'method_used', 'matching_concepts', 'differences', 'recommendation']
      },
      {
        type: 'evaluation_result',
        description: 'Evaluation scores and feedback',
        fields: ['accuracy', 'completeness', 'relevance', 'overall_score', 'strengths', 'weaknesses', 'suggestions']
      },
      {
        type: 'prompt_analysis',
        description: 'Analysis of prompt effectiveness and quality',
        fields: ['prompt_type', 'effectiveness', 'clarity', 'completeness', 'improvements', 'optimal_for']
      }
    ];
  }
}

module.exports = LLMService;
