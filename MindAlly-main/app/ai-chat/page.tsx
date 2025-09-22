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
import { StorageStatusBanner } from '@/components/StorageStatusBanner';

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
  const [isDemoUser, setIsDemoUser] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition and demo user detection
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

    // Check if demo user
    if (user?.email && ['demo@mind.app', 'demo@mindally.com', 'demo@mind.ally'].includes(user.email)) {
      setIsDemoUser(true);
    }
  }, [user]);

  // Cleanup demo data on page unload
  useEffect(() => {
    if (!isDemoUser || !user) return;

    const handleBeforeUnload = async () => {
      try {
        await fetch('/api/demo/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id || user.id })
        });
      } catch (error) {
        console.error('Demo cleanup failed:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDemoUser, user]);

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
      const userId = isDemoUser ? `demo-${Date.now()}` : (user?._id || user?.id);
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
      <StorageStatusBanner />
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
                <p className="text-sm text-gray-600">
                  {isDemoUser ? 'Demo Mode - Data stored temporarily' : 'Powered by your local Ollama models'}
                </p>
                {isDemoUser && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🎭 Demo Account - Data will be cleared when you leave
                    </span>
                  </div>
                )}
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
                  <div className="text-center py-16 px-8">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                      <div className="relative h-24 w-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
                        <Brain className="h-12 w-12 text-white animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
                        Welcome to your AI Mental Health Assistant
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        I'm here to provide support, guidance, and a listening ear. 
                        Feel free to share what's on your mind.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                      <button 
                        onClick={() => setInput("I'm feeling stressed about my exams and need some guidance")}
                        className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:scale-105 border border-blue-200"
                      >
                        <div className="flex items-center mb-3">
                          <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                            <span className="text-white text-lg">💭</span>
                          </div>
                          <h4 className="font-semibold text-blue-900">Share Your Thoughts</h4>
                        </div>
                        <p className="text-sm text-blue-700 leading-relaxed">Tell me about your day, feelings, or any challenges you're facing.</p>
                      </button>
                      
                      <button 
                        onClick={() => setInput("I'm feeling anxious and would like some coping strategies")}
                        className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:scale-105 border border-green-200"
                      >
                        <div className="flex items-center mb-3">
                          <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                            <span className="text-white text-lg">🧘</span>
                          </div>
                          <h4 className="font-semibold text-green-900">Get Coping Strategies</h4>
                        </div>
                        <p className="text-sm text-green-700 leading-relaxed">Ask for techniques to manage stress, anxiety, or difficult emotions.</p>
                      </button>
                      
                      <button 
                        onClick={() => setInput("I want to set some mental health goals for myself")}
                        className="group p-6 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:scale-105 border border-purple-200"
                      >
                        <div className="flex items-center mb-3">
                          <div className="h-10 w-10 bg-purple-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                            <span className="text-white text-lg">🎯</span>
                          </div>
                          <h4 className="font-semibold text-purple-900">Set Mental Health Goals</h4>
                        </div>
                        <p className="text-sm text-purple-700 leading-relaxed">Work together to create achievable wellness objectives.</p>
                      </button>
                      
                      <button 
                        onClick={() => setInput("I'd like to learn more about mental health and personal growth")}
                        className="group p-6 bg-gradient-to-br from-orange-50 to-amber-100 hover:from-orange-100 hover:to-amber-200 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:scale-105 border border-orange-200"
                      >
                        <div className="flex items-center mb-3">
                          <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                            <span className="text-white text-lg">📚</span>
                          </div>
                          <h4 className="font-semibold text-orange-900">Learn & Grow</h4>
                        </div>
                        <p className="text-sm text-orange-700 leading-relaxed">Explore mental health topics and personal development.</p>
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Click any card above to get started, or type your own message below</p>
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
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-white" />
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                          : 'bg-white/90 border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center justify-between mt-3 text-xs ${
                          message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-white/90 border border-gray-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">AI is thinking</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share what's on your mind... (Press Enter to send, Shift+Enter for new line)"
                      className="min-h-[60px] max-h-32 resize-none border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      className={`h-12 w-12 rounded-xl transition-all shadow-lg ${
                        isListening 
                          ? 'bg-red-100 text-red-600 border-red-300 animate-pulse shadow-red-200' 
                          : 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-blue-200'
                      }`}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                      title="Send message"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className={`flex items-center space-x-1 ${
                      isListening ? 'text-red-600 font-medium' : ''
                    }`}>
                      {isListening && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      <span>{isListening ? 'Listening...' : 'Click microphone for voice input'}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Using: {selectedModel}</span>
                  </div>
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










