
"use client";

import { useState, useEffect, use, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, Timer, Loader2, Palette, Sparkles, Monitor, Settings2, Moon, Sun, Activity, UserMinus, X } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, PollSession, PollParticipant } from "@/app/types/poll";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { aiOpenTextSummarizer } from "@/ai/flows/ai-open-text-summarizer";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const { toast } = useToast();
  
  const sessionRef = useMemoFirebase(() => doc(db, "sessions", resolvedParams.sessionId), [db, resolvedParams.sessionId]);
  const { data: session, isLoading: sessionLoading } = useDoc<PollSession>(sessionRef);

  const title = session?.title || "Live Presentation";
  const code = session?.code || "---";
  const currentTheme = session?.theme || 'orange';
  const customColor = session?.customColor;
  const showResults = session?.showResultsToParticipants ?? true;

  const questionsQuery = useMemoFirebase(() => {
    if (!session) return null;
    return query(collection(db, `users/${session.userId}/surveys/${session.pollId}/questions`), orderBy("order", "asc"));
  }, [db, session]);
  const { data: questions } = useCollection<PollQuestion>(questionsQuery);

  const responsesQuery = useMemoFirebase(() => {
    if (!resolvedParams.sessionId) return null;
    return collection(db, `sessions/${resolvedParams.sessionId}/responses`);
  }, [db, resolvedParams.sessionId]);
  const { data: allResponses } = useCollection(responsesQuery);

  const participantsQuery = useMemoFirebase(() => {
    if (!resolvedParams.sessionId) return null;
    return collection(db, `sessions/${resolvedParams.sessionId}/participants`);
  }, [db, resolvedParams.sessionId]);
  const { data: participants } = useCollection<PollParticipant>(participantsQuery);

  const [results, setResults] = useState<Record<string, number>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (allResponses && session?.currentQuestionId) {
      const filtered = allResponses.filter(r => r.questionId === session.currentQuestionId);
      const counts: Record<string, number> = {};
      filtered.forEach(r => {
        const val = r.value?.toString();
        if (val !== undefined) {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      setResults(counts);
    }
  }, [allResponses, session?.currentQuestionId]);

  useEffect(() => {
    if (session && !session.currentQuestionId && questions && questions.length > 0) {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[0].id });
    }
  }, [session, questions, sessionRef]);

  useEffect(() => {
    if (!session?.currentQuestionId || !questions) return;
    const currentQ = questions.find(q => q.id === session.currentQuestionId);
    
    if (currentQ?.timeLimit && currentQ.timeLimit > 0) {
      setTimeLeft(currentQ.timeLimit);
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(null);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.currentQuestionId, questions]);

  const handleNext = () => {
    if (!questions || !session) return;
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx < questions.length - 1) {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[currentIdx + 1].id });
    }
  };

  const handlePrev = () => {
    if (!questions || !session) return;
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx > 0) {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[currentIdx - 1].id });
    }
  };

  const handleKick = (participantId: string) => {
    const pRef = doc(db, `sessions/${resolvedParams.sessionId}/participants/${participantId}`);
    updateDocumentNonBlocking(pRef, { status: 'kicked' });
    toast({ title: "Participant Removed", description: "The user has been kicked from the session." });
  };

  const toggleResultVisibility = () => {
    if (!sessionRef) return;
    updateDocumentNonBlocking(sessionRef, { showResultsToParticipants: !showResults });
  };

  const handleSummarize = async () => {
    if (!allResponses || !session?.currentQuestionId) return;
    const currentResponses = allResponses.filter(r => r.questionId === session.currentQuestionId).map(r => r.value.toString());
    if (currentResponses.length < 3) {
      toast({ title: "Insufficient Data", description: "Waiting for more responses before AI analysis." });
      return;
    }

    setIsSummarizing(true);
    try {
      const { summary } = await aiOpenTextSummarizer({ responses: currentResponses });
      toast({ title: "AI Insights", description: summary });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Summarization failed." });
    } finally {
      setIsSummarizing(false);
    }
  };

  const getContrastColor = (hex: string) => {
    if (!hex) return '#000000';
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  if (sessionLoading || !questions) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin opacity-20" />
      </div>
    );
  }

  let finalBg = '#ffffff';
  if (currentTheme === 'orange') finalBg = '#ff9312';
  else if (currentTheme === 'red') finalBg = '#780c16';
  else if (currentTheme === 'green') finalBg = '#d2e822';
  else if (currentTheme === 'blue') finalBg = '#0d99ff';
  else if (currentTheme === 'minimal-light') finalBg = '#f4f4f5';
  else if (currentTheme === 'minimal-dark') finalBg = '#18181b';
  else if (currentTheme === 'custom' && customColor) finalBg = customColor;

  const finalFg = getContrastColor(finalBg);
  const dynamicStyles = {
    backgroundColor: finalBg,
    color: finalFg,
    borderColor: finalFg + '15'
  };

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];
  const activeParticipants = participants?.filter(p => p.status === 'active') || [];

  return (
    <div 
      className="no-scroll h-screen w-screen flex flex-col font-body transition-colors duration-700 overflow-hidden" 
      style={dynamicStyles}
    >
      <header className="h-[12vh] px-12 flex items-center justify-between border-b-2 shrink-0 z-20 bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-6">
          <Zap className="h-10 w-10 fill-current" />
          <h1 className="text-2xl font-black tracking-tight truncate max-w-xl uppercase">{title}</h1>
        </div>
        
        <div className="flex items-center gap-12">
          {timeLeft !== null && (
            <div className="flex items-center gap-4 px-8 py-3 rounded-[1.25rem] border-4 animate-pulse" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <Timer className="h-6 w-6" />
              <span className="text-4xl font-black tabular-nums">{timeLeft}</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 leading-none mb-1">Session Code</p>
            <p className="text-5xl font-black tracking-tighter leading-none">{code}</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-4 bg-black/5 px-6 py-3 rounded-[1.25rem] border-2 hover:bg-black/10 transition-colors" style={{ borderColor: finalFg + '10' }}>
                <Users className="h-6 w-6" />
                <span className="text-3xl font-black leading-none">{activeParticipants.length}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 rounded-[2rem] border-2 shadow-2xl" 
              align="end"
              style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
            >
              <div className="p-6 border-b-2 flex items-center justify-between" style={{ borderColor: finalBg + '20' }}>
                <p className="text-xs font-black uppercase tracking-widest opacity-40">Live Participants</p>
                <div className="h-6 px-3 rounded-full flex items-center" style={{ backgroundColor: finalBg + '20' }}>
                  <span className="text-[10px] font-black">{activeParticipants.length} Active</span>
                </div>
              </div>
              <ScrollArea className="h-80">
                {activeParticipants.length === 0 ? (
                  <div className="p-12 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-widest">No signals detected</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {activeParticipants.map(p => (
                      <div 
                        key={p.id} 
                        className="flex items-center justify-between p-4 rounded-[1rem] transition-colors group"
                        style={{ borderBottom: `1px solid ${finalBg}10` }}
                      >
                        <span className="text-sm font-bold uppercase truncate pr-4">{p.nickname || "Anonymous"}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleKick(p.id)}
                          className="h-8 w-8 rounded-[0.5rem] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: finalBg }}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-12 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-[1600px] h-full flex flex-col gap-10">
          <div className="text-center shrink-0 space-y-8">
             <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full text-xl font-black uppercase tracking-[0.4em] shadow-sm animate-in fade-in slide-in-from-top-4 duration-700" style={{ backgroundColor: finalFg, color: finalBg }}>
               <Activity className="h-6 w-6" /> Step {currentIdx + 1} of {questions.length}
             </div>
             <h2 className="text-5xl md:text-8xl font-black leading-[0.95] tracking-tight max-w-6xl mx-auto uppercase">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <Card className="h-full border-4 rounded-[2.5rem] bg-black/5 p-12 flex items-center justify-center overflow-hidden shadow-none" style={{ borderColor: finalFg + '08' }}>
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
            
            {q.type === 'open-text' && currentResponses.length > 0 && (
              <Button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="absolute top-8 right-8 h-12 px-8 rounded-[1rem] font-black uppercase text-[10px] border-2 transition-all gap-3 shadow-xl"
                style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
              >
                {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Signal
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="h-[10vh] flex items-center justify-between shrink-0 px-12 border-t-2 bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-14 w-14 rounded-[1.25rem] border-2 bg-black/5 transition-all hover:opacity-80 disabled:opacity-5"
            style={{ borderColor: finalFg + '20', color: finalFg }}
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className="h-14 w-14 rounded-[1.25rem] border-2 bg-black/5 transition-all hover:opacity-80 disabled:opacity-5"
            style={{ borderColor: finalFg + '20', color: finalFg }}
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">
            Step Navigation
          </span>
        </div>
        
        <div className="flex items-center gap-12">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-14 w-14 rounded-[1.25rem] border-2 bg-black/5 transition-all hover:bg-black/10 shadow-none" 
                style={{ color: finalFg, borderColor: finalFg + '10' }}
              >
                <Settings2 className="h-7 w-7" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-8 rounded-[2rem] border-2 flex flex-col gap-6 shadow-2xl" 
              align="end"
              style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
            >
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Settings</p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-results" className="text-xs font-black uppercase tracking-tight">Live Feedback Stream</Label>
                  <Switch 
                    id="show-results" 
                    checked={showResults} 
                    onCheckedChange={toggleResultVisibility} 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <p className="text-[10px] opacity-40 uppercase leading-tight font-bold">
                  When active, participants will see aggregated data after transmitting.
                </p>
              </div>
              <div className="pt-4 border-t-2" style={{ borderColor: finalBg + '20' }}>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-[1rem] font-black uppercase text-[10px] tracking-widest shadow-none"
                  style={{ backgroundColor: finalBg + '10', borderColor: finalBg + '20', color: finalBg }}
                  onClick={() => document.documentElement.requestFullscreen()}
                >
                  <Monitor className="h-4 w-4 mr-2" /> Fullscreen Display
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </footer>
    </div>
  );
}
