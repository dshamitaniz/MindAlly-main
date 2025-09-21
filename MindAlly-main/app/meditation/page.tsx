'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Navbar } from '@/components/Navbar';
import { 
  Brain, 
  Wind, 
  Moon, 
  Focus, 
  Quote, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { BreathingExercise } from '@/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'anulom-vilom',
    name: 'Anulom Vilom (Alternate Nostril)',
    description: 'Traditional Indian pranayama technique for balancing energy and calming the mind',
    pattern: { inhale: 4, hold: 4, exhale: 4, holdAfter: 0 },
    duration: 10,
    benefits: ['Balances left and right brain', 'Reduces anxiety', 'Improves focus', 'Purifies energy channels'],
  },
  {
    id: 'kapalbhati',
    name: 'Kapalbhati (Skull Shining)',
    description: 'Energizing breathing technique from Hatha Yoga for mental clarity',
    pattern: { inhale: 1, hold: 0, exhale: 2, holdAfter: 0 },
    duration: 5,
    benefits: ['Increases energy', 'Clears mind', 'Improves digestion', 'Strengthens lungs'],
  },
  {
    id: 'bhramari',
    name: 'Bhramari (Bee Breath)',
    description: 'Soothing humming breath technique for instant relaxation',
    pattern: { inhale: 4, hold: 2, exhale: 6, holdAfter: 0 },
    duration: 8,
    benefits: ['Reduces stress', 'Calms nervous system', 'Improves sleep', 'Relieves tension'],
  },
  {
    id: 'ujjayi',
    name: 'Ujjayi (Victorious Breath)',
    description: 'Ocean-like breathing for deep meditation and focus',
    pattern: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
    duration: 10,
    benefits: ['Enhances concentration', 'Builds internal heat', 'Calms mind', 'Prepares for meditation'],
  },
];

const SLEEP_TOOLS = [
  {
    id: 'yoga-nidra',
    name: 'Yoga Nidra (Yogic Sleep)',
    description: 'Ancient Indian practice for deep relaxation and conscious sleep',
    duration: 20,
    icon: Moon,
  },
  {
    id: 'chakra-meditation',
    name: 'Chakra Meditation',
    description: 'Energy center meditation for balance and healing',
    duration: 15,
    icon: Brain,
  },
  {
    id: 'nature-sounds',
    name: 'Nature Sounds',
    description: 'Soothing sounds of forests, rivers, and monsoon',
    duration: 30,
    icon: Wind,
  },
  {
    id: 'mantra-meditation',
    name: 'Mantra Meditation',
    description: 'Sacred Sanskrit mantras for deep sleep and peace',
    duration: 25,
    icon: Quote,
  },
];

const FOCUS_TOOLS = [
  {
    id: 'trataka',
    name: 'Trataka (Candle Gazing)',
    description: 'Ancient Indian concentration practice using candle flame',
    duration: 15,
    icon: Focus,
  },
  {
    id: 'dharana',
    name: 'Dharana Meditation',
    description: 'Focused attention meditation for mental clarity',
    duration: 10,
    icon: Brain,
  },
  {
    id: 'indian-classical',
    name: 'Indian Classical Music',
    description: 'Raga-based music for enhanced concentration and focus',
    duration: 60,
    icon: Wind,
  },
  {
    id: 'mindful-chai',
    name: 'Mindful Chai Break',
    description: '5-minute mindful tea drinking to reset and refocus',
    duration: 5,
    icon: Clock,
  },
];

