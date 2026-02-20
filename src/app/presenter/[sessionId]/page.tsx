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
  const code = searchParams.get('code') || "PULSE1";

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
      <header className="px-12 py-6 flex items-center justify-between bg-white/10 border-b-4 border-primary">
        <div className="flex items-center gap-6">
          <div className="bg-primary p-3 rounded-2xl border-4 border-primary">
            <Zap className="text-background h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter truncate max-w-md">{title}</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center bg-primary text-background px-8 py-3 rounded-[2rem] border-4 border-primary">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Join at PulsePoll.com</p>
            <p className="text-4xl font-black tracking-tighter">{code}</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full border-4 border-primary">
            <Users className="h-6 w-6" />
            <span className="text-2xl font-black">{participantCount}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-14 w-14 border-4 border-primary hover:bg-primary hover:text-background transition-all">
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Main Display Area */}
      <main className="flex-grow flex items-center justify-center p-16">
        <div className="w-full max-w-6xl space-y-16 animate-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-6 text-center">
             <div className="inline-block px-6 py-1 bg-primary text-background rounded-full text-sm font-black uppercase tracking-[0.4em]">
               Q {currentIdx + 1} / {MOCK_QUESTIONS.length}
             </div>
             <h2 className="text-7xl md:text-9xl font-black leading-[0.8] uppercase tracking-tighter">
               {q.question}
             </h2>
          </div>

          <div className="relative">
            <Card className="border-8 border-primary rounded-[5rem] bg-white/20 p-20 overflow-hidden">
               <ResultChart question={q} results={results} />
               
               {q.type === 'open-text' && (
                 <div className="grid grid-cols-2 gap-6 mt-12">
                   {["BOLD IDEA!", "REALLY IMPACTFUL", "LETS DO IT", "EXCITING TIMES"].map((text, i) => (
                     <div key={i} className="bg-primary text-background p-8 rounded-[3rem] text-2xl font-black uppercase tracking-tighter border-4 border-primary animate-in zoom-in duration-500">
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
      <footer className="p-12 flex items-center justify-center gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setResults({}); }}
          disabled={currentIdx === 0}
          className="h-20 w-20 rounded-full border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all"
        >
          <ChevronLeft className="h-10 w-10" />
        </Button>
        
        <div className="bg-primary text-background px-12 py-4 rounded-[3rem] flex items-center gap-8 border-4 border-primary">
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest">
             <LayoutGrid className="h-6 w-6 mr-3" /> GRID
           </Button>
           <div className="w-1 h-8 bg-background/20 rounded-full" />
           <Button variant="ghost" className="text-background hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest">
             <Timer className="h-6 w-6 mr-3" /> TIME
           </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.min(MOCK_QUESTIONS.length - 1, currentIdx + 1)); setResults({}); }}
          disabled={currentIdx === MOCK_QUESTIONS.length - 1}
          className="h-20 w-20 rounded-full border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all"
        >
          <ChevronRight className="h-10 w-10" />
        </Button>
      </footer>
    </div>
  );
}