"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Clock, 
  Users, 
  TrendingUp, 
  Play, 
  Pause, 
  RotateCcw,
  Timer,
  Mic,
  MicOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Pitch {
  id: string;
  clientName: string;
  pitchStage: string;
  createdAt: any;
}

interface PracticeSession {
  id: string;
  pitchId: string;
  duration: number;
  score?: number;
  feedback?: string;
  createdAt: Date;
}

export default function PitchPracticePage() {
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setPracticeTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Fetch pitches
  useEffect(() => {
    const fetchPitches = async () => {
      try {
        const pitchesRef = collection(db, 'pitches');
        const q = query(pitchesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const pitchesData: Pitch[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          pitchesData.push({
            id: doc.id,
            clientName: data.clientName || 'Unknown Client',
            pitchStage: data.pitchStage || 'stage1',
            createdAt: data.createdAt
          });
        });
        
        setPitches(pitchesData);
      } catch (error) {
        console.error('Error fetching pitches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPitches();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPractice = (pitch: Pitch) => {
    setSelectedPitch(pitch);
    setPracticeTime(0);
    setIsTimerRunning(true);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setPracticeTime(0);
    setIsTimerRunning(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const endPractice = () => {
    setIsTimerRunning(false);
    setIsRecording(false);
    // Here you would typically save the practice session
    setSelectedPitch(null);
    setPracticeTime(0);
  };

  const getPitchStageDisplay = (stage: string) => {
    const stageMap: Record<string, string> = {
      'stage1': 'Initial Engagement',
      'stage2': 'Needs Assessment',
      'stage3': 'RFP Response',
      'stage4': 'Proposal Presentation',
      'stage5': 'Evaluation'
    };
    return stageMap[stage] || stage;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-16 bg-white">
      {/* Gradient header background */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-b-3xl opacity-10" />
      
      <div className="w-full px-6 pt-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Bull Pen
            </h1>
            <p className="text-slate-600 mt-1">
              Practice your pitches and improve your delivery with AI-powered coaching.
            </p>
          </div>
        </div>
      </div>

      {/* Content moved outside the gradient area */}
      <div className="w-full px-6 relative">
        <style jsx>{`
          .aurora-bg {
            background: linear-gradient(
              135deg,
              rgba(99, 102, 241, 0.05) 0%,
              rgba(168, 85, 247, 0.08) 25%,
              rgba(99, 102, 241, 0.03) 50%,
              rgba(168, 85, 247, 0.06) 75%,
              rgba(99, 102, 241, 0.04) 100%
            );
          }
          .aurora-practice {
            background: linear-gradient(
              135deg,
              rgba(99, 102, 241, 0.08) 0%,
              rgba(168, 85, 247, 0.12) 25%,
              rgba(99, 102, 241, 0.06) 50%,
              rgba(168, 85, 247, 0.1) 75%,
              rgba(99, 102, 241, 0.08) 100%
            );
            border: 1px solid rgba(99, 102, 241, 0.15);
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(168, 85, 247, 0.05);
          }
        `}</style>

      {!selectedPitch ? (
        <Tabs defaultValue="practice" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-50 border border-slate-200">
            <TabsTrigger value="practice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Practice Sessions</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Analytics</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pitches.map((pitch) => (
                <Card key={pitch.id} className="aurora-practice transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate text-slate-900">{pitch.clientName}</span>
                      <div className="rounded-full bg-indigo-100 w-10 h-10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-indigo-600" />
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                        {getPitchStageDisplay(pitch.pitchStage)}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <div className="rounded-full bg-slate-100 w-6 h-6 flex items-center justify-center mr-2">
                          <Clock className="h-3 w-3 text-slate-600" />
                        </div>
                        Created {pitch.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => startPractice(pitch)}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Practice
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/pitches/${pitch.id}`)}
                          className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pitches.length === 0 && (
              <Card className="aurora-bg text-center py-12 border border-slate-200">
                <CardContent>
                  <div className="rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No pitches available</h3>
                  <p className="text-slate-600 mb-4">Create your first pitch to start practicing</p>
                  <Button 
                    onClick={() => router.push('/pitches/new')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                  >
                    Create Pitch
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="aurora-bg border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900">Total Sessions</CardTitle>
                  <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center">
                    <Timer className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <p className="text-xs text-slate-500">+0% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="aurora-bg border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900">Avg. Duration</CardTitle>
                  <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">0:00</div>
                  <p className="text-xs text-slate-500">+0% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="aurora-bg border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900">Improvement</CardTitle>
                  <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">0%</div>
                  <p className="text-xs text-slate-500">+0% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="aurora-bg border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900">Active Pitches</CardTitle>
                  <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{pitches.length}</div>
                  <p className="text-xs text-slate-500">Available for practice</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="aurora-bg border border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Practice Sessions</CardTitle>
                <CardDescription className="text-slate-600">Your latest practice sessions and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <div className="rounded-full bg-slate-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-700">No practice sessions yet</p>
                  <p className="text-sm text-slate-500">Start practicing to see your history here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Practice Mode
        <div className="max-w-4xl mx-auto">
          <Card className="aurora-practice mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-slate-900">Practicing: {selectedPitch.clientName}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      {getPitchStageDisplay(selectedPitch.pitchStage)}
                    </Badge>
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={endPractice}
                  className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                >
                  End Practice
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Timer and Controls */}
            <Card className="aurora-bg border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center mr-2">
                    <Timer className="h-4 w-4 text-indigo-600" />
                  </div>
                  Practice Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-indigo-600 mb-4">
                    {formatTime(practiceTime)}
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={toggleTimer}
                      variant={isTimerRunning ? "destructive" : "default"}
                      size="lg"
                      className={isTimerRunning ? "" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={resetTimer} 
                      variant="outline" 
                      size="lg"
                      className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recording Controls */}
            <Card className="aurora-bg border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center mr-2">
                    <Mic className="h-4 w-4 text-indigo-600" />
                  </div>
                  Recording
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="mb-4">
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                      isRecording ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-400'
                    }`}>
                      {isRecording ? (
                        <div className="w-6 h-6 bg-red-600 rounded-full animate-pulse" />
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className={`w-full ${isRecording ? "" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"}`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  {isRecording && (
                    <p className="text-sm text-red-600 mt-2">Recording in progress...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practice Notes */}
          <Card className="aurora-bg mt-6 border border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Practice Notes</CardTitle>
              <CardDescription className="text-slate-600">
                Take notes during your practice session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add notes about your practice session, areas for improvement, key points to remember..."
              />
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
} 