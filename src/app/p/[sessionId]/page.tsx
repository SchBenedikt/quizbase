
"use client";

import { useState, use, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Heart, Loader2, Star, Timer, CheckCircle2, XCircle, User, ShieldAlert, Clock, Trophy } from "lucide-react";
import { PollQuestion, PollSession, PollParticipant } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, collection, serverTimestamp, getDoc, query, where, limit, setDoc, updateDoc, increment } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ResultChart } from "@/components/poll/ResultChart";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { useAuth } from "@/firebase/provider";

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  
  const sessionQuery = useMemoFirebase(() => {
    return query(
      collection(db, "sessions"), 
      where("code", "==", resolvedParams.sessionId.toUpperCase()), 
      limit(1)
    );
  }, [db, resolvedParams.sessionId]);

  const { data: sessionDocs, isLoading: sessionLoading } = useCollection<PollSession>(sessionQuery);
  const session = sessionDocs?.[0] || null;

  const participantRef = useMemoFirebase(() => {
    if (!session?.id || !user?.uid) return null;
    return doc(db, `sessions/${session.id}/participants/${user.uid}`);
  }, [db, session?.id, user?.uid]);

  const { data: participantData } = useDoc<PollParticipant>(participantRef);

  const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(null);
  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [sliderValue, setSliderValue] = useState(50);
  const [ratingValue, setRatingValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isSettingNickname, setIsSettingNickname] = useState(true);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const responsesQuery = useMemoFirebase(() => {
    if (!session?.id) return null;
    return collection(db, `sessions/${session.id}/responses`);
  }, [db, session?.id]);
  const { data: allResponses } = useCollection(responsesQuery);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
    if (session?.id && user?.uid && !isSettingNickname) {
      const pRef = doc(db, `sessions/${session.id}/participants/${user.uid}`);
      setDoc(pRef, {
        id: user.uid,
        nickname: nickname || "Anonymous",
        status: 'active',
        score: participantData?.score || 0,
        joinedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [session?.id, user?.uid, isSettingNickname, nickname, db]);

  useEffect(() => {
    if (session?.currentQuestionId && session.currentQuestionId !== 'lobby' && session.currentQuestionId !== 'podium' && session.userId && session.pollId) {
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
            setLastCorrect(null);
            
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }

            if (qData.timeLimit && qData.timeLimit > 0) {
              setTimeLeft(qData.timeLimit);
              timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                  if (prev === null || prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            } else {
              setTimeLeft(null);
            }
          }
        } catch (error) {}
      };
      fetchQ();
    } else {
      setCurrentQuestion(null);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.currentQuestionId, session?.userId, session?.pollId, db]);

  const handleSubmit = async () => {
    if (!currentQuestion || !session || (timeLeft === 0 && currentQuestion.timeLimit)) return;
    setLoading(true);
    
    let value: any = "";
    let isCorrect = false;

    if (currentQuestion.type === 'multiple-choice') {
      value = selection;
      if (currentQuestion.correctOptionIndices && selection !== null) {
        isCorrect = currentQuestion.correctOptionIndices.includes(selection);
      }
    }
    // ... other types
    if (currentQuestion.type === 'word-cloud') value = textValue.trim().toUpperCase();
    if (currentQuestion.type === 'open-text') value = textValue.trim();
    if (currentQuestion.type === 'slider' || currentQuestion.type === 'scale') value = sliderValue;
    if (currentQuestion.type === 'rating') value = ratingValue;
    if (currentQuestion.type === 'guess-number') value = parseFloat(textValue) || 0;

    const responseCol = collection(db, `sessions/${session.id}/responses`);
    addDocumentNonBlocking(responseCol, {
      sessionId: session.id,
      questionId: currentQuestion.id,
      value,
      userId: user?.uid || 'anon', 
      createdAt: serverTimestamp(),
    });

    if (isCorrect && participantRef) {
      // Speed bonus: 500 base + 500 * (timeLeft / totalTime)
      const baseScore = 500;
      const timeBonus = (currentQuestion.timeLimit && timeLeft) ? Math.round((timeLeft / currentQuestion.timeLimit) * 500) : 0;
      const totalPoints = baseScore + timeBonus;
      updateDoc(participantRef, { score: increment(totalPoints) });
    }
    
    setLastCorrect(isCorrect);
    setVoted(true);
    setLoading(false);
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

  if (sessionLoading || isUserLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-foreground" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
      <h1 className="text-3xl font-black uppercase tracking-tighter opacity-30">Session Not Found</h1>
      <Button onClick={() => window.location.href = '/join'} className="mt-12 h-16 px-12 rounded-[1.5rem] bg-foreground text-background font-black">Return</Button>
    </div>
  );

  const currentTheme = session.theme || 'orange';
  const customColor = session.customColor;
  let finalBg = '#ffffff';
  if (currentTheme === 'orange') finalBg = '#ff9312';
  else if (currentTheme === 'red') finalBg = '#780c16';
  else if (currentTheme === 'green') finalBg = '#d2e822';
  else if (currentTheme === 'blue') finalBg = '#0d99ff';
  else if (currentTheme === 'minimal-light') finalBg = '#f4f4f5';
  else if (currentTheme === 'minimal-dark') finalBg = '#18181b';
  else if (currentTheme === 'custom' && customColor) finalBg = customColor;

  const finalFg = getContrastColor(finalBg);
  const dynamicStyles = { backgroundColor: finalBg, color: finalFg, borderColor: finalFg + '33' };

  if (participantData?.status === 'kicked') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background space-y-8">
      <ShieldAlert className="h-12 w-12 text-destructive" />
      <h1 className="text-5xl font-black uppercase">Disconnected</h1>
      <Button onClick={() => window.location.href = '/join'} className="h-14 rounded-[1rem] font-black uppercase px-10">Lobby</Button>
    </div>
  );

  if (isSettingNickname) return (
    <div className="min-h-screen flex flex-col p-8 transition-colors duration-700 font-body" style={dynamicStyles}>
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col items-center justify-center space-y-12">
         <header className="text-center space-y-6">
           <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border-4" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <User className="h-12 w-12" />
           </div>
           <h1 className="text-6xl font-black uppercase tracking-tighter">Identity.</h1>
         </header>
         <div className="w-full space-y-6">
           <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="YOUR NICKNAME..." maxLength={20} className="h-28 text-5xl font-black text-center rounded-[2rem] border-4 bg-black/10 focus-visible:ring-0 placeholder:opacity-10 uppercase tracking-tighter" style={{ borderColor: finalFg, color: finalFg }} />
           <Button onClick={() => setIsSettingNickname(false)} className="w-full h-28 text-3xl font-black rounded-[2rem] border-4 uppercase tracking-tighter transition-all" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>Enter Studio <Zap className="ml-4 h-8 w-8 fill-current" /></Button>
         </div>
      </div>
    </div>
  );

  if (session.currentQuestionId === 'podium') return (
    <div className="min-h-screen flex flex-col p-8 transition-colors duration-700 font-body items-center justify-center" style={dynamicStyles}>
      <div className="space-y-8 text-center">
        <Trophy className="h-24 w-24 mx-auto animate-bounce text-yellow-500" />
        <h1 className="text-7xl font-black uppercase tracking-tighter">Pulse Finished!</h1>
        <div className="bg-black/10 p-12 rounded-[3rem] border-4" style={{ borderColor: finalFg + '33' }}>
           <p className="text-xs font-black uppercase tracking-[0.5em] mb-4 opacity-40">Your Final Signal</p>
           <p className="text-8xl font-black tabular-nums">{participantData?.score || 0}</p>
        </div>
        <Button onClick={() => window.location.href = '/join'} className="h-20 px-12 rounded-[1.5rem] font-black uppercase tracking-widest text-xl" style={{ backgroundColor: finalFg, color: finalBg }}>New Signal</Button>
      </div>
    </div>
  );

  if (session.currentQuestionId === 'lobby') return (
    <div className="min-h-screen flex flex-col p-8 transition-colors duration-700 font-body items-center justify-center" style={dynamicStyles}>
      <div className="space-y-8 text-center">
        <div className="w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center mx-auto animate-pulse" style={{ borderColor: finalFg }}>
          <Zap className="h-12 w-12 fill-current" />
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter">You're in!</h1>
        <p className="text-2xl font-bold opacity-60 uppercase tracking-widest">Waiting for the Host to start...</p>
        <div className="mt-12 bg-black/10 px-8 py-4 rounded-full font-black text-xl uppercase tracking-widest">
          {nickname || "Anonymous"}
        </div>
      </div>
    </div>
  );

  if (voted || (timeLeft === 0 && currentQuestion?.timeLimit)) {
    const isQuiz = currentQuestion?.type === 'multiple-choice' && currentQuestion.correctOptionIndices && currentQuestion.correctOptionIndices.length > 0;
    
    return (
      <div className="min-h-screen flex flex-col p-8 transition-colors duration-700" style={dynamicStyles}>
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col items-center justify-center text-center space-y-12">
          {timeLeft === 0 && !voted ? (
            <div className="space-y-6">
               <div className="w-24 h-24 rounded-[1.5rem] flex items-center justify-center mx-auto border-4 bg-amber-500 border-amber-600"><Clock className="h-12 w-12 text-white" /></div>
               <h1 className="text-5xl font-black uppercase tracking-tighter">Time's Up!</h1>
            </div>
          ) : isQuiz ? (
            <div className="space-y-6">
              <div className={cn("w-24 h-24 rounded-[1.5rem] flex items-center justify-center mx-auto border-4", lastCorrect ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600")}>
                {lastCorrect ? <CheckCircle2 className="h-12 w-12 text-white" /> : <XCircle className="h-12 w-12 text-white" />}
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter">{lastCorrect ? "Correct!" : "Nice Try!"}</h1>
              <div className="bg-black/10 px-8 py-4 rounded-[1rem] inline-flex items-center gap-4">
                 <Trophy className="h-6 w-6 text-yellow-500" />
                 <span className="text-3xl font-black tabular-nums">{participantData?.score || 0}</span>
              </div>
            </div>
          ) : (
            <div className="p-14 rounded-[1.5rem] animate-float" style={{ backgroundColor: finalFg, color: finalBg }}><Heart className="h-20 w-20 fill-current" /></div>
          )}

          <div className="w-full mt-12 text-center opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Syncing with stage...</p>
             <p className="text-xl font-bold uppercase tracking-widest">Stand by for next question</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center" style={dynamicStyles}>
      <p className="text-3xl font-black uppercase opacity-30 tracking-widest">Connecting to Pulse...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-8 font-body transition-colors duration-700" style={dynamicStyles}>
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 fill-current" />
            <span className="font-black text-2xl tracking-tighter uppercase">PopPulse*</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-[1rem] bg-black/10">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-black tabular-nums">{participantData?.score || 0}</span>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-3 px-6 py-2 rounded-[1rem] border-2" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
                <Timer className="h-4 w-4" />
                <span className="text-xl font-black tabular-nums">{timeLeft}</span>
              </div>
            )}
          </div>
        </div>

        <main className="space-y-12 flex-1">
          <h2 className="text-5xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase">{currentQuestion.question}</h2>
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="grid gap-4">
              {currentQuestion.options.map((opt, idx) => (
                <Button key={idx} variant="outline" className={cn("h-24 text-xl font-black rounded-[1.5rem] border-2 transition-all active:scale-95 text-left justify-start px-8", selection === idx ? "border-current" : "border-current/20 bg-black/5 hover:bg-black/10")} style={selection === idx ? { backgroundColor: finalFg, color: finalBg, borderColor: finalFg } : { borderColor: finalFg + '33' }} onClick={() => setSelection(idx)}>
                  <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center mr-6 shrink-0 transition-colors border-2 text-lg font-black" style={{ backgroundColor: selection === idx ? finalBg : finalFg, color: selection === idx ? finalFg : finalBg, borderColor: selection === idx ? finalBg : finalFg }}>{String.fromCharCode(65 + idx)}</div>
                  <span className="truncate uppercase">{opt}</span>
                </Button>
              ))}
            </div>
          )}
          {/* ... handle other types ... */}
          <Button disabled={loading || (selection === null && !textValue && ratingValue === 0)} onClick={handleSubmit} className="w-full h-24 text-3xl font-black rounded-[1.5rem] mt-8 uppercase tracking-tighter border-2 shadow-xl active:scale-95" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>{loading ? <Loader2 className="animate-spin h-10 w-10" /> : "Transmit"}</Button>
        </main>
      </div>
    </div>
  );
}
