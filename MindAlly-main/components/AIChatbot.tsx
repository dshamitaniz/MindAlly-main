'use client';

import { useState, useRef, useEffect } from 'react';
import '@/types'; // Import global type declarations
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  X, 
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Settings,
  AlertTriangle,
  Heart,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'react-hot-toast';
import { audioService, VoiceSettings } from '@/lib/audio-service';
import { VoiceSettings as VoiceSettingsComponent } from '@/components/VoiceSettings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
  };
}

interface OllamaModel {
  name: string;
  size: string;
  description: string;
  recommended: boolean;
}

const OLLAMA_MODELS: OllamaModel[] = [
  { name: 'llama3:latest', size: '4.7 GB', description: 'Llama 3 model - best for general conversation', recommended: true },
  { name: 'mistral:latest', size: '4.4 GB', description: 'Mistral - excellent for reasoning and analysis', recommended: true },
  { name: 'phi3:latest', size: '2.2 GB', description: 'Microsoft Phi-3 - lightweight and fast', recommended: false },
];

export function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3:latest');
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(audioService.getDefaultSettings());
  const [aiProvider, setAiProvider] = useState<'openai' | 'google' | 'ollama'>('ollama');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState<string>('llama3:latest');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationMemory, setConversationMemory] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition failed');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Load user AI settings and conversation history
  useEffect(() => {
    if (user) {
      loadAISettings();
      loadConversationHistory();
    }
  }, [user, loadAISettings, loadConversationHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAISettings = async () => {
    try {
      const userId = user?._id || user?.id;
      console.log('Loading AI settings for user:', userId);
      const response = await fetch(`/api/user/ai-settings?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('AI settings loaded:', data.aiSettings);
        setAiProvider(data.aiSettings.provider || 'ollama');
        setConversationMemory(data.aiSettings.conversationMemory ?? true);
        setOllamaBaseUrl(data.aiSettings.ollamaBaseUrl || 'http://localhost:11434');
        setOllamaModel(data.aiSettings.ollamaModel || 'llama3:latest');
      } else {
        console.error('Failed to load AI settings:', response.status);
        // Set defaults if API fails
        setAiProvider('ollama');
        setOllamaBaseUrl('http://localhost:11434');
        setOllamaModel('llama3:latest');
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      // Set defaults if API fails
      setAiProvider('ollama');
      setOllamaBaseUrl('http://localhost:11434');
      setOllamaModel('llama3:latest');
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/ai-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          aiSettings: {
            provider: aiProvider,
            conversationMemory,
            ollamaBaseUrl,
            ollamaModel,
          },
        }),
      });

      if (response.ok) {
        toast.success('AI settings saved successfully!');
        setShowSettings(false);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save AI settings: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      toast.error('Failed to save AI settings.');
    }
  };

  const handleProviderChange = (provider: 'openai' | 'google' | 'ollama') => {
    setAiProvider(provider);
    // Optionally reset model or base URL if changing provider
    if (provider === 'ollama') {
      setSelectedModel(ollamaModel); // Use the stored ollamaModel
    } else if (provider === 'google') {
      setSelectedModel('gemini-1.5-flash'); // Default Google model
    } else {
      setSelectedModel('gpt-3.5-turbo'); // Default OpenAI model (assuming this is the default)
    }
  };

  const handleOllamaBaseUrlChange = (url: string) => {
    setOllamaBaseUrl(url);
  };

  const handleOllamaModelChange = (model: string) => {
    setOllamaModel(model);
    setSelectedModel(model);
  };

  const handleConversationMemoryChange = (checked: boolean) => {
    setConversationMemory(checked);
  };

  const loadConversationHistory = async () => {
    if (!conversationMemory || (aiProvider !== 'google' && aiProvider !== 'ollama')) return;
    
    try {
      const response = await fetch(`/api/ai/chat?userId=${user?._id || user?.id}&sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map((msg: any) => ({
            id: `${msg.timestamp}_${Math.random()}`,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            metadata: msg.metadata,
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const clearConversation = async () => {
    if ((aiProvider === 'google' || aiProvider === 'ollama') && user) {
      try {
        await fetch('/api/ai/chat', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user._id || user.id,
            sessionId,
          }),
        });
      } catch (error) {
        console.error('Failed to clear conversation:', error);
      }
    }
    setMessages([]);
    setCrisisDetected(false);
    toast.success('Conversation cleared');
  };

  // Crisis detection keywords
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'not worth living', 'want to die',
    'hurt myself', 'self harm', 'cutting', 'overdose', 'jump off', 'hang myself',
    'crisis', 'emergency', 'help me', 'can\'t go on', 'give up', 'hopeless'
  ];

  const detectCrisis = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check for crisis language
    const isCrisis = detectCrisis(userMessage.content);
    if (isCrisis) {
      setCrisisDetected(true);
      toast.error('Crisis detected! Please seek immediate help.');
    }

    try {
      let response;
      
      if (aiProvider === 'google') {
        // Use Google AI with conversation memory
        response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            sessionId,
            userId: user?._id || user?.id,
          }),
        });
      } else if (aiProvider === 'ollama') {
        // Use Ollama AI with conversation memory
        response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            sessionId,
            userId: user?._id || user?.id,
          }),
        });
      } else {
        // Use OpenAI (existing implementation)
        response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            model: selectedModel,
            isCrisis,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      const responseContent = (aiProvider === 'google' || aiProvider === 'ollama') ? data.message : data.response;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        metadata: (aiProvider === 'google' || aiProvider === 'ollama') ? data.metadata : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if not muted
      if (!isMuted && responseContent) {
        audioService.speak(
          responseContent,
          voiceSettings,
          () => {}, // onStart
          () => {}, // onEnd
          () => {}  // onError
        );
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to the AI service. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCrisisDetected(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 hover:from-primary-700 hover:via-purple-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group"
            >
              <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
            </Button>
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            {/* Floating label */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
                AI Assistant
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-[420px] h-[600px]'
        }`}>
          <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-md overflow-hidden">
            {/* Header */}
            <CardHeader className="flex flex-col space-y-2 pb-3 bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 text-white rounded-t-lg">
              {/* Top Row - Title and Controls */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Bot className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-semibold truncate">AI Assistant</CardTitle>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:bg-white/20 h-7 w-7 rounded-md"
                    title="Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/20 h-7 w-7 rounded-md"
                    title={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-7 w-7 rounded-md"
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              {/* Bottom Row - Status Badges */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
                    {aiProvider === 'google' ? '🤖 Google AI' : aiProvider === 'ollama' ? '🦙 Ollama' : '🔮 OpenAI'}
                  </Badge>
                  {conversationMemory && (
                    <Badge variant="secondary" className="bg-emerald-500/80 text-white border-emerald-400 text-xs px-2 py-0.5">
                      <MessageSquare className="h-2.5 w-2.5 mr-1" />
                      Memory
                    </Badge>
                  )}
                  {crisisDetected && (
                    <Badge variant="destructive" className="bg-red-500 animate-pulse text-xs px-2 py-0.5">
                      <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                      Crisis
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-white/70 font-medium">
                  Online
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Settings Panel */}
                {showSettings && (
                  <div className="border-b bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
                      {/* AI Provider Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Bot className="h-4 w-4 mr-2 text-primary-600" />
                          AI Provider
                        </label>
                        <select
                          value={aiProvider}
                          onChange={(e) => handleProviderChange(e.target.value as 'openai' | 'google' | 'ollama')}
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        >
                          <option value="google">🤖 Google AI (Recommended)</option>
                          <option value="ollama">🦙 Ollama (Local)</option>
                          <option value="openai">🔮 OpenAI</option>
                        </select>
                      </div>

                      {/* Ollama Configuration */}
                      {aiProvider === 'ollama' && (
                        <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="text-sm font-semibold text-gray-700">Ollama Base URL</label>
                          <input
                            type="text"
                            value={ollamaBaseUrl}
                            onChange={(e) => handleOllamaBaseUrlChange(e.target.value)}
                            placeholder="http://localhost:11434"
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}

                      {/* Model Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">AI Model</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => handleOllamaModelChange(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 transition-colors"
                          disabled={aiProvider !== 'ollama'}
                        >
                          {OLLAMA_MODELS.map((model) => (
                            <option key={model.name} value={model.name}>
                              {model.name} ({model.size}) {model.recommended ? '⭐' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Voice & Memory Settings */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Voice Output</label>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowVoiceSettings(true)}
                              className="flex-1 text-xs"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Settings
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsMuted(!isMuted)}
                              className={`px-2 ${isMuted ? 'text-red-600' : 'text-green-600'}`}
                            >
                              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Memory</label>
                          <div className="flex items-center justify-center">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={conversationMemory}
                                onChange={(e) => handleConversationMemoryChange(e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`relative w-10 h-5 rounded-full transition-colors ${
                                conversationMemory ? 'bg-green-500' : 'bg-gray-300'
                              }`}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                  conversationMemory ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearChat}
                          className="flex-1 text-xs"
                        >
                          Clear Chat
                        </Button>
                        <Button
                          onClick={handleSaveSettings}
                          size="sm"
                          className="flex-1 text-xs bg-primary-600 hover:bg-primary-700"
                        >
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50/30">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full blur-xl opacity-50" />
                        <div className="relative bg-gradient-to-r from-primary-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
                          <Bot className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Hi! I'm your AI mental health assistant</h3>
                      <p className="text-sm text-gray-600 mb-4">I'm here to listen and support you. How are you feeling today?</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button 
                          onClick={() => setInput("I'm feeling stressed about exams")}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                        >
                          📚 Exam stress
                        </button>
                        <button 
                          onClick={() => setInput("I'm feeling anxious")}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs hover:bg-yellow-200 transition-colors"
                        >
                          😰 Anxiety
                        </button>
                        <button 
                          onClick={() => setInput("I need someone to talk to")}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                        >
                          💬 Just talk
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`flex items-start space-x-3 max-w-[85%] ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-primary-500 to-purple-500' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <div className={`flex items-center justify-between mt-2 text-xs ${
                            message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {message.metadata?.model && (
                              <span className="ml-2 opacity-60">{message.metadata.model}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">AI is thinking</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t bg-gray-50/50">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Share what's on your mind..."
                        className="min-h-[44px] max-h-24 resize-none border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleVoiceInput}
                        disabled={isLoading}
                        className={`h-11 w-11 rounded-lg transition-all ${
                          isListening 
                            ? 'bg-red-100 text-red-600 border-red-300 animate-pulse' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        title={isListening ? "Stop listening" : "Voice input"}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="h-11 w-11 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all"
                        title="Send message"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Actions Row */}
                  {messages.length > 0 && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearConversation}
                        disabled={isLoading}
                        className="text-xs text-gray-600 hover:text-red-600 hover:bg-red-50"
                      >
                        Clear conversation
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Crisis Resources */}
      {crisisDetected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-red-50 border-red-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Heart className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-red-800">Crisis Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-red-700">
I&apos;m concerned about your safety. Please reach out for immediate help:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>KIRAN Mental Health Helpline:</strong> 1800-599-0019</p>
                <p><strong>AASRA Mumbai:</strong> 91-22-27546669</p>
                <p><strong>Vandrevala Foundation:</strong> 1860-266-2345</p>
                <p><strong>Emergency:</strong> 112</p>
              </div>
              <Button
                onClick={() => setCrisisDetected(false)}
                variant="outline"
                className="w-full"
              >
I understand
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Voice Settings Modal */}
            {user && (
                <VoiceSettingsComponent
                    isOpen={showVoiceSettings}
                    onClose={() => setShowVoiceSettings(false)}
                    onSettingsChange={setVoiceSettings}
                    userId={user._id || user.id}
                    ollamaModels={OLLAMA_MODELS}
                />
            )}</>
  );
}