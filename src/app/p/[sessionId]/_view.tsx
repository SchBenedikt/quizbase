
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
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { useAuth } from "@/firebase/provider";
import { useResolvedParam } from "@/hooks/use-resolved-param";

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '🎉'];
const REACTION_COOLDOWN_MS = 1000;

export default function ParticipantView({ params }: { params: Promise<{ sessionId: string }> }) {
  const rawParams = use(params);
  const resolvedParams = { ...rawParams, sessionId: useResolvedParam(rawParams.sessionId, 1) };
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

  const allParticipantsQuery = useMemoFirebase(() => {
    if (!session?.id) return null;
    return query(collection(db, `sessions/${session.id}/participants`), where("status", "==", "active"));
  }, [db, session?.id]);
  const { data: allParticipants } = useCollection<PollParticipant>(allParticipantsQuery);

  const responsesQuery = useMemoFirebase(() => {
    if (!session?.id || !user?.uid) return null;
    return query(
      collection(db, `sessions/${session.id}/responses`),
      where("userId", "==", user.uid),
      where("questionId", "==", session.currentQuestionId),
      limit(1)
    );
  }, [db, session?.id, session?.currentQuestionId, user?.uid]);

  const { data: userResponses } = useCollection(responsesQuery);
  
  // Check if user has already voted for current question
  const hasVotedForCurrentQuestion = userResponses && userResponses.length > 0;

  const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(null);
  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);
  const [rankingOrder, setRankingOrder] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isSettingNickname, setIsSettingNickname] = useState(true);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [reactionCooldown, setReactionCooldown] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleReaction = (emoji: string) => {
    if (!session?.id || reactionCooldown) return;
    setReactionCooldown(true);
    const reactionsCol = collection(db, `sessions/${session.id}/reactions`);
    addDocumentNonBlocking(reactionsCol, {
      emoji,
      userId: user?.uid || 'anon',
      createdAt: serverTimestamp(),
    });
    setTimeout(() => setReactionCooldown(false), REACTION_COOLDOWN_MS);
  };

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
        streak: participantData?.streak || 0,
        joinedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [session?.id, user?.uid, isSettingNickname, nickname, db]);

  // Update voted state when user responses change
  useEffect(() => {
    setVoted(hasVotedForCurrentQuestion || false);
  }, [hasVotedForCurrentQuestion]);

  useEffect(() => {
    if (session?.currentQuestionId && session.currentQuestionId !== 'lobby' && session.currentQuestionId !== 'podium' && session.userId && session.pollId) {
      const fetchQ = async () => {
        try {
          const qRef = doc(db, `users/${session.userId}/surveys/${session.pollId}/questions/${session.currentQuestionId}`);
          const snap = await getDoc(qRef);
          if (snap.exists()) {
            const qData = { ...snap.data(), id: snap.id } as PollQuestion;
            setCurrentQuestion(qData);
            // Set voted state based on whether user has already voted for this question
            setVoted(hasVotedForCurrentQuestion || false);
            setSelection(null);
            setTextValue("");
            setRatingValue(0);
            setRankingOrder([]);
            setSliderValue(qData.range?.min ?? 0);
            setLastCorrect(null);
            setPointsEarned(0);
            
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

  const isAnswerMissing = (): boolean => {
    if (!currentQuestion) return true;
    const type = currentQuestion.type;
    if (type === 'multiple-choice' || type === 'true-false') return selection === null;
    if (type === 'word-cloud' || type === 'open-text' || type === 'guess-number') return !textValue.trim();
    if (type === 'rating') return ratingValue === 0;
    if (type === 'ranking') return rankingOrder.length !== (currentQuestion.options?.length ?? 0);
    // slider and scale always have a value
    return false;
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !session || voted || hasVotedForCurrentQuestion || (timeLeft === 0 && currentQuestion.timeLimit)) return;
    setLoading(true);
    
    let value: any = "";
    let isCorrect = false;

    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
      value = selection;
      if (currentQuestion.correctOptionIndices && selection !== null) {
        isCorrect = currentQuestion.correctOptionIndices.includes(selection);
      }
    }
    if (currentQuestion.type === 'guess-number') {
      value = parseFloat(textValue) || 0;
      if (currentQuestion.correctAnswer !== undefined) {
        isCorrect = value === currentQuestion.correctAnswer;
      }
    }
    if (currentQuestion.type === 'word-cloud') value = textValue.trim().toUpperCase();
    if (currentQuestion.type === 'open-text') value = textValue.trim();
    if (currentQuestion.type === 'slider' || currentQuestion.type === 'scale') value = sliderValue;
    if (currentQuestion.type === 'rating') value = ratingValue;
    if (currentQuestion.type === 'ranking') value = rankingOrder;

    const responseCol = collection(db, `sessions/${session.id}/responses`);
    addDocumentNonBlocking(responseCol, {
      sessionId: session.id,
      questionId: currentQuestion.id,
      value,
      userId: user?.uid || 'anon', 
      createdAt: serverTimestamp(),
    });

    // Only calculate and update score in quiz mode
    if (session.isQuiz && participantRef) {
      if (isCorrect) {
        const baseScore = 500;
        const timeBonus = (currentQuestion.timeLimit && timeLeft) ? Math.round((timeLeft / currentQuestion.timeLimit) * 500) : 0;
        const multiplier = currentQuestion.isDoublePoints ? 2 : 1;
        const currentStreak = participantData?.streak || 0;
        const streakBonus = Math.min(currentStreak * 100, 500);
        
        const totalPoints = (baseScore + timeBonus) * multiplier + streakBonus;
        
        updateDoc(participantRef, { 
          score: increment(totalPoints),
          streak: increment(1)
        });
        setPointsEarned(totalPoints);
      } else if (currentQuestion.type === 'multiple-choice') {
        updateDoc(participantRef, { streak: 0 });
      }
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
      <Loader2 className="h-8 w-8 animate-spin text-foreground opacity-30" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background space-y-6">
      <h1 className="text-2xl font-bold opacity-30">Session not found</h1>
      <Button onClick={() => window.location.href = '/join'} className="h-12 px-8 rounded-lg">Back to Join</Button>
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
  const isQuizMode = !!session.isQuiz;

  if (participantData?.status === 'kicked') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background space-y-6">
      <ShieldAlert className="h-10 w-10 text-destructive" />
      <h1 className="text-2xl font-bold">Disconnected</h1>
      <Button onClick={() => window.location.href = '/join'} className="h-11 rounded-lg font-medium px-8">Back to Join</Button>
    </div>
  );

  if (isSettingNickname) return (
    <div className="min-h-screen flex flex-col p-6 transition-colors duration-700 font-body" style={dynamicStyles}>
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col items-center justify-center space-y-8">
         <header className="text-center space-y-4">
           <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto border-2" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <User className="h-8 w-8" />
           </div>
           <h1 className="text-3xl font-bold">Choose a nickname</h1>
         </header>
         <div className="w-full space-y-4">
           <Input 
             value={nickname} 
             onChange={(e) => setNickname(e.target.value)} 
             onKeyDown={(e) => e.key === 'Enter' && setIsSettingNickname(false)}
             placeholder="Your nickname..." 
             maxLength={20} 
             className="h-14 text-xl font-medium text-center rounded-lg border-2 bg-black/10 focus-visible:ring-0 placeholder:opacity-30" 
             style={{ borderColor: finalFg + '44', color: finalFg }} 
           />
           <Button 
             onClick={() => setIsSettingNickname(false)} 
             className="w-full h-14 text-base font-semibold rounded-lg border-2 transition-all" 
             style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
           >
             Enter <Zap className="ml-2 h-4 w-4 fill-current" />
           </Button>
         </div>
      </div>
    </div>
  );

  if (session.currentQuestionId === 'podium') {
    const sorted = [...(allParticipants || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const myRank = sorted.findIndex(p => p.id === user?.uid) + 1;
    const totalP = sorted.length;

    return (
      <div className="min-h-screen flex flex-col p-6 transition-colors duration-700 font-body items-center justify-center" style={dynamicStyles}>
        <div className="space-y-6 text-center max-w-sm w-full">
          <Trophy className="h-16 w-16 mx-auto animate-bounce text-yellow-500" />
          <h1 className="text-4xl font-bold">Session finished!</h1>
          {isQuizMode && (
            <>
              <div className="bg-black/10 px-8 py-6 rounded-lg" style={{ borderColor: finalFg + '33' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-40">Your score</p>
                <p className="text-5xl font-black tabular-nums">{participantData?.score || 0}</p>
              </div>
              {myRank > 0 && (
                <div className="bg-black/10 px-6 py-4 rounded-lg">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1 opacity-40">Your rank</p>
                  <p className="text-3xl font-bold">#{myRank} <span className="text-base font-medium opacity-50">of {totalP}</span></p>
                </div>
              )}
              {/* Top 3 mini-leaderboard */}
              {sorted.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-40">Top Players</p>
                  {sorted.slice(0, 3).map((p, i) => (
                    <div key={p.id} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg", p.id === user?.uid ? "border-2" : "bg-black/5")} style={p.id === user?.uid ? { borderColor: finalFg } : {}}>
                      <span className="text-sm font-bold w-6">{i + 1}.</span>
                      <span className="flex-1 text-sm font-semibold truncate text-left">{p.nickname || "Anonymous"}</span>
                      <span className="text-sm font-bold tabular-nums">{p.score || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <Button 
            onClick={() => window.location.href = '/join'} 
            className="h-12 px-10 rounded-lg font-semibold" 
            style={{ backgroundColor: finalFg, color: finalBg }}
          >
            Join another session
          </Button>
        </div>
      </div>
    );
  }

  if (session.currentQuestionId === 'lobby') return (
    <div className="min-h-screen flex flex-col p-6 transition-colors duration-700 font-body items-center justify-center" style={dynamicStyles}>
      <div className="space-y-6 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-lg border-2 flex items-center justify-center mx-auto animate-pulse" style={{ borderColor: finalFg }}>
          <Zap className="h-8 w-8 fill-current" />
        </div>
        <h1 className="text-3xl font-bold">You're in!</h1>
        <p className="text-base font-medium opacity-50">Waiting for the host to start...</p>
        <div className="mt-4 bg-black/10 px-6 py-3 rounded-full font-semibold text-base">
          {nickname || "Anonymous"}
        </div>
      </div>
    </div>
  );

  if (voted || (timeLeft === 0 && currentQuestion?.timeLimit)) {
    const hasCorrectAnswers = currentQuestion?.type === 'multiple-choice' && 
      currentQuestion.correctOptionIndices && 
      currentQuestion.correctOptionIndices.length > 0;
    const showQuizResult = isQuizMode && hasCorrectAnswers;
    
    return (
      <div className="min-h-screen flex flex-col p-6 transition-colors duration-700" style={dynamicStyles}>
        <div className="max-w-sm mx-auto w-full flex-1 flex flex-col items-center justify-center text-center space-y-8">
          {timeLeft === 0 && !voted ? (
            <div className="space-y-4">
               <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto bg-amber-500 border-2 border-amber-600"><Clock className="h-8 w-8 text-white" /></div>
               <h1 className="text-3xl font-bold">Time's up!</h1>
               <p className="text-base font-medium opacity-40">Your answer was not submitted in time.</p>
            </div>
          ) : showQuizResult ? (
            <div className="space-y-6">
              <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center mx-auto border-2", lastCorrect ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600")}>
                {lastCorrect ? <CheckCircle2 className="h-8 w-8 text-white" /> : <XCircle className="h-8 w-8 text-white" />}
              </div>
              <h1 className="text-3xl font-bold">{lastCorrect ? "Correct!" : "Not quite!"}</h1>
              
              {/* Show correct answer for incorrect answers */}
              {!lastCorrect && (
                <div className="space-y-3">
                  <p className="text-lg font-medium opacity-70">The correct answer was:</p>
                  {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false' ? (
                    <div className="bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <p className="text-xl font-bold text-green-700 dark:text-green-400">
                        {currentQuestion.correctOptionIndices?.map(idx => currentQuestion.options?.[idx]).join(', ')}
                      </p>
                    </div>
                  ) : currentQuestion.type === 'guess-number' && currentQuestion.correctAnswer !== undefined ? (
                    <div className="bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <p className="text-3xl font-bold text-green-700 dark:text-green-400 text-center">
                        {currentQuestion.correctAnswer}
                      </p>
                    </div>
                  ) : null}
                  
                  {/* Show user's answer for comparison */}
                  <div className="bg-muted/50 px-4 py-2 rounded-lg text-center">
                    <p className="text-sm opacity-60">Your answer:</p>
                    <p className="font-semibold">
                      {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false' 
                        ? currentQuestion.options?.[selection ?? -1] || 'Not selected'
                        : currentQuestion.type === 'guess-number'
                        ? textValue || 'No answer'
                        : 'No answer'
                      }
                    </p>
                  </div>
                </div>
              )}
              
              {lastCorrect && (
                <div className="bg-black/10 px-6 py-4 rounded-lg flex flex-col items-center gap-1">
                   <div className="flex items-center gap-3">
                     <Trophy className="h-5 w-5 text-yellow-500" />
                     <span className="text-2xl font-bold tabular-nums">+{pointsEarned}</span>
                   </div>
                   {(participantData?.streak ?? 0) > 1 && (
                     <span className="text-xs font-medium opacity-60">🔥 {participantData?.streak} streak bonus</span>
                   )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-10 rounded-lg" style={{ backgroundColor: finalFg, color: finalBg }}>
                <Heart className="h-12 w-12 fill-current" />
              </div>
              <h1 className="text-2xl font-bold">Response sent!</h1>
            </div>
          )}

          <p className="text-sm font-medium opacity-30">Waiting for next question...</p>
        </div>
        {/* Live Reactions bar */}
        <div className="shrink-0 px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: finalFg + '18' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-30">React</p>
          <div className="flex gap-2">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                disabled={reactionCooldown}
                className="text-2xl transition-all active:scale-75 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={`Send ${emoji} reaction`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center" style={dynamicStyles}>
      <p className="text-lg font-medium opacity-30">Connecting...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-6 font-body transition-colors duration-700" style={dynamicStyles}>
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 fill-current" />
            <span className="font-bold text-sm">Quizbase</span>
          </div>
          {isQuizMode && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/10">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-bold tabular-nums text-sm">{participantData?.score || 0}</span>
              {(participantData?.streak ?? 0) > 0 && (
                <span className="text-xs">🔥 {participantData?.streak}</span>
              )}
            </div>
          )}
        </div>

        <main className="space-y-6 flex-1">
          {/* Image Display */}
          {(currentQuestion.imageUrl || currentQuestion.imageHint) && (
            <div className="aspect-[4/3] rounded-lg border-2 overflow-hidden bg-black/5" style={{ borderColor: finalFg + '33' }}>
              {currentQuestion.imageUrl ? (
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question image" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    // Fallback to imageHint if imageUrl fails
                    if (currentQuestion.imageHint) {
                      e.currentTarget.src = `https://picsum.photos/seed/${currentQuestion.imageHint}/800/600`;
                    }
                  }}
                />
              ) : (
                <img 
                  src={`https://picsum.photos/seed/${currentQuestion.imageHint}/800/600`} 
                  alt="Question context" 
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
          )}

          {/* Question */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {isQuizMode && currentQuestion.isDoublePoints && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <Zap className="h-3 w-3 fill-current" /> 2× Points
                  </div>
                )}
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">{currentQuestion.question}</h2>
                {currentQuestion.description && (
                  <p className="text-sm font-medium opacity-50">{currentQuestion.description}</p>
                )}
              </div>
              {timeLeft !== null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 shrink-0" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
                  <Timer className="h-4 w-4" />
                  <span className="text-lg font-bold tabular-nums">{timeLeft}</span>
                </div>
              )}
            </div>
          </div>

          {/* Multiple choice */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="grid gap-3">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelection(idx)}
                  className={cn(
                    "w-full h-14 rounded-lg border-2 flex items-center px-4 gap-3 transition-all active:scale-[0.98] text-left",
                    selection === idx ? "border-current" : "border-current/20 bg-black/5 hover:bg-black/10"
                  )}
                  style={selection === idx ? { backgroundColor: finalFg, color: finalBg, borderColor: finalFg } : { borderColor: finalFg + '33' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-sm font-bold transition-colors"
                    style={{ 
                      backgroundColor: selection === idx ? finalBg : 'transparent', 
                      color: finalFg, 
                      borderColor: selection === idx ? finalBg : finalFg + '55' 
                    }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-medium text-base">{opt}</span>
                </button>
              ))}
            </div>
          )}

          {/* True / False */}
          {currentQuestion.type === 'true-false' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'True', icon: '✓', idx: 0 },
                { label: 'False', icon: '✗', idx: 1 },
              ].map(({ label, icon, idx }) => (
                <button
                  key={idx}
                  onClick={() => setSelection(idx)}
                  className={cn(
                    "h-24 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.97] font-bold text-2xl",
                    selection === idx ? "border-current" : "border-current/20 bg-black/5 hover:bg-black/10"
                  )}
                  style={selection === idx ? { backgroundColor: finalFg, color: finalBg, borderColor: finalFg } : { borderColor: finalFg + '33' }}
                >
                  <span className="text-3xl">{icon}</span>
                  <span className="text-base font-semibold">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Ranking */}
          {currentQuestion.type === 'ranking' && currentQuestion.options && (
            <div className="space-y-3">
              <p className="text-xs font-medium opacity-40 uppercase tracking-wider">
                Tap options in your preferred order ({rankingOrder.length}/{currentQuestion.options.length} ranked)
              </p>
              <div className="grid gap-2">
                {currentQuestion.options.map((opt, idx) => {
                  const rankPos = rankingOrder.indexOf(idx);
                  const isRanked = rankPos !== -1;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isRanked) {
                          setRankingOrder(rankingOrder.filter(i => i !== idx));
                        } else {
                          setRankingOrder([...rankingOrder, idx]);
                        }
                      }}
                      className={cn(
                        "w-full h-14 rounded-lg border-2 flex items-center px-4 gap-3 transition-all active:scale-[0.98] text-left",
                        isRanked ? "border-current" : "border-current/20 bg-black/5 hover:bg-black/10"
                      )}
                      style={isRanked ? { backgroundColor: finalFg, color: finalBg, borderColor: finalFg } : { borderColor: finalFg + '33' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-sm font-bold"
                        style={{
                          backgroundColor: isRanked ? finalBg : 'transparent',
                          color: finalFg,
                          borderColor: isRanked ? finalBg : finalFg + '55',
                        }}
                      >
                        {isRanked ? rankPos + 1 : '–'}
                      </div>
                      <span className="font-medium text-base">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Word cloud */}
          {currentQuestion.type === 'word-cloud' && (
            <div className="space-y-2">
              <p className="text-xs font-medium opacity-40 uppercase tracking-wider">One word</p>
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value.replace(/\s+/g, '').toUpperCase())}
                placeholder="ONE WORD..."
                maxLength={30}
                className="w-full h-16 px-5 rounded-lg border-2 bg-black/10 text-2xl font-bold text-center tracking-widest placeholder:opacity-20 focus:outline-none focus:bg-black/20 transition-colors uppercase"
                style={{ borderColor: finalFg + '44', color: finalFg }}
              />
            </div>
          )}

          {/* Open text */}
          {currentQuestion.type === 'open-text' && (
            <div className="space-y-2">
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Your answer..."
                maxLength={300}
                rows={4}
                className="w-full px-5 py-4 rounded-lg border-2 bg-black/10 text-base font-medium placeholder:opacity-30 focus:outline-none focus:bg-black/20 transition-colors resize-none"
                style={{ borderColor: finalFg + '44', color: finalFg }}
              />
            </div>
          )}

          {/* Guess number */}
          {currentQuestion.type === 'guess-number' && (
            <div className="space-y-2">
              <p className="text-xs font-medium opacity-40 uppercase tracking-wider">
                Range: {currentQuestion.range?.min ?? 0} – {currentQuestion.range?.max ?? 100}
              </p>
              <input
                type="number"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={`${currentQuestion.range?.min ?? 0}`}
                min={currentQuestion.range?.min ?? 0}
                max={currentQuestion.range?.max ?? 100}
                className="w-full h-16 px-5 rounded-lg border-2 bg-black/10 text-3xl font-bold text-center placeholder:opacity-20 focus:outline-none focus:bg-black/20 transition-colors"
                style={{ borderColor: finalFg + '44', color: finalFg }}
              />
            </div>
          )}

          {/* Slider */}
          {(currentQuestion.type === 'slider' || currentQuestion.type === 'scale') && (
            <div className="space-y-6 py-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium opacity-50">
                  {currentQuestion.labels?.min || (currentQuestion.range?.min ?? 0)}
                </span>
                <span className="text-4xl font-bold tabular-nums">{sliderValue}</span>
                <span className="text-sm font-medium opacity-50">
                  {currentQuestion.labels?.max || (currentQuestion.range?.max ?? 100)}
                </span>
              </div>
              <input
                type="range"
                min={currentQuestion.range?.min ?? 0}
                max={currentQuestion.range?.max ?? 100}
                step={currentQuestion.range?.step ?? 1}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: finalFg }}
              />
            </div>
          )}

          {/* Rating (Stars) */}
          {currentQuestion.type === 'rating' && (
            <div className="flex items-center justify-center gap-4 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="transition-all active:scale-90 hover:scale-110"
                  style={{ color: finalFg }}
                >
                  <Star className={cn("h-12 w-12 transition-all", ratingValue >= star ? "fill-current" : "opacity-20")} />
                </button>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            disabled={loading || voted || hasVotedForCurrentQuestion || isAnswerMissing() || (timeLeft === 0 && !!currentQuestion.timeLimit)}
            onClick={handleSubmit}
            className="w-full h-14 text-base font-semibold rounded-lg mt-2 border-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Submit"}
          </button>
        </main>

        {/* Live Reactions bar */}
        <div className="shrink-0 px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: finalFg + '18' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-30">React</p>
          <div className="flex gap-2">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                disabled={reactionCooldown}
                className="text-2xl transition-all active:scale-75 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={`Send ${emoji} reaction`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

