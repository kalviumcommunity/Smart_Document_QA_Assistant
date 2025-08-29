class DynamicPromptService {
  constructor() {
    this.questionClassifier = new QuestionClassifier();
    this.contextAnalyzer = new ContextAnalyzer();
  }

  generateDynamicPrompt(params) {
    const {
      question,
      context,
      userProfile = {},
      documentMetadata = {},
      previousInteractions = []
    } = params;

    try {
      const questionAnalysis = this.questionClassifier.classify(question);
      const contextAnalysis = this.contextAnalyzer.analyze(context, documentMetadata);
      const expertiseLevel = this.determineExpertiseLevel(userProfile, previousInteractions);
      const promptStrategy = this.selectPromptStrategy(questionAnalysis, contextAnalysis, expertiseLevel);
      
      const dynamicPrompt = this.buildPrompt({
        strategy: promptStrategy,
        question,
        context,
        questionAnalysis,
        contextAnalysis,
        expertiseLevel,
        userProfile,
        documentMetadata
      });

      return {
        prompt: dynamicPrompt.text,
        metadata: {
          questionType: questionAnalysis.type,
          confidence: questionAnalysis.confidence,
          strategy: promptStrategy.name,
          expertiseLevel,
          contextLength: context.length,
          promptLength: dynamicPrompt.text.length,
          adaptations: dynamicPrompt.adaptations,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error generating dynamic prompt:', error);
      return this.generateFallbackPrompt(question, context);
    }
  }

  buildPrompt(params) {
    const {
      strategy,
      question,
      context,
      questionAnalysis,
      contextAnalysis,
      expertiseLevel,
      userProfile
    } = params;

    let promptParts = [];
    let adaptations = [];

    const systemInstructions = this.generateSystemInstructions(strategy, expertiseLevel, questionAnalysis.type);
    promptParts.push(systemInstructions);

    if (contextAnalysis.needsSpecialHandling) {
      const specialInstructions = this.generateSpecialInstructions(contextAnalysis);
      promptParts.push(specialInstructions);
      adaptations.push('special_context_handling');
    }

    if (strategy.useExamples) {
      const examples = this.selectRelevantExamples(questionAnalysis.type, expertiseLevel, contextAnalysis.domain);
      if (examples.length > 0) {
        promptParts.push('\nExamples:\n');
        promptParts.push(examples.join('\n\n'));
        adaptations.push(`added_${examples.length}_examples`);
      }
    }

    if (questionAnalysis.complexity === 'high' || questionAnalysis.type === 'analytical') {
      promptParts.push(this.generateChainOfThoughtInstructions(questionAnalysis.type));
      adaptations.push('chain_of_thought_reasoning');
    }

    promptParts.push('\n--- CONTEXT ---');
    const processedContext = this.processContextForPrompt(context, strategy.contextProcessing);
    promptParts.push(processedContext);
    
    if (strategy.contextProcessing !== 'raw') {
      adaptations.push(`context_${strategy.contextProcessing}`);
    }

    const framedQuestion = this.frameQuestion(question, questionAnalysis, expertiseLevel);
    promptParts.push('\n--- QUESTION ---');
    promptParts.push(framedQuestion);

    const outputInstructions = this.generateOutputInstructions(questionAnalysis.type, expertiseLevel, userProfile.preferredFormat);
    promptParts.push(outputInstructions);

    if (strategy.requireCitations) {
      promptParts.push('\nInclude confidence level (1-10) and cite specific parts of the context.');
      adaptations.push('citations_required');
    }

    return {
      text: promptParts.join('\n'),
      adaptations
    };
  }

  generateSystemInstructions(strategy, expertiseLevel, questionType) {
    const baseInstructions = {
      beginner: "You are a helpful AI assistant that explains concepts clearly and simply.",
      intermediate: "You are an AI assistant that provides detailed, accurate information.",
      expert: "You are an AI assistant that provides precise, technical responses."
    };

    const typeSpecificInstructions = {
      factual: "Focus on providing accurate, specific facts from the context.",
      analytical: "Analyze the information thoroughly and explain your reasoning.",
      comparative: "Compare and contrast different aspects systematically.",
      procedural: "Provide clear, step-by-step instructions.",
      creative: "Think creatively while staying grounded in the context."
    };

    return `${baseInstructions[expertiseLevel]} ${typeSpecificInstructions[questionType] || ''}

${strategy.systemPrompt || 'Answer based on the provided context.'}`;
  }

  frameQuestion(question, questionAnalysis, expertiseLevel) {
    const framingStrategies = {
      beginner: {
        factual: `Please explain in simple terms: ${question}`,
        analytical: `Help me understand: ${question}`,
        comparative: `What are the differences regarding: ${question}`
      },
      intermediate: {
        factual: `Based on the context, ${question}`,
        analytical: `Analyze and explain: ${question}`,
        comparative: `Compare and evaluate: ${question}`
      },
      expert: {
        factual: question,
        analytical: `Provide detailed analysis of: ${question}`,
        comparative: `Conduct comprehensive comparison: ${question}`
      }
    };

    const strategy = framingStrategies[expertiseLevel] || framingStrategies.intermediate;
    return strategy[questionAnalysis.type] || question;
  }

  generateOutputInstructions(questionType, expertiseLevel, preferredFormat) {
    const formatInstructions = {
      structured: "\nProvide structured answer with headings and bullet points.",
      detailed: "\nProvide comprehensive, detailed answer with explanations.",
      concise: "\nProvide concise, direct answer focusing on key points.",
      stepwise: "\nBreak down answer into clear, numbered steps."
    };

    const typeDefaults = {
      factual: 'concise',
      analytical: 'detailed',
      comparative: 'structured',
      procedural: 'stepwise'
    };

    const format = preferredFormat || typeDefaults[questionType] || 'detailed';
    let instructions = formatInstructions[format] || formatInstructions.detailed;
    
    if (expertiseLevel === 'beginner') {
      instructions += " Use simple language and explain technical terms.";
    } else if (expertiseLevel === 'expert') {
      instructions += " Use technical terminology and assume domain knowledge.";
    }

    return instructions;
  }

  selectRelevantExamples(questionType, expertiseLevel, domain) {
    const exampleBank = {
      factual: {
        beginner: ["Q: What is photosynthesis?\nA: Photosynthesis is how plants make food using sunlight."],
        intermediate: ["Q: How does machine learning work?\nA: Machine learning uses algorithms to find patterns in data."],
        expert: ["Q: What are quantum entanglement implications?\nA: Quantum entanglement demonstrates non-local correlations between particles."]
      },
      analytical: {
        beginner: ["Q: Why do leaves change color?\nA: Step by step:\n1. Chlorophyll breaks down\n2. Other pigments become visible\n3. Creates fall colors."],
        intermediate: ["Q: What factors contribute to inflation?\nA: Several factors:\n1. Supply/demand imbalances\n2. Monetary policy\n3. External shocks\n4. Consumer expectations"]
      }
    };

    const examples = exampleBank[questionType]?.[expertiseLevel] || [];
    return examples.slice(0, 2);
  }

  generateChainOfThoughtInstructions(questionType) {
    const cotInstructions = {
      analytical: "\nUse step-by-step reasoning:\n1. Identify key components\n2. Analyze each component\n3. Explain relationships\n4. Draw conclusions",
      comparative: "\nFollow comparison framework:\n1. Identify items to compare\n2. List comparison criteria\n3. Evaluate against criteria\n4. Summarize differences",
      procedural: "\nBreak down process:\n1. Identify starting point\n2. List steps in sequence\n3. Explain necessity of each step\n4. Describe expected outcome"
    };

    return cotInstructions[questionType] || "\nThink step by step, explaining your reasoning.";
  }

  processContextForPrompt(context, processingType) {
    switch (processingType) {
      case 'summarized':
        return this.summarizeContext(context);
      case 'highlighted':
        return this.highlightKeyPoints(context);
      case 'structured':
        return this.structureContext(context);
      default:
        return context;
    }
  }

  summarizeContext(context) {
    const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = sentences.slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)));
    return keyPoints.join('. ') + '.';
  }

  highlightKeyPoints(context) {
    const keywords = ['important', 'key', 'significant', 'main', 'primary', 'essential'];
    let highlighted = context;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`(\\b${keyword}\\b)`, 'gi');
      highlighted = highlighted.replace(regex, '**$1**');
    });
    
    return highlighted;
  }

  structureContext(context) {
    const paragraphs = context.split('\n\n').filter(p => p.trim());
    if (paragraphs.length <= 1) return context;
    
    return paragraphs.map((para, index) => 
      `**Section ${index + 1}:**\n${para}`
    ).join('\n\n');
  }

  determineExpertiseLevel(userProfile, previousInteractions) {
    if (userProfile.expertiseLevel) {
      return userProfile.expertiseLevel;
    }

    const totalInteractions = previousInteractions.length;
    if (totalInteractions === 0) return 'intermediate';

    const complexQuestions = previousInteractions.filter(
      interaction => interaction.question && interaction.question.length > 100
    ).length;

    const complexityRatio = complexQuestions / totalInteractions;
    
    if (complexityRatio > 0.6) return 'expert';
    if (complexityRatio < 0.2) return 'beginner';
    return 'intermediate';
  }

  selectPromptStrategy(questionAnalysis, contextAnalysis, expertiseLevel) {
    const strategies = {
      simple_factual: {
        name: 'Simple Factual',
        systemPrompt: 'Provide clear, accurate answers based on context.',
        useExamples: false,
        requireCitations: true,
        contextProcessing: 'raw'
      },
      analytical_detailed: {
        name: 'Analytical Detailed',
        systemPrompt: 'Analyze information thoroughly with detailed explanations.',
        useExamples: true,
        requireCitations: true,
        contextProcessing: 'highlighted'
      },
      comparative_structured: {
        name: 'Comparative Structured',
        systemPrompt: 'Compare and contrast systematically with clear structure.',
        useExamples: true,
        requireCitations: true,
        contextProcessing: 'structured'
      },
      expert_technical: {
        name: 'Expert Technical',
        systemPrompt: 'Provide precise, technical responses with domain expertise.',
        useExamples: false,
        requireCitations: true,
        contextProcessing: 'raw'
      }
    };

    if (expertiseLevel === 'expert' && questionAnalysis.complexity === 'high') {
      return strategies.expert_technical;
    }
    
    if (questionAnalysis.type === 'comparative') {
      return strategies.comparative_structured;
    }
    
    if (questionAnalysis.type === 'analytical' || questionAnalysis.complexity === 'high') {
      return strategies.analytical_detailed;
    }
    
    return strategies.simple_factual;
  }

  generateSpecialInstructions(contextAnalysis) {
    if (contextAnalysis.domain === 'technical') {
      return "\nNote: This is technical content. Explain technical terms when needed.";
    }
    
    if (contextAnalysis.domain === 'academic') {
      return "\nNote: This is academic content. Maintain scholarly tone and cite sources.";
    }
    
    return "\nNote: Handle this content with special care for accuracy.";
  }

  generateFallbackPrompt(question, context) {
    return {
      prompt: `Answer the following question based on the provided context:

Context: ${context}

Question: ${question}

Provide a clear, accurate answer based on the context.`,
      metadata: {
        questionType: 'unknown',
        confidence: 0.5,
        strategy: 'fallback',
        expertiseLevel: 'intermediate',
        contextLength: context.length,
        adaptations: ['fallback_used'],
        timestamp: new Date().toISOString()
      }
    };
  }
}

