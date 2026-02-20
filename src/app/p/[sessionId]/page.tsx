"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Zap, Send, Star, Heart, Cloud, SlidersHorizontal } from "lucide-react";
import { PollQuestion } from "@/app/types/poll";

// Mock question for the participant view
const MOCK_CURRENT_QUESTION: PollQuestion = {
  id: '1',
  type: 'word-cloud',
  question: "What's the one word that describes your weekend?",
  createdAt: Date.now()
};

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="bg-primary border-4 border-primary p-12 rounded-[5rem] animate-float">
          <Heart className="h-24 w-24 text-background fill-background" />
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl font-black font-headline text-primary uppercase tracking-tighter leading-none">RECIEVED!</h1>
          <p className="text-primary font-bold text-xl max-w-xs mx-auto uppercase tracking-tight">Your energy has been added to the pulse.</p>
        </div>
        <Button variant="outline" className="rounded-full px-12 py-10 border-4 border-primary font-black uppercase tracking-widest hover:bg-primary hover:text-background transition-all shadow-none" onClick={() => setVoted(false)}>
          REVISE VOTE
        </Button>
      </div>
    );
  }

  const q = MOCK_CURRENT_QUESTION;

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 font-body max-w-lg mx-auto text-primary">
      {/* Mini Header */}
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="font-black text-3xl tracking-tighter uppercase">PopPulse*</span>
        </div>
        <div className="px-5 py-2 border-4 border-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
          Live
        </div>
      </div>

      <main className="space-y-12">
        <div className="space-y-4">
          <h2 className="text-5xl font-black font-headline leading-[0.8] uppercase tracking-tighter">
            {q.question}
          </h2>
        </div>

        {q.type === 'multiple-choice' && q.options && (
          <div className="grid gap-4">
            {q.options.map((opt, idx) => (
              <Button
                key={idx}
                variant={selection === idx ? "default" : "outline"}
                className={`h-24 text-xl font-black rounded-[3rem] border-4 transition-all active:scale-95 text-left justify-start px-8 shadow-none ${
                  selection === idx ? "bg-primary text-background border-primary" : "border-primary/20 bg-white/10 hover:border-primary"
                }`}
                onClick={() => setSelection(idx)}
              >
                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center mr-6 shrink-0 transition-colors border-2 ${
                  selection === idx ? "bg-background text-primary border-background" : "bg-primary text-background border-primary"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="truncate uppercase tracking-tighter">{opt}</span>
              </Button>
            ))}
          </div>
        )}

        {q.type === 'word-cloud' && (
          <div className="space-y-6">
            <Input 
              placeholder="ONE WORD..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value.toUpperCase())}
              className="h-24 text-4xl font-black px-8 rounded-[3rem] border-4 border-primary bg-white/10 focus-visible:ring-0 placeholder:opacity-20 uppercase shadow-none"
            />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-center">Type your word to join the cloud</p>
          </div>
        )}

        {q.type === 'slider' && (
          <div className="space-y-12 py-10">
            <div className="text-center">
              <span className="text-9xl font-black tracking-tighter">{sliderValue}</span>
            </div>
            <Slider 
              value={[sliderValue]}
              onValueChange={(v) => setSliderValue(v[0])}
              max={100}
              step={1}
              className="py-4"
            />
          </div>
        )}

        {q.type === 'rating' && (
          <div className="flex items-center justify-center gap-3 py-12">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setRating(v)}
                className={`transition-all p-3 ${rating >= v ? "text-primary scale-125" : "text-primary/10"}`}
              >
                <Star className={`h-16 w-16 ${rating >= v ? "fill-primary" : ""}`} />
              </button>
            ))}
          </div>
        )}

        <Button 
          disabled={selection === null && !textValue && !rating && q.type !== 'slider'}
          onClick={handleSubmit}
          className="w-full h-24 text-2xl font-black rounded-[3.5rem] bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all mt-8 uppercase tracking-tighter shadow-none"
        >
          SEND VIBE <Send className="ml-3 h-10 w-10" />
        </Button>
      </main>

      <footer className="mt-24 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">PopPulse Security: Encrypted & Anonymous</p>
      </footer>
    </div>
  );
}
