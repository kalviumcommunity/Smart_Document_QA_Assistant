const PromptingService = require('../services/promptingService');

class PromptingController {
  static async generateMultiShotPrompt(req, res) {
    try {
      const { question, context, domain = 'general', numExamples = 3 } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const promptingService = new PromptingService();
      const prompt = promptingService.generateMultiShotPrompt(question, context, domain, numExamples);

      console.log(`Generated multi-shot prompt with ${numExamples} examples for domain: ${domain}`);

      res.json({
        success: true,
        prompt,
        metadata: {
          type: 'multi-shot',
          domain,
          numExamples,
          questionLength: question.length,
          contextLength: context.length,
          promptLength: prompt.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating multi-shot prompt:', error);
      res.status(500).json({ 
        error: 'Failed to generate multi-shot prompt',
        details: error.message 
      });
    }
  }

  static async generateOneShotPrompt(req, res) {
    try {
      const { question, context, domain = 'general' } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const promptingService = new PromptingService();
      const prompt = promptingService.generateOneShotPrompt(question, context, domain);

      console.log(`Generated one-shot prompt for domain: ${domain}`);

      res.json({
        success: true,
        prompt,
        metadata: {
          type: 'one-shot',
          domain,
          numExamples: 1,
          questionLength: question.length,
          contextLength: context.length,
          promptLength: prompt.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating one-shot prompt:', error);
      res.status(500).json({ 
        error: 'Failed to generate one-shot prompt',
        details: error.message 
      });
    }
  }

  static async generateZeroShotPrompt(req, res) {
    try {
      const { question, context } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const promptingService = new PromptingService();
      const prompt = promptingService.generateZeroShotPrompt(question, context);

      console.log('Generated zero-shot prompt');

      res.json({
        success: true,
        prompt,
        metadata: {
          type: 'zero-shot',
          numExamples: 0,
          questionLength: question.length,
          contextLength: context.length,
          promptLength: prompt.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating zero-shot prompt:', error);
      res.status(500).json({ 
        error: 'Failed to generate zero-shot prompt',
        details: error.message 
      });
    }
  }

  static async generateChainOfThoughtPrompt(req, res) {
    try {
      const { question, context, includeExamples = true } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const promptingService = new PromptingService();
      const prompt = promptingService.generateChainOfThoughtPrompt(question, context, includeExamples);

      console.log(`Generated chain-of-thought prompt with examples: ${includeExamples}`);

      res.json({
        success: true,
        prompt,
        metadata: {
          type: 'chain-of-thought',
          includeExamples,
          questionLength: question.length,
          contextLength: context.length,
          promptLength: prompt.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating chain-of-thought prompt:', error);
      res.status(500).json({ 
        error: 'Failed to generate chain-of-thought prompt',
        details: error.message 
      });
    }
  }

  static async comparePromptingTechniques(req, res) {
    try {
      const { question, context, domain = 'general' } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const promptingService = new PromptingService();

      const techniques = {
        'zero-shot': promptingService.generateZeroShotPrompt(question, context),
        'one-shot': promptingService.generateOneShotPrompt(question, context, domain),
        'multi-shot': promptingService.generateMultiShotPrompt(question, context, domain, 3),
        'chain-of-thought': promptingService.generateChainOfThoughtPrompt(question, context, true)
      };

      const comparison = {};
      Object.keys(techniques).forEach(technique => {
        comparison[technique] = {
          prompt: techniques[technique],
          length: techniques[technique].length,
          wordCount: techniques[technique].split(/\s+/).length,
          exampleCount: technique === 'zero-shot' ? 0 : 
                       technique === 'one-shot' ? 1 : 
                       technique === 'multi-shot' ? 3 : 2
        };
      });

      const analysis = {
        'zero-shot': {
          pros: ['Concise', 'Fast', 'No example bias'],
          cons: ['May lack guidance', 'Inconsistent results'],
          bestFor: 'Simple factual questions, expert users'
        },
        'one-shot': {
          pros: ['Good guidance', 'Moderate length', 'Clear format'],
          cons: ['Single example bias', 'May not cover edge cases'],
          bestFor: 'Standard questions, intermediate users'
        },
        'multi-shot': {
          pros: ['Multiple examples', 'Consistent format', 'Better coverage'],
          cons: ['Longer prompts', 'More tokens', 'Example selection bias'],
          bestFor: 'Complex questions, consistent formatting needed'
        },
        'chain-of-thought': {
          pros: ['Step-by-step reasoning', 'Transparent process', 'Better for complex problems'],
          cons: ['Longest prompts', 'Most tokens', 'May over-explain'],
          bestFor: 'Analytical questions, mathematical problems'
        }
      };

      res.json({
        question,
        context: context.substring(0, 100) + '...',
        domain,
        comparison,
        analysis,
        recommendations: {
          forBeginner: 'Use multi-shot prompting for consistency',
          forIntermediate: 'Use one-shot or multi-shot based on complexity',
          forExpert: 'Use zero-shot for efficiency, chain-of-thought for reasoning',
          forComplexQuestions: 'Use chain-of-thought prompting',
          forSimpleQuestions: 'Use zero-shot or one-shot prompting'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error comparing prompting techniques:', error);
      res.status(500).json({ 
        error: 'Failed to compare prompting techniques',
        details: error.message 
      });
    }
  }

  static async demonstrateMultiShotEvolution(req, res) {
    try {
      const { question, context, domain = 'general' } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const promptingService = new PromptingService();

      const evolution = {
        'step1_zero_shot': {
          prompt: promptingService.generateZeroShotPrompt(question, context),
          description: 'No examples provided - relies on model\'s inherent knowledge'
        },
        'step2_one_shot': {
          prompt: promptingService.generateOneShotPrompt(question, context, domain),
          description: 'Single example to demonstrate desired format and approach'
        },
        'step3_multi_shot_2': {
          prompt: promptingService.generateMultiShotPrompt(question, context, domain, 2),
          description: 'Two examples showing pattern and reducing single-example bias'
        },
        'step4_multi_shot_3': {
          prompt: promptingService.generateMultiShotPrompt(question, context, domain, 3),
          description: 'Three examples providing robust pattern recognition'
        }
      };

      const progressiveImprovements = [
        'Zero-shot: Quick but potentially inconsistent',
        'One-shot: Adds format guidance but may have example bias',
        'Multi-shot (2): Reduces bias, shows pattern variation',
        'Multi-shot (3): Optimal balance of guidance and efficiency'
      ];

      const tokenAnalysis = {};
      Object.keys(evolution).forEach(step => {
        const prompt = evolution[step].prompt;
        tokenAnalysis[step] = {
          characters: prompt.length,
          words: prompt.split(/\s+/).length,
          estimatedTokens: Math.ceil(prompt.length / 4),
          lines: prompt.split('\n').length
        };
      });

      res.json({
        question,
        domain,
        evolution,
        progressiveImprovements,
        tokenAnalysis,
        explanation: {
          concept: 'Multi-shot prompting uses multiple examples to guide LLM behavior',
          benefits: [
            'Reduces example bias through variety',
            'Establishes clear patterns and formats',
            'Improves consistency across responses',
            'Provides robust guidance for complex tasks'
          ],
          considerations: [
            'Token usage increases with more examples',
            'Example quality is crucial',
            'Diminishing returns after 3-5 examples',
            'Domain-specific examples work best'
          ]
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error demonstrating multi-shot evolution:', error);
      res.status(500).json({ 
        error: 'Failed to demonstrate multi-shot evolution',
        details: error.message 
      });
    }
  }

  static async generateAdaptivePrompt(req, res) {
    try {
      const { question, context, userLevel = 'intermediate', questionType = 'factual' } = req.body;

      if (!question || !context) {
        return res.status(400).json({ error: 'Question and context are required' });
      }

      const promptingService = new PromptingService();
      const prompt = promptingService.generateAdaptivePrompt(question, context, userLevel, questionType);
      const strategy = promptingService.selectStrategy(questionType, userLevel);

      console.log(`Generated adaptive prompt using ${strategy} strategy for ${userLevel} user`);

      res.json({
        success: true,
        prompt,
        metadata: {
          strategy,
          userLevel,
          questionType,
          questionLength: question.length,
          contextLength: context.length,
          promptLength: prompt.length
        },
        explanation: {
          why: `Selected ${strategy} because user is ${userLevel} level asking a ${questionType} question`,
          strategy_details: this.getStrategyExplanation(strategy)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating adaptive prompt:', error);
      res.status(500).json({ 
        error: 'Failed to generate adaptive prompt',
        details: error.message 
      });
    }
  }

  static getStrategyExplanation(strategy) {
    const explanations = {
      'zero_shot': 'No examples - efficient for experts and simple questions',
      'one_shot': 'Single example - good balance for most users',
      'multi_shot': 'Multiple examples - best for consistency and complex patterns',
      'chain_of_thought': 'Step-by-step reasoning - ideal for analytical questions'
    };
    
    return explanations[strategy] || 'Strategy optimized for the given context';
  }
}

module.exports = PromptingController;
