
"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Zap, ChevronLeft, ChevronRight, Users, LayoutGrid, Timer, Loader2, Palette } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, updateDoc, query, orderBy } from "firebase/firestore";

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const sessionRef = useMemoFirebase(() => doc(db, "sessions", resolvedParams.sessionId), [db, resolvedParams.sessionId]);
  const { data: session, isLoading: sessionLoading } = useDoc(sessionRef);

  // Derive theme from session document primarily
  const theme = (session?.theme as AppTheme) || (searchParams.get('theme') as AppTheme) || 'orange';
  const title = session?.title || searchParams.get('title') || "Live Presentation";
  const code = session?.code || searchParams.get('code') || "---";

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

  const changeTheme = (newTheme: AppTheme) => {
    if (!sessionRef) return;
    updateDoc(sessionRef, { theme: newTheme });
  };

  if (sessionLoading || !questions) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-muted transition-colors duration-500">
        <Loader2 className="h-10 w-10 animate-spin opacity-20" />
      </div>
    );
  }

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  const themeOptions: { name: AppTheme; color: string }[] = [
    { name: 'orange', color: '#ff9312' },
    { name: 'green', color: '#14ae5c' },
    { name: 'red', color: '#f24822' },
    { name: 'blue', color: '#0d99ff' },
  ];

  return (
    <div className={cn("no-scroll h-screen w-screen flex flex-col font-body bg-background transition-colors duration-500", `theme-${theme}`)}>
      <header className="h-[12vh] px-12 flex items-center justify-between border-b border-foreground/10 shrink-0 z-10 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Zap className="h-8 w-8 text-foreground fill-foreground" />
          <h1 className="text-xl font-bold tracking-tight text-foreground truncate max-w-lg">{title}</h1>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-50 text-foreground">Pulse Code</p>
            <p className="text-4xl font-black tracking-tighter text-foreground leading-none mt-1">{code}</p>
          </div>
          <div className="flex items-center gap-3 bg-foreground/10 px-5 py-2 rounded-2xl border border-foreground/20 text-foreground">
            <Users className="h-5 w-5" />
            <span className="text-xl font-black">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-8 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col gap-6">
          <div className="text-center shrink-0">
             <div className="inline-block px-5 py-1 bg-foreground text-background rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-3">
               Node {currentIdx + 1} of {questions.length}
             </div>
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground max-w-4xl mx-auto uppercase">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <Card className="h-full border-4 border-foreground/10 rounded-[3rem] bg-white/10 backdrop-blur-lg p-10 flex items-center justify-center overflow-hidden shadow-none">
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
          </div>
        </div>
      </main>

      <footer className="h-[10vh] flex items-center justify-between gap-8 border-t border-foreground/10 shrink-0 px-12 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-12 w-12 rounded-full border-2 border-foreground/20 bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className="h-12 w-12 rounded-full border-2 border-foreground/20 bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex items-center gap-6 bg-foreground/5 px-6 py-2 rounded-2xl border border-foreground/10 text-foreground">
           <Button variant="ghost" className="font-bold uppercase tracking-[0.2em] text-[10px] h-9 px-3 hover:bg-foreground/10">
             <LayoutGrid className="h-4 w-4 mr-2" /> Grid
           </Button>
           <div className="w-px h-5 bg-foreground/10" />
           <Button variant="ghost" className="font-bold uppercase tracking-[0.2em] text-[10px] h-9 px-3 hover:bg-foreground/10">
             <Timer className="h-4 w-4 mr-2" /> Timer
           </Button>
           <div className="w-px h-5 bg-foreground/10" />
           <Popover>
             <PopoverTrigger asChild>
               <Button variant="ghost" className="font-bold uppercase tracking-[0.2em] text-[10px] h-9 px-3 hover:bg-foreground/10">
                 <Palette className="h-4 w-4 mr-2" /> Vibe
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-48 p-3 rounded-2xl border-4 border-foreground bg-background">
               <div className="grid grid-cols-2 gap-2">
                 {themeOptions.map((opt) => (
                   <button
                     key={opt.name}
                     onClick={() => changeTheme(opt.name)}
                     className={cn(
                       "h-10 rounded-xl border-2 transition-all",
                       theme === opt.name ? "border-foreground" : "border-transparent opacity-50 hover:opacity-100"
                     )}
                     style={{ backgroundColor: opt.color }}
                   />
                 ))}
               </div>
             </PopoverContent>
           </Popover>
        </div>

        <div className="w-24 flex justify-end">
           <Zap className="h-6 w-6 text-foreground/20" />
        </div>
      </footer>
    </div>
  );
}
