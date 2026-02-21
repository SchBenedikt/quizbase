"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, LayoutGrid, Timer, Loader2 } from "lucide-react";
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

  const theme = (session?.theme as AppTheme) || (searchParams.get('theme') as AppTheme) || 'orange';
  const title = session?.title || searchParams.get('title') || "Display";
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

  if (sessionLoading || !questions) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin opacity-20" />
      </div>
    );
  }

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  return (
    <div className={cn("no-scroll h-screen w-screen overflow-hidden flex flex-col font-body bg-background transition-colors duration-500", `theme-${theme}`)}>
      <header className="h-[10vh] px-10 flex items-center justify-between border-b border-foreground/10 shrink-0 z-10 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-foreground fill-foreground" />
          <h1 className="text-xl font-bold tracking-tight text-foreground truncate max-w-sm">{title}</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-foreground">Join Code</p>
            <p className="text-3xl font-black tracking-tighter text-foreground">{code}</p>
          </div>
          <div className="flex items-center gap-2 bg-foreground/10 px-4 py-1.5 rounded-xl border border-foreground/20 text-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xl font-bold">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-8 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-5xl h-full flex flex-col gap-6">
          <div className="text-center shrink-0">
             <div className="inline-block px-4 py-1 bg-foreground text-background rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
               Node {currentIdx + 1} of {questions.length}
             </div>
             <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-foreground max-w-3xl mx-auto">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <Card className="h-full border-2 border-foreground/10 rounded-[2.5rem] bg-white/20 backdrop-blur-md p-8 flex items-center justify-center overflow-hidden shadow-none">
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
          </div>
        </div>
      </main>

      <footer className="h-[8vh] flex items-center justify-center gap-4 border-t border-foreground/10 shrink-0 px-10 bg-background/50 backdrop-blur-sm">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="h-10 w-10 rounded-full border border-foreground/20 bg-transparent text-foreground hover:bg-foreground hover:text-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-4 bg-foreground/5 px-6 py-2 rounded-2xl border border-foreground/10 text-foreground">
           <Button variant="ghost" className="font-bold uppercase tracking-widest text-[9px] h-8 px-3">
             <LayoutGrid className="h-3 w-3 mr-2" /> Views
           </Button>
           <div className="w-px h-4 bg-foreground/10" />
           <Button variant="ghost" className="font-bold uppercase tracking-widest text-[9px] h-8 px-3">
             <Timer className="h-3 w-3 mr-2" /> Timer
           </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNext}
          disabled={currentIdx === questions.length - 1}
          className="h-10 w-10 rounded-full border border-foreground/20 bg-transparent text-foreground hover:bg-foreground hover:text-background"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}