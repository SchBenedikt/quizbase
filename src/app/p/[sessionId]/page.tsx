"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Send, Star, CheckCircle2, Heart } from "lucide-react";
import { PollQuestion } from "@/app/types/poll";

// Mock question for the participant view
const MOCK_CURRENT_QUESTION: PollQuestion = {
  id: '1',
  type: 'multiple-choice',
  question: "What is the primary benefit of our new strategy?",
  options: ["Growth", "Stability", "Innovation", "Efficiency"],
  createdAt: Date.now()
};

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [openText, setOpenText] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    setVoted(true);
    // Submit to Firebase here
  };

  if (voted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="bg-primary/10 p-6 rounded-[2rem] animate-float">
          <Heart className="h-20 w-20 text-primary fill-primary" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black font-headline text-accent">Thanks for voting!</h1>
          <p className="text-muted-foreground text-lg">Your response has been added to the pulse. Please wait for the presenter to advance.</p>
        </div>
        <Button variant="outline" className="rounded-full px-8 py-6 border-2 font-bold" onClick={() => setVoted(false)}>
          Change Response
        </Button>
      </div>
    );
  }

  const q = MOCK_CURRENT_QUESTION;

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 font-body max-w-lg mx-auto">
      {/* Mini Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-black text-accent tracking-tighter">PulsePoll</span>
        </div>
        <div className="px-3 py-1 bg-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
          Active Session
        </div>
      </div>

      <main className="space-y-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-black font-headline leading-tight text-accent">
            {q.question}
          </h2>
        </div>

        {q.type === 'multiple-choice' && q.options && (
          <div className="grid gap-4">
            {q.options.map((opt, idx) => (
              <Button
                key={idx}
                variant={selection === idx ? "default" : "outline"}
                className={`h-20 text-lg font-bold rounded-2xl border-2 transition-all active:scale-95 text-left justify-start px-6 ${
                  selection === idx ? "shadow-xl shadow-primary/20 border-primary" : "border-primary/10 bg-white"
                }`}
                onClick={() => setSelection(idx)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 shrink-0 transition-colors ${
                  selection === idx ? "bg-white text-primary" : "bg-secondary text-accent"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="truncate">{opt}</span>
              </Button>
            ))}
          </div>
        )}

        {q.type === 'open-text' && (
          <div className="space-y-4">
            <Textarea 
              placeholder="Type your answer..."
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              className="min-h-[200px] text-xl font-medium p-6 rounded-[2rem] border-none bg-white shadow-inner focus-visible:ring-primary"
            />
          </div>
        )}

        {q.type === 'rating' && (
          <div className="flex items-center justify-center gap-4 py-8">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setRating(v)}
                className={`transition-all ${rating >= v ? "text-primary scale-125" : "text-muted opacity-30"}`}
              >
                <Star className={`h-12 w-12 ${rating >= v ? "fill-primary" : ""}`} />
              </button>
            ))}
          </div>
        )}

        <Button 
          disabled={selection === null && !openText && !rating}
          onClick={handleSubmit}
          className="w-full h-20 text-xl font-bold rounded-[2rem] shadow-2xl shadow-primary/30 mt-8"
        >
          Submit Response <Send className="ml-2 h-6 w-6" />
        </Button>
      </main>

      <footer className="mt-20 text-center opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Anonymous & Secure</p>
      </footer>
    </div>
  );
}