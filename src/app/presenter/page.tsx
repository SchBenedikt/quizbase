
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Zap, ArrowLeft, Plus, History, TrendingUp, Users, Activity, LogOut } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase";

export default function PresenterPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoize query for user's polls
  const pollsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/polls`), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: polls } = useCollection(pollsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleStartSession = async (questions: PollQuestion[], theme: AppTheme) => {
    if (!sessionTitle) {
      alert("Please enter a session title");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const sessionRef = doc(collection(db, "sessions"));
      const sessionId = sessionRef.id;

      // 1. Create the Poll record
      const pollRef = doc(collection(db, `users/${user.uid}/polls`));
      await setDoc(pollRef, {
        id: pollRef.id,
        userId: user.uid,
        title: sessionTitle,
        theme,
        createdAt: serverTimestamp(),
      });

      // 2. Create questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qRef = doc(collection(db, `users/${user.uid}/polls/${pollRef.id}/questions`));
        await setDoc(qRef, {
          ...q,
          id: qRef.id,
          pollId: pollRef.id,
          order: i,
        });
      }

      // 3. Create the Session
      await setDoc(sessionRef, {
        id: sessionId,
        pollId: pollRef.id,
        userId: user.uid,
        code,
        status: "active",
        currentQuestionId: questions[0]?.id || null,
        theme,
        createdAt: serverTimestamp(),
      });

      router.push(`/presenter/${sessionId}?code=${code}&title=${encodeURIComponent(sessionTitle)}&theme=${theme}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !user) return null;

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#f3f3f1] presenter-ui">
        <Header variant="minimal" />
        <div className="max-w-4xl mx-auto px-6 space-y-12 py-10 pb-40">
          <div className="flex items-center gap-6 mt-20">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-16 w-16 border-4 border-foreground">
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <h1 className="text-6xl font-black uppercase tracking-tighter">NEW PULSE</h1>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-4">SESSION TITLE</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value.toUpperCase())}
              placeholder="E.G. Q4 STRATEGY SYNC"
              className="text-4xl font-black h-24 border-8 border-foreground bg-white rounded-[2rem] px-10 focus-visible:ring-0 uppercase placeholder:opacity-10"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f1] presenter-ui flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid lg:grid-cols-12 gap-12 mt-20">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none">COMMAND<br />CENTER.</h1>
            <p className="text-2xl font-black opacity-40 uppercase tracking-[0.3em]">Ready to lead, {user.displayName || 'Presenter'}.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <Card 
               className="border-8 border-foreground rounded-[4rem] bg-primary group hover:bg-foreground transition-all cursor-pointer overflow-hidden active:scale-95"
               onClick={() => setIsCreating(true)}
             >
                <CardContent className="p-12 space-y-8 flex flex-col h-full">
                  <div className="bg-background w-24 h-24 rounded-[2.5rem] flex items-center justify-center">
                    <Plus className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-background uppercase tracking-tighter">NEW PULSE</h3>
                    <p className="text-background/60 font-black text-xs uppercase tracking-[0.3em]">Ignite interaction now</p>
                  </div>
                </CardContent>
             </Card>

             <Card className="border-8 border-foreground rounded-[4rem] bg-white hover:bg-muted/10 transition-all cursor-pointer overflow-hidden active:scale-95">
                <CardContent className="p-12 space-y-8 flex flex-col h-full">
                  <div className="bg-foreground w-24 h-24 rounded-[2.5rem] flex items-center justify-center">
                    <History className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-foreground uppercase tracking-tighter">HISTORY</h3>
                    <p className="text-foreground/40 font-black text-xs uppercase tracking-[0.3em]">Access previous pulses ({polls?.length || 0})</p>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-8 border-foreground rounded-[4rem] bg-white h-fit sticky top-32">
             <CardContent className="p-12 space-y-12">
                <h4 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-foreground pb-6">STATISTICS</h4>
                <div className="space-y-10">
                  {[
                    { label: "Total Sessions", val: polls?.length || "0", icon: Activity },
                    { label: "Total Captures", val: "1.4K", icon: TrendingUp },
                    { label: "Global Users", val: "12K+", icon: Users }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-foreground/5 rounded-[1.5rem] group-hover:bg-primary group-hover:text-background transition-all">
                          <stat.icon className="h-8 w-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</span>
                      </div>
                      <span className="text-5xl font-black tracking-tighter">{stat.val}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/10 p-10 rounded-[3rem] border-4 border-primary/20 transition-all hover:bg-primary/20">
                   <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-4">Pro Insight</p>
                   <p className="text-2xl font-black uppercase leading-tight tracking-tight">Active visuals increase engagement by 40%.</p>
                </div>
             </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
