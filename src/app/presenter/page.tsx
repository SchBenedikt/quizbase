"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Plus, History, TrendingUp, Users, Activity, ArrowLeft, Play, BarChart3, MoreVertical, Edit2, UserCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function PresenterPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(false);

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
      toast({ variant: "destructive", title: "Missing Title", description: "Please enter a title for your pulse." });
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const sessionRef = doc(collection(db, "sessions"));
      const pollRef = doc(collection(db, `users/${user.uid}/polls`));

      await setDoc(pollRef, {
        id: pollRef.id,
        userId: user.uid,
        title: sessionTitle,
        theme,
        createdAt: serverTimestamp(),
      });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qRef = doc(collection(db, `users/${user.uid}/polls/${pollRef.id}/questions`));
        await setDoc(qRef, { ...q, id: qRef.id, pollId: pollRef.id, order: i });
      }

      await setDoc(sessionRef, {
        id: sessionRef.id,
        pollId: pollRef.id,
        userId: user.uid,
        code,
        status: "active",
        currentQuestionId: questions[0]?.id || null,
        theme,
        createdAt: serverTimestamp(),
      });

      router.push(`/presenter/${sessionRef.id}?code=${code}&title=${encodeURIComponent(sessionTitle)}&theme=${theme}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Launch Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchExisting = (poll: any) => {
    router.push(`/presenter/launch/${poll.id}`);
  };

  const handleEditPoll = (pollId: string) => {
    router.push(`/presenter/edit/${pollId}`);
  };

  if (isUserLoading || !user) return null;

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#f3f3f1] presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-5xl mx-auto px-6 py-12 pb-40">
          <div className="flex items-center gap-6 mt-32 mb-12">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-14 w-14 border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-5xl font-black uppercase tracking-tighter text-primary">New Architecture</h1>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-primary">Initialize your interactive field</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-12">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-4 text-primary">Pulse Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Quarterly Strategy Sync"
              className="text-3xl font-black h-20 border-8 border-primary bg-white rounded-[2rem] px-10 focus-visible:ring-0 uppercase placeholder:opacity-10 text-primary shadow-none"
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
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none text-primary">Control Unit.</h1>
            <p className="text-lg font-bold opacity-40 uppercase tracking-[0.3em] text-primary">System Ready, {user.displayName?.split(' ')[0] || 'Presenter'}.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <Card 
               className="border-8 border-primary rounded-[4rem] bg-primary group hover:bg-primary/95 transition-all cursor-pointer overflow-hidden active:scale-95 shadow-none"
               onClick={() => setIsCreating(true)}
             >
                <CardContent className="p-10 space-y-10 flex flex-col h-full">
                  <div className="bg-background w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-4 border-primary">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-background uppercase tracking-tighter">New Pulse</h3>
                    <p className="text-background/60 font-black text-[10px] uppercase tracking-[0.4em]">Initialize Interaction</p>
                  </div>
                </CardContent>
             </Card>

             <Card 
               className="border-8 border-primary rounded-[4rem] bg-white hover:bg-primary/5 transition-all cursor-pointer overflow-hidden active:scale-95 shadow-none"
               onClick={() => router.push('/profile')}
             >
                <CardContent className="p-10 space-y-10 flex flex-col h-full">
                  <div className="bg-primary w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-4 border-primary">
                    <UserCircle className="h-8 w-8 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-primary uppercase tracking-tighter">Profile</h3>
                    <p className="text-primary/40 font-black text-[10px] uppercase tracking-[0.4em]">Manage Identity</p>
                  </div>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h4 className="text-2xl font-black uppercase tracking-tighter text-primary opacity-30">Pulse Archives</h4>
            </div>
            <div className="grid gap-6">
              {polls?.length === 0 ? (
                <div className="p-20 text-center border-4 border-dashed border-primary/10 rounded-[4rem]">
                   <p className="text-2xl font-black uppercase opacity-20 tracking-tighter">No Pulses Initialized Yet</p>
                </div>
              ) : (
                polls?.map((poll) => (
                  <div key={poll.id} className="bg-white p-8 rounded-[2.5rem] border-4 border-primary/10 flex items-center justify-between group hover:border-primary transition-all">
                    <div className="flex items-center gap-8">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-4", `theme-${poll.theme} border-foreground`)}>
                         <BarChart3 className="h-6 w-6 text-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-black uppercase tracking-tighter text-primary">{poll.title}</p>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">
                          {poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Syncing...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button 
                         variant="ghost" 
                         onClick={() => handleLaunchExisting(poll)}
                         className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-primary/10 hover:border-primary"
                       >
                         <Play className="h-3 w-3 mr-2" /> Launch
                       </Button>
                       <Button 
                         variant="ghost" 
                         onClick={() => handleEditPoll(poll.id)}
                         className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-primary/10 hover:border-primary"
                       >
                         <Edit2 className="h-3 w-3 mr-2" /> Edit
                       </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-8 border-primary rounded-[4rem] bg-white h-fit sticky top-32 shadow-none">
             <CardContent className="p-10 space-y-12">
                <h4 className="text-3xl font-black uppercase tracking-tighter border-b-8 border-primary pb-4 text-primary">Live Pulse</h4>
                <div className="space-y-12">
                  {[
                    { label: "Active Nodes", val: polls?.length || 0, icon: Activity },
                    { label: "Global Energy", val: "1.2k", icon: TrendingUp },
                    { label: "Total Syncs", val: "840", icon: Users }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 group">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/5 rounded-[1.2rem] border-4 border-primary/10 transition-colors group-hover:bg-primary/10">
                          <stat.icon className="h-7 w-7 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-primary">{stat.label}</span>
                      </div>
                      <span className="text-7xl font-black tracking-tighter text-primary">{stat.val}</span>
                    </div>
                  ))}
                </div>
             </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}