class QuestionClassifier {
  classify(question) {
    const questionLower = question.toLowerCase();
    
    const patterns = {
      factual: /^(what|who|when|where|which|how many|how much)\b/,
      analytical: /^(why|how|explain|analyze|discuss|elaborate)/,
      comparative: /(compare|contrast|difference|similar|versus|vs\.?|better|worse)/,
      procedural: /(how to|steps|process|procedure|method|way to)/,
      creative: /(imagine|suppose|what if|create|design|suggest)/
    };

    let type = 'factual';
    let confidence = 0.6;

    for (const [questionType, pattern] of Object.entries(patterns)) {
      if (pattern.test(questionLower)) {
        type = questionType;
        confidence = 0.8;
        break;
      }
    }

    const complexityIndicators = {
      high: /(analyze|evaluate|synthesize|compare.*contrast|multiple.*factor|relationship.*between)/,
      medium: /(explain|describe|discuss|how.*work|why.*important)/,
      low: /(what|who|when|where|which|list)/
    };

    let complexity = 'medium';
    for (const [level, pattern] of Object.entries(complexityIndicators)) {
      if (pattern.test(questionLower)) {
        complexity = level;
        break;
      }
    }

    if (question.length > 100) confidence += 0.1;
    if (question.includes('?')) confidence += 0.05;

    return {
      type,
      complexity,
      confidence: Math.min(confidence, 1.0),
      length: question.length,
      wordCount: question.split(/\s+/).length
    };
  }
}

class ContextAnalyzer {
  analyze(context, documentMetadata = {}) {
    const analysis = {
      length: context.length,
      wordCount: context.split(/\s+/).length,
      needsSpecialHandling: false,
      domain: 'general',
      contentType: 'text',
      technicalLevel: 'medium'
    };

    const technicalIndicators = /(algorithm|function|variable|parameter|method|class|object)/gi;
    const technicalMatches = context.match(technicalIndicators) || [];
    
    if (technicalMatches.length > 5) {
      analysis.technicalLevel = 'high';
      analysis.domain = 'technical';
      analysis.needsSpecialHandling = true;
    }

    const academicIndicators = /(research|study|analysis|hypothesis|methodology|findings)/gi;
    const academicMatches = context.match(academicIndicators) || [];
    
    if (academicMatches.length > 3) {
      analysis.domain = 'academic';
      analysis.needsSpecialHandling = true;
    }

    if (documentMetadata.type) {
      analysis.contentType = documentMetadata.type;
    }
    
    if (documentMetadata.domain) {
      analysis.domain = documentMetadata.domain;
    }

    return analysis;
  }
}

module.exports = DynamicPromptService;
