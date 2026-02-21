
"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, LayoutGrid, Timer, Loader2, Settings, Palette } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, updateDoc, query, orderBy } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  
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

  return (
    <div className="no-scroll h-screen w-screen flex flex-col font-body bg-background transition-colors duration-500" data-theme={currentTheme}>
      <header className="h-[12vh] px-12 flex items-center justify-between border-b shrink-0 z-10 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Zap className="h-10 w-10 text-primary fill-primary" />
          <h1 className="text-2xl font-extrabold tracking-tighter truncate max-w-xl uppercase">{title}</h1>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Join Pulse</p>
            <p className="text-5xl font-black tracking-tighter leading-none mt-1">{code}</p>
          </div>
          <div className="flex items-center gap-4 bg-muted px-6 py-3 rounded-2xl border-2">
            <Users className="h-6 w-6" />
            <span className="text-3xl font-black">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl h-full flex flex-col gap-10">
          <div className="text-center shrink-0 space-y-4">
             <div className="inline-block px-6 py-1.5 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
               Node {currentIdx + 1} / {questions.length}
             </div>
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-5xl mx-auto uppercase">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <Card className="h-full border-4 rounded-[3rem] bg-muted/30 backdrop-blur-xl p-16 flex items-center justify-center overflow-hidden">
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
          </div>
        </div>
      </main>

      <footer className="h-[10vh] flex items-center justify-between shrink-0 px-12 border-t bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-14 w-14 rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className="h-14 w-14 rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 bg-muted p-2 rounded-full border-2">
           <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-full">
                  <Palette className="h-5 w-5 mr-3" /> Vibe
                </Button>
             </PopoverTrigger>
             <PopoverContent className="w-48 p-4 rounded-[2rem] border-4 flex flex-col gap-2">
                <Button onClick={() => setTheme('orange')} className="bg-[#ff9312] hover:bg-[#ff9312]/90 text-white rounded-full font-black uppercase text-[10px]">Orange</Button>
                <Button onClick={() => setTheme('red')} className="bg-[#f24822] hover:bg-[#f24822]/90 text-white rounded-full font-black uppercase text-[10px]">Red</Button>
                <Button onClick={() => setTheme('green')} className="bg-[#14ae5c] hover:bg-[#14ae5c]/90 text-white rounded-full font-black uppercase text-[10px]">Green</Button>
                <Button onClick={() => setTheme('blue')} className="bg-[#0d99ff] hover:bg-[#0d99ff]/90 text-white rounded-full font-black uppercase text-[10px]">Blue</Button>
             </PopoverContent>
           </Popover>
           <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-full">
             <Timer className="h-5 w-5 mr-3" /> Timer
           </Button>
           <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-full">
             <Settings className="h-5 w-5 mr-3" /> Controls
           </Button>
        </div>

        <div className="flex items-center gap-2 opacity-20">
           <Zap className="h-6 w-6 fill-foreground" />
           <span className="font-black text-xs uppercase tracking-[0.3em]">PopPulse* OS</span>
        </div>
      </footer>
    </div>
  );
}
