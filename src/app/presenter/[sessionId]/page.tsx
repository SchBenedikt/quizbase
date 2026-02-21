"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, Timer, Loader2, Settings, Palette, Sparkles, Monitor } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, updateDoc, query, orderBy } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { aiOpenTextSummarizer } from "@/ai/flows/ai-open-text-summarizer";
import { useToast } from "@/hooks/use-toast";

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const { toast } = useToast();
  
  const sessionRef = useMemoFirebase(() => doc(db, "sessions", resolvedParams.sessionId), [db, resolvedParams.sessionId]);
  const { data: session, isLoading: sessionLoading } = useDoc<PollSession>(sessionRef);

  const title = session?.title || "Live Pulse";
  const code = session?.code || "---";
  const currentTheme = session?.theme || 'orange';

  const questionsQuery = useMemoFirebase(() => {
    if (!session) return null;
    return query(collection(db, `users/${session.userId}/polls/${session.pollId}/questions`), orderBy("order", "asc"));
  }, [db, session]);
  const { data: questions } = useCollection<PollQuestion>(questionsQuery);

  const responsesQuery = useMemoFirebase(() => {
    if (!resolvedParams.sessionId) return null;
    return collection(db, `sessions/${resolvedParams.sessionId}/responses`);
  }, [db, resolvedParams.sessionId]);
  const { data: allResponses } = useCollection(responsesQuery);

  const [results, setResults] = useState<Record<string, number>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  const setTheme = (theme: string) => {
    if (!sessionRef) return;
    updateDoc(sessionRef, { theme });
  };

  const handleSummarize = async () => {
    if (!allResponses || !session?.currentQuestionId) return;
    const currentResponses = allResponses.filter(r => r.questionId === session.currentQuestionId).map(r => r.value.toString());
    if (currentResponses.length < 3) {
      toast({ title: "Need more data", description: "Wait for more responses." });
      return;
    }

    setIsSummarizing(true);
    try {
      const { summary } = await aiOpenTextSummarizer({ responses: currentResponses });
      toast({ title: "AI Synthesis", description: summary });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Sync Error", description: "AI engine unreachable." });
    } finally {
      setIsSummarizing(false);
    }
  };

  if (sessionLoading || !questions) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin opacity-20" />
      </div>
    );
  }

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  return (
    <div className="no-scroll h-screen w-screen flex flex-col font-body bg-background transition-colors duration-1000" data-theme={currentTheme}>
      <header className="h-[12vh] px-16 flex items-center justify-between border-b border-white/10 shrink-0 z-20 glass-card">
        <div className="flex items-center gap-8">
          <Zap className="h-10 w-10 text-foreground fill-foreground" />
          <h1 className="text-3xl font-black tracking-tighter truncate max-w-2xl uppercase">{title}</h1>
        </div>
        
        <div className="flex items-center gap-16">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">JOIN PULSE</p>
            <p className="text-6xl font-black tracking-tighter leading-none mt-2">{code}</p>
          </div>
          <div className="flex items-center gap-6 bg-white/20 px-8 py-4 rounded-[2rem] border-4 border-white/20">
            <Users className="h-8 w-8" />
            <span className="text-4xl font-black leading-none">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-16 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[90rem] h-full flex flex-col gap-12">
          <div className="text-center shrink-0 space-y-6">
             <div className="inline-block px-8 py-2 bg-foreground text-background rounded-full text-[12px] font-black uppercase tracking-[0.5em]">
               SIGNAL {currentIdx + 1} / {questions.length}
             </div>
             <h2 className="text-5xl md:text-7xl lg:text-9xl font-black leading-[0.8] tracking-tighter max-w-7xl mx-auto uppercase">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <Card className="h-full border-8 rounded-[5rem] bg-white/5 backdrop-blur-3xl border-white/10 p-20 flex items-center justify-center overflow-hidden shadow-2xl">
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
            
            {q.type === 'open-text' && currentResponses.length > 0 && (
              <Button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="absolute top-10 right-10 h-16 px-10 rounded-[2rem] bg-foreground text-background font-black uppercase text-sm border-4 border-foreground hover:bg-transparent hover:text-foreground transition-all gap-3 shadow-xl"
              >
                {isSummarizing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                AI SUMMARIZE
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="h-[10vh] flex items-center justify-between shrink-0 px-16 border-t border-white/10 glass-card">
        <div className="flex items-center gap-8">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-16 w-16 rounded-full border-4 border-white/20 bg-white/10 hover:bg-foreground hover:text-background transition-all shadow-lg"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className="h-16 w-16 rounded-full border-4 border-white/20 bg-white/10 hover:bg-foreground hover:text-background transition-all shadow-lg"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
        
        <div className="flex items-center gap-6 bg-white/10 p-3 rounded-full border-4 border-white/10">
           <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" className="font-black uppercase tracking-[0.2em] text-[11px] h-14 px-10 rounded-full hover:bg-white/20 transition-all">
                  <Palette className="h-6 w-6 mr-3" /> Vibe
                </Button>
             </PopoverTrigger>
             <PopoverContent className="w-64 p-6 rounded-[3rem] border-8 border-white/10 bg-background/90 backdrop-blur-3xl flex flex-col gap-3 shadow-2xl">
                <Button onClick={() => setTheme('orange')} className="bg-[#ff9312] hover:opacity-90 text-white rounded-full font-black uppercase text-[10px] h-14 border-4 border-white/20">Vibrant Orange</Button>
                <Button onClick={() => setTheme('red')} className="bg-[#f24822] hover:opacity-90 text-white rounded-full font-black uppercase text-[10px] h-14 border-4 border-white/20">Electric Red</Button>
                <Button onClick={() => setTheme('green')} className="bg-[#14ae5c] hover:opacity-90 text-white rounded-full font-black uppercase text-[10px] h-14 border-4 border-white/20">Neon Green</Button>
                <Button onClick={() => setTheme('blue')} className="bg-[#0d99ff] hover:opacity-90 text-white rounded-full font-black uppercase text-[10px] h-14 border-4 border-white/20">Deep Blue</Button>
             </PopoverContent>
           </Popover>
           <Button variant="ghost" className="font-black uppercase tracking-[0.2em] text-[11px] h-14 px-10 rounded-full hover:bg-white/20 transition-all">
             <Timer className="h-6 w-6 mr-3" /> Timer
           </Button>
           <Button variant="ghost" className="font-black uppercase tracking-[0.2em] text-[11px] h-14 px-10 rounded-full hover:bg-white/20 transition-all">
             <Monitor className="h-6 w-6 mr-3" /> Screen
           </Button>
        </div>

        <div className="flex items-center gap-3 opacity-20">
           <Zap className="h-8 w-8 fill-foreground" />
           <span className="font-black text-xs uppercase tracking-[0.5em]">PopPulse* OS v4.0</span>
        </div>
      </footer>
    </div>
  );
}
