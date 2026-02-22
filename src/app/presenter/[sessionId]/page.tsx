"use client";

import { useState, useEffect, use, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, Timer, Loader2, Palette, Sparkles, Monitor, Settings2, Eye, EyeOff } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, updateDoc, query, orderBy } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { aiOpenTextSummarizer } from "@/ai/flows/ai-open-text-summarizer";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
      updateDoc(sessionRef, { currentQuestionId: questions[0].id });
    }
  }, [session, questions, sessionRef]);

  // Timer logic
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
      updateDoc(sessionRef, { currentQuestionId: questions[currentIdx + 1].id });
    }
  };

  const handlePrev = () => {
    if (!questions || !session) return;
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx > 0) {
      updateDoc(sessionRef, { currentQuestionId: questions[currentIdx - 1].id });
    }
  };

  const setTheme = (theme: string, customColor?: string) => {
    if (!sessionRef) return;
    updateDoc(sessionRef, { theme, customColor: customColor || null });
  };

  const toggleResultVisibility = () => {
    if (!sessionRef) return;
    updateDoc(sessionRef, { showResultsToParticipants: !showResults });
  };

  const handleSummarize = async () => {
    if (!allResponses || !session?.currentQuestionId) return;
    const currentResponses = allResponses.filter(r => r.questionId === session.currentQuestionId).map(r => r.value.toString());
    if (currentResponses.length < 3) {
      toast({ title: "Not Enough Data", description: "Wait for more responses before AI analysis." });
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
    if (!hex) return 'black';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // YIQ algorithm for perceived brightness
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  if (sessionLoading || !questions) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin opacity-20" />
      </div>
    );
  }

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  const dynamicForeground = customColor ? getContrastColor(customColor) : 'currentColor';
  const dynamicStyles = customColor ? {
    backgroundColor: customColor,
    color: dynamicForeground,
    borderColor: dynamicForeground + '33'
  } : {};

  return (
    <div 
      className="no-scroll h-screen w-screen flex flex-col font-body bg-background transition-colors duration-700" 
      data-theme={currentTheme !== 'custom' ? currentTheme : undefined}
      style={dynamicStyles}
    >
      <header className="h-[12vh] px-16 flex items-center justify-between border-b-2 shrink-0 z-20 bg-black/5" style={{ borderColor: 'inherit' }}>
        <div className="flex items-center gap-8">
          <Zap className="h-10 w-10 fill-current" />
          <h1 className="text-4xl font-black tracking-tighter truncate max-w-2xl uppercase">{title}</h1>
        </div>
        
        <div className="flex items-center gap-12">
          {timeLeft !== null && (
            <div className="flex items-center gap-4 px-8 py-4 rounded-[1.5rem] border-2 animate-pulse bg-current" style={{ color: 'var(--background)' }}>
              <Timer className="h-8 w-8" />
              <span className="text-5xl font-black tabular-nums">{timeLeft}</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">JOIN CODE</p>
            <p className="text-6xl font-black tracking-tighter leading-none mt-1">{code}</p>
          </div>
          <div className="flex items-center gap-6 bg-black/5 px-8 py-4 rounded-[1.5rem] border-2 border-current/10">
            <Users className="h-8 w-8" />
            <span className="text-5xl font-black leading-none">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-16 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[1400px] h-full flex flex-col gap-12">
          <div className="text-center shrink-0 space-y-4">
             <div className="inline-block px-6 py-2 bg-current rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--background)' }}>
               QUESTION {currentIdx + 1} / {questions.length}
             </div>
             <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-black leading-[0.8] tracking-tighter max-w-7xl mx-auto uppercase">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <Card className="h-full border-2 rounded-[1.5rem] bg-black/5 p-16 flex items-center justify-center overflow-hidden border-current/10">
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
            
            {q.type === 'open-text' && currentResponses.length > 0 && (
              <Button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="absolute top-8 right-8 h-14 px-8 rounded-[1rem] bg-current font-black uppercase text-xs border-2 border-current hover:bg-transparent hover:text-current transition-all gap-3"
                style={{ color: 'var(--background)' }}
              >
                {isSummarizing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                AI ANALYZE
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="h-[10vh] flex items-center justify-between shrink-0 px-16 border-t-2 bg-black/5" style={{ borderColor: 'inherit' }}>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-14 w-14 rounded-[1.5rem] border-2 bg-black/5 transition-all hover:bg-current hover:text-background"
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className="h-14 w-14 rounded-[1.5rem] border-2 bg-black/5 transition-all hover:bg-current hover:text-background"
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 bg-black/5 p-2 rounded-[1.5rem] border-2 border-current/10">
           <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-[1rem] hover:bg-black/10 transition-all">
                  <Palette className="h-5 w-5 mr-3" /> Vibe
                </Button>
             </PopoverTrigger>
             <PopoverContent className="w-64 p-6 rounded-[1.5rem] border-2 bg-background flex flex-col gap-4 text-foreground" align="center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Preset Vibes</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setTheme('orange')} className="bg-[#ff9312] text-white rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Orange</Button>
                  <Button onClick={() => setTheme('red')} className="bg-[#780c16] text-[#e9c0e9] rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Red</Button>
                  <Button onClick={() => setTheme('green')} className="bg-[#d2e822] text-[#254e1a] rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Acid</Button>
                  <Button onClick={() => setTheme('blue')} className="bg-[#0d99ff] text-white rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Blue</Button>
                </div>
                <div className="space-y-3 pt-3 border-t-2">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Custom Color</p>
                   <Input 
                     type="color" 
                     className="h-12 w-full rounded-[1rem] border-2 p-1 cursor-pointer"
                     onChange={(e) => setTheme('custom', e.target.value)}
                   />
                </div>
             </PopoverContent>
           </Popover>
           
           <Popover>
             <PopoverTrigger asChild>
               <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-[1rem] hover:bg-black/10 transition-all">
                 <Settings2 className="h-5 w-5 mr-3" /> Sync
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-72 p-6 rounded-[1.5rem] border-2 bg-background flex flex-col gap-6 text-foreground" align="center">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Audience Controls</p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-results" className="text-xs font-black uppercase">Live Results</Label>
                    <Switch id="show-results" checked={showResults} onCheckedChange={toggleResultVisibility} />
                  </div>
                  <p className="text-[10px] opacity-40 uppercase leading-tight font-bold">
                    When active, participants see real-time charts on their devices after submitting.
                  </p>
                </div>
             </PopoverContent>
           </Popover>

           <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-[1rem] hover:bg-black/10 transition-all">
             <Monitor className="h-5 w-5 mr-3" /> Live
           </Button>
        </div>

        <div className="flex items-center gap-3 opacity-30">
           <Zap className="h-6 w-6 fill-current" />
           <span className="font-black text-[10px] uppercase tracking-widest">Presenter Mode</span>
        </div>
      </footer>
    </div>
  );
}
