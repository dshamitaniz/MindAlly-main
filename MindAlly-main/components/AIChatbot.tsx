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
  }, [user]);

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
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-md">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {aiProvider === 'google' ? 'Google AI' : aiProvider === 'ollama' ? 'Ollama' : 'OpenAI'}
                </Badge>
                {conversationMemory && (
                  <Badge variant="secondary" className="bg-green-500/80 text-white border-green-400">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Memory
                  </Badge>
                )}
                {crisisDetected && (
                  <Badge variant="destructive" className="bg-red-500">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Crisis
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Settings Panel */}
                {showSettings && (
                  <div className="p-4 border-b bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">AI Provider</label>
                        <select
                          value={aiProvider}
                          onChange={(e) => handleProviderChange(e.target.value as 'openai' | 'google' | 'ollama')}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="google">Google AI</option>
                          <option value="ollama">Ollama</option>
                          <option value="openai">OpenAI</option>
                        </select>
                      </div>

                      {aiProvider === 'ollama' && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Ollama Base URL</label>
                          <input
                            type="text"
                            value={ollamaBaseUrl}
                            onChange={(e) => handleOllamaBaseUrlChange(e.target.value)}
                            placeholder="e.g., http://localhost:11434"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">AI Model</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => handleOllamaModelChange(e.target.value)}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                          disabled={aiProvider !== 'ollama'}
                        >
                          {OLLAMA_MODELS.map((model) => (
                            <option key={model.name} value={model.name}>
                              {model.name} ({model.size}) {model.recommended ? '⭐' : ''}
                            </option>
                          ))}
                        </select>
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Conversation Memory</span>
                        <input
                          type="checkbox"
                          checked={conversationMemory}
                          onChange={(e) => handleConversationMemoryChange(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-primary-600 rounded"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearChat}
                        className="w-full"
                      >
                        Clear Chat
                      </Button>
                      <Button
                        onClick={handleSaveSettings}
                        className="w-full"
                      >
                        Save AI Settings
                      </Button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Hi! I&apos;m your AI mental health assistant.</p>
                      <p className="text-sm">How can I help you today?</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          {message.role === 'user' && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
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
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[40px] max-h-24 resize-none"
                      disabled={isLoading}
                    />
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleVoiceInput}
                        disabled={isLoading}
                        className={`h-10 w-10 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="h-10 w-10"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      {messages.length > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={clearConversation}
                          disabled={isLoading}
                          className="h-8 w-10 text-xs"
                          title="Clear conversation"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
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