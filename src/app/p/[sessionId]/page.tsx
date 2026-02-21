"use client";

import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Send, Heart, Loader2, Star } from "lucide-react";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  
  const sessionRef = useMemoFirebase(() => doc(db, "sessions", resolvedParams.sessionId), [db, resolvedParams.sessionId]);
  const { data: session, isLoading: sessionLoading } = useDoc(sessionRef);

  const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(null);
  
  useEffect(() => {
    if (session?.currentQuestionId && session.userId && session.pollId) {
      const fetchQ = async () => {
        try {
          const qRef = doc(db, `users/${session.userId}/polls/${session.pollId}/questions/${session.currentQuestionId}`);
          const snap = await getDoc(qRef);
          if (snap.exists()) {
            setCurrentQuestion({ ...snap.data(), id: snap.id } as PollQuestion);
            setVoted(false);
            setSelection(null);
            setTextValue("");
            setRatingValue(0);
            setSliderValue(50);
          }
        } catch (error) {
          console.error("Failed to fetch current question:", error);
        }
      };
      fetchQ();
    }
  }, [session?.currentQuestionId, session?.userId, session?.pollId, db]);

  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [sliderValue, setSliderValue] = useState(50);
  const [ratingValue, setRatingValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const theme = session?.theme || 'orange';

  const handleSubmit = async () => {
    if (!currentQuestion || !session) return;
    setLoading(true);
    try {
      let value: any = "";
      if (currentQuestion.type === 'multiple-choice') value = selection;
      if (currentQuestion.type === 'word-cloud') value = textValue.trim().toUpperCase();
      if (currentQuestion.type === 'open-text') value = textValue.trim();
      if (currentQuestion.type === 'slider') value = sliderValue;
      if (currentQuestion.type === 'rating') value = ratingValue;

      await addDoc(collection(db, `sessions/${resolvedParams.sessionId}/responses`), {
        sessionId: resolvedParams.sessionId,
        questionId: currentQuestion.id,
        value,
        userId: session.userId, 
        createdAt: serverTimestamp(),
      });
      setVoted(true);
    } catch (e) {
      console.error("Submission failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f1]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f3f3f1]">
        <h1 className="text-4xl font-black uppercase tracking-tighter opacity-20">Session Inactive</h1>
        <Button onClick={() => window.location.href = '/join'} className="mt-8 bg-primary text-white font-black rounded-full h-16 px-10 border-4 border-primary">Return to Lobby</Button>
      </div>
    );
  }

  if (voted) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-12 animate-in fade-in duration-500 bg-background", `theme-${theme}`)}>
        <div className="bg-foreground p-16 rounded-[5rem] animate-float border-8 border-background">
          <Heart className="h-32 w-32 text-background fill-background" />
        </div>
        <div className="space-y-6">
          <h1 className="text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Sync Confirmed!</h1>
          <p className="text-foreground font-black text-2xl max-w-xs mx-auto uppercase tracking-tight opacity-70">Stand by for the next pulse signal...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background", `theme-${theme}`)}>
        <p className="text-4xl font-black uppercase opacity-20 tracking-tighter text-foreground">Waiting for Transmission...</p>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col p-8 font-body max-w-lg mx-auto bg-background transition-colors duration-500", `theme-${theme}`)}>
      <div className="flex items-center justify-between mb-20">
        <div className="flex items-center gap-4">
          <Zap className="h-10 w-10 text-foreground fill-foreground" />
          <span className="font-black text-4xl tracking-tighter uppercase text-foreground">PopPulse*</span>
        </div>
        <div className="px-8 py-3 border-4 border-foreground rounded-full text-xs font-black uppercase tracking-[0.4em] text-foreground">
          LIVE
        </div>
      </div>

      <main className="space-y-16 flex-1">
        <h2 className="text-5xl md:text-7xl font-black leading-[1] uppercase tracking-tighter text-foreground">
          {currentQuestion.question}
        </h2>

        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="grid gap-6">
            {currentQuestion.options.map((opt, idx) => (
              <Button
                key={idx}
                variant={selection === idx ? "default" : "outline"}
                className={cn(
                  "h-28 text-2xl font-black rounded-[3rem] border-4 transition-all active:scale-95 text-left justify-start px-10 shadow-none",
                  selection === idx ? "bg-foreground text-background border-foreground" : "border-foreground/20 bg-white/10 text-foreground"
                )}
                onClick={() => setSelection(idx)}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mr-8 shrink-0 transition-colors border-4",
                  selection === idx ? "bg-background text-foreground border-background" : "bg-foreground text-background border-foreground"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="truncate uppercase">{opt}</span>
              </Button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'rating' && (
          <div className="flex justify-center gap-4 py-10">
            {[1, 2, 3, 4, 5].map((s) => (
              <Button
                key={s}
                variant="ghost"
                size="icon"
                onClick={() => setRatingValue(s)}
                className="h-20 w-20 rounded-full"
              >
                <Star 
                  className={cn(
                    "h-16 w-16 transition-all",
                    s <= ratingValue ? "fill-foreground text-foreground" : "text-foreground/20"
                  )} 
                />
              </Button>
            ))}
          </div>
        )}

        {(currentQuestion.type === 'word-cloud' || currentQuestion.type === 'open-text') && (
          <div className="space-y-8">
            {currentQuestion.type === 'word-cloud' ? (
              <Input 
                placeholder="Type one word..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                maxLength={20}
                className="h-28 text-4xl font-black px-12 rounded-[3.5rem] border-4 border-foreground bg-white/10 focus-visible:ring-0 uppercase placeholder:opacity-20 shadow-none text-foreground"
              />
            ) : (
              <Textarea 
                placeholder="Broadcast your thoughts..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="min-h-[250px] text-2xl font-black p-12 rounded-[3.5rem] border-4 border-foreground bg-white/10 focus-visible:ring-0 uppercase placeholder:opacity-20 shadow-none leading-tight text-foreground"
              />
            )}
          </div>
        )}

        {currentQuestion.type === 'slider' && (
          <div className="space-y-16 py-12">
            <div className="text-center">
              <span className="text-[10rem] font-black tracking-tighter leading-none text-foreground">{sliderValue}</span>
            </div>
            <Slider 
              value={[sliderValue]}
              onValueChange={(v) => setSliderValue(v[0])}
              max={100}
              step={1}
              className="py-8"
            />
            <div className="flex justify-between font-black text-xs uppercase tracking-widest opacity-40 text-foreground px-4">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}

        <Button 
          disabled={loading || (selection === null && !textValue && ratingValue === 0 && currentQuestion.type !== 'slider')}
          onClick={handleSubmit}
          className="w-full h-28 text-3xl font-black rounded-[3.5rem] bg-foreground text-background border-4 border-foreground hover:bg-transparent hover:text-foreground transition-all mt-12 uppercase tracking-tighter shadow-none"
        >
          {loading ? <Loader2 className="animate-spin h-10 w-10" /> : "Transmit Pulse"}
        </Button>
      </main>

      <footer className="mt-24 pt-16 text-center opacity-30 border-t-8 border-foreground/5">
        <p className="text-xs font-black uppercase tracking-[0.5em] text-foreground">Zero Retention. Instant Connection. PopPulse*</p>
      </footer>
    </div>
  );
}