const DAILY_QUOTES = [
  {
    text: "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। (May all beings be happy and free from illness.)",
    author: "Ancient Sanskrit Prayer",
    category: "compassion",
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "mindfulness",
  },
  {
    text: "योगः कर्मसु कौशलम्। (Yoga is skill in action.)",
    author: "Bhagavad Gita",
    category: "wisdom",
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "peace",
  },
  {
    text: "आत्मनो मोक्षार्थं जगत् हिताय च। (For the liberation of the self and the welfare of the world.)",
    author: "Sanskrit Proverb",
    category: "purpose",
  },
  {
    text: "Breathe in peace, breathe out stress.",
    author: "Unknown",
    category: "mindfulness",
  },
  {
    text: "तत्त्वमसि। (Thou art That - You are the divine essence.)",
    author: "Upanishads",
    category: "wisdom",
  },
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "peace",
  },
  {
    text: "सत्यमेव जयते। (Truth alone triumphs.)",
    author: "Mundaka Upanishad",
    category: "wisdom",
  },
  {
    text: "Be kind whenever possible. It is always possible.",
    author: "Dalai Lama",
    category: "compassion",
  },
  {
    text: "अहिंसा परमो धर्मः। (Non-violence is the highest virtue.)",
    author: "Mahabharata",
    category: "compassion",
  },
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
  },
];

const NATURE_SOUNDS = [
  { id: 'forest', name: 'Forest Sounds', file: '/audio/forest.mp3' },
  { id: 'river', name: 'River Flow', file: '/audio/river.mp3' },
  { id: 'monsoon', name: 'Monsoon Rain', file: '/audio/monsoon.mp3' },
  { id: 'birds', name: 'Morning Birds', file: '/audio/birds.mp3' },
  { id: 'ocean', name: 'Ocean Waves', file: '/audio/ocean.mp3' }
];

