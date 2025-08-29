const DynamicPromptService = require('../services/dynamicPromptService');

class PromptController {
  static async generateDynamicPrompt(req, res) {
    try {
      const { question, context, userProfile, documentMetadata, previousInteractions } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const dynamicPromptService = new DynamicPromptService();
      const result = dynamicPromptService.generateDynamicPrompt({
        question,
        context,
        userProfile: userProfile || {},
        documentMetadata: documentMetadata || {},
        previousInteractions: previousInteractions || []
      });

      console.log(`Generated ${result.metadata.strategy} prompt for ${result.metadata.questionType} question`);

      res.json({
        success: true,
        prompt: result.prompt,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in generateDynamicPrompt:', error);
      res.status(500).json({ 
        error: 'Failed to generate dynamic prompt',
        details: error.message 
      });
    }
  }

  static async testPromptVariations(req, res) {
    try {
      const { question, context } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const dynamicPromptService = new DynamicPromptService();
      const expertiseLevels = ['beginner', 'intermediate', 'expert'];
      const variations = {};

      expertiseLevels.forEach(level => {
        const result = dynamicPromptService.generateDynamicPrompt({
          question,
          context,
          userProfile: { expertiseLevel: level },
          documentMetadata: {},
          previousInteractions: []
        });

        variations[level] = {
          prompt: result.prompt,
          strategy: result.metadata.strategy,
          adaptations: result.metadata.adaptations
        };
      });

      res.json({
        question,
        contextLength: context.length,
        variations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error testing prompt variations:', error);
      res.status(500).json({ 
        error: 'Failed to test prompt variations',
        details: error.message 
      });
    }
  }

  static async analyzeQuestion(req, res) {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const dynamicPromptService = new DynamicPromptService();
      const analysis = dynamicPromptService.questionClassifier.classify(question);

      res.json({
        question,
        analysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error analyzing question:', error);
      res.status(500).json({ 
        error: 'Failed to analyze question',
        details: error.message 
      });
    }
  }

  static async demonstrateAdaptation(req, res) {
    try {
      const { question, context } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const dynamicPromptService = new DynamicPromptService();
      
      const scenarios = [
        { name: 'Beginner User', userProfile: { expertiseLevel: 'beginner' } },
        { name: 'Expert User', userProfile: { expertiseLevel: 'expert' } },
        { name: 'Technical Context', documentMetadata: { domain: 'technical' } },
        { name: 'Academic Context', documentMetadata: { domain: 'academic' } },
        { name: 'Experienced User', previousInteractions: new Array(10).fill({ question: 'complex question with detailed analysis requirements' }) }
      ];

      const demonstrations = {};

      scenarios.forEach(scenario => {
        const result = dynamicPromptService.generateDynamicPrompt({
          question,
          context,
          userProfile: scenario.userProfile || {},
          documentMetadata: scenario.documentMetadata || {},
          previousInteractions: scenario.previousInteractions || []
        });

        demonstrations[scenario.name] = {
          prompt: result.prompt.substring(0, 500) + '...',
          strategy: result.metadata.strategy,
          expertiseLevel: result.metadata.expertiseLevel,
          adaptations: result.metadata.adaptations,
          promptLength: result.metadata.promptLength
        };
      });

      res.json({
        question,
        contextLength: context.length,
        demonstrations,
        explanation: {
          dynamicPrompting: "Prompts adapt based on user expertise, question type, and context",
          adaptations: "Each scenario shows different prompt strategies and structures",
          benefits: "Improves relevance, comprehension, and answer quality"
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error demonstrating adaptation:', error);
      res.status(500).json({ 
        error: 'Failed to demonstrate adaptation',
        details: error.message 
      });
    }
  }
}

module.exports = PromptController;
