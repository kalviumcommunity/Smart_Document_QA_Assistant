class PromptingService {
  constructor() {
    this.exampleBank = new ExampleBank();
  }

  generateZeroShotPrompt(question, context) {
    return `Answer the following question based on the provided context:

Context: ${context}

Question: ${question}

Answer:`;
  }

  generateOneShotPrompt(question, context, domain = 'general') {
    const example = this.exampleBank.getExample(domain);
    
    return `Answer the following question based on the provided context. Here's an example:

Example:
Context: ${example.context}
Question: ${example.question}
Answer: ${example.answer}

Now answer this question:
Context: ${context}
Question: ${question}
Answer:`;
  }

  generateMultiShotPrompt(question, context, domain = 'general', numExamples = 3) {
    const examples = this.exampleBank.getMultipleExamples(domain, numExamples);
    
    let prompt = `Answer the following question based on the provided context. Here are some examples:\n\n`;
    
    examples.forEach((example, index) => {
      prompt += `Example ${index + 1}:
Context: ${example.context}
Question: ${example.question}
Answer: ${example.answer}\n\n`;
    });

    prompt += `Now answer this question:
Context: ${context}
Question: ${question}
Answer:`;

    return prompt;
  }

  generateChainOfThoughtPrompt(question, context, includeExamples = true) {
    let prompt = '';
    
    if (includeExamples) {
      const cotExamples = this.exampleBank.getChainOfThoughtExamples();
      
      prompt += `Answer step by step with clear reasoning. Here are examples:\n\n`;
      
      cotExamples.forEach((example, index) => {
        prompt += `Example ${index + 1}:
Context: ${example.context}
Question: ${example.question}
Answer: ${example.answer}\n\n`;
      });
    }

    prompt += `Now solve this step by step:
Context: ${context}
Question: ${question}

Let's think step by step:
1. First, I'll identify the key information
2. Then, I'll analyze what the question is asking
3. Finally, I'll provide a clear answer

Answer:`;

    return prompt;
  }

  generateFewShotWithReasoning(question, context, domain = 'general') {
    const examples = this.exampleBank.getReasoningExamples(domain);
    
    let prompt = `Answer the question with clear reasoning. Examples:\n\n`;
    
    examples.forEach((example, index) => {
      prompt += `Example ${index + 1}:
Context: ${example.context}
Question: ${example.question}
Reasoning: ${example.reasoning}
Answer: ${example.answer}\n\n`;
    });

    prompt += `Now answer with reasoning:
Context: ${context}
Question: ${question}
Reasoning: [Explain your thought process]
Answer: [Your final answer]`;

    return prompt;
  }

  generateAdaptivePrompt(question, context, userLevel = 'intermediate', questionType = 'factual') {
    const strategy = this.selectStrategy(questionType, userLevel);
    
    switch (strategy) {
      case 'zero_shot':
        return this.generateZeroShotPrompt(question, context);
      case 'one_shot':
        return this.generateOneShotPrompt(question, context);
      case 'multi_shot':
        return this.generateMultiShotPrompt(question, context);
      case 'chain_of_thought':
        return this.generateChainOfThoughtPrompt(question, context);
      default:
        return this.generateMultiShotPrompt(question, context);
    }
  }

  selectStrategy(questionType, userLevel) {
    const strategies = {
      factual: {
        beginner: 'one_shot',
        intermediate: 'multi_shot',
        expert: 'zero_shot'
      },
      analytical: {
        beginner: 'chain_of_thought',
        intermediate: 'multi_shot',
        expert: 'chain_of_thought'
      },
      comparative: {
        beginner: 'multi_shot',
        intermediate: 'multi_shot',
        expert: 'few_shot_reasoning'
      }
    };

    return strategies[questionType]?.[userLevel] || 'multi_shot';
  }

  analyzePromptEffectiveness(responses, goldStandard) {
    const analysis = {
      accuracy: 0,
      consistency: 0,
      completeness: 0,
      recommendations: []
    };

    if (responses.length === 0) return analysis;

    let accurateResponses = 0;
    let completeResponses = 0;

    responses.forEach(response => {
      if (this.isAccurate(response, goldStandard)) {
        accurateResponses++;
      }
      if (this.isComplete(response, goldStandard)) {
        completeResponses++;
      }
    });

    analysis.accuracy = accurateResponses / responses.length;
    analysis.completeness = completeResponses / responses.length;
    analysis.consistency = this.calculateConsistency(responses);

    if (analysis.accuracy < 0.7) {
      analysis.recommendations.push('Consider adding more relevant examples');
    }
    if (analysis.consistency < 0.6) {
      analysis.recommendations.push('Use more consistent example formats');
    }
    if (analysis.completeness < 0.8) {
      analysis.recommendations.push('Include examples with more detailed answers');
    }

    return analysis;
  }

  isAccurate(response, goldStandard) {
    const responseWords = response.toLowerCase().split(/\s+/);
    const goldWords = goldStandard.toLowerCase().split(/\s+/);
    
    const overlap = responseWords.filter(word => goldWords.includes(word));
    return overlap.length / goldWords.length > 0.5;
  }

  isComplete(response, goldStandard) {
    return response.length >= goldStandard.length * 0.7;
  }

  calculateConsistency(responses) {
    if (responses.length < 2) return 1.0;
    
    let similarities = 0;
    let comparisons = 0;
    
    for (let i = 0; i < responses.length - 1; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const similarity = this.calculateSimilarity(responses[i], responses[j]);
        similarities += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? similarities / comparisons : 0;
  }

  calculateSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }
}

