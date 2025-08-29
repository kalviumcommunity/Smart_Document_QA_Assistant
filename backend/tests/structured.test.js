const LLMService = require('../services/llmService');

describe('LLMService - Structured Output', () => {
  let llmService;

  beforeEach(() => {
    llmService = new LLMService();
  });

  describe('Schema Generation', () => {
    test('should generate QA response schema', () => {
      const schema = { type: 'qa_response' };
      const description = llmService.generateSchemaDescription(schema);
      
      expect(description).toContain('answer');
      expect(description).toContain('confidence');
      expect(description).toContain('sources');
      expect(description).toContain('reasoning');
      expect(description).toContain('category');
      expect(description).toContain('keywords');
    });

    test('should generate document analysis schema', () => {
      const schema = { type: 'document_analysis' };
      const description = llmService.generateSchemaDescription(schema);
      
      expect(description).toContain('summary');
      expect(description).toContain('main_topics');
      expect(description).toContain('sentiment');
      expect(description).toContain('complexity');
      expect(description).toContain('word_count');
    });

    test('should generate similarity analysis schema', () => {
      const schema = { type: 'similarity_analysis' };
      const description = llmService.generateSchemaDescription(schema);
      
      expect(description).toContain('similarity_score');
      expect(description).toContain('method_used');
      expect(description).toContain('matching_concepts');
      expect(description).toContain('differences');
    });

    test('should generate evaluation result schema', () => {
      const schema = { type: 'evaluation_result' };
      const description = llmService.generateSchemaDescription(schema);
      
      expect(description).toContain('accuracy');
      expect(description).toContain('completeness');
      expect(description).toContain('relevance');
      expect(description).toContain('overall_score');
    });

    test('should generate default schema for unknown type', () => {
      const schema = { type: 'unknown' };
      const description = llmService.generateSchemaDescription(schema);
      
      expect(description).toContain('result');
      expect(description).toContain('status');
      expect(description).toContain('metadata');
    });
  });

  describe('Structured Prompt Creation', () => {
    test('should create structured prompt with schema', () => {
      const prompt = 'What is artificial intelligence?';
      const schema = { type: 'qa_response' };
      
      const structuredPrompt = llmService.createStructuredPrompt(prompt, schema);
      
      expect(structuredPrompt).toContain(prompt);
      expect(structuredPrompt).toContain('IMPORTANT: Respond ONLY with valid JSON');
      expect(structuredPrompt).toContain('answer');
      expect(structuredPrompt).toContain('confidence');
      expect(structuredPrompt).toContain('JSON Response:');
    });

    test('should include all schema requirements', () => {
      const prompt = 'Analyze this document';
      const schema = { type: 'document_analysis' };
      
      const structuredPrompt = llmService.createStructuredPrompt(prompt, schema);
      
      expect(structuredPrompt).toContain('Return only valid JSON');
      expect(structuredPrompt).toContain('Include all required fields');
      expect(structuredPrompt).toContain('Use correct data types');
      expect(structuredPrompt).toContain('No additional text');
    });
  });

  describe('Response Validation', () => {
    test('should validate QA response structure', () => {
      const validResponse = {
        answer: 'AI is machine intelligence',
        confidence: 0.9,
        sources: ['source1', 'source2'],
        reasoning: 'Based on the context',
        category: 'factual',
        keywords: ['AI', 'intelligence']
      };

      const isValid = llmService.validateQAResponse(validResponse);
      expect(isValid).toBe(true);
    });

    test('should reject invalid QA response structure', () => {
      const invalidResponse = {
        answer: 'AI is machine intelligence',
        confidence: 'high',
        sources: 'source1',
        reasoning: 123
      };

      const isValid = llmService.validateQAResponse(invalidResponse);
      expect(isValid).toBe(false);
    });

    test('should validate document analysis structure', () => {
      const validResponse = {
        summary: 'Document summary',
        main_topics: ['topic1', 'topic2'],
        sentiment: 'positive',
        complexity: 'medium',
        word_count: 500,
        key_entities: ['entity1'],
        actionable_items: ['action1']
      };

      const isValid = llmService.validateDocumentAnalysis(validResponse);
      expect(isValid).toBe(true);
    });

    test('should validate similarity analysis structure', () => {
      const validResponse = {
        similarity_score: 0.8,
        method_used: 'cosine',
        matching_concepts: ['concept1'],
        differences: ['diff1'],
        recommendation: 'recommendation text'
      };

      const isValid = llmService.validateSimilarityAnalysis(validResponse);
      expect(isValid).toBe(true);
    });

    test('should validate evaluation result structure', () => {
      const validResponse = {
        accuracy: 8,
        completeness: 7,
        relevance: 9,
        overall_score: 8,
        strengths: ['strength1'],
        weaknesses: ['weakness1'],
        suggestions: ['suggestion1']
      };

      const isValid = llmService.validateEvaluationResult(validResponse);
      expect(isValid).toBe(true);
    });

    test('should validate prompt analysis structure', () => {
      const validResponse = {
        prompt_type: 'multi-shot',
        effectiveness: 8,
        clarity: 9,
        completeness: 7,
        improvements: ['improvement1'],
        optimal_for: ['scenario1']
      };

      const isValid = llmService.validatePromptAnalysis(validResponse);
      expect(isValid).toBe(true);
    });
  });

  describe('Schema Information', () => {
    test('should return available schemas', () => {
      const schemas = llmService.getAvailableSchemas();
      
      expect(Array.isArray(schemas)).toBe(true);
      expect(schemas.length).toBeGreaterThan(0);
      
      schemas.forEach(schema => {
        expect(schema).toHaveProperty('type');
        expect(schema).toHaveProperty('description');
        expect(schema).toHaveProperty('fields');
        expect(Array.isArray(schema.fields)).toBe(true);
      });
    });

    test('should include all expected schema types', () => {
      const schemas = llmService.getAvailableSchemas();
      const types = schemas.map(s => s.type);
      
      expect(types).toContain('qa_response');
      expect(types).toContain('document_analysis');
      expect(types).toContain('similarity_analysis');
      expect(types).toContain('evaluation_result');
      expect(types).toContain('prompt_analysis');
    });
  });

  describe('Token Estimation', () => {
    test('should estimate tokens correctly', () => {
      const text = 'This is a test text with multiple words';
      const tokens = llmService.estimateTokens(text);
      
      expect(typeof tokens).toBe('number');
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBe(Math.ceil(text.length / 4));
    });

    test('should handle empty text', () => {
      const tokens = llmService.estimateTokens('');
      expect(tokens).toBe(0);
    });

    test('should handle long text', () => {
      const longText = 'word '.repeat(1000);
      const tokens = llmService.estimateTokens(longText);
      
      expect(tokens).toBeGreaterThan(1000);
      expect(tokens).toBe(Math.ceil(longText.length / 4));
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON in validation', () => {
      const invalidResponse = null;
      const schema = { type: 'qa_response' };
      
      const isValid = llmService.validateStructure(invalidResponse, schema);
      expect(isValid).toBe(false);
    });

    test('should handle missing required fields', () => {
      const incompleteResponse = {
        answer: 'AI is machine intelligence'
      };

      const isValid = llmService.validateQAResponse(incompleteResponse);
      expect(isValid).toBe(false);
    });

    test('should handle wrong data types', () => {
      const wrongTypeResponse = {
        answer: 123,
        confidence: 'high',
        sources: 'not an array',
        reasoning: [],
        category: 456,
        keywords: 'not an array'
      };

      const isValid = llmService.validateQAResponse(wrongTypeResponse);
      expect(isValid).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should create valid structured prompt for each schema type', () => {
      const schemas = ['qa_response', 'document_analysis', 'similarity_analysis', 'evaluation_result', 'prompt_analysis'];
      const prompt = 'Test prompt';

      schemas.forEach(schemaType => {
        const schema = { type: schemaType };
        const structuredPrompt = llmService.createStructuredPrompt(prompt, schema);
        
        expect(structuredPrompt).toContain(prompt);
        expect(structuredPrompt).toContain('JSON');
        expect(structuredPrompt.length).toBeGreaterThan(prompt.length);
      });
    });

    test('should validate structure for all schema types', () => {
      const testResponses = {
        qa_response: {
          answer: 'test',
          confidence: 0.8,
          sources: ['s1'],
          reasoning: 'test',
          category: 'test',
          keywords: ['k1']
        },
        document_analysis: {
          summary: 'test',
          main_topics: ['t1'],
          sentiment: 'positive',
          complexity: 'medium',
          word_count: 100,
          key_entities: ['e1'],
          actionable_items: ['a1']
        },
        similarity_analysis: {
          similarity_score: 0.8,
          method_used: 'cosine',
          matching_concepts: ['c1'],
          differences: ['d1'],
          recommendation: 'test'
        },
        evaluation_result: {
          accuracy: 8,
          completeness: 7,
          relevance: 9,
          overall_score: 8,
          strengths: ['s1'],
          weaknesses: ['w1'],
          suggestions: ['sg1']
        },
        prompt_analysis: {
          prompt_type: 'multi-shot',
          effectiveness: 8,
          clarity: 9,
          completeness: 7,
          improvements: ['i1'],
          optimal_for: ['o1']
        }
      };

      Object.keys(testResponses).forEach(schemaType => {
        const response = testResponses[schemaType];
        const schema = { type: schemaType };
        const isValid = llmService.validateStructure(response, schema);
        expect(isValid).toBe(true);
      });
    });
  });
});

console.log('🧪 Testing Structured Output Generation and Validation');
console.log('🎯 Focus: JSON schema validation, prompt creation, and response structure');
