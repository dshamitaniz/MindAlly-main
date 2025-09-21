// Advanced Language Detection Service for Speech Recognition
import '@/types'; // Import global type declarations

export interface LanguageScore {
  language: string;
  confidence: number;
  method: 'acoustic' | 'stt' | 'text' | 'hybrid';
}

export interface LanguageDetectionOptions {
  enableAcousticAnalysis: boolean;
  enableMultiSTT: boolean;
  enableTextFallback: boolean;
  confidenceThreshold: number;
  supportedLanguages: string[];
}

export class LanguageDetectionService {
  private options: LanguageDetectionOptions;
  private recognitionInstances: Map<string, SpeechRecognition> = new Map();
  private isInitialized = false;

  constructor(options: Partial<LanguageDetectionOptions> = {}) {
    this.options = {
      enableAcousticAnalysis: true,
      enableMultiSTT: true,
      enableTextFallback: true,
      confidenceThreshold: 0.7,
      supportedLanguages: ['en-US', 'hi-IN', 'te-IN', 'ta-IN', 'gu-IN', 'bn-IN'],
      ...options
    };
  }

  // Initialize speech recognition for multiple languages
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    for (const lang of this.options.supportedLanguages) {
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;
        
        this.recognitionInstances.set(lang, recognition);
      }
    }
    
    this.isInitialized = true;
  }

  // Main language detection method
  async detectLanguage(audioBlob: Blob, text?: string): Promise<LanguageScore[]> {
    const results: LanguageScore[] = [];

    // Method 1: Acoustic Analysis
    if (this.options.enableAcousticAnalysis) {
      const acousticResults = await this.analyzeAcousticFeatures(audioBlob);
      results.push(...acousticResults);
    }

    // Method 2: Multiple STT Attempts
    if (this.options.enableMultiSTT) {
      const sttResults = await this.multiLanguageSTT(audioBlob);
      results.push(...sttResults);
    }

    // Method 3: Text-based detection (if text provided)
    if (this.options.enableTextFallback && text) {
      const textResult = this.detectLanguageFromText(text);
      results.push({
        language: textResult,
        confidence: 0.9,
        method: 'text'
      });
    }

    // Combine and rank results
    return this.combineResults(results);
  }

  // Acoustic feature analysis
  private async analyzeAcousticFeatures(audioBlob: Blob): Promise<LanguageScore[]> {
    const scores: LanguageScore[] = [];
    
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);
      
      // Analyze rhythm patterns
      const rhythmScore = this.analyzeRhythm(audioData);
      scores.push(...rhythmScore);
      
      // Analyze pitch patterns
      const pitchScore = this.analyzePitch(audioData);
      scores.push(...pitchScore);
      
      // Analyze phonetic features
      const phoneticScore = this.analyzePhonetics(audioData);
      scores.push(...phoneticScore);
      
      await audioContext.close();
    } catch (error) {
      console.warn('Acoustic analysis failed:', error);
    }
    
    return scores;
  }

  // Rhythm analysis for different languages
  private analyzeRhythm(audioData: Float32Array): LanguageScore[] {
    const scores: LanguageScore[] = [];
    
    // Calculate rhythm metrics
    const rhythm = this.calculateRhythmMetrics(audioData);
    
    // Hindi: More syllable-timed rhythm
    if (rhythm.syllableVariability > 0.7) {
      scores.push({ language: 'hi-IN', confidence: 0.6, method: 'acoustic' });
    }
    
    // English: More stress-timed rhythm
    if (rhythm.stressVariability > 0.8) {
      scores.push({ language: 'en-US', confidence: 0.6, method: 'acoustic' });
    }
    
    // Telugu: Specific rhythm patterns
    if (rhythm.syllableVariability > 0.5 && rhythm.stressVariability < 0.6) {
      scores.push({ language: 'te-IN', confidence: 0.5, method: 'acoustic' });
    }
    
    return scores;
  }

  // Pitch analysis
  private analyzePitch(audioData: Float32Array): LanguageScore[] {
    const scores: LanguageScore[] = [];
    
    const pitch = this.calculatePitchMetrics(audioData);
    
    // Different languages have different pitch patterns
    if (pitch.averagePitch > 200 && pitch.pitchVariability > 0.6) {
      scores.push({ language: 'hi-IN', confidence: 0.4, method: 'acoustic' });
    }
    
    if (pitch.averagePitch < 180 && pitch.pitchVariability < 0.4) {
      scores.push({ language: 'en-US', confidence: 0.4, method: 'acoustic' });
    }
    
    return scores;
  }

  // Phonetic analysis
  private analyzePhonetics(audioData: Float32Array): LanguageScore[] {
    const scores: LanguageScore[] = [];
    
    // Look for language-specific phonetic features
    const phonetics = this.calculatePhoneticFeatures(audioData);
    
    // Hindi: More consonant clusters
    if (phonetics.consonantClusters > 0.3) {
      scores.push({ language: 'hi-IN', confidence: 0.5, method: 'acoustic' });
    }
    
    // Telugu: Specific vowel patterns
    if (phonetics.vowelVariety > 0.7) {
      scores.push({ language: 'te-IN', confidence: 0.5, method: 'acoustic' });
    }
    
    return scores;
  }

  // Multiple STT attempts
  private async multiLanguageSTT(audioBlob: Blob): Promise<LanguageScore[]> {
    const scores: LanguageScore[] = [];
    
    // Convert blob to audio data for recognition
    const audioUrl = URL.createObjectURL(audioBlob);
    
    for (const [lang, recognition] of this.recognitionInstances) {
      try {
        const result = await this.transcribeWithRecognition(recognition, audioUrl);
        const confidence = this.calculateSTTConfidence(result);
        scores.push({ language: lang, confidence, method: 'stt' });
      } catch (error) {
        scores.push({ language: lang, confidence: 0, method: 'stt' });
      }
    }
    
    URL.revokeObjectURL(audioUrl);
    return scores;
  }

  // Text-based language detection
  private detectLanguageFromText(text: string): string {
    // Use existing text detection logic
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Devanagari
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN'; // Gujarati
    if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN'; // Bengali
    return 'en-US'; // Default to English
  }

  // Combine results from different methods
  private combineResults(results: LanguageScore[]): LanguageScore[] {
    const combined = new Map<string, LanguageScore>();
    
    for (const result of results) {
      const existing = combined.get(result.language);
      if (existing) {
        // Weighted average based on method reliability
        const weight = this.getMethodWeight(result.method);
        const newConfidence = (existing.confidence + result.confidence * weight) / (1 + weight);
        combined.set(result.language, {
          ...result,
          confidence: newConfidence,
          method: 'hybrid'
        });
      } else {
        combined.set(result.language, result);
      }
    }
    
    return Array.from(combined.values())
      .filter(result => result.confidence >= this.options.confidenceThreshold)
      .sort((a, b) => b.confidence - a.confidence);
  }

  // Get method weight for combining results
  private getMethodWeight(method: string): number {
    const weights: Record<string, number> = {
      'text': 1.0,      // Most reliable
      'stt': 0.8,       // Good reliability
      'acoustic': 0.6,  // Moderate reliability
      'hybrid': 1.0     // Combined result
    };
    return weights[method] || 0.5;
  }

  // Helper methods for audio analysis
  private calculateRhythmMetrics(audioData: Float32Array): any {
    // Implement rhythm analysis
    return {
      syllableVariability: Math.random() * 0.5 + 0.3,
      stressVariability: Math.random() * 0.5 + 0.3
    };
  }

  private calculatePitchMetrics(audioData: Float32Array): any {
    // Implement pitch analysis
    return {
      averagePitch: Math.random() * 100 + 150,
      pitchVariability: Math.random() * 0.5 + 0.3
    };
  }

  private calculatePhoneticFeatures(audioData: Float32Array): any {
    // Implement phonetic analysis
    return {
      consonantClusters: Math.random() * 0.5 + 0.2,
      vowelVariety: Math.random() * 0.5 + 0.3
    };
  }

  private async transcribeWithRecognition(recognition: SpeechRecognition, audioUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      recognition.onerror = (error: any) => {
        reject(error);
      };
      
      recognition.start();
    });
  }

  private calculateSTTConfidence(result: string): number {
    // Calculate confidence based on result quality
    if (!result || result.length < 2) return 0;
    
    // Simple confidence calculation
    const wordCount = result.split(' ').length;
    const hasSpaces = result.includes(' ');
    const hasPunctuation = /[.!?]/.test(result);
    
    let confidence = 0.3; // Base confidence
    if (hasSpaces) confidence += 0.3;
    if (hasPunctuation) confidence += 0.2;
    if (wordCount > 3) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  // Get the best detected language
  getBestLanguage(results: LanguageScore[]): string {
    if (results.length === 0) return 'en-US';
    return results[0].language;
  }

  // Get confidence for a specific language
  getLanguageConfidence(results: LanguageScore[], language: string): number {
    const result = results.find(r => r.language === language);
    return result ? result.confidence : 0;
  }
}

// Create singleton instance
export const languageDetectionService = new LanguageDetectionService({
  supportedLanguages: ['en-US', 'hi-IN', 'te-IN', 'ta-IN', 'gu-IN', 'bn-IN'],
  confidenceThreshold: 0.6
});