export default function MeditationPage() {
  const router = useRouter();
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);
  const [activeSleepTool, setActiveSleepTool] = useState<any>(null);
  const [activeFocusTool, setActiveFocusTool] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter'>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedSound, setSelectedSound] = useState(NATURE_SOUNDS[0]);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    // Set daily quote based on current date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const dailyQuoteIndex = dayOfYear % DAILY_QUOTES.length;
    setCurrentQuoteIndex(dailyQuoteIndex);
  }, []);

  const getDailyQuotes = () => {
    // Get 3 quotes starting from today's quote
    const quotes = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentQuoteIndex + i) % DAILY_QUOTES.length;
      quotes.push(DAILY_QUOTES[index]);
    }
    return quotes;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    let phaseInterval: NodeJS.Timeout;

    if (isRunning && activeExercise) {
      const phases = [
        { name: 'inhale' as const, duration: activeExercise.pattern.inhale },
        { name: 'hold' as const, duration: activeExercise.pattern.hold },
        { name: 'exhale' as const, duration: activeExercise.pattern.exhale },
        { name: 'holdAfter' as const, duration: activeExercise.pattern.holdAfter },
      ];

      const currentPhaseIndex = phases.findIndex(phase => phase.name === currentPhase);
      const currentPhaseDuration = phases[currentPhaseIndex]?.duration || 0;

      if (phaseTimeLeft > 0) {
        phaseInterval = setInterval(() => {
          setPhaseTimeLeft(prev => {
            if (prev <= 1) {
              // Move to next phase
              const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
              const nextPhase = phases[nextPhaseIndex];
              setCurrentPhase(nextPhase.name);
              return nextPhase.duration;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => clearInterval(phaseInterval);
  }, [isRunning, activeExercise, currentPhase, phaseTimeLeft]);

  const startExercise = (exercise: BreathingExercise) => {
    setActiveExercise(exercise);
    setTimeLeft(exercise.duration * 60); // Convert minutes to seconds
    setCurrentPhase('inhale');
    setPhaseTimeLeft(exercise.pattern.inhale);
    setIsRunning(true);
  };

  const startSleepTool = (tool: any) => {
    setActiveSleepTool(tool);
    setTimeLeft(tool.duration * 60);
    setIsRunning(true);
    
    // Start audio for Indian Nature Sounds
    if (tool.id === 'nature-sounds' && audioRef) {
      audioRef.currentTime = 0;
      audioRef.loop = true;
      audioRef.play();
    }
  };

  const startFocusTool = (tool: any) => {
    setActiveFocusTool(tool);
    setTimeLeft(tool.duration * 60);
    setIsRunning(true);
  };

  const handleComplete = useCallback(async () => {
    setCompletedSessions(prev => prev + 1);
    toast.success('Great job! You completed your meditation session.');
    
    // Save session to database
    try {
      const response = await fetch('/api/meditation/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'breathing',
          duration: activeExercise?.duration || 0,
          completed: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save session');
      }
    } catch (error) {
      console.error('Failed to save meditation session:', error);
      toast.error('Session completed but failed to save to history');
    }
  }, [activeExercise]);

  const resetExercise = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setPhaseTimeLeft(0);
    setCurrentPhase('inhale');
    setActiveSleepTool(null);
    setActiveFocusTool(null);
    
    // Stop audio
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
  };

  const toggleAudio = () => {
    if (audioRef) {
      if (isRunning) {
        audioRef.play();
      } else {
        audioRef.pause();
      }
    }
  };

  const changeSound = (sound: any) => {
    setSelectedSound(sound);
    if (audioRef) {
      audioRef.pause();
      audioRef.src = sound.file;
      if (isRunning) {
        audioRef.play();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe in slowly...';
      case 'hold':
        return 'Hold your breath...';
      case 'exhale':
        return 'Breathe out slowly...';
      case 'holdAfter':
        return 'Pause...';
      default:
        return '';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'bg-green-500';
      case 'hold':
        return 'bg-blue-500';
      case 'exhale':
        return 'bg-red-500';
      case 'holdAfter':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meditation & Wellness</h1>
              <p className="text-gray-600 mt-1">
                Find your calm with guided practices and mindfulness tools.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Sessions Today</div>
                <div className="text-2xl font-bold text-purple-600">{completedSessions}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="breathing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="quotes">Daily Quotes</TabsTrigger>
          </TabsList>

          {/* Breathing Exercises */}
          <TabsContent value="breathing" className="space-y-6">
            {activeExercise ? (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setActiveExercise(null);
                    resetExercise();
                  }}
                  className="mb-4"
                >
                  ← Back to Exercises
                </Button>
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{activeExercise.name}</CardTitle>
                    <CardDescription>{activeExercise.description}</CardDescription>
                  </CardHeader>
                <CardContent className="text-center space-y-6">
                  {/* Breathing Circle */}
                  <div className="flex justify-center">
                    <div className={`w-64 h-64 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-1000 ${getPhaseColor()} breathing-circle`}>
                      {phaseTimeLeft}
                    </div>
                  </div>
                  
                  <div className="text-xl font-medium">{getPhaseInstruction()}</div>
                  
                  <div className="text-3xl font-bold text-blue-600">
                    {formatTime(timeLeft)}
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    {!isRunning ? (
                      <Button onClick={() => setIsRunning(true)} size="lg">
                        <Play className="h-5 w-5 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={() => setIsRunning(false)} variant="outline" size="lg">
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetExercise} variant="outline" size="lg">
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Benefits: {activeExercise.benefits.join(' • ')}
                  </div>
                </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BREATHING_EXERCISES.map((exercise) => (
                  <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wind className="h-5 w-5 mr-2 text-blue-500" />
                        {exercise.name}
                      </CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {exercise.duration} minutes
                        </div>
                        <div className="text-sm">
                          <div className="font-medium mb-2">Pattern:</div>
                          <div className="text-gray-600">
                            Inhale {exercise.pattern.inhale}s • Hold {exercise.pattern.hold}s • 
                            Exhale {exercise.pattern.exhale}s
                            {exercise.pattern.holdAfter > 0 && ` • Pause ${exercise.pattern.holdAfter}s`}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium mb-2">Benefits:</div>
                          <ul className="text-gray-600 space-y-1">
                            {exercise.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button 
                          onClick={() => startExercise(exercise)} 
                          className="w-full"
                        >
                          Start Exercise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sleep Tools */}
          <TabsContent value="sleep" className="space-y-6">
            {activeSleepTool ? (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setActiveSleepTool(null);
                    resetExercise();
                  }}
                  className="mb-4"
                >
                  ← Back to Sleep Tools
                </Button>
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{activeSleepTool.name}</CardTitle>
                    <CardDescription>{activeSleepTool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    {activeSleepTool.id === 'nature-sounds' && (
                      <>
                        <audio 
                          ref={(ref) => setAudioRef(ref)}
                          src={selectedSound.file}
                          loop
                        />
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose Nature Sound:
                          </label>
                          <select 
                            value={selectedSound.id}
                            onChange={(e) => {
                              const sound = NATURE_SOUNDS.find(s => s.id === e.target.value);
                              if (sound) changeSound(sound);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            {NATURE_SOUNDS.map(sound => (
                              <option key={sound.id} value={sound.id}>{sound.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-center">
                      <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold">
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                    
                    <div className="text-xl font-medium text-purple-600">
                      {isRunning ? 'Relax and let go...' : 'Ready to begin'}
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      {!isRunning ? (
                        <Button onClick={() => {
                          setIsRunning(true);
                          toggleAudio();
                        }} size="lg">
                          <Play className="h-5 w-5 mr-2" />
                          Start
                        </Button>
                      ) : (
                        <Button onClick={() => {
                          setIsRunning(false);
                          toggleAudio();
                        }} variant="outline" size="lg">
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button onClick={resetExercise} variant="outline" size="lg">
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SLEEP_TOOLS.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <tool.icon className="h-5 w-5 mr-2 text-purple-500" />
                        {tool.name}
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {tool.duration} minutes
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => startSleepTool(tool)}
                        >
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Focus Tools */}
          <TabsContent value="focus" className="space-y-6">
            {activeFocusTool ? (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setActiveFocusTool(null);
                    resetExercise();
                  }}
                  className="mb-4"
                >
                  ← Back to Focus Tools
                </Button>
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{activeFocusTool.name}</CardTitle>
                    <CardDescription>{activeFocusTool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-64 h-64 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-4xl font-bold">
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                    
                    <div className="text-xl font-medium text-green-600">
                      {isRunning ? 'Stay focused and present...' : 'Ready to focus'}
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      {!isRunning ? (
                        <Button onClick={() => setIsRunning(true)} size="lg">
                          <Play className="h-5 w-5 mr-2" />
                          Start
                        </Button>
                      ) : (
                        <Button onClick={() => setIsRunning(false)} variant="outline" size="lg">
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button onClick={resetExercise} variant="outline" size="lg">
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FOCUS_TOOLS.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <tool.icon className="h-5 w-5 mr-2 text-green-500" />
                        {tool.name}
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {tool.duration} minutes
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => startFocusTool(tool)}
                        >
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Daily Quotes */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center">
                    <Quote className="h-6 w-6 mr-2 text-yellow-500" />
                    Daily Inspiration
                  </CardTitle>
                  <CardDescription>
                    Start your day with wisdom and mindfulness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="overflow-hidden">
                      <div 
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                      >
                        {getDailyQuotes().map((quote, index) => (
                          <div key={index} className="w-full flex-shrink-0 px-2">
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                              <blockquote className="text-lg italic text-gray-700 mb-4">
                                &ldquo;{quote.text}&rdquo;
                              </blockquote>
                              <div className="flex items-center justify-between">
                                <cite className="text-sm font-medium text-gray-600">
                                  — {quote.author}
                                </cite>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  {quote.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Navigation buttons */}
                    <button
                      onClick={() => setCarouselIndex(carouselIndex > 0 ? carouselIndex - 1 : 2)}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => setCarouselIndex(carouselIndex < 2 ? carouselIndex + 1 : 0)}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                    
                    {/* Dots indicator */}
                    <div className="flex justify-center mt-4 space-x-2">
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          onClick={() => setCarouselIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            carouselIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
