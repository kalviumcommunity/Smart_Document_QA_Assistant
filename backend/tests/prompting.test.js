const PromptingService = require('../services/promptingService');

describe('PromptingService', () => {
  let promptingService;

  beforeEach(() => {
    promptingService = new PromptingService();
  });

  describe('Zero-Shot Prompting', () => {
    test('should generate basic zero-shot prompt', () => {
      const question = 'What is photosynthesis?';
      const context = 'Plants use sunlight to make food.';
      
      const prompt = promptingService.generateZeroShotPrompt(question, context);
      
      expect(prompt).toContain('Answer the following question');
      expect(prompt).toContain(question);
      expect(prompt).toContain(context);
      expect(prompt).not.toContain('Example');
    });

    test('should be shortest prompt type', () => {
      const question = 'Test question?';
      const context = 'Test context.';
      
      const zeroShot = promptingService.generateZeroShotPrompt(question, context);
      const oneShot = promptingService.generateOneShotPrompt(question, context);
      const multiShot = promptingService.generateMultiShotPrompt(question, context);
      
      expect(zeroShot.length).toBeLessThan(oneShot.length);
      expect(zeroShot.length).toBeLessThan(multiShot.length);
    });
  });

  describe('One-Shot Prompting', () => {
    test('should generate one-shot prompt with single example', () => {
      const question = 'What is gravity?';
      const context = 'Objects fall toward Earth.';
      
      const prompt = promptingService.generateOneShotPrompt(question, context, 'general');
      
      expect(prompt).toContain('Example:');
      expect(prompt).toContain('Now answer this question:');
      expect(prompt).toContain(question);
      expect(prompt).toContain(context);
      
      const exampleCount = (prompt.match(/Example:/g) || []).length;
      expect(exampleCount).toBe(1);
    });

    test('should use domain-specific examples', () => {
      const question = 'How do APIs work?';
      const context = 'APIs enable communication.';
      
      const technicalPrompt = promptingService.generateOneShotPrompt(question, context, 'technical');
      const generalPrompt = promptingService.generateOneShotPrompt(question, context, 'general');
      
      expect(technicalPrompt).toContain('API');
      expect(technicalPrompt.length).toBeGreaterThan(generalPrompt.length);
    });
  });

  describe('Multi-Shot Prompting', () => {
    test('should generate multi-shot prompt with multiple examples', () => {
      const question = 'How does the water cycle work?';
      const context = 'Water evaporates and condenses.';
      
      const prompt = promptingService.generateMultiShotPrompt(question, context, 'general', 3);
      
      expect(prompt).toContain('Here are some examples:');
      expect(prompt).toContain('Example 1:');
      expect(prompt).toContain('Example 2:');
      expect(prompt).toContain('Example 3:');
      expect(prompt).toContain('Now answer this question:');
      expect(prompt).toContain(question);
      expect(prompt).toContain(context);
    });

    test('should respect numExamples parameter', () => {
      const question = 'Test question?';
      const context = 'Test context.';
      
      const prompt2 = promptingService.generateMultiShotPrompt(question, context, 'general', 2);
      const prompt3 = promptingService.generateMultiShotPrompt(question, context, 'general', 3);
      
      const examples2 = (prompt2.match(/Example \d+:/g) || []).length;
      const examples3 = (prompt3.match(/Example \d+:/g) || []).length;
      
      expect(examples2).toBe(2);
      expect(examples3).toBe(3);
      expect(prompt3.length).toBeGreaterThan(prompt2.length);
    });

    test('should handle limited examples gracefully', () => {
      const question = 'Test question?';
      const context = 'Test context.';
      
      const prompt = promptingService.generateMultiShotPrompt(question, context, 'general', 10);
      
      expect(prompt).toContain('Example');
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  describe('Chain-of-Thought Prompting', () => {
    test('should generate chain-of-thought prompt with reasoning steps', () => {
      const question = 'What is 15% of 200?';
      const context = 'Calculate the percentage.';
      
      const prompt = promptingService.generateChainOfThoughtPrompt(question, context, true);
      
      expect(prompt).toContain('step by step');
      expect(prompt).toContain('Let\'s think step by step');
      expect(prompt).toContain('1. First');
      expect(prompt).toContain('2. Then');
      expect(prompt).toContain('3. Finally');
      expect(prompt).toContain(question);
      expect(prompt).toContain(context);
    });

    test('should work without examples when specified', () => {
      const question = 'Solve this problem.';
      const context = 'Problem context.';
      
      const withExamples = promptingService.generateChainOfThoughtPrompt(question, context, true);
      const withoutExamples = promptingService.generateChainOfThoughtPrompt(question, context, false);
      
      expect(withExamples.length).toBeGreaterThan(withoutExamples.length);
      expect(withoutExamples).toContain('step by step');
      expect(withoutExamples).not.toContain('Here are examples');
    });
  });

  describe('Few-Shot with Reasoning', () => {
    test('should generate reasoning-based prompt', () => {
      const question = 'Why is the sky blue?';
      const context = 'Light scatters in the atmosphere.';
      
      const prompt = promptingService.generateFewShotWithReasoning(question, context, 'general');
      
      expect(prompt).toContain('Reasoning:');
      expect(prompt).toContain('Answer:');
      expect(prompt).toContain('[Explain your thought process]');
      expect(prompt).toContain('[Your final answer]');
    });
  });

  describe('Adaptive Prompting', () => {
    test('should select appropriate strategy based on user level and question type', () => {
      const question = 'What is machine learning?';
      const context = 'ML is a subset of AI.';
      
      const beginnerFactual = promptingService.generateAdaptivePrompt(question, context, 'beginner', 'factual');
      const expertFactual = promptingService.generateAdaptivePrompt(question, context, 'expert', 'factual');
      const beginnerAnalytical = promptingService.generateAdaptivePrompt(question, context, 'beginner', 'analytical');
      
      expect(beginnerFactual).toContain('Example:');
      expect(expertFactual).not.toContain('Example:');
      expect(beginnerAnalytical).toContain('step by step');
    });

    test('should use different strategies for different question types', () => {
      const question = 'Compare X and Y';
      const context = 'Context about X and Y.';
      
      const factualPrompt = promptingService.generateAdaptivePrompt(question, context, 'intermediate', 'factual');
      const comparativePrompt = promptingService.generateAdaptivePrompt(question, context, 'intermediate', 'comparative');
      
      expect(factualPrompt).not.toBe(comparativePrompt);
    });
  });

  describe('Strategy Selection', () => {
    test('should select zero-shot for expert factual questions', () => {
      const strategy = promptingService.selectStrategy('factual', 'expert');
      expect(strategy).toBe('zero_shot');
    });

    test('should select chain-of-thought for analytical questions', () => {
      const beginnerStrategy = promptingService.selectStrategy('analytical', 'beginner');
      const expertStrategy = promptingService.selectStrategy('analytical', 'expert');
      
      expect(beginnerStrategy).toBe('chain_of_thought');
      expect(expertStrategy).toBe('chain_of_thought');
    });

    test('should select multi-shot for comparative questions', () => {
      const strategy = promptingService.selectStrategy('comparative', 'intermediate');
      expect(strategy).toBe('multi_shot');
    });

    test('should have fallback strategy', () => {
      const strategy = promptingService.selectStrategy('unknown', 'unknown');
      expect(strategy).toBe('multi_shot');
    });
  });

  describe('Analysis Functions', () => {
    test('should calculate accuracy correctly', () => {
      const response = 'The answer is photosynthesis uses sunlight';
      const goldStandard = 'Photosynthesis is the process using sunlight';
      
      const isAccurate = promptingService.isAccurate(response, goldStandard);
      expect(typeof isAccurate).toBe('boolean');
    });

    test('should calculate completeness correctly', () => {
      const response = 'Short answer';
      const goldStandard = 'This is a much longer and more complete answer';
      
      const isComplete = promptingService.isComplete(response, goldStandard);
      expect(typeof isComplete).toBe('boolean');
    });

    test('should calculate consistency between responses', () => {
      const responses = [
        'Photosynthesis is the process of making food',
        'Plants use photosynthesis to create food',
        'Food is made by plants through photosynthesis'
      ];
      
      const consistency = promptingService.calculateConsistency(responses);
      expect(consistency).toBeGreaterThanOrEqual(0);
      expect(consistency).toBeLessThanOrEqual(1);
    });

    test('should handle single response consistency', () => {
      const responses = ['Single response'];
      const consistency = promptingService.calculateConsistency(responses);
      expect(consistency).toBe(1.0);
    });
  });

  describe('Example Bank', () => {
    test('should retrieve examples for different domains', () => {
      const generalExample = promptingService.exampleBank.getExample('general');
      const technicalExample = promptingService.exampleBank.getExample('technical');
      
      expect(generalExample).toHaveProperty('context');
      expect(generalExample).toHaveProperty('question');
      expect(generalExample).toHaveProperty('answer');
      
      expect(technicalExample).toHaveProperty('context');
      expect(technicalExample).toHaveProperty('question');
      expect(technicalExample).toHaveProperty('answer');
    });

    test('should retrieve multiple examples', () => {
      const examples = promptingService.exampleBank.getMultipleExamples('general', 2);
      
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeLessThanOrEqual(2);
      examples.forEach(example => {
        expect(example).toHaveProperty('context');
        expect(example).toHaveProperty('question');
        expect(example).toHaveProperty('answer');
      });
    });

    test('should get chain-of-thought examples', () => {
      const cotExamples = promptingService.exampleBank.getChainOfThoughtExamples();
      
      expect(Array.isArray(cotExamples)).toBe(true);
      expect(cotExamples.length).toBeGreaterThan(0);
      cotExamples.forEach(example => {
        expect(example.answer).toContain('step');
      });
    });

    test('should allow adding new examples', () => {
      const newExample = {
        context: 'Test context',
        question: 'Test question?',
        answer: 'Test answer'
      };
      
      promptingService.exampleBank.addExample('test_domain', newExample);
      const retrieved = promptingService.exampleBank.getExample('test_domain');
      
      expect(retrieved).toEqual(newExample);
    });
  });

  describe('Performance Tests', () => {
    test('should generate prompts efficiently', () => {
      const question = 'Test question?';
      const context = 'Test context.';
      
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        promptingService.generateMultiShotPrompt(question, context, 'general', 3);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000);
    });
  });
});

console.log('🧪 Testing Multi-Shot and Few-Shot Prompting Techniques');
console.log('🎯 Focus: Prompt generation, example management, and strategy selection');
