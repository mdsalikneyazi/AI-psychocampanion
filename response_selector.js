// Dynamic response selection based on user input analysis
const trainingData = require('./training_data.json');

class ResponseSelector {
  constructor() {
    this.techniques = trainingData.technique_responses;
    this.crisisResponses = trainingData.crisis_responses;
  }

  analyzeUserInput(input) {
    const lowerInput = input.toLowerCase();
    
    // Crisis detection
    if (this.detectCrisis(lowerInput)) {
      return { type: 'crisis', urgency: 'high' };
    }
    
    // Emotional state detection
    const emotionalState = this.detectEmotionalState(lowerInput);
    
    // Technique suggestion
    const suggestedTechnique = this.suggestTechnique(emotionalState, lowerInput);
    
    return {
      type: 'support',
      emotionalState,
      suggestedTechnique,
      urgency: emotionalState === 'severe' ? 'high' : 'medium'
    };
  }

  detectCrisis(input) {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself',
      'hopeless', 'no way out', 'better off dead'
    ];
    return crisisKeywords.some(keyword => input.includes(keyword));
  }

  detectEmotionalState(input) {
    const anxietyKeywords = ['anxious', 'worried', 'panic', 'nervous', 'scared'];
    const depressionKeywords = ['sad', 'depressed', 'hopeless', 'worthless', 'empty'];
    const stressKeywords = ['stressed', 'overwhelmed', 'pressure', 'tired'];
    
    if (anxietyKeywords.some(keyword => input.includes(keyword))) return 'anxiety';
    if (depressionKeywords.some(keyword => input.includes(keyword))) return 'depression';
    if (stressKeywords.some(keyword => input.includes(keyword))) return 'stress';
    
    return 'general';
  }

  suggestTechnique(emotionalState, input) {
    if (emotionalState === 'anxiety') return 'breathing';
    if (emotionalState === 'depression') return 'grounding';
    if (emotionalState === 'stress') return 'breathing';
    if (input.includes('sleep')) return 'relaxation';
    if (input.includes('panic')) return 'breathing';
    
    return 'grounding'; // default
  }

  generateResponse(analysis, language = 'EN') {
    if (analysis.type === 'crisis') {
      return this.crisisResponses.self_harm; // Default crisis response
    }

    const technique = analysis.suggestedTechnique;
    const emotionalState = analysis.emotionalState;
    
    // Get appropriate technique response
    const techniqueResponse = this.techniques[technique]?.['4-7-8'] || 
                            this.techniques[technique]?.['5-4-3-2-1'] ||
                            this.techniques[technique]?.['present_moment'];
    
    // Get validation response
    const validationResponse = this.techniques.validation?.[emotionalState] || 
                              this.techniques.validation?.stress;
    
    // Combine responses
    return `${validationResponse} ${techniqueResponse}`;
  }
}

module.exports = ResponseSelector;
