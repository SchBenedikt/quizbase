"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Zap, Send, Star, Heart, SlidersHorizontal } from "lucide-react";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const MOCK_CURRENT_QUESTION: PollQuestion = {
  id: '1',
  type: 'word-cloud',
  question: "ONE WORD FOR THE FUTURE?",
  createdAt: Date.now()
};

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const theme = (searchParams.get('theme') as AppTheme) || 'orange';
  
  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [rating, setRating] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);

  const handleSubmit = () => {
    setVoted(true);
  };

  if (voted) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500", `theme-${theme}`)}>
        <div className="bg-foreground p-10 rounded-[4rem] animate-float">
          <Heart className="h-20 w-20 text-background fill-background" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none">SENT!</h1>
          <p className="text-foreground font-black text-lg max-w-xs mx-auto uppercase tracking-tight opacity-70">Energy added to the pulse.</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-full px-10 py-8 border-4 border-foreground font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all" 
          onClick={() => setVoted(false)}
        >
          RE-VIBE
        </Button>
      </div>
    );
  }

  const q = MOCK_CURRENT_QUESTION;

  return (
    <div className={cn("min-h-screen flex flex-col p-6 font-body max-w-lg mx-auto", `theme-${theme}`)}>
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-foreground fill-foreground" />
          <span className="font-black text-2xl tracking-tighter uppercase">PopPulse*</span>
        </div>
        <div className="px-4 py-1.5 border-4 border-foreground rounded-full text-[8px] font-black uppercase tracking-[0.3em]">
          LIVE
        </div>
      </div>

      <main className="space-y-10">
        <h2 className="text-5xl font-black leading-[0.8] uppercase tracking-tighter">
          {q.question}
        </h2>

        {q.type === 'multiple-choice' && q.options && (
          <div className="grid gap-3">
            {q.options.map((opt, idx) => (
              <Button
                key={idx}
                variant={selection === idx ? "default" : "outline"}
                className={cn(
                  "h-20 text-lg font-black rounded-[2rem] border-4 transition-all active:scale-95 text-left justify-start px-6",
                  selection === idx ? "bg-foreground text-background border-foreground" : "border-foreground/20 bg-white/10"
                )}
                onClick={() => setSelection(idx)}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-colors border-2",
                  selection === idx ? "bg-background text-foreground border-background" : "bg-foreground text-background border-foreground"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="truncate uppercase">{opt}</span>
              </Button>
            ))}
          </div>
        )}

        {q.type === 'word-cloud' && (
          <div className="space-y-4">
            <Input 
              placeholder="ONE WORD..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value.toUpperCase())}
              className="h-20 text-3xl font-black px-8 rounded-[2.5rem] border-4 border-foreground bg-white/10 focus-visible:ring-0 uppercase placeholder:opacity-20"
            />
            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 text-center">Type your vibe to join the cloud</p>
          </div>
        )}

        {q.type === 'slider' && (
          <div className="space-y-8 py-6">
            <div className="text-center">
              <span className="text-8xl font-black tracking-tighter">{sliderValue}</span>
            </div>
            <Slider 
              value={[sliderValue]}
              onValueChange={(v) => setSliderValue(v[0])}
              max={100}
              className="py-4"
            />
          </div>
        )}

        <Button 
          disabled={selection === null && !textValue && !rating && q.type !== 'slider'}
          onClick={handleSubmit}
          className="w-full h-20 text-xl font-black rounded-[2.5rem] bg-foreground text-background border-4 border-foreground hover:bg-transparent hover:text-foreground transition-all mt-4 uppercase tracking-tighter"
        >
          SEND VIBE <Send className="ml-3 h-8 w-8" />
        </Button>
      </main>

      <footer className="mt-auto pt-12 text-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">PopPulse Security: Encrypted & Anonymous</p>
      </footer>
    </div>
  );
}
