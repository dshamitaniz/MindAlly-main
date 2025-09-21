// Enhanced Audio Service for Natural Speech Synthesis with Multilingual Support
export interface VoiceSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

export interface AudioServiceOptions {
  enableSSML: boolean;
  addPauses: boolean;
  emphasizeKeywords: boolean;
  naturalRhythm: boolean;
  autoDetectLanguage: boolean;
}

// Multilingual voice mappings for better Web Speech API support
export const MULTILINGUAL_VOICES: Record<string, string[]> = {
  'en-US': [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Google US English',
    'Alex', 'Samantha', 'Victoria'
  ],
  'hi-IN': [
    'Microsoft Swara Online (Natural) - Hindi (India)',
    'Google हिन्दी',
    'Hindi India',
    'hi-IN-Wavenet-A',
    'hi-IN-Standard-A'
  ],
  'te-IN': [
    'Microsoft Shruti Online (Natural) - Telugu (India)',
    'Google తెలుగు',
    'Telugu India',
    'te-IN-Standard-A',
    'te-IN-Standard-B'
  ],
  'ta-IN': [
    'Microsoft Pallavi Online (Natural) - Tamil (India)',
    'Google தமிழ்',
    'Tamil India'
  ]
};

// Enhanced multilingual text processing
export const MULTILINGUAL_KEYWORDS: Record<string, string[]> = {
  'en': ['important', 'crucial', 'essential', 'remember', 'note', 'warning'],
  'hi': ['महत्वपूर्ण', 'जरूरी', 'आवश्यक', 'याद रखें', 'नोट', 'चेतावनी'],
  'te': ['ముఖ్యమైన', 'అవసరమైన', 'అత్యవసర', 'గుర్తుంచుకోండి', 'నోట్', 'హెచ్చరిక'],
  'ta': ['முக்கியமான', 'அவசியமான', 'நினைவில் கொள்ளுங்கள்']
};

