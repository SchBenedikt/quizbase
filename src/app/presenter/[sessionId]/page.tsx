"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ChevronLeft, ChevronRight, Share2, Users, LayoutGrid, Timer } from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion } from "@/app/types/poll";
import { useSearchParams } from "next/navigation";

// Mock questions for demo if Firestore not wired up
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
  const code = searchParams.get('code') || "ABCDEF";

  // Simulate incoming results
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
    <div className="min-h-screen bg-background flex flex-col font-body">
      {/* Header */}
      <header className="px-8 py-4 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2 rounded-xl">
            <Zap className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold font-headline text-accent truncate max-w-xs">{title}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center bg-secondary/30 px-6 py-2 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Join at PulsePoll.com</p>
            <p className="text-2xl font-black text-primary tracking-tighter">{code}</p>
          </div>
          <div className="flex items-center gap-2 text-accent font-bold">
            <Users className="h-5 w-5" />
            <span>{participantCount}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Display Area */}
      <main className="flex-grow flex items-center justify-center p-12">
        <div className="w-full max-w-5xl space-y-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4 text-center">
             <div className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest">
               Question {currentIdx + 1} of {MOCK_QUESTIONS.length}
             </div>
             <h2 className="text-5xl font-black font-headline leading-tight text-accent">
               {q.question}
             </h2>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-[3rem] opacity-50"></div>
            <Card className="relative border-none shadow-2xl rounded-[3rem] bg-white/80 backdrop-blur-xl p-12 overflow-hidden">
               <ResultChart question={q} results={results} />
               
               {q.type === 'open-text' && (
                 <div className="grid grid-cols-2 gap-4 mt-8">
                   {["Great idea!", "Maybe focus on users?", "Efficiency is key", "Let's innovate more!"].map((text, i) => (
                     <div key={i} className="bg-secondary/20 p-4 rounded-2xl text-accent font-medium animate-in fade-in zoom-in duration-300">
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
      <footer className="p-8 flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setResults({}); }}
          disabled={currentIdx === 0}
          className="h-14 w-14 rounded-full border-2 border-primary/20 text-primary shadow-xl"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        
        <div className="bg-accent/90 text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
           <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl">
             <LayoutGrid className="h-5 w-5 mr-2" /> Grid View
           </Button>
           <div className="w-px h-6 bg-white/20" />
           <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl">
             <Timer className="h-5 w-5 mr-2" /> Countdown
           </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setCurrentIdx(Math.min(MOCK_QUESTIONS.length - 1, currentIdx + 1)); setResults({}); }}
          disabled={currentIdx === MOCK_QUESTIONS.length - 1}
          className="h-14 w-14 rounded-full border-2 border-primary/20 text-primary shadow-xl"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </footer>
    </div>
  );
}