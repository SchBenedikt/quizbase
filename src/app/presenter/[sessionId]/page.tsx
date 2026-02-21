
"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, LayoutGrid, Timer, Loader2 } from "lucide-react";
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

  // Fetch real responses for the current question
  const responsesQuery = useMemoFirebase(() => {
    if (!session?.currentQuestionId) return null;
    return collection(db, `sessions/${resolvedParams.sessionId}/responses`);
  }, [db, session?.currentQuestionId, resolvedParams.sessionId]);
  const { data: responses } = useCollection(responsesQuery);

  const [results, setResults] = useState<Record<string, number>>({});

  useEffect(() => {
    if (responses && session?.currentQuestionId) {
      const filtered = responses.filter(r => r.questionId === session.currentQuestionId);
      const counts: Record<string, number> = {};
      filtered.forEach(r => {
        counts[r.value] = (counts[r.value] || 0) + 1;
      });
      setResults(counts);
    }
  }, [responses, session?.currentQuestionId]);

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

  return (
    <div className={cn("no-scroll h-screen w-screen overflow-hidden flex flex-col font-body", `theme-${theme}`)}>
      {/* Header - Fixed Height */}
      <header className="h-[15vh] px-12 flex items-center justify-between bg-white border-b-8 border-foreground shrink-0 z-10">
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="bg-foreground p-4 rounded-[1.5rem] shrink-0">
            <Zap className="text-background h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter truncate max-w-xl">{title}</h1>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-center bg-foreground text-background px-12 py-3 rounded-[2.5rem]">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-60 leading-none">JOIN CODE</p>
            <p className="text-6xl font-black tracking-tighter leading-none mt-2">{code}</p>
          </div>
          <div className="flex items-center gap-4 bg-foreground/5 px-8 py-4 rounded-[2.5rem] border-4 border-foreground">
            <Users className="h-8 w-8" />
            <span className="text-4xl font-black leading-none">{responses?.length || 0}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Dynamic Height */}
      <main className="flex-1 min-h-0 p-12 bg-background flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-7xl h-full flex flex-col gap-8">
          <div className="space-y-4 text-center shrink-0">
             <div className="inline-block px-8 py-2 bg-foreground text-background rounded-full text-sm font-black uppercase tracking-[0.6em]">
               STAGE {currentIdx + 1} / {questions.length}
             </div>
             <h2 className="text-6xl md:text-8xl font-black leading-[0.85] uppercase tracking-tighter text-foreground">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <Card className="h-full border-8 border-foreground rounded-[5rem] bg-white/50 backdrop-blur-sm p-12 flex items-center justify-center overflow-hidden shadow-none">
               <ResultChart question={q} results={results} />
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Controls - Fixed Height */}
      <footer className="h-[12vh] flex items-center justify-center gap-8 bg-white border-t-8 border-foreground shrink-0">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="h-20 w-20 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all shadow-none"
        >
          <ChevronLeft className="h-10 w-10" />
        </Button>
        
        <div className="bg-foreground text-background px-16 py-4 rounded-[4rem] flex items-center gap-12 border-4 border-foreground">
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[1.5rem] font-black uppercase tracking-widest text-sm px-8 py-4 h-auto">
             <LayoutGrid className="h-6 w-6 mr-4" /> GRID
           </Button>
           <div className="w-1.5 h-10 bg-background/20 rounded-full" />
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[1.5rem] font-black uppercase tracking-widest text-sm px-8 py-4 h-auto">
             <Timer className="h-6 w-6 mr-4" /> LOCK
           </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNext}
          disabled={currentIdx === questions.length - 1}
          className="h-20 w-20 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all shadow-none"
        >
          <ChevronRight className="h-10 w-10" />
        </Button>
      </footer>
    </div>
  );
}
