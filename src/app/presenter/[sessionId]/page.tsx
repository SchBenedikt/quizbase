"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Share2, Users, LayoutGrid, Timer } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion } from "@/app/types/poll";
import { useSearchParams } from "next/navigation";

// Mock questions for demo
const MOCK_QUESTIONS: PollQuestion[] = [
  { id: '1', type: 'multiple-choice', question: "What is the primary benefit of our new strategy?", options: ["Growth", "Stability", "Innovation", "Efficiency"], createdAt: Date.now() },
  { id: '2', type: 'rating', question: "How confident do you feel about the Q4 targets?", createdAt: Date.now() },
  { id: '3', type: 'open-text', question: "Any other suggestions for the team?", createdAt: Date.now() }
];

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [results, setResults] = useState<Record<string, number>>({});
  
  const title = searchParams.get('title') || "New Presentation";
  const code = searchParams.get('code') || "POP123";

  useEffect(() => {
    const timer = setInterval(() => {
      setParticipantCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setResults(prev => {
        const q = MOCK_QUESTIONS[currentIdx];
        if (q.type === 'multiple-choice' && q.options) {
          const randIdx = Math.floor(Math.random() * q.options.length);
          return { ...prev, [randIdx]: (prev[randIdx] || 0) + 1 };
        } else if (q.type === 'rating') {
          const randRating = Math.floor(Math.random() * 5) + 1;
          return { ...prev, [randRating]: (prev[randRating] || 0) + 1 };
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [currentIdx]);

  const q = MOCK_QUESTIONS[currentIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col font-body text-primary">
      {/* Header */}
      <header className="px-12 py-8 flex items-center justify-between bg-white/10 border-b-8 border-primary">
        <div className="flex items-center gap-8">
          <div className="bg-primary p-4 rounded-[2rem] border-4 border-primary">
            <Zap className="text-background h-8 w-8" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter truncate max-w-xl">{title}</h1>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-center bg-primary text-background px-12 py-4 rounded-[3rem] border-4 border-primary">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Join at PopPulse.me</p>
            <p className="text-5xl font-black tracking-tighter leading-none mt-1">{code}</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 px-8 py-4 rounded-[2.5rem] border-4 border-primary">
            <Users className="h-8 w-8" />
            <span className="text-4xl font-black leading-none">{participantCount}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-20 w-20 border-4 border-primary hover:bg-primary hover:text-background transition-all shadow-none">
            <Share2 className="h-8 w-8" />
          </Button>
        </div>
      </header>

      {/* Main Display Area */}
      <main className="flex-grow flex items-center justify-center p-20">
        <div className="w-full max-w-7xl space-y-20 animate-in slide-in-from-bottom-12 duration-700">
          <div className="space-y-8 text-center">
             <div className="inline-block px-8 py-2 bg-primary text-background rounded-full text-sm font-black uppercase tracking-[0.5em]">
               STAGE {currentIdx + 1} / {MOCK_QUESTIONS.length}
             </div>
             <h2 className="text-8xl md:text-[11rem] font-black leading-[0.75] uppercase tracking-tighter">
               {q.question}
             </h2>
          </div>

          <div className="relative">
            <Card className="border-[12px] border-primary rounded-[6rem] bg-white/10 p-24 overflow-hidden shadow-none">
               <ResultChart question={q} results={results} />
               
               {q.type === 'open-text' && (
                 <div className="grid grid-cols-2 gap-8 mt-16">
                   {["PUSH BOUNDARIES", "FAST TRACK", "SYSTEM SYNERGY", "BOLD MOVES"].map((text, i) => (
                     <div key={i} className="bg-primary text-background p-10 rounded-[4rem] text-3xl font-black uppercase tracking-tighter border-4 border-primary animate-in zoom-in duration-500">
                        {text}
                     </div>
                   ))}
                 </div>
               )}
            </Card>
          </div>
        </div>
      </main>

      {/* Control Bar */}
      <footer className="p-16 flex items-center justify-center gap-8">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setResults({}); }}
          disabled={currentIdx === 0}
          className="h-24 w-24 rounded-full border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all shadow-none"
        >
          <ChevronLeft className="h-12 w-12" />
        </Button>
        
        <div className="bg-primary text-background px-16 py-6 rounded-[4rem] flex items-center gap-12 border-4 border-primary">
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[2rem] font-black uppercase tracking-widest text-lg px-8 py-10 h-auto">
             <LayoutGrid className="h-8 w-8 mr-4" /> GRID VIEW
           </Button>
           <div className="w-1.5 h-12 bg-background/20 rounded-full" />
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-[2rem] font-black uppercase tracking-widest text-lg px-8 py-10 h-auto">
             <Timer className="h-8 w-8 mr-4" /> LOCK PULSE
           </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.min(MOCK_QUESTIONS.length - 1, currentIdx + 1)); setResults({}); }}
          disabled={currentIdx === MOCK_QUESTIONS.length - 1}
          className="h-24 w-24 rounded-full border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all shadow-none"
        >
          <ChevronRight className="h-12 w-12" />
        </Button>
      </footer>
    </div>
  );
}
