"use client";

import { useState, use, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Heart, Loader2, Star, Timer, CheckCircle2, XCircle } from "lucide-react";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, getDoc, query, where, limit } from "firebase/firestore";
import { ResultChart } from "@/components/poll/ResultChart";

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
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const responsesQuery = useMemoFirebase(() => {
    if (!session?.id) return null;
    return collection(db, `sessions/${session.id}/responses`);
  }, [db, session?.id]);
  const { data: allResponses } = useCollection(responsesQuery);

  useEffect(() => {
    if (session?.currentQuestionId && session.userId && session.pollId) {
      const fetchQ = async () => {
        try {
          const qRef = doc(db, `users/${session.userId}/surveys/${session.pollId}/questions/${session.currentQuestionId}`);
          const snap = await getDoc(qRef);
          if (snap.exists()) {
            const qData = { ...snap.data(), id: snap.id } as PollQuestion;
            setCurrentQuestion(qData);
            setVoted(false);
            setSelection(null);
            setTextValue("");
            setRatingValue(0);
            setSliderValue(qData.range?.min || 50);
            
            if (qData.timeLimit && qData.timeLimit > 0) {
              setTimeLeft(qData.timeLimit);
              if (timerRef.current) clearInterval(timerRef.current);
              timerRef.current = setInterval(() => {
                setTimeLeft(prev => (prev === null || prev <= 0) ? 0 : prev - 1);
              }, 1000);
            } else {
              setTimeLeft(null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch current question:", error);
        }
      };
      fetchQ();
    }
  }, [session?.currentQuestionId, session?.userId, session?.pollId, db]);

  const handleSubmit = async () => {
    if (!currentQuestion || !session || (timeLeft === 0 && currentQuestion.timeLimit)) return;
    setLoading(true);
    try {
      let value: any = "";
      if (currentQuestion.type === 'multiple-choice') value = selection;
      if (currentQuestion.type === 'word-cloud') value = textValue.trim().toUpperCase();
      if (currentQuestion.type === 'open-text') value = textValue.trim();
      if (currentQuestion.type === 'slider') value = sliderValue;
      if (currentQuestion.type === 'rating') value = ratingValue;
      if (currentQuestion.type === 'guess-number') value = parseFloat(textValue) || 0;

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

  const getContrastColor = (hex: string) => {
    if (!hex) return '#000000';
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
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
        <p className="text-xs font-bold opacity-60 mt-4 uppercase tracking-widest">Verify your session code.</p>
        <Button onClick={() => window.location.href = '/join'} className="mt-12 bg-foreground text-background font-black rounded-[1.5rem] h-16 px-12 border-2 border-foreground">Return to Lobby</Button>
      </div>
    );
  }

  const currentTheme = session.theme || 'orange';
  const customColor = session.customColor;
  const showResults = session.showResultsToParticipants;

  let finalBg = '#ffffff';
  if (currentTheme === 'orange') finalBg = '#ff9312';
  else if (currentTheme === 'red') finalBg = '#780c16';
  else if (currentTheme === 'green') finalBg = '#d2e822';
  else if (currentTheme === 'blue') finalBg = '#0d99ff';
  else if (currentTheme === 'custom' && customColor) finalBg = customColor;

  const finalFg = getContrastColor(finalBg);
  const dynamicStyles = {
    backgroundColor: finalBg,
    color: finalFg,
    borderColor: finalFg + '33'
  };

  if (voted || (timeLeft === 0 && currentQuestion?.timeLimit)) {
    const qResults: Record<string, number> = {};
    const currentResponses = allResponses?.filter(r => r.questionId === currentQuestion?.id) || [];
    currentResponses.forEach(r => {
      const val = r.value?.toString();
      if (val !== undefined) qResults[val] = (qResults[val] || 0) + 1;
    });

    const isQuiz = currentQuestion?.type === 'multiple-choice' && currentQuestion.correctOptionIndices && currentQuestion.correctOptionIndices.length > 0;
    const isCorrect = isQuiz && selection !== null && currentQuestion.correctOptionIndices?.includes(selection);

    return (
      <div 
        className="min-h-screen flex flex-col p-8 transition-colors duration-700" 
        style={dynamicStyles}
      >
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col items-center justify-center text-center space-y-12">
          {isQuiz ? (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <div className={cn(
                "w-24 h-24 rounded-[1.5rem] flex items-center justify-center mx-auto border-4",
                isCorrect ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600"
              )}>
                {isCorrect ? <CheckCircle2 className="h-12 w-12 text-white" /> : <XCircle className="h-12 w-12 text-white" />}
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter">{isCorrect ? "Correct!" : "Nice Try!"}</h1>
              {isQuiz && !isCorrect && (
                <div className="space-y-2">
                  <p className="font-bold opacity-60 uppercase tracking-widest text-xs">Correct answer(s):</p>
                  <p className="font-black uppercase text-xl">
                    {currentQuestion.correctOptionIndices?.map(i => currentQuestion.options?.[i]).join(", ")}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-14 rounded-[1.5rem] animate-float" style={{ backgroundColor: finalFg, color: finalBg }}>
              <Heart className="h-20 w-20 fill-current" />
            </div>
          )}

          {!isQuiz && (
            <div className="space-y-4">
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Sync Confirmed!</h1>
              <p className="font-bold text-xl max-w-xs mx-auto uppercase tracking-tight opacity-80">Stand by for the next signal...</p>
            </div>
          )}

          {showResults && currentQuestion && (
            <div className="w-full mt-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-40">Live Audience Pulse</p>
               <div className="h-64 border-2 rounded-[1.5rem] p-6 bg-black/5" style={{ borderColor: finalFg + '33' }}>
                 <ResultChart question={currentQuestion} results={qResults} allResponses={currentResponses} />
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8 text-center" 
        style={dynamicStyles}
      >
        <p className="text-3xl font-black uppercase opacity-30 tracking-widest">Waiting for Presenter...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col p-8 font-body transition-colors duration-700" 
      style={dynamicStyles}
    >
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 fill-current" />
            <span className="font-black text-2xl tracking-tighter uppercase">PopPulse*</span>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-3 px-6 py-2 rounded-[1rem] border-2" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <Timer className="h-4 w-4" />
              <span className="text-xl font-black tabular-nums">{timeLeft}</span>
            </div>
          )}
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
                  variant="outline"
                  className={cn(
                    "h-24 text-xl font-black rounded-[1.5rem] border-2 transition-all active:scale-95 text-left justify-start px-8",
                    selection === idx 
                      ? "border-current" 
                      : "border-current/20 bg-black/5 hover:bg-black/10"
                  )}
                  style={selection === idx ? { backgroundColor: finalFg, color: finalBg, borderColor: finalFg } : { borderColor: finalFg + '33' }}
                  onClick={() => setSelection(idx)}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-[1rem] flex items-center justify-center mr-6 shrink-0 transition-colors border-2 text-lg font-black",
                  )} style={{ 
                    backgroundColor: selection === idx ? finalBg : finalFg, 
                    color: selection === idx ? finalFg : finalBg,
                    borderColor: selection === idx ? finalBg : finalFg
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="truncate uppercase">{opt}</span>
                </Button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'rating' && (
            <div className="flex justify-center gap-3 py-10 bg-black/5 rounded-[1.5rem] border-2" style={{ borderColor: finalFg + '10' }}>
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
                      s <= ratingValue ? "fill-current" : "opacity-20"
                    )} 
                  />
                </Button>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'word-cloud' || currentQuestion.type === 'open-text' || currentQuestion.type === 'guess-number') && (
            <div className="space-y-6">
              {currentQuestion.type === 'word-cloud' ? (
                <Input 
                  placeholder="One word..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  maxLength={20}
                  className="h-24 text-3xl font-black px-10 rounded-[1.5rem] border-2 bg-black/5 focus-visible:ring-0 uppercase placeholder:opacity-20"
                  style={{ borderColor: finalFg + '33', color: finalFg }}
                />
              ) : currentQuestion.type === 'guess-number' ? (
                <Input 
                  type="number"
                  placeholder="Your guess..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="h-24 text-4xl font-black px-10 rounded-[1.5rem] border-2 bg-black/5 focus-visible:ring-0 uppercase placeholder:opacity-20 text-center"
                  style={{ borderColor: finalFg + '33', color: finalFg }}
                />
              ) : (
                <Textarea 
                  placeholder="Your thoughts..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="min-h-[250px] text-2xl font-black p-10 rounded-[1.5rem] border-2 bg-black/5 focus-visible:ring-0 uppercase placeholder:opacity-20 leading-tight"
                  style={{ borderColor: finalFg + '33', color: finalFg }}
                />
              )}
            </div>
          )}

          {currentQuestion.type === 'slider' && currentQuestion.range && (
            <div className="space-y-12 py-12 bg-black/5 rounded-[1.5rem] border-2 px-10" style={{ borderColor: finalFg + '10' }}>
              <div className="text-center">
                <span className="text-9xl font-black tracking-tighter leading-none">{sliderValue}</span>
              </div>
              <Slider 
                value={[sliderValue]}
                onValueChange={(v) => setSliderValue(v[0])}
                min={currentQuestion.range.min}
                max={currentQuestion.range.max}
                step={currentQuestion.range.step}
                className="py-6"
              />
              <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-40 px-4">
                <span>{currentQuestion.range.min}</span>
                <span>{currentQuestion.range.max}</span>
              </div>
            </div>
          )}

          <Button 
            disabled={loading || (selection === null && !textValue && ratingValue === 0 && currentQuestion.type !== 'slider')}
            onClick={handleSubmit}
            className="w-full h-24 text-3xl font-black rounded-[1.5rem] hover:opacity-90 transition-all mt-8 uppercase tracking-tighter border-2"
            style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
          >
            {loading ? <Loader2 className="animate-spin h-10 w-10" /> : "Transmit"}
          </Button>
        </main>

        <footer className="mt-20 pt-12 text-center opacity-40 border-t-2" style={{ borderColor: finalFg + '10' }}>
          <p className="text-[10px] font-black uppercase tracking-widest">Instant Sync Active</p>
        </footer>
      </div>
    </div>
  );
}
