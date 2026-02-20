
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
      <div className="min-h-screen bg-[#f3f3f1] presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-4xl mx-auto px-6 space-y-12 py-10 pb-40">
          <div className="flex items-center gap-6 mt-32">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-16 w-16 border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all">
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <h1 className="text-7xl font-black uppercase tracking-tighter text-primary">NEW PULSE</h1>
          </div>
          
          <div className="space-y-4">
            <label className="text-[12px] font-black uppercase tracking-[0.5em] opacity-40 ml-4 text-primary">SESSION IDENTITY</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value.toUpperCase())}
              placeholder="E.G. PRODUCT VISION 2025"
              className="text-4xl font-black h-24 border-8 border-primary bg-white rounded-[2rem] px-10 focus-visible:ring-0 uppercase placeholder:opacity-10 text-primary"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f1] presenter-ui flex flex-col font-body">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid lg:grid-cols-12 gap-12 mt-32">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <h1 className="text-9xl font-black uppercase tracking-tighter leading-none text-primary">CONTROL<br />UNIT.</h1>
            <p className="text-2xl font-black opacity-40 uppercase tracking-[0.3em] text-primary">Welcome back, {user.displayName || 'Presenter'}.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
             <Card 
               className="border-8 border-primary rounded-[4rem] bg-primary group hover:bg-primary-foreground transition-all cursor-pointer overflow-hidden active:scale-95"
               onClick={() => setIsCreating(true)}
             >
                <CardContent className="p-12 space-y-8 flex flex-col h-full">
                  <div className="bg-background w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-4 border-primary">
                    <Plus className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-background group-hover:text-primary uppercase tracking-tighter">NEW PULSE</h3>
                    <p className="text-background/60 group-hover:text-primary/60 font-black text-xs uppercase tracking-[0.3em]">START INTERACTION</p>
                  </div>
                </CardContent>
             </Card>

             <Card className="border-8 border-primary rounded-[4rem] bg-white hover:bg-primary/5 transition-all cursor-pointer overflow-hidden active:scale-95">
                <CardContent className="p-12 space-y-8 flex flex-col h-full">
                  <div className="bg-primary w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-4 border-primary">
                    <History className="h-12 w-12 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-primary uppercase tracking-tighter">VAULT</h3>
                    <p className="text-primary/40 font-black text-xs uppercase tracking-[0.3em]">{polls?.length || 0} PREVIOUS PULSES</p>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-8 border-primary rounded-[4rem] bg-white h-fit sticky top-32">
             <CardContent className="p-12 space-y-12">
                <h4 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-primary pb-6 text-primary">VITAL SIGNS</h4>
                <div className="space-y-12">
                  {[
                    { label: "Active Sessions", val: polls?.length || "0", icon: Activity },
                    { label: "Total Insights", val: "1.4K", icon: TrendingUp },
                    { label: "Global Reach", val: "12K+", icon: Users }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 group">
                      <div className="flex items-center gap-6 mb-2">
                        <div className="p-5 bg-primary/5 rounded-[1.5rem] group-hover:bg-primary group-hover:text-background transition-all border-4 border-primary/10">
                          <stat.icon className="h-10 w-10 text-primary group-hover:text-background" />
                        </div>
                        <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40 text-primary">{stat.label}</span>
                      </div>
                      <span className="text-7xl font-black tracking-tighter text-primary">{stat.val}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-primary p-10 rounded-[3rem] border-4 border-primary transition-all">
                   <p className="text-xs font-black uppercase tracking-[0.4em] text-background opacity-60 mb-4">SYSTEM FEEDBACK</p>
                   <p className="text-2xl font-black uppercase leading-tight tracking-tight text-background">Dynamic visualizations are currently peaking.</p>
                </div>
             </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
