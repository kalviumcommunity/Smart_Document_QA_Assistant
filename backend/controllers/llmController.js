const LLMService = require('../services/llmService');

class LLMController {
  static async generateStructuredResponse(req, res) {
    try {
      const { prompt, schema_type = 'qa_response' } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const llmService = new LLMService();
      const schema = { type: schema_type };
      
      const result = await llmService.generateStructuredResponse(prompt, schema);

      console.log(`Generated structured response of type: ${schema_type}`);

      res.json({
        success: true,
        prompt: prompt.substring(0, 100) + '...',
        schema_type,
        response: result.data,
        metadata: {
          tokens_used: result.tokens,
          schema_validated: true,
          response_time: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error in generateStructuredResponse:', error);
      res.status(500).json({ 
        error: 'Failed to generate structured response',
        details: error.message 
      });
    }
  }

  static async generateWithParameters(req, res) {
    try {
      const { 
        prompt, 
        temperature = 0.7, 
        topP = 0.9, 
        topK = 40,
        maxTokens = 1000,
        structured = false,
        schema_type = 'qa_response'
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const llmService = new LLMService();
      const parameters = {
        temperature: parseFloat(temperature),
        topP: parseFloat(topP),
        topK: parseInt(topK),
        maxTokens: parseInt(maxTokens),
        structured,
        schema: structured ? { type: schema_type } : null
      };

      const result = await llmService.generateWithParameters(prompt, parameters);

      console.log(`Generated response with custom parameters: temp=${temperature}, topP=${topP}, topK=${topK}`);

      res.json({
        success: true,
        prompt: prompt.substring(0, 100) + '...',
        response: result.data,
        parameters: result.parameters,
        metadata: {
          tokens_used: result.tokens,
          structured_output: structured,
          schema_type: structured ? schema_type : null,
          response_time: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error in generateWithParameters:', error);
      res.status(500).json({ 
        error: 'Failed to generate response with parameters',
        details: error.message 
      });
    }
  }

  static async analyzeDocument(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const prompt = `Analyze the following document and provide structured insights:

${text}

Analyze this document comprehensively covering all aspects mentioned in the schema.`;

      const llmService = new LLMService();
      const schema = { type: 'document_analysis' };
      
      const result = await llmService.generateStructuredResponse(prompt, schema);

      console.log(`Analyzed document with ${text.length} characters`);

      res.json({
        success: true,
        text_length: text.length,
        analysis: result.data,
        metadata: {
          tokens_used: result.tokens,
          analysis_type: 'document_analysis',
          response_time: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error in analyzeDocument:', error);
      res.status(500).json({ 
        error: 'Failed to analyze document',
        details: error.message 
      });
    }
  }

  static async evaluateResponse(req, res) {
    try {
      const { question, expected_answer, actual_answer } = req.body;

      if (!question || !expected_answer || !actual_answer) {
        return res.status(400).json({ error: 'Question, expected_answer, and actual_answer are required' });
      }

      const prompt = `Evaluate the quality of this AI response:

Question: ${question}

Expected Answer: ${expected_answer}

Actual Answer: ${actual_answer}

Provide a comprehensive evaluation with scores and detailed feedback.`;

      const llmService = new LLMService();
      const schema = { type: 'evaluation_result' };
      
      const result = await llmService.generateStructuredResponse(prompt, schema);

      console.log(`Evaluated response with overall score: ${result.data.overall_score}`);

      res.json({
        success: true,
        question: question.substring(0, 100) + '...',
        evaluation: result.data,
        metadata: {
          tokens_used: result.tokens,
          evaluation_type: 'response_quality',
          response_time: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error in evaluateResponse:', error);
      res.status(500).json({ 
        error: 'Failed to evaluate response',
        details: error.message 
      });
    }
  }

  static async compareSimilarity(req, res) {
    try {
      const { text1, text2, method = 'semantic' } = req.body;

      if (!text1 || !text2) {
        return res.status(400).json({ error: 'Both text1 and text2 are required' });
      }

      const prompt = `Compare the similarity between these two texts using ${method} analysis:

Text 1: ${text1}

Text 2: ${text2}

Provide a detailed similarity analysis including scores, matching concepts, differences, and recommendations.`;

      const llmService = new LLMService();
      const schema = { type: 'similarity_analysis' };
      
      const result = await llmService.generateStructuredResponse(prompt, schema);

      console.log(`Compared texts with similarity score: ${result.data.similarity_score}`);

      res.json({
        success: true,
        text1_length: text1.length,
        text2_length: text2.length,
        method,
        analysis: result.data,
        metadata: {
          tokens_used: result.tokens,
          analysis_type: 'similarity_comparison',
          response_time: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error in compareSimilarity:', error);
      res.status(500).json({ 
        error: 'Failed to compare similarity',
        details: error.message 
      });
    }
  }

  static async getAvailableSchemas(req, res) {
    try {
      const llmService = new LLMService();
      const schemas = llmService.getAvailableSchemas();

      res.json({
        success: true,
        schemas,
        total_schemas: schemas.length,
        usage: {
          qa_response: 'Use for question-answering with confidence scores',
          document_analysis: 'Use for analyzing document content and structure',
          similarity_analysis: 'Use for comparing texts or concepts',
          evaluation_result: 'Use for evaluating AI responses and quality',
          prompt_analysis: 'Use for analyzing prompt effectiveness'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting schemas:', error);
      res.status(500).json({ 
        error: 'Failed to get available schemas',
        details: error.message 
      });
    }
  }

  static async demonstrateStructuredOutput(req, res) {
    try {
      const { question = 'What is artificial intelligence?' } = req.body;

      const llmService = new LLMService();
      const schemas = ['qa_response', 'document_analysis', 'evaluation_result'];
      const demonstrations = {};

      for (const schemaType of schemas) {
        try {
          const prompt = schemaType === 'document_analysis' 
            ? `Analyze this text about AI: "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to natural intelligence displayed by humans."`
            : schemaType === 'evaluation_result'
            ? `Evaluate this answer: Question: "${question}" Answer: "AI is computer intelligence that mimics human thinking."`
            : `Answer this question: ${question}`;

          const result = await llmService.generateStructuredResponse(prompt, { type: schemaType });
          
          demonstrations[schemaType] = {
            prompt: prompt.substring(0, 100) + '...',
            response: result.data,
            tokens: result.tokens
          };
        } catch (error) {
          demonstrations[schemaType] = {
            error: error.message
          };
        }
      }

      res.json({
        success: true,
        question,
        demonstrations,
        explanation: {
          concept: 'Structured output ensures consistent JSON responses from LLMs',
          benefits: [
            'Predictable response format',
            'Easy parsing and processing',
            'Validation and error handling',
            'Integration with APIs and databases'
          ],
          use_cases: [
            'API responses that need consistent structure',
            'Data extraction and analysis',
            'Automated evaluation systems',
            'Integration with downstream applications'
          ]
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error demonstrating structured output:', error);
      res.status(500).json({ 
        error: 'Failed to demonstrate structured output',
        details: error.message 
      });
    }
  }
}

module.exports = LLMController;
