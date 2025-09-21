'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Settings,
  AlertTriangle,
  Heart,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'react-hot-toast';
import { audioService, VoiceSettings } from '@/lib/audio-service';
import { VoiceSettings as VoiceSettingsComponent } from '@/components/VoiceSettings';
import { Navbar } from '@/components/Navbar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface OllamaModel {
  name: string;
  size: string;
  description: string;
  recommended: boolean;
  category: 'general' | 'reasoning' | 'creative' | 'multilingual' | 'lightweight';
}

const OLLAMA_MODELS: OllamaModel[] = [
  { 
    name: 'llama3:latest', 
    size: '4.7 GB', 
    description: 'Llama 3 model - best for general conversation and mental health support', 
    recommended: true,
    category: 'general'
  },
  { 
    name: 'mistral:latest', 
    size: '4.4 GB', 
    description: 'Mistral - excellent for reasoning, analysis, and complex mental health discussions', 
    recommended: true,
    category: 'reasoning'
  },
  { 
    name: 'phi3:latest', 
    size: '2.2 GB', 
    description: 'Microsoft Phi-3 - lightweight and fast responses', 
    recommended: false,
    category: 'lightweight'
  },
];

const CATEGORY_COLORS = {
  general: 'bg-blue-100 text-blue-800',
  reasoning: 'bg-purple-100 text-purple-800',
  creative: 'bg-green-100 text-green-800',
  multilingual: 'bg-orange-100 text-orange-800',
  lightweight: 'bg-gray-100 text-gray-800',
};

// Move crisis keywords outside component to prevent recreation on renders
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'not worth living', 'want to die',
  'hurt myself', 'self harm', 'cutting', 'overdose', 'jump off', 'hang myself',
  'crisis', 'emergency', 'help me', 'can\'t go on', 'give up', 'hopeless'
] as const;

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3:latest');
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[][]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(audioService.getDefaultSettings());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectCrisis = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
  }, []);

  const audioCallbacks = useCallback(() => ({
    onStart: () => {},
    onEnd: () => {},
    onError: () => {}
  }), []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
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
      const userId = user?._id || user?.id;
      const sessionId = currentConversationId || crypto.randomUUID();
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if not muted
      if (!isMuted && data.message) {
        const callbacks = audioCallbacks();
        audioService.speak(
          data.message,
          voiceSettings,
          callbacks.onStart,
          callbacks.onEnd,
          callbacks.onError
        );
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I&apos;m having trouble connecting to the AI service. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedModel, detectCrisis, isMuted, audioCallbacks, voiceSettings, currentConversationId, user?._id, user?.id]);

  const handleVoiceInput = useCallback(() => {
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
  }, [isListening]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCrisisDetected(false);
  }, []);

  const startNewConversation = useCallback(() => {
    if (messages.length > 0) {
      setConversationHistory(prev => [...prev, messages]);
    }
    setMessages([]);
    setCrisisDetected(false);
    setCurrentConversationId(crypto.randomUUID());
  }, [messages]);

  const exportConversation = useCallback(() => {
    const conversation = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    }));
    
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-chat-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to access the AI Chat feature.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Mental Health Assistant</h1>
                <p className="text-sm text-gray-600">Powered by your local Ollama models</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button
                variant="outline"
                onClick={startNewConversation}
                className="flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>New Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Panel */}
          {showSettings && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">AI Model</label>
                    <div className="space-y-2">
                      {OLLAMA_MODELS.map((model) => (
                        <div
                          key={model.name}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedModel === model.name
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedModel(model.name)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{model.name}</span>
                                {model.recommended && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${CATEGORY_COLORS[model.category]}`}>
                                  {model.category}
                                </Badge>
                                <span className="text-xs text-gray-500">{model.size}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Voice Output</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVoiceSettings(true)}
                        className="text-primary-600"
                        title="Voice Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className={isMuted ? 'text-gray-500' : 'text-primary-600'}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearChat}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportConversation}
                      className="w-full"
                      disabled={messages.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat Area */}
          <div className={`${showSettings ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <Card className="h-[600px] flex flex-col">
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Welcome to your AI Mental Health Assistant
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      I&apos;m here to provide support, guidance, and a listening ear. 
                      Feel free to share what&apos;s on your mind.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <div className="p-4 bg-blue-50 rounded-lg text-left">
                        <h4 className="font-medium text-blue-900 mb-2">💭 Share Your Thoughts</h4>
                        <p className="text-sm text-blue-700">Tell me about your day, feelings, or any challenges you&apos;re facing.</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-left">
                        <h4 className="font-medium text-green-900 mb-2">🧘 Get Coping Strategies</h4>
                        <p className="text-sm text-green-700">Ask for techniques to manage stress, anxiety, or difficult emotions.</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-left">
                        <h4 className="font-medium text-purple-900 mb-2">🎯 Set Mental Health Goals</h4>
                        <p className="text-sm text-purple-700">Work together to create achievable wellness objectives.</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg text-left">
                        <h4 className="font-medium text-orange-900 mb-2">📚 Learn & Grow</h4>
                        <p className="text-sm text-orange-700">Explore mental health topics and personal development.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.role === 'assistant' && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        {message.role === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex space-x-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                    className="flex-1 min-h-[60px] max-h-32 resize-none"
                    disabled={isLoading}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      className={`h-12 w-12 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-12 w-12"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>
                    {isListening ? 'Listening...' : 'Click microphone to use voice input'}
                  </span>
                  <span>Using: {selectedModel}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

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
      <VoiceSettingsComponent
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        onSettingsChange={setVoiceSettings}
        userId={user?.id || ''}
        ollamaModels={OLLAMA_MODELS}
      />
    </div>
    </>
  );
}










