"use client";

import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Heart, Loader2, Star } from "lucide-react";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, getDoc, query, where, limit } from "firebase/firestore";

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  
  const sessionQuery = useMemoFirebase(() => {
    return query(
      collection(db, "sessions"), 
      where("code", "==", resolvedParams.sessionId.toUpperCase()), 
      limit(1)
    );
  }, [db, resolvedParams.sessionId]);

  const { data: sessionDocs, isLoading: sessionLoading } = useCollection<PollSession>(sessionQuery);
  const session = sessionDocs?.[0] || null;

  const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(null);
  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [sliderValue, setSliderValue] = useState(50);
  const [ratingValue, setRatingValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.currentQuestionId && session.userId && session.pollId) {
      const fetchQ = async () => {
        try {
          const qRef = doc(db, `users/${session.userId}/surveys/${session.pollId}/questions/${session.currentQuestionId}`);
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

      await addDoc(collection(db, `sessions/${session.id}/responses`), {
        sessionId: session.id,
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
        <h1 className="text-3xl font-black uppercase tracking-tighter opacity-30">Session Not Found</h1>
        <p className="text-sm font-bold opacity-60 mt-4 uppercase tracking-widest">Verify your session code.</p>
        <Button onClick={() => window.location.href = '/join'} className="mt-12 bg-foreground text-background font-black rounded-[1.5rem] h-16 px-12 border-2 border-foreground shadow-none">Return to Lobby</Button>
      </div>
    );
  }

  const currentTheme = session.theme || 'orange';

  if (voted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-10 animate-in fade-in duration-700 bg-background" data-theme={currentTheme}>
        <div className="bg-foreground p-14 rounded-[1.5rem] animate-float shadow-none">
          <Heart className="h-20 w-20 text-background fill-background" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Sync Confirmed!</h1>
          <p className="font-bold text-xl max-w-xs mx-auto uppercase tracking-tight opacity-80">Stand by for next signal...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background" data-theme={currentTheme}>
        <p className="text-3xl font-black uppercase opacity-30 tracking-widest">Waiting for Presentation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8 font-body bg-background transition-colors duration-700 shadow-none" data-theme={currentTheme}>
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-foreground fill-foreground" />
            <span className="font-black text-2xl tracking-tighter uppercase">PopPulse*</span>
          </div>
          <div className="px-6 py-2 border-2 border-foreground rounded-[1.5rem] text-xs font-black uppercase tracking-widest">
            Live
          </div>
        </div>

        <main className="space-y-12 flex-1">
          <h2 className="text-5xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="grid gap-4">
              {currentQuestion.options.map((opt, idx) => (
                <Button
                  key={idx}
                  variant={selection === idx ? "default" : "outline"}
                  className={cn(
                    "h-24 text-xl font-black rounded-[1.5rem] border-2 transition-all active:scale-95 text-left justify-start px-8 shadow-none",
                    selection === idx 
                      ? "bg-foreground text-background border-foreground" 
                      : "border-foreground/20 text-foreground bg-foreground/5 hover:bg-foreground/10"
                  )}
                  onClick={() => setSelection(idx)}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-[1rem] flex items-center justify-center mr-6 shrink-0 transition-colors border-2 text-lg font-black",
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
            <div className="flex justify-center gap-3 py-10 bg-black/5 rounded-[1.5rem] border-2 border-foreground/10">
              {[1, 2, 3, 4, 5].map((s) => (
                <Button
                  key={s}
                  variant="ghost"
                  size="icon"
                  onClick={() => setRatingValue(s)}
                  className="h-16 w-16 rounded-[1.5rem]"
                >
                  <Star 
                    className={cn(
                      "h-12 w-12 transition-all",
                      s <= ratingValue ? "fill-foreground text-foreground" : "text-foreground/20"
                    )} 
                  />
                </Button>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'word-cloud' || currentQuestion.type === 'open-text') && (
            <div className="space-y-6">
              {currentQuestion.type === 'word-cloud' ? (
                <Input 
                  placeholder="One word..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  maxLength={20}
                  className="h-24 text-3xl font-black px-10 rounded-[1.5rem] border-2 border-foreground bg-black/5 focus-visible:ring-0 uppercase placeholder:opacity-20 shadow-none"
                />
              ) : (
                <Textarea 
                  placeholder="Your thoughts..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="min-h-[250px] text-2xl font-black p-10 rounded-[1.5rem] border-2 border-foreground bg-black/5 focus-visible:ring-0 uppercase placeholder:opacity-20 shadow-none leading-tight"
                />
              )}
            </div>
          )}

          {currentQuestion.type === 'slider' && (
            <div className="space-y-12 py-12 bg-black/5 rounded-[1.5rem] border-2 border-foreground/10 px-10">
              <div className="text-center">
                <span className="text-9xl font-black tracking-tighter leading-none">{sliderValue}</span>
              </div>
              <Slider 
                value={[sliderValue]}
                onValueChange={(v) => setSliderValue(v[0])}
                max={100}
                step={1}
                className="py-6"
              />
              <div className="flex justify-between font-black text-xs uppercase tracking-widest opacity-40 px-4">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          )}

          <Button 
            disabled={loading || (selection === null && !textValue && ratingValue === 0 && currentQuestion.type !== 'slider')}
            onClick={handleSubmit}
            className="w-full h-24 text-3xl font-black rounded-[1.5rem] bg-foreground text-background hover:opacity-90 transition-all mt-8 uppercase tracking-tighter shadow-none border-2 border-foreground"
          >
            {loading ? <Loader2 className="animate-spin h-10 w-10" /> : "Transmit"}
          </Button>
        </main>

        <footer className="mt-20 pt-12 text-center opacity-40 border-t-2 border-foreground/10">
          <p className="text-xs font-black uppercase tracking-widest">Zero Retention. Instant Sync.</p>
        </footer>
      </div>
    </div>
  );
}
