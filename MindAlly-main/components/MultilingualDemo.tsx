'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { audioService } from '@/lib/audio-service';
import { Volume2, Globe, Languages } from 'lucide-react';

const DEMO_TEXTS = {
  'en-US': {
    title: 'English Demo',
    text: 'Hello! I am your AI mental health assistant. I can help you with meditation, mood tracking, and emotional support in multiple languages.',
    color: 'text-blue-600'
  },
  'hi-IN': {
    title: 'हिन्दी डेमो',
    text: 'नमस्ते! मैं आपकी AI मानसिक स्वास्थ्य सहायक हूँ। मैं आपकी ध्यान, मूड ट्रैकिंग और भावनात्मक सहायता में कई भाषाओं में मदद कर सकती हूँ। आपके मानसिक स्वास्थ्य के लिए मैं यहाँ हूँ।',
    color: 'text-orange-600'
  },
  'te-IN': {
    title: 'తెలుగు డెమో',
    text: 'నమస్కారం! నేను మీ AI మానసిక ఆరోగ్య సహాయకురాలిని. నేను ధ్యానం, మూడ్ ట్రాకింగ్ మరియు భావోద్వేగ మద్దతులో అనేక భాషల్లో మీకు సహాయపడగలను. మీ మానసిక ఆరోగ్యం కోసం నేను ఇక్కడ ఉన్నాను.',
    color: 'text-green-600'
  },
  'ta-IN': {
    title: 'தமிழ் டெமோ',
    text: 'வணக்கம்! நான் உங்கள் AI மன ஆரோக்கிய உதவியாளர். தியானம், மனநிலை கண்காணிப்பு மற்றும் உணர்ச்சி ஆதரவில் பல மொழிகளில் உங்களுக்கு உதவ முடியும். உங்கள் மன ஆரோக்கியத்திற்காக நான் இங்கே இருக்கிறேன்.',
    color: 'text-purple-600'
  },
  'bn-IN': {
    title: 'বাংলা ডেমো',
    text: 'নমস্কার! আমি আপনার AI মানসিক স্বাস্থ্য সহায়ক। আমি ধ্যান, মুড ট্র্যাকিং এবং আবেগিক সহায়তায় বিভিন্ন ভাষায় আপনাকে সাহায্য করতে পারি। আপনার মানসিক স্বাস্থ্যের জন্য আমি এখানে আছি।',
    color: 'text-red-600'
  },
  'gu-IN': {
    title: 'ગુજરાતી ડેમો',
    text: 'નમસ્તે! હું તમારી AI માનસિક આરોગ્ય સહાયક છું. હું ધ્યાન, મૂડ ટ્રેકિંગ અને ભાવનાત્મક સહાયતામાં અનેક ભાષાઓમાં તમને મદદ કરી શકું છું. તમારા માનસિક આરોગ્ય માટે હું અહીં છું.',
    color: 'text-yellow-600'
  },
  'mr-IN': {
    title: 'मराठी डेमो',
    text: 'नमस्कार! मी तुमची AI मानसिक आरोग्य सहायक आहे. मी ध्यान, मूड ट्रॅकिंग आणि भावनिक सहाय्यात अनेक भाषांमध्ये तुम्हाला मदत करू शकते. तुमच्या मानसिक आरोग्यासाठी मी येथे आहे.',
    color: 'text-indigo-600'
  }
};

export function MultilingualDemo() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof DEMO_TEXTS>('en-US');

  const playDemo = async (language: keyof typeof DEMO_TEXTS) => {
    if (isPlaying === language) {
      audioService.stop();
      setIsPlaying(null);
      return;
    }

    setIsPlaying(language);
    const demo = DEMO_TEXTS[language];
    
    await audioService.speak(
      demo.text,
      { lang: language },
      () => setIsPlaying(language),
      () => setIsPlaying(null),
      () => setIsPlaying(null)
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Multilingual Voice Demo
        </CardTitle>
        <p className="text-sm text-gray-600">
          Experience our AI assistant speaking in different languages with natural, high-quality voices.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(DEMO_TEXTS).map(([lang, demo]) => (
            <div key={lang} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${demo.color}`}>
                  {demo.title}
                </h3>
                <Button
                  onClick={() => playDemo(lang as keyof typeof DEMO_TEXTS)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isPlaying === lang ? (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {demo.text}
              </p>
              
              <div className="text-xs text-gray-500">
                Language: {audioService.getLanguageDisplayName(lang)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Features
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Automatic language detection from text</li>
            <li>• Natural speech with language-specific pauses and rhythm</li>
            <li>• High-quality neural voices for each language</li>
            <li>• Support for Hindi, Telugu, Tamil, and 100+ other languages</li>
            <li>• Completely free and works offline</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
