
"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, LayoutGrid, Timer, Loader2, Sparkles } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, updateDoc, query, orderBy } from "firebase/firestore";

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  
  const theme = (searchParams.get('theme') as AppTheme) || 'orange';
  const title = searchParams.get('title') || "SESSION DISPLAY";
  const code = searchParams.get('code') || "---";

  // Fetch real session data
  const sessionRef = useMemoFirebase(() => doc(db, "sessions", resolvedParams.sessionId), [db, resolvedParams.sessionId]);
  const { data: session, isLoading: sessionLoading } = useDoc(sessionRef);

  // Fetch real poll questions
  const questionsQuery = useMemoFirebase(() => {
    if (!session) return null;
    return query(collection(db, `users/${session.userId}/polls/${session.pollId}/questions`), orderBy("order", "asc"));
  }, [db, session]);
  const { data: questions } = useCollection<PollQuestion>(questionsQuery);

  // Fetch real responses for the session
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

  const handleNext = () => {
    if (!questions || !session) return;
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx < questions.length - 1) {
      const nextId = questions[currentIdx + 1].id;
      updateDoc(sessionRef, { currentQuestionId: nextId });
    }
  };

  const handlePrev = () => {
    if (!questions || !session) return;
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx > 0) {
      const prevId = questions[currentIdx - 1].id;
      updateDoc(sessionRef, { currentQuestionId: prevId });
    }
  };

  if (sessionLoading || !questions) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  return (
    <div className={cn("no-scroll h-screen w-screen overflow-hidden flex flex-col font-body", `theme-${theme}`)}>
      {/* Header - Optimized for visibility without clutter */}
      <header className="h-[12vh] px-12 flex items-center justify-between bg-white border-b-8 border-foreground shrink-0 z-10">
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="bg-foreground p-3 rounded-[1rem] shrink-0">
            <Zap className="text-background h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter truncate max-w-lg">{title}</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mb-1">JOIN PULSE</p>
            <p className="text-5xl font-black tracking-tighter leading-none">{code}</p>
          </div>
          <div className="h-12 w-1.5 bg-foreground/10 rounded-full" />
          <div className="flex items-center gap-3 bg-foreground/5 px-6 py-3 rounded-[1.5rem] border-4 border-foreground">
            <Users className="h-6 w-6" />
            <span className="text-3xl font-black leading-none">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      {/* Main Content - No Scroll enforced */}
      <main className="flex-1 min-h-0 p-8 bg-background flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-7xl h-full flex flex-col gap-6">
          <div className="space-y-2 text-center shrink-0">
             <div className="inline-block px-6 py-1 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
               STAGE {currentIdx + 1} OF {questions.length}
             </div>
             <h2 className="text-4xl md:text-6xl font-black leading-[1.1] uppercase tracking-tighter text-foreground max-w-4xl mx-auto">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <Card className="h-full border-8 border-foreground rounded-[4rem] bg-white/40 backdrop-blur-md p-10 flex items-center justify-center overflow-hidden shadow-none">
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="h-[10vh] flex items-center justify-center gap-6 bg-white border-t-8 border-foreground shrink-0 px-12">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="h-14 w-14 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all shadow-none"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="bg-foreground text-background px-10 py-3 rounded-[3rem] flex items-center gap-8 border-4 border-foreground">
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[1rem] font-black uppercase tracking-widest text-[10px] px-6 py-2 h-auto">
             <LayoutGrid className="h-4 w-4 mr-3" /> GRID
           </Button>
           <div className="w-1 h-6 bg-background/20 rounded-full" />
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[1rem] font-black uppercase tracking-widest text-[10px] px-6 py-2 h-auto">
             <Timer className="h-4 w-4 mr-3" /> LOCK
           </Button>
           {q.type === 'open-text' && (
             <>
               <div className="w-1 h-6 bg-background/20 rounded-full" />
               <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[1rem] font-black uppercase tracking-widest text-[10px] px-6 py-2 h-auto">
                 <Sparkles className="h-4 w-4 mr-3" /> ANALYZE
               </Button>
             </>
           )}
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNext}
          disabled={currentIdx === questions.length - 1}
          className="h-14 w-14 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all shadow-none"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </footer>
    </div>
  );
}
