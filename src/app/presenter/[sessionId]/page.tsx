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
    <div className={cn("no-scroll flex flex-col font-body", `theme-${theme}`)}>
      {/* Header - Fixed Height */}
      <header className="h-[12vh] min-h-[100px] px-12 flex items-center justify-between bg-white border-b-8 border-foreground z-10">
        <div className="flex items-center gap-6">
          <div className="bg-foreground p-3 rounded-[1.5rem]">
            <Zap className="text-background h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter truncate max-w-md">{title}</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center bg-foreground text-background px-10 py-3 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">PopPulse.me</p>
            <p className="text-4xl font-black tracking-tighter leading-none mt-1">{code}</p>
          </div>
          <div className="flex items-center gap-4 bg-foreground/5 px-6 py-3 rounded-[2rem] border-4 border-foreground">
            <Users className="h-6 w-6" />
            <span className="text-2xl font-black leading-none">{participantCount}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Flex-1 and Overflow-Hidden to ensure no scrolling */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background overflow-hidden relative">
        <div className="w-full max-w-6xl flex flex-col h-full justify-center space-y-6">
          <div className="space-y-4 text-center">
             <div className="inline-block px-6 py-1.5 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-[0.5em]">
               STAGE {currentIdx + 1} / {MOCK_QUESTIONS.length}
             </div>
             <h2 className="text-6xl md:text-8xl font-black leading-[0.8] uppercase tracking-tighter">
               {q.question}
             </h2>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <Card className="w-full border-8 border-foreground rounded-[4rem] bg-white/50 backdrop-blur-sm p-12 h-full flex items-center justify-center">
               <ResultChart question={q} results={results} />
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Controls - Fixed Height */}
      <footer className="h-[10vh] min-h-[80px] flex items-center justify-center gap-6 bg-white border-t-8 border-foreground">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setResults({}); }}
          disabled={currentIdx === 0}
          className="h-16 w-16 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        
        <div className="bg-foreground text-background px-12 py-3 rounded-[3rem] flex items-center gap-8 border-4 border-foreground">
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs px-6 py-3 h-auto">
             <LayoutGrid className="h-5 w-5 mr-3" /> GRID
           </Button>
           <div className="w-1 h-8 bg-background/20 rounded-full" />
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs px-6 py-3 h-auto">
             <Timer className="h-5 w-5 mr-3" /> LOCK
           </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.min(MOCK_QUESTIONS.length - 1, currentIdx + 1)); setResults({}); }}
          disabled={currentIdx === MOCK_QUESTIONS.length - 1}
          className="h-16 w-16 rounded-full border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </footer>
    </div>
  );
}
