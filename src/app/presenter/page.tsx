
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Plus, History, TrendingUp, Users, Activity, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function PresenterPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time fetch of user's polls
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
      alert("Please enter a session identity first.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const sessionRef = doc(collection(db, "sessions"));
      const sessionId = sessionRef.id;

      const pollRef = doc(collection(db, `users/${user.uid}/polls`));
      await setDoc(pollRef, {
        id: pollRef.id,
        userId: user.uid,
        title: sessionTitle,
        theme,
        createdAt: serverTimestamp(),
      });

      // Save each question to the poll subcollection
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

      // Initialize the live session
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
      console.error("Failed to launch session:", e);
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !user) return null;

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#f3f3f1] presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-5xl mx-auto px-6 py-10 pb-40">
          <div className="flex items-center gap-6 mt-32 mb-12">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCreating(false)} 
              className="rounded-full h-16 w-16 border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all"
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-6xl font-black uppercase tracking-tighter text-primary">New Architecture</h1>
              <p className="text-sm font-bold opacity-40 uppercase tracking-widest text-primary">Design your interactive energy field</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-12">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-4 text-primary">Pulse Identity</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Quarterly Strategic Alignment"
              className="text-4xl font-black h-24 border-8 border-primary bg-white rounded-[2rem] px-10 focus-visible:ring-0 uppercase placeholder:opacity-10 text-primary shadow-none"
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
            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none text-primary">Control Unit.</h1>
            <p className="text-xl font-bold opacity-40 uppercase tracking-[0.3em] text-primary">Ready for pulse, {user.displayName?.split(' ')[0] || 'Presenter'}.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <Card 
               className="border-8 border-primary rounded-[4rem] bg-primary group hover:bg-primary/90 transition-all cursor-pointer overflow-hidden active:scale-95 shadow-none"
               onClick={() => setIsCreating(true)}
             >
                <CardContent className="p-10 space-y-8 flex flex-col h-full">
                  <div className="bg-background w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 border-primary">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-background uppercase tracking-tighter">New Pulse</h3>
                    <p className="text-background/60 font-black text-[10px] uppercase tracking-[0.4em]">Initialize Interaction</p>
                  </div>
                </CardContent>
             </Card>

             <Card className="border-8 border-primary rounded-[4rem] bg-white hover:bg-primary/5 transition-all cursor-pointer overflow-hidden active:scale-95 shadow-none">
                <CardContent className="p-10 space-y-8 flex flex-col h-full">
                  <div className="bg-primary w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 border-primary">
                    <History className="h-10 w-10 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-primary uppercase tracking-tighter">Vault</h3>
                    <p className="text-primary/40 font-black text-[10px] uppercase tracking-[0.4em]">{polls?.length || 0} Stored Sessions</p>
                  </div>
                </CardContent>
             </Card>
          </div>

          {/* Recent Activity List */}
          <div className="space-y-6">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-primary opacity-30">Recent Activity</h4>
            <div className="grid gap-4">
              {polls?.slice(0, 3).map((poll) => (
                <div key={poll.id} className="bg-white p-8 rounded-[2.5rem] border-4 border-primary/10 flex items-center justify-between group hover:border-primary transition-all">
                  <div className="space-y-1">
                    <p className="text-2xl font-black uppercase tracking-tighter">{poll.title}</p>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{new Date(poll.createdAt?.toDate()).toLocaleDateString()}</p>
                  </div>
                  <div className={cn("px-6 py-2 rounded-full font-black text-xs uppercase border-2", `theme-${poll.theme}`)}>
                    {poll.theme}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-8 border-primary rounded-[4rem] bg-white h-fit sticky top-32 shadow-none">
             <CardContent className="p-10 space-y-10">
                <h4 className="text-3xl font-black uppercase tracking-tighter border-b-8 border-primary pb-4 text-primary">Live Pulse</h4>
                <div className="space-y-10">
                  {[
                    { label: "Active Nodes", val: polls?.length || "0", icon: Activity },
                    { label: "Total Energy", val: "1.4k", icon: TrendingUp },
                    { label: "Global Sync", val: "12k+", icon: Users }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-1 group">
                      <div className="flex items-center gap-4 mb-1">
                        <div className="p-4 bg-primary/5 rounded-[1.2rem] border-4 border-primary/10">
                          <stat.icon className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-primary">{stat.label}</span>
                      </div>
                      <span className="text-6xl font-black tracking-tighter text-primary">{stat.val}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-primary p-8 rounded-[2.5rem] border-4 border-primary">
                   <p className="text-[8px] font-black uppercase tracking-[0.4em] text-background opacity-60 mb-2">System Vitals</p>
                   <p className="text-lg font-black uppercase leading-tight text-background">Visual core running at peak efficiency.</p>
                </div>
             </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
