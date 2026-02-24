
"use client";

import { useState, useEffect, use, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Zap, ChevronLeft, ChevronRight, Users, Timer, Loader2, Sparkles, 
  Monitor, Settings2, UserMinus, QrCode, Trophy, Play, Star 
} from "lucide-react";
import { ResultChart } from "@/components/poll/ResultChart";
import { PollQuestion, PollSession, PollParticipant } from "@/app/types/poll";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const { toast } = useToast();
  
  const sessionRef = useMemoFirebase(() => {
    if (!resolvedParams.sessionId) return null;
    return doc(db, "sessions", resolvedParams.sessionId);
  }, [db, resolvedParams.sessionId]);
  
  const { data: session, isLoading: sessionLoading } = useDoc<PollSession>(sessionRef);

  const title = session?.title || "Live Presentation";
  const code = session?.code || "---";
  const currentTheme = session?.theme || 'orange';
  const customColor = session?.customColor;

  const questionsQuery = useMemoFirebase(() => {
    if (!session?.userId || !session?.pollId) return null;
    return query(collection(db, `users/${session.userId}/surveys/${session.pollId}/questions`), orderBy("order", "asc"));
  }, [db, session?.userId, session?.pollId]);
  
  const { data: questions } = useCollection<PollQuestion>(questionsQuery);

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

  const [results, setResults] = useState<Record<string, number>>({});
  const [isQRVisible, setIsQRVisible] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleStartQuiz = () => {
    if (!questions || questions.length === 0 || !sessionRef) return;
    updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[0].id, isStarted: true });
  };

  const handleNext = () => {
    if (!questions || !session || !sessionRef) return;
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId);
    if (currentIdx < questions.length - 1) {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: questions[currentIdx + 1].id });
    } else {
      updateDocumentNonBlocking(sessionRef, { currentQuestionId: 'podium' });
    }
  };

  const handlePrev = () => {
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
  };

  const handleKick = (participantId: string) => {
    if (!resolvedParams.sessionId) return;
    const pRef = doc(db, `sessions/${resolvedParams.sessionId}/participants/${participantId}`);
    updateDocumentNonBlocking(pRef, { status: 'kicked' });
    toast({ title: "Removed", description: "User disconnected." });
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

  if (sessionLoading || !questions) return (
    <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin opacity-20" /></div>
  );

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
  const currentIdx = questions.findIndex(q => q.id === session?.currentQuestionId);
  const activeParticipants = participants?.filter(p => p.status === 'active') || [];
  const currentQuestion = questions[currentIdx];

  return (
    <div className="no-scroll h-screen w-screen flex flex-col font-body transition-colors duration-700 overflow-hidden" style={dynamicStyles}>
      <header className="h-[12vh] px-12 flex items-center justify-between border-b-2 shrink-0 z-20 bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-6">
          <Zap className="h-10 w-10 fill-current" />
          <h1 className="text-2xl font-black tracking-tight truncate max-w-xl uppercase">{title}</h1>
        </div>
        
        <div className="flex items-center gap-12">
          {timeLeft !== null && session?.currentQuestionId !== 'lobby' && (
            <div className="flex items-center gap-4 px-8 py-3 rounded-[1.25rem] border-4 animate-pulse" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <Timer className="h-6 w-6" />
              <span className="text-4xl font-black tabular-nums">{timeLeft}</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 leading-none mb-1">Session Code</p>
            <p className="text-5xl font-black tracking-tighter leading-none">{code}</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-4 bg-black/5 px-6 py-3 rounded-[1.25rem] border-2" style={{ borderColor: finalFg + '10' }}>
                <Users className="h-6 w-6" />
                <span className="text-3xl font-black leading-none">{activeParticipants.length}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-[2rem] border-2 shadow-2xl overflow-hidden" align="end" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <ScrollArea className="h-80">
                <div className="p-2 space-y-1">
                  {activeParticipants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-[1rem]" style={{ borderBottom: `1px solid ${finalBg}10` }}>
                      <span className="text-sm font-bold uppercase truncate pr-4">{p.nickname || "Anonymous"}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleKick(p.id)} className="h-8 w-8 rounded-[0.5rem] hover:bg-black/20" style={{ color: finalBg }}><UserMinus className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-12 flex flex-col items-center justify-center relative overflow-hidden">
        {session?.currentQuestionId === 'lobby' ? (
          <div className="w-full max-w-6xl flex flex-col items-center justify-center space-y-16 animate-in zoom-in duration-1000">
             <div className="grid lg:grid-cols-2 gap-20 items-center w-full">
                <div className="space-y-12">
                   <h2 className="text-8xl font-black uppercase leading-[0.8] tracking-tighter">Join the <br />Pulse.</h2>
                   <div className="space-y-6">
                      <p className="text-xl font-bold opacity-60 uppercase tracking-widest">Connect at poppulse.studio/join</p>
                      <div className="bg-black/10 p-12 rounded-[3rem] border-8 inline-block" style={{ borderColor: finalFg }}>
                         <p className="text-9xl font-black tracking-tighter">{code}</p>
                      </div>
                   </div>
                   <Button onClick={handleStartQuiz} className="h-28 px-20 rounded-[2rem] text-4xl font-black uppercase tracking-tighter gap-6 shadow-2xl" style={{ backgroundColor: finalFg, color: finalBg }}>Start Quiz <Play className="h-10 w-10 fill-current" /></Button>
                </div>
                <div className="bg-white p-12 rounded-[4rem] border-[12px] shadow-2xl" style={{ borderColor: finalFg }}>
                   <QRCodeSVG value={joinUrl} size={400} level="H" />
                </div>
             </div>
          </div>
        ) : session?.currentQuestionId === 'podium' ? (
          <div className="w-full max-w-4xl flex flex-col items-center space-y-16 animate-in slide-in-from-bottom-10 duration-1000">
             <Trophy className="h-40 w-40 text-yellow-500 animate-bounce" />
             <h2 className="text-9xl font-black uppercase tracking-tighter text-center">Champions.</h2>
             <div className="grid grid-cols-3 gap-8 items-end w-full pt-20">
                <div className="flex flex-col items-center space-y-6">
                   <div className="w-full h-48 bg-black/20 rounded-t-[2rem] flex flex-col items-center justify-center border-x-4 border-t-4" style={{ borderColor: finalFg + '33' }}>
                      <p className="text-xl font-black opacity-40 uppercase">2nd</p>
                      <p className="text-3xl font-black uppercase truncate px-4">{activeParticipants[1]?.nickname || "---"}</p>
                      <p className="text-xl font-bold">{activeParticipants[1]?.score || 0}</p>
                   </div>
                </div>
                <div className="flex flex-col items-center space-y-6">
                   <div className="w-full h-80 bg-black/40 rounded-t-[3rem] flex flex-col items-center justify-center border-x-4 border-t-4" style={{ borderColor: finalFg }}>
                      <Star className="h-10 w-10 text-yellow-400 fill-current mb-4" />
                      <p className="text-2xl font-black opacity-40 uppercase">1st</p>
                      <p className="text-5xl font-black uppercase truncate px-4">{activeParticipants[0]?.nickname || "---"}</p>
                      <p className="text-3xl font-bold">{activeParticipants[0]?.score || 0}</p>
                   </div>
                </div>
                <div className="flex flex-col items-center space-y-6">
                   <div className="w-full h-32 bg-black/10 rounded-t-[2rem] flex flex-col items-center justify-center border-x-4 border-t-4" style={{ borderColor: finalFg + '10' }}>
                      <p className="text-xl font-black opacity-40 uppercase">3rd</p>
                      <p className="text-2xl font-black uppercase truncate px-4">{activeParticipants[2]?.nickname || "---"}</p>
                      <p className="text-lg font-bold">{activeParticipants[2]?.score || 0}</p>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="w-full max-w-[1600px] h-full flex flex-col gap-6">
            {!showLeaderboard ? (
              <>
                <div className="text-center shrink-0 space-y-6">
                  <div className="flex items-center justify-center gap-6">
                    <div className="px-10 py-4 rounded-[1.5rem] text-4xl font-black uppercase tracking-[0.2em] shadow-xl" style={{ backgroundColor: finalFg, color: finalBg }}>{currentIdx + 1} / {questions.length}</div>
                    {currentQuestion?.isDoublePoints && (
                      <div className="px-10 py-4 rounded-[1.5rem] text-4xl font-black uppercase tracking-[0.2em] bg-yellow-400 text-yellow-900 animate-bounce flex items-center gap-3">
                        <Zap className="h-6 w-6 fill-current" /> 2X Points
                      </div>
                    )}
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter max-w-6xl mx-auto uppercase">{currentQuestion?.question}</h2>
                </div>
                
                <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row gap-8">
                  {currentQuestion?.imageHint && (
                    <div className="lg:w-1/3 h-full rounded-[3rem] border-4 overflow-hidden shadow-2xl" style={{ borderColor: finalFg + '20' }}>
                       <img 
                        src={`https://picsum.photos/seed/${currentQuestion.imageHint}/1200/900`} 
                        alt="Context" 
                        className="w-full h-full object-cover" 
                       />
                    </div>
                  )}
                  <Card className="flex-1 border-4 rounded-[3rem] bg-black/5 p-12 flex items-center justify-center overflow-hidden" style={{ borderColor: finalFg + '08' }}>
                    <ResultChart question={currentQuestion} results={results} allResponses={allResponses?.filter(r => r.questionId === session?.currentQuestionId) || []} />
                  </Card>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-16 animate-in zoom-in duration-700">
                 <h2 className="text-7xl font-black uppercase tracking-tighter">Leaderboard.</h2>
                 <div className="w-full max-w-3xl space-y-4">
                   {activeParticipants.slice(0, 5).map((p, i) => (
                     <div key={p.id} className="flex items-center gap-6 p-6 rounded-[2rem] border-4" style={{ backgroundColor: i === 0 ? finalFg : finalFg + '10', color: i === 0 ? finalBg : finalFg, borderColor: i === 0 ? finalFg : finalFg + '10' }}>
                       <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center font-black text-2xl bg-black/10">{i + 1}</div>
                       <span className="flex-1 text-3xl font-black uppercase truncate">{p.nickname || "Anonymous"}</span>
                       <div className="flex flex-col items-end">
                         <span className="text-4xl font-black tracking-tight tabular-nums">{p.score || 0}</span>
                         {p.streak > 1 && <span className="text-[10px] font-black uppercase text-primary">🔥 {p.streak} Streak</span>}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="h-[10vh] flex items-center justify-between shrink-0 px-12 border-t-2 bg-black/5" style={{ borderColor: finalFg + '15' }}>
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" onClick={handlePrev} className="h-14 w-14 rounded-[1.25rem] border-2 bg-black/5" style={{ borderColor: finalFg + '20', color: finalFg }}><ChevronLeft className="h-7 w-7" /></Button>
          <Button variant="outline" size="icon" onClick={handleNext} className="h-14 w-14 rounded-[1.25rem] border-2 bg-black/5" style={{ borderColor: finalFg + '20', color: finalFg }}><ChevronRight className="h-7 w-7" /></Button>
          <Button variant="outline" onClick={() => setShowLeaderboard(!showLeaderboard)} className={cn("h-14 px-8 rounded-[1.25rem] border-2 font-black uppercase text-xs tracking-widest gap-3 shadow-none", showLeaderboard ? "bg-yellow-400 text-yellow-900" : "bg-black/5")} style={!showLeaderboard ? { borderColor: finalFg + '20', color: finalFg } : {}}><Trophy className="h-5 w-5" /> Leaderboard</Button>
        </div>
        <div className="flex items-center gap-6">
          <Popover>
            <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-14 w-14 rounded-[1.25rem] border-2 bg-black/5" style={{ color: finalFg, borderColor: finalFg + '10' }}><Settings2 className="h-7 w-7" /></Button></PopoverTrigger>
            <PopoverContent className="w-80 p-8 rounded-[2rem] border-2 flex flex-col gap-6 shadow-2xl" align="end" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
              <div className="grid gap-3">
                <Button variant="outline" className="w-full h-12 rounded-[1rem] font-black uppercase text-[10px]" style={{ backgroundColor: finalBg + '10', color: finalBg }} onClick={() => setIsQRVisible(true)}><QrCode className="h-4 w-4 mr-2" /> QR Access</Button>
                <Button variant="outline" className="w-full h-12 rounded-[1rem] font-black uppercase text-[10px]" style={{ backgroundColor: finalBg + '10', color: finalBg }} onClick={() => document.documentElement.requestFullscreen()}><Monitor className="h-4 w-4 mr-2" /> Fullscreen</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </footer>

      <Dialog open={isQRVisible} onOpenChange={setIsQRVisible}>
        <DialogContent className="max-w-xl p-8 rounded-[3rem] border-4 text-center" style={{ backgroundColor: finalFg, color: finalBg, borderColor: finalFg }}>
          <QRCodeSVG value={joinUrl} size={300} level="H" className="mx-auto bg-white p-4 rounded-[2rem]" />
          <p className="text-6xl font-black tracking-tighter mt-8">{code}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
