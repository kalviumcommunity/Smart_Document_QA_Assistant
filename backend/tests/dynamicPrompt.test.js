const DynamicPromptService = require('../services/dynamicPromptService');

describe('DynamicPromptService', () => {
  let service;

  beforeEach(() => {
    service = new DynamicPromptService();
  });

  describe('Question Classification', () => {
    test('should classify factual questions', () => {
      const questions = [
        'What is machine learning?',
        'Who invented the telephone?',
        'When did World War II end?',
        'Where is the Eiffel Tower located?'
      ];

      questions.forEach(question => {
        const analysis = service.questionClassifier.classify(question);
        expect(analysis.type).toBe('factual');
        expect(analysis.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should classify analytical questions', () => {
      const questions = [
        'Why do leaves change color in fall?',
        'How does photosynthesis work?',
        'Explain the theory of relativity',
        'Analyze the causes of inflation'
      ];

      questions.forEach(question => {
        const analysis = service.questionClassifier.classify(question);
        expect(analysis.type).toBe('analytical');
        expect(analysis.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should classify comparative questions', () => {
      const questions = [
        'Compare Python and JavaScript',
        'What is the difference between cats and dogs?',
        'Which is better: iOS or Android?',
        'Contrast democracy and autocracy'
      ];

      questions.forEach(question => {
        const analysis = service.questionClassifier.classify(question);
        expect(analysis.type).toBe('comparative');
        expect(analysis.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should determine question complexity', () => {
      const simpleQuestion = 'What is water?';
      const complexQuestion = 'Analyze the relationship between economic factors and social mobility in developing countries';

      const simpleAnalysis = service.questionClassifier.classify(simpleQuestion);
      const complexAnalysis = service.questionClassifier.classify(complexQuestion);

      expect(simpleAnalysis.complexity).toBe('low');
      expect(complexAnalysis.complexity).toBe('high');
    });
  });

  describe('Context Analysis', () => {
    test('should detect technical content', () => {
      const technicalContext = 'The algorithm uses a recursive function to traverse the binary tree. Each node contains a parameter that determines the method execution.';
      
      const analysis = service.contextAnalyzer.analyze(technicalContext);
      
      expect(analysis.domain).toBe('technical');
      expect(analysis.technicalLevel).toBe('high');
      expect(analysis.needsSpecialHandling).toBe(true);
    });

    test('should detect academic content', () => {
      const academicContext = 'The research study employed a quantitative methodology to test the hypothesis. The findings suggest significant correlations in the analysis.';
      
      const analysis = service.contextAnalyzer.analyze(academicContext);
      
      expect(analysis.domain).toBe('academic');
      expect(analysis.needsSpecialHandling).toBe(true);
    });

    test('should handle general content', () => {
      const generalContext = 'The weather today is sunny and warm. People are enjoying outdoor activities in the park.';
      
      const analysis = service.contextAnalyzer.analyze(generalContext);
      
      expect(analysis.domain).toBe('general');
      expect(analysis.needsSpecialHandling).toBe(false);
    });
  });

  describe('Expertise Level Determination', () => {
    test('should use explicit expertise level from profile', () => {
      const userProfile = { expertiseLevel: 'expert' };
      const level = service.determineExpertiseLevel(userProfile, []);
      expect(level).toBe('expert');
    });

    test('should determine expertise from interaction history', () => {
      const complexInteractions = Array(10).fill({
        question: 'This is a very long and complex question that demonstrates advanced understanding of the subject matter and requires detailed analysis'
      });

      const simpleInteractions = Array(10).fill({
        question: 'What is this?'
      });

      const expertLevel = service.determineExpertiseLevel({}, complexInteractions);
      const beginnerLevel = service.determineExpertiseLevel({}, simpleInteractions);

      expect(expertLevel).toBe('expert');
      expect(beginnerLevel).toBe('beginner');
    });

    test('should default to intermediate for new users', () => {
      const level = service.determineExpertiseLevel({}, []);
      expect(level).toBe('intermediate');
    });
  });

  describe('Dynamic Prompt Generation', () => {
    const sampleParams = {
      question: 'What is machine learning?',
      context: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
      userProfile: { expertiseLevel: 'intermediate' },
      documentMetadata: { domain: 'technical' },
      previousInteractions: []
    };

    test('should generate complete prompt with metadata', () => {
      const result = service.generateDynamicPrompt(sampleParams);

      expect(result).toHaveProperty('prompt');
      expect(result).toHaveProperty('metadata');
      expect(result.prompt).toContain('machine learning');
      expect(result.metadata.questionType).toBe('factual');
      expect(result.metadata.expertiseLevel).toBe('intermediate');
    });

    test('should adapt prompt for different expertise levels', () => {
      const beginnerParams = { ...sampleParams, userProfile: { expertiseLevel: 'beginner' } };
      const expertParams = { ...sampleParams, userProfile: { expertiseLevel: 'expert' } };

      const beginnerResult = service.generateDynamicPrompt(beginnerParams);
      const expertResult = service.generateDynamicPrompt(expertParams);

      expect(beginnerResult.prompt).toContain('simple');
      expect(expertResult.prompt).toContain('technical');
      expect(beginnerResult.metadata.expertiseLevel).toBe('beginner');
      expect(expertResult.metadata.expertiseLevel).toBe('expert');
    });

    test('should select appropriate strategy for question type', () => {
      const analyticalParams = {
        ...sampleParams,
        question: 'Why is machine learning important in modern technology?'
      };

      const comparativeParams = {
        ...sampleParams,
        question: 'Compare machine learning and traditional programming'
      };

      const analyticalResult = service.generateDynamicPrompt(analyticalParams);
      const comparativeResult = service.generateDynamicPrompt(comparativeParams);

      expect(analyticalResult.metadata.questionType).toBe('analytical');
      expect(comparativeResult.metadata.questionType).toBe('comparative');
      expect(analyticalResult.metadata.strategy).toContain('Analytical');
      expect(comparativeResult.metadata.strategy).toContain('Comparative');
    });

    test('should handle technical context with special instructions', () => {
      const technicalParams = {
        ...sampleParams,
        context: 'The neural network algorithm uses backpropagation to optimize weights through gradient descent. Each layer applies activation functions to transform input data.',
        documentMetadata: { domain: 'technical' }
      };

      const result = service.generateDynamicPrompt(technicalParams);

      expect(result.metadata.adaptations).toContain('special_context_handling');
      expect(result.prompt).toContain('technical');
    });

    test('should add chain of thought for complex questions', () => {
      const complexParams = {
        ...sampleParams,
        question: 'Analyze the impact of machine learning on healthcare and explain the underlying mechanisms',
        userProfile: { expertiseLevel: 'intermediate' }
      };

      const result = service.generateDynamicPrompt(complexParams);

      expect(result.metadata.adaptations).toContain('chain_of_thought_reasoning');
      expect(result.prompt).toContain('step');
    });

    test('should include citations requirement', () => {
      const result = service.generateDynamicPrompt(sampleParams);

      expect(result.metadata.adaptations).toContain('citations_required');
      expect(result.prompt).toContain('confidence level');
      expect(result.prompt).toContain('cite');
    });
  });

  describe('Error Handling', () => {
    test('should provide fallback prompt on error', () => {
      const invalidParams = {
        question: null,
        context: 'Some context'
      };

      const result = service.generateDynamicPrompt(invalidParams);
      expect(result.metadata.strategy).toBe('fallback');
      expect(result.metadata.adaptations).toContain('fallback_used');
    });
  });
});

console.log('🧪 Testing Dynamic Prompting with adaptive strategies');
console.log('🎯 Focus: Question classification, context analysis, and prompt adaptation');
