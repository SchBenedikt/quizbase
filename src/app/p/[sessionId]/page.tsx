
"use client";

import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Zap, Send, Heart, Loader2 } from "lucide-react";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  
  // Real-time session monitoring
  const sessionRef = useMemoFirebase(() => doc(db, "sessions", resolvedParams.sessionId), [db, resolvedParams.sessionId]);
  const { data: session, isLoading: sessionLoading } = useDoc(sessionRef);

  // Fetch current question based on session's currentQuestionId
  const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(null);
  
  useEffect(() => {
    if (session?.currentQuestionId && session.userId && session.pollId) {
      const qRef = doc(db, `users/${session.userId}/polls/${session.pollId}/questions/${session.currentQuestionId}`);
      const fetchQ = async () => {
        const snap = await getDocs(query(collection(db, `users/${session.userId}/polls/${session.pollId}/questions`), where("id", "==", session.currentQuestionId)));
        if (!snap.empty) {
          setCurrentQuestion(snap.docs[0].data() as PollQuestion);
          setVoted(false); // Reset voted state when question changes
        }
      };
      fetchQ();
    }
  }, [session?.currentQuestionId, session?.userId, session?.pollId, db]);

  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [sliderValue, setSliderValue] = useState(50);
  const [loading, setLoading] = useState(false);

  const theme = session?.theme || 'orange';

  const handleSubmit = async () => {
    if (!currentQuestion || !session) return;
    setLoading(true);
    try {
      let value: any = "";
      if (currentQuestion.type === 'multiple-choice') value = selection;
      if (currentQuestion.type === 'word-cloud') value = textValue.trim().toUpperCase();
      if (currentQuestion.type === 'slider') value = sliderValue;

      await addDoc(collection(db, `sessions/${resolvedParams.sessionId}/responses`), {
        sessionId: resolvedParams.sessionId,
        questionId: currentQuestion.id,
        value,
        createdAt: serverTimestamp(),
      });
      setVoted(true);
    } catch (e) {
      console.error("Submission failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f1]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (voted) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500", `theme-${theme}`)}>
        <div className="bg-foreground p-10 rounded-[4rem] animate-float">
          <Heart className="h-20 w-20 text-background fill-background" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none">Vibe Sent!</h1>
          <p className="text-foreground font-black text-lg max-w-xs mx-auto uppercase tracking-tight opacity-70">Waiting for the next pulse...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 text-center", `theme-${theme}`)}>
        <p className="text-3xl font-black uppercase opacity-20">Waiting for the session to start...</p>
      </div>
    );
  }

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
        <h2 className="text-4xl md:text-5xl font-black leading-[0.9] uppercase tracking-tighter">
          {currentQuestion.question}
        </h2>

        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="grid gap-3">
            {currentQuestion.options.map((opt, idx) => (
              <Button
                key={idx}
                variant={selection === idx ? "default" : "outline"}
                className={cn(
                  "h-20 text-lg font-black rounded-[2rem] border-4 transition-all active:scale-95 text-left justify-start px-6 shadow-none",
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

        {currentQuestion.type === 'word-cloud' && (
          <div className="space-y-4">
            <Input 
              placeholder="one word..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="h-20 text-3xl font-black px-8 rounded-[2.5rem] border-4 border-foreground bg-white/10 focus-visible:ring-0 uppercase placeholder:opacity-20 shadow-none"
            />
          </div>
        )}

        {currentQuestion.type === 'slider' && (
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
          disabled={loading || (selection === null && !textValue && currentQuestion.type !== 'slider')}
          onClick={handleSubmit}
          className="w-full h-20 text-xl font-black rounded-[2.5rem] bg-foreground text-background border-4 border-foreground hover:bg-transparent hover:text-foreground transition-all mt-4 uppercase tracking-tighter shadow-none"
        >
          {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Send Vibe"}
        </Button>
      </main>

      <footer className="mt-auto pt-12 text-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">PopPulse: Secure & Anonymous</p>
      </footer>
    </div>
  );
}
