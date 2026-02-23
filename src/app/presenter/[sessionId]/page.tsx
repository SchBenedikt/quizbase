"use client";

import { useState, useEffect, use, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, Timer, Loader2, Palette, Sparkles, Monitor, Settings2, Moon, Sun, Activity } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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

  const setTheme = (theme: string, customColor?: string) => {
    if (!sessionRef) return;
    updateDocumentNonBlocking(sessionRef, { theme, customColor: customColor || null });
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
    borderColor: finalFg + '22'
  };

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  return (
    <div 
      className="no-scroll h-screen w-screen flex flex-col font-body transition-colors duration-700 overflow-hidden" 
      style={dynamicStyles}
    >
      <header className="h-[10vh] px-12 flex items-center justify-between border-b-2 shrink-0 z-20 bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-6">
          <Zap className="h-8 w-8 fill-current" />
          <h1 className="text-xl font-bold tracking-tight truncate max-w-xl">{title}</h1>
        </div>
        
        <div className="flex items-center gap-8">
          {timeLeft !== null && (
            <div className="flex items-center gap-3 px-5 py-2 rounded-[1rem] border-2 animate-pulse" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <Timer className="h-5 w-5" />
              <span className="text-2xl font-black tabular-nums">{timeLeft}</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none">Session Code</p>
            <p className="text-4xl font-black tracking-tighter leading-none mt-1">{code}</p>
          </div>
          <div className="flex items-center gap-4 bg-black/5 px-5 py-2 rounded-[1rem] border-2" style={{ borderColor: finalFg + '10' }}>
            <Users className="h-5 w-5" />
            <span className="text-2xl font-black leading-none">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-10 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-[1400px] h-full flex flex-col gap-8">
          <div className="text-center shrink-0 space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]" style={{ backgroundColor: finalFg + '15', color: finalFg }}>
               <Activity className="h-3 w-3" /> Step {currentIdx + 1} of {questions.length}
             </div>
             <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight max-w-5xl mx-auto">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <Card className="h-full border-2 rounded-[2rem] bg-black/5 p-10 flex items-center justify-center overflow-hidden shadow-none" style={{ borderColor: finalFg + '08' }}>
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
            
            {q.type === 'open-text' && currentResponses.length > 0 && (
              <Button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="absolute top-6 right-6 h-10 px-5 rounded-[0.75rem] font-black uppercase text-[9px] border-2 transition-all gap-2 shadow-none"
                style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
              >
                {isSummarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Analyze Feedback
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="h-[8vh] flex items-center justify-between shrink-0 px-12 border-t-2 bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-10 w-10 rounded-[0.75rem] border-2 bg-black/5 transition-all hover:opacity-80 disabled:opacity-10"
            style={{ borderColor: finalFg + '20', color: finalFg }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className="h-10 w-10 rounded-[0.75rem] border-2 bg-black/5 transition-all hover:opacity-80 disabled:opacity-10"
            style={{ borderColor: finalFg + '20', color: finalFg }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 bg-black/5 p-1.5 rounded-[1.25rem] border-2" style={{ borderColor: finalFg + '08' }}>
           <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" className="font-black uppercase tracking-widest text-[9px] h-9 px-5 rounded-[0.75rem] hover:bg-black/10 transition-all" style={{ color: finalFg }}>
                  <Palette className="h-3.5 w-3.5 mr-2" /> Vibe
                </Button>
             </PopoverTrigger>
             <PopoverContent className="w-[340px] p-5 rounded-[1.5rem] border-2 bg-background flex flex-col gap-4 text-foreground shadow-none" align="center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Immersive Experience</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setTheme('orange')} className="bg-[#ff9312] text-white rounded-[0.75rem] font-bold h-10 border-2 uppercase text-[9px] shadow-none">Orange</Button>
                  <Button onClick={() => setTheme('red')} className="bg-[#780c16] text-[#e9c0e9] rounded-[0.75rem] font-bold h-10 border-2 uppercase text-[9px] shadow-none">Deep Red</Button>
                  <Button onClick={() => setTheme('green')} className="bg-[#d2e822] text-[#254e1a] rounded-[0.75rem] font-bold h-10 border-2 uppercase text-[9px] shadow-none">Acid Green</Button>
                  <Button onClick={() => setTheme('blue')} className="bg-[#0d99ff] text-white rounded-[0.75rem] font-bold h-10 border-2 uppercase text-[9px] shadow-none">Pulse Blue</Button>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-2">Minimalist Studio</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setTheme('minimal-light')} className="bg-[#f4f4f5] text-zinc-950 rounded-[0.75rem] font-bold h-10 border-2 border-zinc-200 uppercase text-[9px] shadow-none"><Sun className="w-3 h-3 mr-2" /> Light</Button>
                  <Button onClick={() => setTheme('minimal-dark')} className="bg-[#18181b] text-zinc-100 rounded-[0.75rem] font-bold h-10 border-2 border-zinc-800 uppercase text-[9px] shadow-none"><Moon className="w-3 h-3 mr-2" /> Dark</Button>
                </div>
                <div className="space-y-2.5 pt-3 border-t-2">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Custom Background</p>
                   <Input 
                     type="color" 
                     className="h-10 w-full rounded-[0.75rem] border-2 p-1 cursor-pointer shadow-none"
                     onChange={(e) => setTheme('custom', e.target.value)}
                   />
                </div>
             </PopoverContent>
           </Popover>
           
           <Popover>
             <PopoverTrigger asChild>
               <Button variant="ghost" className="font-black uppercase tracking-widest text-[9px] h-9 px-5 rounded-[0.75rem] hover:bg-black/10 transition-all" style={{ color: finalFg }}>
                 <Settings2 className="h-3.5 w-3.5 mr-2" /> Sync
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-64 p-5 rounded-[1.5rem] border-2 bg-background flex flex-col gap-5 text-foreground shadow-none" align="center">
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Audience Controls</p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-results" className="text-[11px] font-bold uppercase">Live Results</Label>
                    <Switch id="show-results" checked={showResults} onCheckedChange={toggleResultVisibility} />
                  </div>
                  <p className="text-[9px] opacity-40 uppercase leading-tight font-bold">
                    Allow participants to see the pulse stream after submission.
                  </p>
                </div>
             </PopoverContent>
           </Popover>

           <Button variant="ghost" onClick={() => document.documentElement.requestFullscreen()} className="font-black uppercase tracking-widest text-[9px] h-9 px-5 rounded-[0.75rem] hover:bg-black/10 transition-all" style={{ color: finalFg }}>
             <Monitor className="h-3.5 w-3.5 mr-2" /> Fullscreen
           </Button>
        </div>

        <div className="flex items-center gap-2 opacity-30">
           <Zap className="h-4 w-4 fill-current" />
           <span className="font-black text-[9px] uppercase tracking-widest">Presenter</span>
        </div>
      </footer>
    </div>
  );
}