export class AudioService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized = false;
  
  // Default settings for natural-sounding speech
  private defaultSettings: VoiceSettings = {
    voice: '',
    rate: 0.85, // Slightly slower for clarity
    pitch: 1.1, // Slightly higher for warmth
    volume: 0.9,
    lang: 'en-US'
  };

  private options: AudioServiceOptions = {
    enableSSML: true,
    addPauses: true,
    emphasizeKeywords: true,
    naturalRhythm: true,
    autoDetectLanguage: true
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.initializeVoices();
    } else {
      // Initialize with null for SSR
      this.synthesis = null as any;
    }
  }

  private async initializeVoices() {
    if (typeof window === 'undefined' || !this.synthesis) return;
    
    if (this.synthesis.getVoices().length > 0) {
      this.voices = this.synthesis.getVoices();
      this.isInitialized = true;
    } else {
      // Wait for voices to load
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis.getVoices();
        this.isInitialized = true;
      });
    }
  }

  // Get available voices with multilingual support
  getAvailableVoices(language: string = 'en-US'): SpeechSynthesisVoice[] {
    const langCode = language.split('-')[0];
    
    return this.voices
      .filter(voice => 
        voice.lang.startsWith(langCode) || 
        voice.lang.startsWith(language) ||
        MULTILINGUAL_VOICES[language]?.some(name => 
          voice.name.includes(name.split(' ')[0])
        )
      )
      .sort((a, b) => {
        // Prioritize neural/natural voices
        const aIsNatural = a.name.toLowerCase().includes('natural') || 
                          a.name.toLowerCase().includes('neural') ||
                          a.name.toLowerCase().includes('wavenet');
        const bIsNatural = b.name.toLowerCase().includes('natural') || 
                          b.name.toLowerCase().includes('neural') ||
                          b.name.toLowerCase().includes('wavenet');
        
        if (aIsNatural && !bIsNatural) return -1;
        if (!aIsNatural && bIsNatural) return 1;
        
        // Prioritize exact language match
        if (a.lang === language && b.lang !== language) return -1;
        if (a.lang !== language && b.lang === language) return 1;
        
        return a.name.localeCompare(b.name);
      });
  }

  // Enhanced multilingual text processing
  private processTextForSpeech(text: string, language: string = 'en-US'): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    let processedText = text;
    const langCode = language.split('-')[0];

    if (this.options.addPauses) {
      // Language-specific pause patterns
      if (langCode === 'hi' || langCode === 'te' || langCode === 'ta') {
        // Indian languages benefit from longer pauses
        processedText = processedText
          .replace(/([।॥])\s*/g, '$1... ') // Devanagari punctuation
          .replace(/([,;:])\s*/g, '$1, ')
          .replace(/([.!?])\s*/g, '$1... ');
      } else {
        // English and other languages
        processedText = processedText
          .replace(/([.!?])\s*/g, '$1... ')
          .replace(/([,;:])\s*/g, '$1, ');
      }
    }

    if (this.options.emphasizeKeywords) {
      const keywords = MULTILINGUAL_KEYWORDS[langCode] || MULTILINGUAL_KEYWORDS['en'];
      keywords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processedText = processedText.replace(regex, `${word}`); // Emphasis through repetition
      });
    }

    if (this.options.naturalRhythm) {
      // Add natural speech patterns based on language
      if (langCode === 'hi') {
        processedText = processedText.replace(/\b(तो|फिर|अब|वैसे)\b/gi, '$1,');
      } else if (langCode === 'te') {
        processedText = processedText.replace(/\b(అప్పుడు|ఇప్పుడు|మరియు)\b/gi, '$1,');
      } else if (langCode === 'ta') {
        processedText = processedText.replace(/\b(அப்போது|இப்போது|மற்றும்)\b/gi, '$1,');
      } else {
        // English patterns
        processedText = processedText
          .replace(/\b(well|so|now|actually|basically)\b/gi, '$1,')
          .replace(/\b(um|uh|er)\b/gi, '');
      }
    }

    return processedText;
  }

  // Auto-detect language from text
  private detectLanguage(text: string): string {
    // Simple language detection based on character sets
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Devanagari (Hindi)
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN'; // Gujarati
    if (/[\u0B00-\u0B7F]/.test(text)) return 'or-IN'; // Odia
    return 'en-US'; // Default to English
  }

  // Select best voice for language
  private selectBestVoice(language: string): SpeechSynthesisVoice | null {
    const availableVoices = this.getAvailableVoices(language);
    
    if (availableVoices.length === 0) {
      // Fallback to any voice for the language family
      const langCode = language.split('-')[0];
      const fallbackVoices = this.voices.filter(voice => 
        voice.lang.startsWith(langCode)
      );
      return fallbackVoices[0] || null;
    }
    
    return availableVoices[0];
  }

  // Create SSML for enhanced speech
  private createSSML(text: string, settings: VoiceSettings): string {
    const processedText = this.processTextForSpeech(text, settings.lang);
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${settings.lang}">
        <prosody rate="${settings.rate}" pitch="${settings.pitch}" volume="${settings.volume}">
          ${processedText}
        </prosody>
      </speak>
    `;
  }

  // Enhanced speak method with auto-language detection
  async speak(
    text: string, 
    settings: Partial<VoiceSettings> = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    // Stop any current speech
    this.stop();

    // Auto-detect language if enabled and not specified
    const detectedLang = this.options.autoDetectLanguage && !settings.lang ? 
      this.detectLanguage(text) : 
      (settings.lang || this.defaultSettings.lang);
    
    const finalSettings = { 
      ...this.defaultSettings, 
      ...settings, 
      lang: detectedLang 
    };
    
    // Find the best voice for the language
    const selectedVoice = settings.voice ? 
      this.voices.find(v => v.name === settings.voice) :
      this.selectBestVoice(finalSettings.lang);
    
    // Process text for natural speech
    const processedText = this.processTextForSpeech(text, finalSettings.lang);
    
    const utterance = new SpeechSynthesisUtterance(processedText);
    
    // Apply voice and settings
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = finalSettings.lang;
    utterance.rate = finalSettings.rate;
    utterance.pitch = finalSettings.pitch;
    utterance.volume = finalSettings.volume;

    // Add event listeners
    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      onError?.(event);
    };

    this.currentUtterance = utterance;
    if (typeof window !== 'undefined' && this.synthesis) {
      this.synthesis.speak(utterance);
    }
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    this.voices.forEach(voice => {
      languages.add(voice.lang);
    });
    return Array.from(languages).sort();
  }

  // Check if a language is supported
  isLanguageSupported(language: string): boolean {
    return this.voices.some(voice => 
      voice.lang.startsWith(language) || 
      voice.lang.startsWith(language.split('-')[0])
    );
  }

  // Get language display name
  getLanguageDisplayName(languageCode: string): string {
    const languageNames: { [key: string]: string } = {
      'en-US': 'English (US)',
      'hi-IN': 'हिन्दी (Hindi)',
      'te-IN': 'తెలుగు (Telugu)',
      'ta-IN': 'தமிழ் (Tamil)',
      'gu-IN': 'ગુજરાતી (Gujarati)',
      'or-IN': 'ଓଡ଼ିଆ (Odia)',
      'bn-IN': 'বাংলা (Bengali)',
      'pa-IN': 'ਪੰਜਾਬੀ (Punjabi)',
      'mr-IN': 'मराठी (Marathi)',
      'kn-IN': 'ಕನ್ನಡ (Kannada)',
      'ml-IN': 'മലയാളം (Malayalam)'
    };
    return languageNames[languageCode] || languageCode;
  }

  // Wait for voices to initialize
  private async waitForInitialization(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve();
        return;
      }

      const checkVoices = () => {
        if (typeof window === 'undefined' || !this.synthesis) {
          resolve();
          return;
        }
        
        if (this.synthesis.getVoices().length > 0) {
          this.voices = this.synthesis.getVoices();
          this.isInitialized = true;
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };

      checkVoices();
    });
  }

  // Stop current speech
  stop(): void {
    if (typeof window !== 'undefined' && this.synthesis) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  // Pause current speech
  pause(): void {
    if (typeof window !== 'undefined' && this.synthesis) {
      this.synthesis.pause();
    }
  }

  // Resume paused speech
  resume(): void {
    if (typeof window !== 'undefined' && this.synthesis) {
      this.synthesis.resume();
    }
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return typeof window !== 'undefined' && this.synthesis ? this.synthesis.speaking : false;
  }

  // Check if currently paused
  isPaused(): boolean {
    return typeof window !== 'undefined' && this.synthesis ? this.synthesis.paused : false;
  }

  // Update options
  updateOptions(options: Partial<AudioServiceOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // Get current settings
  getDefaultSettings(): VoiceSettings {
    return { ...this.defaultSettings };
  }

  // Update default settings
  updateDefaultSettings(settings: Partial<VoiceSettings>): void {
    this.defaultSettings = { ...this.defaultSettings, ...settings };
  }
}

// Create singleton instance
export const audioService = new AudioService();
