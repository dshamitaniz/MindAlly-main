// Enhanced Crisis Detection with Cultural Context for Indian Youth
import { crisisDetectionService, CrisisAssessment } from './crisis-detection';

export interface EnhancedCrisisResponse {
  assessment: CrisisAssessment;
  response: string;
  resources: string[];
  culturalSupport: string[];
  immediateActions: string[];
}

export class EnhancedCrisisDetection {
  
  static processMessage(message: string): EnhancedCrisisResponse {
    const assessment = crisisDetectionService.detectCrisis(message);
    
    // Generate culturally appropriate response
    const response = this.generateCulturalResponse(message, assessment);
    
    // Get Indian-specific resources
    const resources = this.getIndianResources(assessment.riskLevel);
    
    // Cultural support suggestions
    const culturalSupport = this.getCulturalSupport(message);
    
    // Immediate actions based on risk level
    const immediateActions = this.getImmediateActions(assessment.riskLevel);
    
    return {
      assessment,
      response,
      resources,
      culturalSupport,
      immediateActions
    };
  }
  
  private static generateCulturalResponse(message: string, assessment: CrisisAssessment): string {
    const lowerMessage = message.toLowerCase();
    
    // Academic pressure context
    if (/exam|jee|neet|board|परीक्षा|एग्जाम/.test(lowerMessage)) {
      if (assessment.riskLevel === 'imminent' || assessment.riskLevel === 'high') {
        return `I understand the immense pressure you're feeling about your exams. This academic stress is overwhelming many students, but your life is more valuable than any exam result. Please reach out for immediate help - KIRAN helpline: 1800-599-0019. There are people who understand this pressure and can help you through it.`;
      }
      return `I can hear how stressed you are about your exams. This pressure is something many Indian students face, and it's completely understandable to feel overwhelmed. Your worth isn't defined by exam results. Let's talk about some ways to manage this stress.`;
    }
    
    // Family pressure context
    if (/family|parents|माता.पिता|परिवार/.test(lowerMessage)) {
      if (assessment.riskLevel === 'imminent' || assessment.riskLevel === 'high') {
        return `I can hear how much pain you're in regarding your family situation. Family conflicts can feel overwhelming, especially in our culture where family expectations are so high. Your safety is the priority right now - please contact KIRAN: 1800-599-0019 immediately.`;
      }
      return `Family relationships can be really challenging, especially when there are different expectations and pressures. It sounds like you're going through a difficult time with your family. Many young people in India face similar struggles with balancing family expectations and personal desires.`;
    }
    
    // Default crisis response based on risk level
    switch (assessment.riskLevel) {
      case 'imminent':
        return `I'm very concerned about your immediate safety. You don't have to face this alone. Please contact KIRAN helpline right now: 1800-599-0019. They have trained counselors who understand what you're going through and can provide immediate support.`;
      
      case 'high':
        return `I can hear how much pain you're experiencing right now. These thoughts are very serious, and I'm concerned about your safety. Please reach out to a crisis counselor at KIRAN: 1800-599-0019. You deserve support and care during this difficult time.`;
      
      case 'moderate':
        return `I understand you're going through a really difficult time. These feelings are concerning, and you don't have to handle them alone. Consider reaching out to KIRAN helpline: 1800-599-0019 where trained counselors can provide support.`;
      
      case 'low':
        return `It sounds like you're struggling with some difficult feelings right now. These thoughts are important to address, and talking to someone can really help. Support is available when you're ready.`;
      
      default:
        return `I'm here to listen and support you. Thank you for sharing what's on your mind.`;
    }
  }
  
  private static getIndianResources(riskLevel: string): string[] {
    const baseResources = [
      'KIRAN National Helpline: 1800-599-0019 (24/7, free, multilingual)',
      'AASRA: 91-22-2754-6669 (24/7 crisis support)',
      'Vandrevala Foundation: 1860-266-2345 (24/7 helpline)',
      'iCALL: 9152987821 (Mon-Sat, 8 AM-10 PM)'
    ];
    
    if (riskLevel === 'imminent' || riskLevel === 'high') {
      return [
        'EMERGENCY: Call 102 (National Emergency Number)',
        ...baseResources,
        'Nearest hospital emergency department',
        'Local police: 100 (if immediate danger)'
      ];
    }
    
    return baseResources;
  }
  
  private static getCulturalSupport(message: string): string[] {
    const support = [];
    const lowerMessage = message.toLowerCase();
    
    // Academic stress support
    if (/exam|study|academic|परीक्षा/.test(lowerMessage)) {
      support.push(
        'Remember: Your worth is not determined by exam results',
        'Consider talking to a school counselor about academic pressure',
        'Practice stress-reduction techniques like deep breathing',
        'Connect with other students who understand this pressure'
      );
    }
    
    // Family issues support
    if (/family|parents|माता.पिता/.test(lowerMessage)) {
      support.push(
        'Family conflicts are common in our culture - you\'re not alone',
        'Consider family counseling to improve communication',
        'Find a trusted adult outside the family to talk to',
        'Remember that generational differences in values are normal'
      );
    }
    
    // General cultural support
    support.push(
      'Mental health support is becoming more accepted in India',
      'Many successful people have faced similar struggles',
      'Seeking help is a sign of strength, not weakness',
      'Your feelings are valid and deserve attention'
    );
    
    return support;
  }
  
  private static getImmediateActions(riskLevel: string): string[] {
    switch (riskLevel) {
      case 'imminent':
        return [
          'Call KIRAN immediately: 1800-599-0019',
          'Stay with someone you trust',
          'Remove any means of self-harm',
          'Go to nearest hospital if in immediate danger',
          'Call emergency services: 102'
        ];
      
      case 'high':
        return [
          'Contact KIRAN helpline: 1800-599-0019',
          'Reach out to a trusted adult',
          'Avoid being alone',
          'Consider going to a hospital',
          'Remove access to harmful items'
        ];
      
      case 'moderate':
        return [
          'Consider calling KIRAN: 1800-599-0019',
          'Talk to someone you trust',
          'Practice grounding techniques',
          'Avoid alcohol or substances',
          'Stay connected with supportive people'
        ];
      
      case 'low':
        return [
          'Reach out to a friend or family member',
          'Consider professional counseling',
          'Practice self-care activities',
          'Monitor your mood and thoughts',
          'Keep crisis numbers handy'
        ];
      
      default:
        return [
          'Continue sharing your feelings',
          'Practice stress management',
          'Maintain social connections',
          'Consider professional support if needed'
        ];
    }
  }
}

// Export for use in chat services
export const enhancedCrisisDetection = EnhancedCrisisDetection;