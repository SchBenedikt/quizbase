"use client";

import { useState, useEffect, use, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, Timer, Loader2, Palette, Sparkles, Monitor, Settings2, Moon, Sun } from "lucide-react";
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
        <Loader2 className="h-10 w-10 animate-spin opacity-20" />
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
    borderColor: finalFg + '33'
  };

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  return (
    <div 
      className="no-scroll h-screen w-screen flex flex-col font-body transition-colors duration-700" 
      style={dynamicStyles}
    >
      <header className="h-[12vh] px-16 flex items-center justify-between border-b-2 shrink-0 z-20 bg-black/5" style={{ borderColor: finalFg + '33' }}>
        <div className="flex items-center gap-8 studio-container mx-0 max-w-none w-full justify-between">
          <div className="flex items-center gap-8">
            <Zap className="h-10 w-10 fill-current" />
            <h1 className="text-3xl font-black tracking-tighter truncate max-w-xl uppercase">{title}</h1>
          </div>
          
          <div className="flex items-center gap-10">
            {timeLeft !== null && (
              <div className="flex items-center gap-4 px-6 py-3 rounded-[1.5rem] border-2 animate-pulse" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
                <Timer className="h-6 w-6" />
                <span className="text-4xl font-black tabular-nums">{timeLeft}</span>
              </div>
            )}
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">JOIN CODE</p>
              <p className="text-5xl font-black tracking-tighter leading-none mt-1">{code}</p>
            </div>
            <div className="flex items-center gap-5 bg-black/5 px-6 py-3 rounded-[1.5rem] border-2" style={{ borderColor: finalFg + '10' }}>
              <Users className="h-6 w-6" />
              <span className="text-4xl font-black leading-none">{currentResponses.length}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-12 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[1400px] h-full flex flex-col gap-10">
          <div className="text-center shrink-0 space-y-4">
             <div className="inline-block px-5 py-2 rounded-[1rem] text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: finalFg, color: finalBg }}>
               QUESTION {currentIdx + 1} / {questions.length}
             </div>
             <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter max-w-5xl mx-auto uppercase">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <Card className="h-full border-2 rounded-[1.5rem] bg-black/5 p-12 flex items-center justify-center overflow-hidden" style={{ borderColor: finalFg + '10' }}>
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
            
            {q.type === 'open-text' && currentResponses.length > 0 && (
              <Button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="absolute top-6 right-6 h-12 px-6 rounded-[1rem] font-black uppercase text-[10px] border-2 transition-all gap-2"
                style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
              >
                {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                AI ANALYZE
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="h-[10vh] flex items-center justify-between shrink-0 px-16 border-t-2 bg-black/5" style={{ borderColor: finalFg + '33' }}>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-12 w-12 rounded-[1.25rem] border-2 bg-black/5 transition-all hover:opacity-80"
            style={{ borderColor: finalFg + '33', color: finalFg }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className="h-12 w-12 rounded-[1.25rem] border-2 bg-black/5 transition-all hover:opacity-80"
            style={{ borderColor: finalFg + '33', color: finalFg }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3 bg-black/5 p-2 rounded-[1.5rem] border-2" style={{ borderColor: finalFg + '10' }}>
           <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-[1rem] hover:bg-black/10 transition-all" style={{ color: finalFg }}>
                  <Palette className="h-4 w-4 mr-2" /> Vibe
                </Button>
             </PopoverTrigger>
             <PopoverContent className="w-[380px] p-6 rounded-[1.5rem] border-2 bg-background flex flex-col gap-4 text-foreground shadow-none" align="center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Immersive Experience</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setTheme('orange')} className="bg-[#ff9312] text-white rounded-[1rem] font-black h-11 border-2 uppercase text-[10px] shadow-none">Orange</Button>
                  <Button onClick={() => setTheme('red')} className="bg-[#780c16] text-[#e9c0e9] rounded-[1rem] font-black h-11 border-2 uppercase text-[10px] shadow-none">Deep Red</Button>
                  <Button onClick={() => setTheme('green')} className="bg-[#d2e822] text-[#254e1a] rounded-[1rem] font-black h-11 border-2 uppercase text-[10px] shadow-none">Acid Green</Button>
                  <Button onClick={() => setTheme('blue')} className="bg-[#0d99ff] text-white rounded-[1rem] font-black h-11 border-2 uppercase text-[10px] shadow-none">Pulse Blue</Button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">Minimalist Studio</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setTheme('minimal-light')} className="bg-[#f4f4f5] text-zinc-950 rounded-[1rem] font-black h-11 border-2 border-zinc-200 uppercase text-[10px] shadow-none"><Sun className="w-3 h-3 mr-2" /> Studio Light</Button>
                  <Button onClick={() => setTheme('minimal-dark')} className="bg-[#18181b] text-zinc-100 rounded-[1rem] font-black h-11 border-2 border-zinc-800 uppercase text-[10px] shadow-none"><Moon className="w-3 h-3 mr-2" /> Studio Dark</Button>
                </div>
                <div className="space-y-3 pt-3 border-t-2">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Touch-up Background</p>
                   <Input 
                     type="color" 
                     className="h-11 w-full rounded-[1rem] border-2 p-1 cursor-pointer shadow-none"
                     onChange={(e) => setTheme('custom', e.target.value)}
                   />
                </div>
             </PopoverContent>
           </Popover>
           
           <Popover>
             <PopoverTrigger asChild>
               <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-[1rem] hover:bg-black/10 transition-all" style={{ color: finalFg }}>
                 <Settings2 className="h-4 w-4 mr-2" /> Sync
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-72 p-6 rounded-[1.5rem] border-2 bg-background flex flex-col gap-6 text-foreground shadow-none" align="center">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Audience Controls</p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-results" className="text-xs font-black uppercase">Live Results</Label>
                    <Switch id="show-results" checked={showResults} onCheckedChange={toggleResultVisibility} />
                  </div>
                  <p className="text-[10px] opacity-40 uppercase leading-tight font-bold">
                    Participants see real-time updates after submitting.
                  </p>
                </div>
             </PopoverContent>
           </Popover>

           <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-[1rem] hover:bg-black/10 transition-all" style={{ color: finalFg }}>
             <Monitor className="h-4 w-4 mr-2" /> Fullscreen
           </Button>
        </div>

        <div className="flex items-center gap-3 opacity-30">
           <Zap className="h-5 w-5 fill-current" />
           <span className="font-black text-[10px] uppercase tracking-widest">Presenter</span>
        </div>
      </footer>
    </div>
  );
}