class ExampleBank {
  constructor() {
    this.examples = {
      general: [
        {
          context: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.",
          question: "What is photosynthesis?",
          answer: "Photosynthesis is the process where plants convert sunlight, water, and carbon dioxide into glucose (food) and oxygen."
        },
        {
          context: "The water cycle includes evaporation, condensation, precipitation, and collection. Water evaporates from oceans and lakes, forms clouds, falls as rain, and returns to water bodies.",
          question: "How does the water cycle work?",
          answer: "The water cycle works through four main stages: evaporation (water rises as vapor), condensation (vapor forms clouds), precipitation (rain/snow falls), and collection (water returns to bodies of water)."
        },
        {
          context: "Gravity is a fundamental force that attracts objects with mass toward each other. On Earth, gravity pulls objects toward the center of the planet.",
          question: "What is gravity?",
          answer: "Gravity is a fundamental force that attracts objects with mass toward each other, which is why objects fall toward Earth's center."
        }
      ],
      technical: [
        {
          context: "Machine learning algorithms learn patterns from data without being explicitly programmed. They improve performance through experience and can make predictions on new data.",
          question: "How do machine learning algorithms work?",
          answer: "Machine learning algorithms work by learning patterns from training data, then use these patterns to make predictions or decisions on new, unseen data without being explicitly programmed for each specific task."
        },
        {
          context: "APIs (Application Programming Interfaces) allow different software applications to communicate with each other. They define the methods and data formats for requesting and exchanging information.",
          question: "What is an API?",
          answer: "An API (Application Programming Interface) is a set of protocols and tools that allows different software applications to communicate and share data with each other in a standardized way."
        }
      ],
      academic: [
        {
          context: "The scientific method involves observation, hypothesis formation, experimentation, data analysis, and conclusion drawing. It's a systematic approach to understanding natural phenomena.",
          question: "What are the steps of the scientific method?",
          answer: "The scientific method includes: 1) Observation of phenomena, 2) Forming a hypothesis, 3) Designing and conducting experiments, 4) Analyzing data, and 5) Drawing conclusions that support or refute the hypothesis."
        }
      ]
    };

    this.chainOfThoughtExamples = [
      {
        context: "A company's revenue increased from $100,000 to $150,000 over one year.",
        question: "What was the percentage increase in revenue?",
        answer: "Let me solve this step by step:\n1. Find the increase: $150,000 - $100,000 = $50,000\n2. Calculate percentage: ($50,000 ÷ $100,000) × 100 = 50%\n3. Therefore, the revenue increased by 50%."
      },
      {
        context: "A recipe calls for 2 cups of flour to make 12 cookies. You want to make 18 cookies.",
        question: "How much flour do you need?",
        answer: "Let me work through this:\n1. Find the ratio: 2 cups flour for 12 cookies\n2. Calculate per cookie: 2 ÷ 12 = 0.167 cups per cookie\n3. For 18 cookies: 0.167 × 18 = 3 cups\n4. Therefore, I need 3 cups of flour."
      }
    ];

    this.reasoningExamples = [
      {
        context: "Solar panels convert sunlight into electricity using photovoltaic cells. They work best in direct sunlight and their efficiency decreases on cloudy days.",
        question: "Why might solar panels produce less electricity in winter?",
        reasoning: "I need to consider factors that affect solar panel efficiency in winter: shorter daylight hours, lower sun angle, potential cloud cover, and possible snow coverage blocking panels.",
        answer: "Solar panels produce less electricity in winter because of shorter daylight hours, lower sun angles that reduce direct sunlight exposure, increased cloud cover, and potential snow coverage that blocks the panels."
      }
    ];
  }

  getExample(domain) {
    const domainExamples = this.examples[domain] || this.examples.general;
    return domainExamples[Math.floor(Math.random() * domainExamples.length)];
  }

  getMultipleExamples(domain, count) {
    const domainExamples = this.examples[domain] || this.examples.general;
    const shuffled = [...domainExamples].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  getChainOfThoughtExamples() {
    return this.chainOfThoughtExamples;
  }

  getReasoningExamples(domain) {
    return this.reasoningExamples;
  }

  addExample(domain, example) {
    if (!this.examples[domain]) {
      this.examples[domain] = [];
    }
    this.examples[domain].push(example);
  }
}

module.exports = PromptingService;
