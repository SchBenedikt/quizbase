
"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Share2, Users, LayoutGrid, Timer } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const MOCK_QUESTIONS: PollQuestion[] = [
  { id: '1', type: 'multiple-choice', question: "PRIMARY BENEFIT OF THE STRATEGY?", options: ["GROWTH", "STABILITY", "INNOVATION", "EFFICIENCY"], createdAt: Date.now() },
  { id: '2', type: 'rating', question: "CONFIDENCE LEVEL FOR Q4?", createdAt: Date.now() },
  { id: '3', type: 'word-cloud', question: "ONE WORD FOR THE FUTURE?", createdAt: Date.now() }
];

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [participantCount, setParticipantCount] = useState(12);
  const [results, setResults] = useState<Record<string, number>>({});
  
  const title = searchParams.get('title') || "SESSION DISPLAY";
  const code = searchParams.get('code') || "POP123";
  const theme = (searchParams.get('theme') as AppTheme) || 'orange';

  useEffect(() => {
    const timer = setInterval(() => {
      setParticipantCount(prev => prev + (Math.random() > 0.8 ? 1 : 0));
      setResults(prev => {
        const q = MOCK_QUESTIONS[currentIdx];
        if (q.type === 'multiple-choice' && q.options) {
          const randIdx = Math.floor(Math.random() * q.options.length);
          return { ...prev, [randIdx]: (prev[randIdx] || 0) + 1 };
        } else if (q.type === 'rating') {
          const randRating = Math.floor(Math.random() * 5) + 1;
          return { ...prev, [randRating]: (prev[randRating] || 0) + 1 };
        } else if (q.type === 'word-cloud') {
          const words = ["SPEED", "BOLD", "ENERGY", "FLOW", "PULSE"];
          const word = words[Math.floor(Math.random() * words.length)];
          return { ...prev, [word]: (prev[word] || 0) + 1 };
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIdx]);

  const q = MOCK_QUESTIONS[currentIdx];

  return (
    <div className={cn("no-scroll h-screen w-screen overflow-hidden flex flex-col font-body", `theme-${theme}`)}>
      {/* Header - Strictly No Scroll Layout */}
      <header className="h-[15vh] px-12 flex items-center justify-between bg-white border-b-8 border-foreground shrink-0 z-10">
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="bg-foreground p-4 rounded-[1.5rem] shrink-0">
            <Zap className="text-background h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter truncate max-w-xl">{title}</h1>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-center bg-foreground text-background px-12 py-4 rounded-[2.5rem]">
            <p className="text-[12px] font-black uppercase tracking-[0.6em] opacity-60 leading-none">JOIN CODE</p>
            <p className="text-6xl font-black tracking-tighter leading-none mt-2">{code}</p>
          </div>
          <div className="flex items-center gap-4 bg-foreground/5 px-8 py-4 rounded-[2.5rem] border-4 border-foreground">
            <Users className="h-8 w-8" />
            <span className="text-4xl font-black leading-none">{participantCount}</span>
          </div>
        </div>
      </header>

      {/* Main Content - No Scroll flex-grow */}
      <main className="flex-1 min-h-0 p-12 bg-background flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-7xl h-full flex flex-col gap-8">
          <div className="space-y-4 text-center shrink-0">
             <div className="inline-block px-8 py-2 bg-foreground text-background rounded-full text-sm font-black uppercase tracking-[0.6em]">
               STAGE {currentIdx + 1} / {MOCK_QUESTIONS.length}
             </div>
             <h2 className="text-7xl md:text-9xl font-black leading-[0.8] uppercase tracking-tighter text-foreground">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <Card className="h-full border-8 border-foreground rounded-[5rem] bg-white/50 backdrop-blur-sm p-12 flex items-center justify-center overflow-hidden">
               <ResultChart question={q} results={results} />
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Controls - Strictly No Scroll */}
      <footer className="h-[12vh] flex items-center justify-center gap-8 bg-white border-t-8 border-foreground shrink-0">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setResults({}); }}
          disabled={currentIdx === 0}
          className="h-20 w-20 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all"
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
          onClick={() => { setCurrentIdx(Math.min(MOCK_QUESTIONS.length - 1, currentIdx + 1)); setResults({}); }}
          disabled={currentIdx === MOCK_QUESTIONS.length - 1}
          className="h-20 w-20 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all"
        >
          <ChevronRight className="h-10 w-10" />
        </Button>
      </footer>
    </div>
  );
}
