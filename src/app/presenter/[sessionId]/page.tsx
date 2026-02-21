"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Users, LayoutGrid, Timer, Loader2, Sparkles } from "lucide-react";
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
  const title = session?.title || searchParams.get('title') || "Session Display";
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
      <div className="h-screen w-screen flex items-center justify-center bg-[#f3f3f1]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const q = questions[currentIdx] || questions[0];
  if (!q) return null;
  const currentResponses = allResponses?.filter(r => r.questionId === q.id) || [];

  return (
    <div className={cn("no-scroll h-screen w-screen overflow-hidden flex flex-col font-body bg-background transition-colors duration-500", `theme-${theme}`)}>
      <header className="h-[12vh] px-12 flex items-center justify-between bg-white border-b-8 border-foreground shrink-0 z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="bg-foreground p-2 rounded-lg shrink-0">
            <Zap className="text-background h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight truncate max-w-lg text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-0.5 text-foreground">Join Code</p>
            <p className="text-4xl font-extrabold tracking-tight leading-none text-foreground">{code}</p>
          </div>
          <div className="h-10 w-1 bg-foreground/10 rounded-full" />
          <div className="flex items-center gap-3 bg-foreground/5 px-5 py-2 rounded-2xl border-4 border-foreground text-foreground">
            <Users className="h-5 w-5" />
            <span className="text-2xl font-bold leading-none">{currentResponses.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-8 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col gap-6">
          <div className="space-y-1 text-center shrink-0">
             <div className="inline-block px-5 py-0.5 bg-foreground text-background rounded-full text-xs font-bold uppercase tracking-[0.3em]">
               Node {currentIdx + 1} of {questions.length}
             </div>
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight uppercase tracking-tight text-foreground max-w-4xl mx-auto">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <Card className="h-full border-8 border-foreground rounded-[3rem] bg-white/40 backdrop-blur-md p-10 flex items-center justify-center overflow-hidden shadow-none">
               <ResultChart question={q} results={results} allResponses={currentResponses} />
            </Card>
          </div>
        </div>
      </main>

      <footer className="h-[10vh] flex items-center justify-center gap-6 bg-white border-t-8 border-foreground shrink-0 px-12">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="h-12 w-12 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all shadow-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="bg-foreground text-background px-8 py-2 rounded-[2rem] flex items-center gap-6 border-4 border-foreground">
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-lg font-bold uppercase tracking-widest text-[9px] px-4 py-1.5 h-auto">
             <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Grid
           </Button>
           <div className="w-0.5 h-4 bg-background/20 rounded-full" />
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-lg font-bold uppercase tracking-widest text-[9px] px-4 py-1.5 h-auto">
             <Timer className="h-3.5 w-3.5 mr-2" /> Lock
           </Button>
           {q.type === 'open-text' && (
             <>
               <div className="w-0.5 h-4 bg-background/20 rounded-full" />
               <Button variant="ghost" className="text-background hover:bg-white/10 rounded-lg font-bold uppercase tracking-widest text-[9px] px-4 py-1.5 h-auto">
                 <Sparkles className="h-3.5 w-3.5 mr-2" /> Analyze
               </Button>
             </>
           )}
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNext}
          disabled={currentIdx === questions.length - 1}
          className="h-12 w-12 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all shadow-none"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  );
}