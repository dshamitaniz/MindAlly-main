'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch'; // Import Switch component
import { Input } from '@/components/ui/Input'; // Import Input component
import { audioService, type VoiceSettings, AudioServiceOptions } from '@/lib/audio-service';
import { testOllamaConnection, getSuggestedUrls, getDockerTroubleshootingSteps } from '@/lib/ollama-docker-helper';
import { Volume2, VolumeX, Play, Square, Settings, Mic, Globe, Languages, Brain, Key, Link, MessageSquare, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: VoiceSettings) => void;
  userId: string;
  ollamaModels: OllamaModel[];
}

interface OllamaModel {
  name: string;
  size: string;
  description: string;
  recommended: boolean;
}

interface AISettings {
  provider: 'google' | 'ollama' | '';
  googleApiKey: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  conversationMemory: boolean;
}

export function VoiceSettings({ isOpen, onClose, onSettingsChange, userId, ollamaModels }: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(audioService.getDefaultSettings());
  const [options, setOptions] = useState<AudioServiceOptions>({
    enableSSML: true,
    addPauses: true,
    emphasizeKeywords: true,
    naturalRhythm: true,
    autoDetectLanguage: true
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [testText, setTestText] = useState("Hello! I'm your AI assistant. How can I help you today?");
  const [aiSettings, setAiSettings] = useState<AISettings>({
    provider: 'ollama',
    googleApiKey: '',
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.1:latest',
    conversationMemory: true,
  });
  const [loadingAISettings, setLoadingAISettings] = useState(true);
  const [savingAISettings, setSavingAISettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Fetch AI settings on component mount
  useEffect(() => {
    const fetchAISettings = async () => {
      if (!userId) {
        console.warn("fetchAISettings: userId is undefined, skipping fetch.");
        setLoadingAISettings(false); // Ensure loading state is cleared
        return;
      }
      setLoadingAISettings(true);
      try {
        const response = await fetch(`/api/user/ai-settings?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAiSettings({
          provider: 'ollama',
          googleApiKey: '',
          ollamaBaseUrl: data.aiSettings.ollamaBaseUrl || 'http://localhost:11434',
          ollamaModel: data.aiSettings.ollamaModel || 'llama3.1:latest',
          conversationMemory: data.aiSettings.conversationMemory ?? true,
        });
      } catch (error) {
        console.error("Failed to fetch AI settings:", error);
      } finally {
        setLoadingAISettings(false);
      }
    };

    if (isOpen && userId) { // Only fetch if modal is open AND userId is available
      fetchAISettings();
    } else if (!userId) {
      setLoadingAISettings(false); // Clear loading if userId is not available
    }
  }, [isOpen, userId]);
  
  // Multilingual test examples
  const testExamples = {
    'en-US': "Hello! I'm your AI assistant. How can I help you today?",
    'hi-IN': "नमस्ते! मैं आपकी AI सहायक हूँ। आज मैं आपकी कैसे मदद कर सकती हूँ?",
    'te-IN': "నమస్కారం! నేను మీ AI సహాయకురాలిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    'ta-IN': "வணக்கம்! நான் உங்கள் AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"
  };
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  useEffect(() => {
    const loadVoices = async () => {
      // Wait a bit for voices to load
      setTimeout(() => {
        const availableLanguages = audioService.getSupportedLanguages();
        setLanguages(availableLanguages);
        
        const availableVoices = audioService.getAvailableVoices(selectedLanguage);
        setVoices(availableVoices);
        
        // Auto-select first voice if none selected
        if (!settings.voice && availableVoices.length > 0) {
          const newSettings = { ...settings, voice: availableVoices[0].name, lang: selectedLanguage };
          setSettings(newSettings);
          onSettingsChange?.(newSettings);
        }
      }, 500);
    };

    loadVoices();
  }, [selectedLanguage, onSettingsChange, settings]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    const availableVoices = audioService.getAvailableVoices(language);
    setVoices(availableVoices);
    
    // Update test text for the selected language
    const exampleText = testExamples[language as keyof typeof testExamples] || testExamples['en-US'];
    setTestText(exampleText);
    
    // Auto-select first voice for the language
    if (availableVoices.length > 0) {
      const newSettings = { ...settings, voice: availableVoices[0].name, lang: language };
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    const newSettings = { ...settings, voice: voiceName };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleRateChange = (rate: number) => {
    const newSettings = { ...settings, rate };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handlePitchChange = (pitch: number) => {
    const newSettings = { ...settings, pitch };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleVolumeChange = (volume: number) => {
    const newSettings = { ...settings, volume };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleOptionChange = (option: keyof AudioServiceOptions, value: boolean) => {
    const newOptions = { ...options, [option]: value };
    setOptions(newOptions);
    audioService.updateOptions(newOptions);
  };

  const playTestAudio = async () => {
    if (isPlaying) {
      audioService.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    await audioService.speak(
      testText,
      { ...settings, lang: selectedLanguage },
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  const resetToDefaults = () => {
    const defaultSettings = audioService.getDefaultSettings();
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  const testOllamaConnectionHandler = async () => {
    setConnectionStatus('testing');
    setConnectionError('');
    
    try {
      const result = await testOllamaConnection(aiSettings.ollamaBaseUrl);
      
      if (result.success) {
        setConnectionStatus('success');
        setAvailableModels(result.models || []);
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleSaveAISettings = async () => {
    if (!userId) {
      alert("User ID is not available. Please log in.");
      return;
    }
    setSavingAISettings(true);
    try {
      const response = await fetch('/api/user/ai-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          aiSettings: {
            provider: aiSettings.provider,
            googleApiKey: aiSettings.googleApiKey === '**********' ? undefined : aiSettings.googleApiKey, // Don't send masked key if unchanged
            ollamaBaseUrl: aiSettings.ollamaBaseUrl,
            ollamaModel: aiSettings.ollamaModel,
            conversationMemory: aiSettings.conversationMemory,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optionally, refetch settings to ensure UI is in sync, or update state directly
      // For now, we'll just close the modal
      onClose();
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      alert("Failed to save AI settings. Please try again."); // Simple error feedback
    } finally {
      setSavingAISettings(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Voice Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {audioService.getLanguageDisplayName(lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Voice
            </label>
            <select
              value={settings.voice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Speech Rate: {settings.rate.toFixed(2)}x
            </label>
            <Slider
              value={[settings.rate]}
              onValueChange={([value]) => handleRateChange(value)}
              min={0.5}
              max={1.5}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Pitch: {settings.pitch.toFixed(2)}
            </label>
            <Slider
              value={[settings.pitch]}
              onValueChange={([value]) => handlePitchChange(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lower</span>
              <span>Higher</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <Slider
              value={[settings.volume]}
              onValueChange={([value]) => handleVolumeChange(value)}
              min={0.1}
              max={1.0}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Quiet</span>
              <span>Loud</span>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Advanced Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.addPauses}
                  onChange={(e) => handleOptionChange('addPauses', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Add natural pauses</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.emphasizeKeywords}
                  onChange={(e) => handleOptionChange('emphasizeKeywords', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Emphasize important words</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.naturalRhythm}
                  onChange={(e) => handleOptionChange('naturalRhythm', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Natural speech rhythm</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.autoDetectLanguage}
                  onChange={(e) => handleOptionChange('autoDetectLanguage', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Auto-detect language from text</span>
              </label>
            </div>
          </div>

          {/* AI Settings */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Settings
            </h3>
            {loadingAISettings ? (
              <p>Loading AI settings...</p>
            ) : (
              <div className="space-y-4">
                {/* Ollama Base URL (Conditional) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Ollama Base URL
                    {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {connectionStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={aiSettings.ollamaBaseUrl}
                        onChange={(e) => {
                          setAiSettings({ ...aiSettings, ollamaBaseUrl: e.target.value });
                          setConnectionStatus('idle');
                        }}
                        placeholder="e.g., http://localhost:11434"
                        className={connectionStatus === 'error' ? 'border-red-300' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={testOllamaConnectionHandler}
                        disabled={connectionStatus === 'testing' || !aiSettings.ollamaBaseUrl}
                      >
                        {connectionStatus === 'testing' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                    
                    {connectionStatus === 'error' && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <p className="font-medium">Connection Failed:</p>
                        <p>{connectionError}</p>
                      </div>
                    )}
                    
                    {connectionStatus === 'success' && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        <p className="font-medium">✓ Connected successfully!</p>
                        {availableModels.length > 0 && (
                          <p>Found {availableModels.length} model(s): {availableModels.slice(0, 3).join(', ')}{availableModels.length > 3 ? '...' : ''}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Quick URL suggestions */}
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">Common Docker URLs</summary>
                      <div className="mt-2 space-y-1">
                        {getSuggestedUrls().map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setAiSettings({ ...aiSettings, ollamaBaseUrl: suggestion.url });
                              setConnectionStatus('idle');
                            }}
                            className="block w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded"
                          >
                            <span className="font-mono">{suggestion.url}</span>
                            <span className="text-gray-500 ml-2">- {suggestion.description}</span>
                          </button>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>

                {/* Ollama Model (Conditional) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Ollama Model
                  </label>
                  <select
                    value={aiSettings.ollamaModel}
                    onChange={(e) => setAiSettings({ ...aiSettings, ollamaModel: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {/* Show available models from connection test if available */}
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model} (Available)
                        </option>
                      ))
                    ) : (
                      ollamaModels.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.name} ({model.size}) {model.recommended ? '⭐' : ''}
                        </option>
                      ))
                    )}
                  </select>
                  {availableModels.length === 0 && connectionStatus === 'success' && (
                    <p className="text-xs text-amber-600 mt-1">
                      No models found. Pull a model first: docker exec ollama ollama pull llama3.1
                    </p>
                  )}
                </div>

                {/* Docker Troubleshooting */}
                {connectionStatus === 'error' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Docker Troubleshooting
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      {getDockerTroubleshootingSteps().map((step, index) => (
                        <div key={index} className="font-mono text-xs bg-blue-100 p-2 rounded">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation Memory */}
                <div className="flex items-center justify-between">
                  <label htmlFor="conversation-memory" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Enable Conversation Memory
                  </label>
                  <Switch
                    id="conversation-memory"
                    checked={aiSettings.conversationMemory}
                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, conversationMemory: checked })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Audio */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Test Audio ({audioService.getLanguageDisplayName(selectedLanguage)})
            </label>
            <div className="space-y-2">
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={3}
                placeholder="Enter text to test the voice settings..."
              />
              <div className="flex gap-2">
                <Button
                  onClick={playTestAudio}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Stop' : 'Play Test'}
                </Button>
                <Button
                  onClick={resetToDefaults}
                  variant="ghost"
                  size="sm"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
