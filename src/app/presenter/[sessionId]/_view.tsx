
"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Zap, ChevronLeft, ChevronRight, Users, Timer, Loader2, Sparkles, 
  Monitor, Settings2, UserMinus, QrCode, Trophy, Play, Star, BarChart3 
} from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, PollSession, PollParticipant } from "@/app/types/poll";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useResolvedParam } from "@/hooks/use-resolved-param";

// Force dynamic rendering for this page
export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const rawParams = use(params);
  const resolvedParams = { ...rawParams, sessionId: useResolvedParam(rawParams.sessionId, 1) };
  const db = useFirestore();
  const { toast } = useToast();
  
  // Extended logging for debugging
  useEffect(() => {
    console.log('[SessionDisplayPage] Component mounted');
    console.log('[SessionDisplayPage] resolvedParams:', resolvedParams);
    console.log('[SessionDisplayPage] sessionId:', resolvedParams?.sessionId);
    console.log('[SessionDisplayPage] db initialized:', !!db);
    console.log('[SessionDisplayPage] window.location:', typeof window !== 'undefined' ? window.location.href : 'SSR');
  }, [resolvedParams, db]);
  
  const sessionRef = useMemoFirebase(() => {
    const ref = resolvedParams.sessionId ? doc(db, "sessions", resolvedParams.sessionId) : null;
    console.log('[SessionDisplayPage] sessionRef created:', {
      sessionId: resolvedParams.sessionId,
      hasRef: !!ref,
      refPath: ref?.path
    });
    return ref;
  }, [db, resolvedParams.sessionId]);
  
  const { data: session, isLoading: sessionLoading } = useDoc<PollSession>(sessionRef);

  // Log session data for debugging
  useEffect(() => {
    console.log('[SessionDisplayPage] Session data updated:', {
      session,
      isLoading: sessionLoading,
      hasSession: !!session,
      sessionUserId: session?.userId,
      sessionPollId: session?.pollId,
      sessionStatus: session?.status
    });
  }, [session, sessionLoading]);

  const title = session?.title || "Live Presentation";
  const code = session?.code || "---";
  const currentTheme = session?.theme || 'orange';
  const customColor = session?.customColor;

  const questionsQuery = useMemoFirebase(() => {
    const q = (session?.userId && session?.pollId) 
      ? query(collection(db, `users/${session.userId}/surveys/${session.pollId}/questions`), orderBy("order", "asc"))
      : null;
    console.log('[SessionDisplayPage] questionsQuery created:', {
      hasQuery: !!q,
      userId: session?.userId,
      pollId: session?.pollId,
      queryPath: q && session ? `users/${session.userId}/surveys/${session.pollId}/questions` : null
    });
    return q;
  }, [db, session?.userId, session?.pollId]);
  
  const { data: rawQuestions } = useCollection<PollQuestion>(questionsQuery);
  
  // Log questions data for debugging
  useEffect(() => {
    console.log('[SessionDisplayPage] Questions data updated:', {
      rawQuestions,
      questionsCount: rawQuestions?.length || 0
    });
  }, [rawQuestions]);

  const pollRef = useMemoFirebase(() => {
    if (!session?.userId || !session?.pollId) return null;
    return doc(db, `users/${session.userId}/surveys/${session.pollId}`);
  }, [db, session?.userId, session?.pollId]);
  const { data: pollData } = useDoc(pollRef);

  // Shuffle questions once per session if shuffleQuestions is enabled
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);
  useEffect(() => {
    if (rawQuestions && rawQuestions.length > 0 && pollData?.shuffleQuestions && !shuffledOrder) {
      const indices = rawQuestions.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledOrder(indices);
    }
  }, [rawQuestions, pollData?.shuffleQuestions, shuffledOrder]);

  const questions = rawQuestions && shuffledOrder
    ? shuffledOrder.map(i => rawQuestions[i])
    : rawQuestions;

  const responsesQuery = useMemoFirebase(() => {
    if (!resolvedParams.sessionId) return null;
    return collection(db, `sessions/${resolvedParams.sessionId}/responses`);
  }, [db, resolvedParams.sessionId]);
  
  const { data: allResponses } = useCollection(responsesQuery);

  const participantsQuery = useMemoFirebase(() => {
    if (!resolvedParams.sessionId) return null;
    return query(collection(db, `sessions/${resolvedParams.sessionId}/participants`), orderBy("score", "desc"));
  }, [db, resolvedParams.sessionId]);
  
  const { data: participants } = useCollection<PollParticipant>(participantsQuery);

  const reactionsQuery = useMemoFirebase(() => {
    if (!resolvedParams.sessionId) return null;
    return query(
      collection(db, `sessions/${resolvedParams.sessionId}/reactions`),
      orderBy("createdAt", "desc"),
      limit(30)
    );
  }, [db, resolvedParams.sessionId]);
  const { data: rawReactions } = useCollection<{ emoji: string; createdAt: any }>(reactionsQuery);

  // Convert incoming reactions into animated floating items
  type FloatingReaction = { id: string; emoji: string; x: number };
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const seenReactionIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!rawReactions) return;
    rawReactions.forEach((r: any) => {
      if (!seenReactionIds.current.has(r.id)) {
        seenReactionIds.current.add(r.id);
        const item: FloatingReaction = { id: r.id, emoji: r.emoji, x: 10 + Math.random() * 80 };
        setFloatingReactions(prev => [...prev, item]);
        setTimeout(() => setFloatingReactions(prev => prev.filter(f => f.id !== r.id)), 3500);
      }
    });
  }, [rawReactions]);

  const [results, setResults] = useState<Record<string, number>>({});
  const [isQRVisible, setIsQRVisible] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (allResponses && session?.currentQuestionId) {
      const filtered = allResponses.filter(r => r.questionId === session.currentQuestionId);
      const counts: Record<string, number> = {};
      filtered.forEach(r => {
        const val = r.value?.toString();
        if (val !== undefined) counts[val] = (counts[val] || 0) + 1;
      });
      setResults(counts);
    }
  }, [allResponses, session?.currentQuestionId]);

  useEffect(() => {
    if (!session?.currentQuestionId || session.currentQuestionId === 'lobby' || session.currentQuestionId === 'podium' || !questions) return;
    const currentQ = questions.find(q => q.id === session.currentQuestionId);
    
    setShowLeaderboard(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    if (currentQ?.timeLimit && currentQ.timeLimit > 0) {
      setTimeLeft(currentQ.timeLimit);
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.currentQuestionId, questions]);

  // Auto-advance when timer reaches 0 (after 5s delay to show results)
  useEffect(() => {
    if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null; }
    if (timeLeft === 0 && session?.currentQuestionId && session.currentQuestionId !== 'lobby' && session.currentQuestionId !== 'podium' && questions && sessionRef) {
      autoAdvanceRef.current = setTimeout(() => {
        const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
        if (currentIdx < questions.length - 1) {
          updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[currentIdx + 1].id });
        } else {
          updateDocumentNonBlocking(sessionRef, { currentQuestionId: 'podium' });
        }
      }, 5000);
    }
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, [timeLeft, session?.currentQuestionId, questions, sessionRef]);

  // Confetti celebration on podium
  useEffect(() => {
    if (session?.currentQuestionId === 'podium') {
      const loadConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default;
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      };
      loadConfetti();
    }
  }, [session?.currentQuestionId]);

  const handleStartQuiz = () => {
    if (!questions || questions.length === 0 || !sessionRef) return;
    updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[0].id, isStarted: true });
  };

  const handleNext = useCallback(() => {
    if (!questions || !session || !sessionRef) return;
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx < questions.length - 1) {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[currentIdx + 1].id });
    } else {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: 'podium' });
    }
  }, [questions, session, sessionRef]);

  const handlePrev = useCallback(() => {
    if (!questions || !session || !sessionRef) return;
    if (session.currentQuestionId === 'podium') {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[questions.length - 1].id });
      return;
    }
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx > 0) {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[currentIdx - 1].id });
    } else {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: 'lobby' });
    }
  }, [questions, session, sessionRef]);

  const handleEndSession = () => {
    if (!sessionRef) return;
    updateDocumentNonBlocking(sessionRef, { status: 'ended' });
    toast({ title: "Session ended", description: "All participants have been notified." });
  };

  const handleKick = (participantId: string) => {
    if (!resolvedParams.sessionId) return;
    const pRef = doc(db, `sessions/${resolvedParams.sessionId}/participants/${participantId}`);
    updateDocumentNonBlocking(pRef, { status: 'kicked' });
    toast({ title: "Removed", description: "User disconnected." });
  };

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (e.key === 'f' || e.key === 'F') { document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const getContrastColor = (hex: string) => {
    if (!hex) return '#000000';
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  // Debug loading state
  useEffect(() => {
    console.log('[SessionDisplayPage] Loading state:', {
      sessionLoading,
      hasQuestions: !!questions,
      questionsLength: questions?.length,
      shouldShowLoading: sessionLoading || !questions,
      hasSession: !!session,
      sessionUserId: session?.userId,
      sessionPollId: session?.pollId,
      rawQuestionsLength: rawQuestions?.length || 0
    });
  }, [sessionLoading, questions, session, rawQuestions]);

  // Show loading only while session is loading
  // Allow empty questions to proceed (show empty state instead of loading)
  if (sessionLoading) {
    console.log('[SessionDisplayPage] Showing loading screen (session loading)');
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin opacity-20" />
          <p className="text-sm text-muted-foreground">Loading session data...</p>
        </div>
      </div>
    );
  }

  // Show error if no session data
  if (!session) {
    console.log('[SessionDisplayPage] No session data found');
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-2">Session not found</h2>
          <p className="text-muted-foreground mb-4">The session you&apos;re trying to access doesn&apos;t exist or may have been deleted.</p>
          <p className="text-xs text-muted-foreground mb-6">Session ID: {resolvedParams.sessionId}</p>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  let finalBg = '#ffffff';
  if (currentTheme === 'orange') finalBg = '#ff9312';
  else if (currentTheme === 'red') finalBg = '#780c16';
  else if (currentTheme === 'green') finalBg = '#d2e822';
  else if (currentTheme === 'blue') finalBg = '#0d99ff';
  else if (currentTheme === 'minimal-light') finalBg = '#f4f4f5';
  else if (currentTheme === 'minimal-dark') finalBg = '#18181b';
  else if (currentTheme === 'custom' && customColor) finalBg = customColor;

  const finalFg = getContrastColor(finalBg);
  const dynamicStyles = { backgroundColor: finalBg, color: finalFg, borderColor: finalFg + '15' };
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${code}` : '';
  const currentIdx = questions?.findIndex(q => q.id === session?.currentQuestionId) ?? -1;
  const activeParticipants = participants?.filter(p => p.status === 'active') || [];
  const currentQuestion = currentIdx >= 0 && questions && questions.length > 0 ? questions[currentIdx] : null;

  return (
    <div className="no-scroll h-screen w-screen flex flex-col font-body transition-colors duration-700 overflow-hidden" style={dynamicStyles}>
      <header className="h-[12vh] px-8 flex items-center justify-between border-b shrink-0 z-20 bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-4">
          <Zap className="h-7 w-7 fill-current" />
          <h1 className="text-xl font-bold tracking-tight truncate max-w-xl">{title}</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <p className="text-[9px] font-semibold uppercase tracking-widest opacity-40 leading-none mb-1">Session Code</p>
            <p className="text-3xl font-black tracking-tight leading-none">{code}</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 bg-black/5 px-4 py-2 rounded-xl border" style={{ borderColor: finalFg + '10' }}>
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold leading-none">{activeParticipants.length}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 rounded-xl border-2 shadow-xl overflow-hidden" align="end" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <ScrollArea className="h-72">
                <div className="p-2 space-y-1">
                  {activeParticipants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg" style={{ borderBottom: `1px solid ${finalBg}10` }}>
                      <span className="text-sm font-medium truncate pr-4">{p.nickname || "Anonymous"}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleKick(p.id)} className="h-7 w-7 rounded-md hover:bg-black/20" style={{ color: finalBg }}><UserMinus className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Floating emoji reactions */}
        {floatingReactions.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute text-5xl select-none z-50 animate-float-up"
            style={{ left: `${r.x}%`, bottom: '10%' }}
          >
            {r.emoji}
          </span>
        ))}
        {session?.currentQuestionId === 'lobby' ? (
          <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-12 animate-in zoom-in duration-700">
             <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
                <div className="space-y-8">
                   <h2 className="text-5xl font-bold leading-tight" style={{ color: finalFg }}>Join the session.</h2>
                   <div className="space-y-4">
                      <p className="text-base font-medium opacity-50" style={{ color: finalFg }}>Join at your browser · enter the code below</p>
                      <div className="bg-black/10 px-10 py-6 rounded-2xl border-4 inline-block" style={{ borderColor: finalFg }}>
                         <p className="text-7xl font-black tracking-tight" style={{ color: finalFg }}>{code}</p>
                      </div>
                   </div>
                   <Button onClick={handleStartQuiz} className="h-16 px-12 rounded-xl text-xl font-bold gap-4" style={{ backgroundColor: finalFg, color: finalBg }}>
                     {session.isQuiz ? "Start Quiz" : "Start Survey"} <Play className="h-6 w-6 fill-current" aria-hidden="true" />
                   </Button>
                </div>
                <div className="bg-white p-6 rounded-3xl border-4 shadow-xl" style={{ borderColor: finalFg }}>
                   <QRCodeSVG value={joinUrl} size={320} level="H" />
                </div>
             </div>
          </div>
        ) : session?.currentQuestionId === 'podium' ? (
          <div className="w-full max-w-3xl flex flex-col items-center space-y-10 animate-in slide-in-from-bottom-10 duration-700">
             <Trophy className="h-24 w-24 text-yellow-500 animate-bounce" />
             <h2 className="text-6xl font-bold text-center" style={{ color: finalFg }}>Final Results</h2>
             <div className="grid grid-cols-3 gap-6 items-end w-full pt-12">
                <div className="flex flex-col items-center">
                   <div className="w-full h-36 bg-black/20 rounded-t-2xl flex flex-col items-center justify-center border-x-2 border-t-2" style={{ borderColor: finalFg + '33', color: finalFg }}>
                      <p className="text-base font-semibold opacity-40">2nd</p>
                      <p className="text-2xl font-bold truncate px-4">{activeParticipants[1]?.nickname || "---"}</p>
                      <p className="text-lg font-medium">{activeParticipants[1]?.score || 0}</p>
                   </div>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-full h-56 bg-black/40 rounded-t-3xl flex flex-col items-center justify-center border-x-2 border-t-2" style={{ borderColor: finalFg, color: finalFg }}>
                      <Star className="h-8 w-8 text-yellow-400 fill-current mb-3" />
                      <p className="text-base font-semibold opacity-40">1st</p>
                      <p className="text-3xl font-bold truncate px-4">{activeParticipants[0]?.nickname || "---"}</p>
                      <p className="text-2xl font-medium">{activeParticipants[0]?.score || 0}</p>
                   </div>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-full h-24 bg-black/10 rounded-t-2xl flex flex-col items-center justify-center border-x-2 border-t-2" style={{ borderColor: finalFg + '10', color: finalFg }}>
                      <p className="text-base font-semibold opacity-40">3rd</p>
                      <p className="text-xl font-bold truncate px-4">{activeParticipants[2]?.nickname || "---"}</p>
                      <p className="text-base font-medium">{activeParticipants[2]?.score || 0}</p>
                   </div>
                </div>
             </div>
              <div className="flex items-center gap-4 pt-4">
                <Link href={`/presenter/${resolvedParams.sessionId}/stats`}>
                  <Button className="h-12 px-8 rounded-xl font-semibold text-sm gap-2" style={{ backgroundColor: finalFg, color: finalBg }}>
                    <BarChart3 className="h-4 w-4" /> View Statistics
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleEndSession} className="h-12 px-8 rounded-xl font-semibold text-sm border-2" style={{ borderColor: finalFg + '44', color: finalFg, backgroundColor: 'transparent' }}>
                  End Session
                </Button>
              </div>
          </div>
        ) : (
          <div className="w-full max-w-[1600px] h-full flex flex-col gap-6">
            {!showLeaderboard ? (
              <>
                <div className="text-center shrink-0 space-y-4 relative">
                  <div className="flex items-center justify-center gap-5">
                    <div className="px-6 py-3 rounded-xl text-3xl font-bold min-w-[120px] text-center" style={{ backgroundColor: finalFg, color: finalBg }}>{currentIdx + 1} / {questions?.length || 0}</div>
                    <div className="px-5 py-3 rounded-xl border-2 flex items-center gap-2 text-xl font-bold min-w-[120px] justify-center" style={{ borderColor: finalFg + '33', color: finalFg }}>
                      <Users className="h-5 w-5" />
                      <span className="tabular-nums">{allResponses?.filter(r => r.questionId === session?.currentQuestionId).length || 0}</span>
                      <span className="text-sm font-medium opacity-40">/ {activeParticipants.length}</span>
                    </div>
                    {session?.isQuiz && currentQuestion?.isDoublePoints && (
                      <div className="px-6 py-3 rounded-xl text-2xl font-bold bg-yellow-400 text-yellow-900 animate-bounce flex items-center gap-2 min-w-[120px] justify-center">
                        <Zap className="h-6 w-6 fill-current" /> 2× Points
                      </div>
                    )}
                    {timeLeft !== null && (
                      <div className="px-8 py-3 rounded-xl border-4 flex items-center gap-3 animate-in zoom-in duration-500 min-w-[140px] justify-center" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
                        <Timer className="h-7 w-7" />
                        <span className="text-4xl font-black tabular-nums">{timeLeft}</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight max-w-5xl mx-auto" style={{ color: finalFg }}>{currentQuestion?.question}</h2>
                  {currentQuestion?.description && (
                    <p className="text-lg font-medium opacity-50 max-w-3xl mx-auto" style={{ color: finalFg }}>{currentQuestion.description}</p>
                  )}
                </div>
                
                <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row gap-6">
                  {currentQuestion?.imageHint && (
                    <div className="lg:w-1/3 h-full rounded-2xl border-2 overflow-hidden" style={{ borderColor: finalFg + '20' }}>
                       <img 
                        src={`https://picsum.photos/seed/${currentQuestion.imageHint}/1200/900`} 
                        alt="Context" 
                        className="w-full h-full object-cover" 
                       />
                    </div>
                  )}
                  {currentQuestion && (
                  <Card className="flex-1 border-2 rounded-2xl bg-black/5 p-8 flex items-center justify-center overflow-hidden" style={{ borderColor: finalFg + '08' }}>
                    <ResultChart question={currentQuestion} results={results} allResponses={allResponses?.filter(r => r.questionId === session?.currentQuestionId) || []} />
                  </Card>
                )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-10 animate-in zoom-in duration-500">
                 <h2 className="text-4xl font-bold" style={{ color: finalFg }}>Leaderboard</h2>
                 <div className="w-full max-w-2xl space-y-3">
                   {activeParticipants.slice(0, 5).map((p, i) => (
                     <div key={p.id} className="flex items-center gap-5 p-5 rounded-xl border-2" style={{ backgroundColor: i === 0 ? finalFg : finalFg + '10', color: i === 0 ? finalBg : finalFg, borderColor: i === 0 ? finalFg : finalFg + '10' }}>
                       <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl bg-black/10">{i + 1}</div>
                       <span className="flex-1 text-xl font-semibold truncate">{p.nickname || "Anonymous"}</span>
                       <div className="flex flex-col items-end">
                         <span className="text-2xl font-bold tabular-nums">{p.score || 0}</span>
                         {p.streak > 1 && <span className="text-[10px] font-medium opacity-50">🔥 {p.streak}</span>}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="h-[10vh] flex items-center justify-between shrink-0 px-8 border-t bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrev} className="h-12 w-12 rounded-xl border bg-black/5" style={{ borderColor: finalFg + '20', color: finalFg }}><ChevronLeft className="h-6 w-6" /></Button>
          <Button variant="outline" size="icon" onClick={handleNext} className="h-12 w-12 rounded-xl border bg-black/5" style={{ borderColor: finalFg + '20', color: finalFg }}><ChevronRight className="h-6 w-6" /></Button>
          {session?.isQuiz && (
            <Button variant="outline" onClick={() => setShowLeaderboard(!showLeaderboard)} className={cn("h-12 px-6 rounded-xl border font-semibold text-xs gap-2 shadow-none", showLeaderboard ? "bg-yellow-400 text-yellow-900" : "bg-black/5")} style={!showLeaderboard ? { borderColor: finalFg + '20', color: finalFg } : {}}><Trophy className="h-4 w-4" /> Leaderboard</Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl border bg-black/5" style={{ color: finalFg, borderColor: finalFg + '10' }}><Settings2 className="h-6 w-6" /></Button></PopoverTrigger>
            <PopoverContent className="w-72 p-6 rounded-xl border-2 flex flex-col gap-4 shadow-xl" align="end" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <div className="grid gap-3">
                <Button variant="outline" className="w-full h-11 rounded-lg font-medium text-sm" style={{ backgroundColor: finalBg + '10', color: finalBg }} onClick={() => setIsQRVisible(true)}><QrCode className="h-4 w-4 mr-2" /> Show QR Code</Button>
                <Button variant="outline" className="w-full h-11 rounded-lg font-medium text-sm" style={{ backgroundColor: finalBg + '10', color: finalBg }} onClick={() => document.documentElement.requestFullscreen()}><Monitor className="h-4 w-4 mr-2" /> Fullscreen</Button>
                <Link href={`/presenter/${resolvedParams.sessionId}/stats`}>
                  <Button variant="outline" className="w-full h-11 rounded-lg font-medium text-sm" style={{ backgroundColor: finalBg + '10', color: finalBg }}><BarChart3 className="h-4 w-4 mr-2" /> Statistics</Button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </footer>

      <Dialog open={isQRVisible} onOpenChange={setIsQRVisible}>
        <DialogContent className="max-w-md p-8 rounded-2xl border-4 text-center" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
          <div className="bg-white p-4 rounded-xl inline-block">
            <QRCodeSVG value={joinUrl} size={260} level="H" />
          </div>
          <p className="text-4xl font-black tracking-tight mt-6">{code}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
