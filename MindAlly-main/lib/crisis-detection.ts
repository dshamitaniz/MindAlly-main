// Crisis Detection System for Indian Youth Mental Health
// Implements C-SSRS framework and cultural context

export interface CrisisAssessment {
  riskLevel: 'no-risk' | 'low' | 'moderate' | 'high' | 'imminent';
  indicators: string[];
  requiresImmediate: boolean;
  culturalContext?: string;
}

export interface CrisisResponse {
  message: string;
  resources: CrisisResource[];
  followUpActions: string[];
}

export interface CrisisResource {
  name: string;
  number: string;
  description: string;
  availability: string;
}

// Crisis patterns based on C-SSRS and Indian context
const CRISIS_PATTERNS = {
  imminent: [
    /tonight|today|right now|अभी|आज रात|आज/i,
    /pills? ready|rope|knife|चाकू|गोलियाँ तैयार/i,
    /suicide note|अलविदा|goodbye|saying bye/i,
    /going to (do it|jump|hang)|करने जा रहा|कूदने जा रहा/i
  ],
  high: [
    /plan to (kill|die|suicide)|प्लान बना|योजना बना/i,
    /method|way to die|तरीका|रास्ता मरने का/i,
    /researching|खोज रहा|ढूंढ रहा/i,
    /decided to|फैसला कर लिया|तय कर लिया/i
  ],
  moderate: [
    /thinking about (killing|suicide|dying)|सोच रहा मरने के बारे में/i,
    /want to (die|kill myself)|मरना चाहता|खुद को मारना चाहता/i,
    /better off dead|मर जाना बेहतर/i,
    /end (it all|my life)|सब कुछ खत्म|जीवन समाप्त/i
  ],
  low: [
    /wish I was dead|काश मैं मर जाता/i,
    /don't want to live|जीना नहीं चाहता/i,
    /tired of living|जीने से थक गया/i,
    /no point in living|जीने का कोई मतलब नहीं/i
  ]
};

const SELF_HARM_PATTERNS = [
  /cut (myself|deep)|अपने आप को काटना/i,
  /hurt myself|खुद को चोट/i,
  /self.harm|आत्म.हानि/i,
  /bleed out|खून बहाना/i,
  /burn myself|जलाना अपने आप को/i
];

export class CrisisDetectionService {
  
  detectCrisis(message: string): CrisisAssessment {
    const lowerMessage = message.toLowerCase();
    const indicators: string[] = [];
    let riskLevel: CrisisAssessment['riskLevel'] = 'no-risk';
    let culturalContext = '';

    // Check for imminent risk first
    for (const pattern of CRISIS_PATTERNS.imminent) {
      if (pattern.test(message)) {
        indicators.push('Imminent action indicators');
        riskLevel = 'imminent';
        break;
      }
    }

    // Check high risk if not imminent
    if (riskLevel !== 'imminent') {
      for (const pattern of CRISIS_PATTERNS.high) {
        if (pattern.test(message)) {
          indicators.push('Specific plan or method mentioned');
          riskLevel = 'high';
          break;
        }
      }
    }

    // Check moderate risk
    if (riskLevel === 'no-risk') {
      for (const pattern of CRISIS_PATTERNS.moderate) {
        if (pattern.test(message)) {
          indicators.push('Active suicidal ideation');
          riskLevel = 'moderate';
          break;
        }
      }
    }

    // Check low risk
    if (riskLevel === 'no-risk') {
      for (const pattern of CRISIS_PATTERNS.low) {
        if (pattern.test(message)) {
          indicators.push('Passive death wishes');
          riskLevel = 'low';
          break;
        }
      }
    }

    // Check for self-harm
    for (const pattern of SELF_HARM_PATTERNS) {
      if (pattern.test(message)) {
        indicators.push('Self-harm indicators');
        if (riskLevel === 'no-risk') riskLevel = 'moderate';
        break;
      }
    }

    // Cultural context detection
    if (/exam|JEE|NEET|board|परीक्षा|एग्जाम/.test(message)) {
      culturalContext = 'Academic pressure - common stressor for Indian youth';
    }
    if (/family|parents|माता.पिता|परिवार/.test(message)) {
      culturalContext = 'Family dynamics - cultural expectations';
    }

    return {
      riskLevel,
      indicators,
      requiresImmediate: ['high', 'imminent'].includes(riskLevel),
      culturalContext
    };
  }

  generateCrisisResponse(assessment: CrisisAssessment): CrisisResponse {
    const resources: CrisisResource[] = [
      {
        name: 'KIRAN National Helpline',
        number: '1800-599-0019',
        description: '24/7 mental health support',
        availability: 'Free, available in multiple languages'
      },
      {
        name: 'AASRA',
        number: '91-22-2754-6669',
        description: 'Crisis intervention and suicide prevention',
        availability: '24/7 support'
      },
      {
        name: 'iCALL',
        number: '9152987821',
        description: 'Psychosocial helpline',
        availability: 'Monday-Saturday, 8 AM-10 PM'
      }
    ];

    let message = '';
    let followUpActions: string[] = [];

    switch (assessment.riskLevel) {
      case 'imminent':
        message = `I am very concerned about your immediate safety. You mentioned specific plans, and I want you to know that you do not have to go through this alone. Please reach out for help right now - call KIRAN at 1800-599-0019 immediately. If you are in immediate danger, please call emergency services or go to the nearest hospital.`;
        followUpActions = [
          'Call emergency services if in immediate danger',
          'Contact KIRAN helpline: 1800-599-0019',
          'Reach out to a trusted adult immediately',
          'Go to nearest hospital emergency room'
        ];
        break;

      case 'high':
        message = `I can hear that you are in significant pain right now. Having specific thoughts about ending your life is very serious, and I am concerned about your safety. Please contact a crisis counselor immediately at KIRAN: 1800-599-0019. They have trained professionals who can help you through this difficult time.`;
        followUpActions = [
          'Contact KIRAN helpline: 1800-599-0019',
          'Speak with a mental health professional',
          'Remove any means of self-harm from your environment',
          'Stay with someone you trust'
        ];
        break;

      case 'moderate':
        message = `I am concerned about what you are sharing with me. These thoughts about wanting to die are serious, and you deserve support. Please consider reaching out to a counselor who can help you work through these feelings. KIRAN helpline (1800-599-0019) has trained professionals available 24/7.`;
        followUpActions = [
          'Contact KIRAN helpline: 1800-599-0019',
          'Consider speaking with a counselor',
          'Reach out to a trusted friend or family member',
          'Focus on your immediate safety'
        ];
        break;

      case 'low':
        message = `I can hear that you are going through a really difficult time. These feelings of not wanting to live are concerning, and I want you to know that support is available. Sometimes talking to a professional can help provide new perspectives and coping strategies.`;
        followUpActions = [
          'Consider contacting KIRAN helpline: 1800-599-0019',
          'Speak with a trusted adult about how you are feeling',
          'Consider professional counseling',
          'Practice self-care and stress management'
        ];
        break;

      default:
        message = `I am here to listen and support you. If you are having thoughts of self-harm or suicide, please do not hesitate to reach out for professional help.`;
        followUpActions = ['Remember that support is available when you need it'];
    }

    return { message, resources, followUpActions };
  }
}

export const crisisDetectionService = new CrisisDetectionService();