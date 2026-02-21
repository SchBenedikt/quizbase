"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Plus, Activity, ArrowLeft, Play, BarChart3, Edit2, UserCircle, Trash2, TrendingUp, Users, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc, getDocs, where } from "firebase/firestore";
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
  const [totalSessions, setTotalSessions] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "sessions"), where("userId", "==", user.uid));
      getDocs(q).then(snap => setTotalSessions(snap.size));
    }
  }, [user, db, polls]);

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

  const handleDeletePoll = async (pollId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to decommission this interaction node? All response data will be lost.")) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/polls/${pollId}`));
      toast({ title: "Node Decommissioned", description: "The pulse has been removed from your archive." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed", description: e.message });
    }
  };

  const handleLaunchExisting = (poll: any) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    setDoc(sessionRef, {
      id: sessionRef.id,
      pollId: poll.id,
      userId: user?.uid,
      code,
      status: "active",
      currentQuestionId: null,
      theme: poll.theme,
      createdAt: serverTimestamp(),
    }).then(() => {
      router.push(`/presenter/${sessionRef.id}?code=${code}&title=${encodeURIComponent(poll.title)}&theme=${poll.theme}`);
    });
  };

  const filteredPolls = polls?.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isUserLoading || !user) return null;

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#f3f3f1] presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-5xl mx-auto px-6 py-32 pb-40">
          <div className="flex items-center gap-6 mb-12">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-14 w-14 border-4 border-primary text-primary hover:bg-primary hover:text-white transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-5xl font-black uppercase tracking-tighter text-primary">New Architecture</h1>
              <p className="text-base font-bold opacity-40 uppercase tracking-widest text-primary">Define the field of interaction</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-12 bg-white p-8 rounded-[2.5rem] border-8 border-primary/10">
            <label className="text-sm font-black uppercase tracking-[0.5em] opacity-40 ml-4 text-primary">Pulse Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Town Hall Feedback"
              className="text-3xl font-black h-24 border-none bg-transparent focus-visible:ring-0 uppercase placeholder:opacity-10 text-primary shadow-none"
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
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-24 grid lg:grid-cols-12 gap-12 mt-16">
        <div className="lg:col-span-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-7xl font-black uppercase tracking-tighter leading-none text-primary">Control Unit.</h1>
              <p className="text-xl font-bold opacity-40 uppercase tracking-[0.3em] text-primary">System Online, {user.displayName?.split(' ')[0] || 'Presenter'}.</p>
            </div>
            <Button 
              size="lg" 
              onClick={() => setIsCreating(true)}
              className="h-20 px-10 rounded-[2rem] text-xl font-black bg-primary text-white border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter"
            >
              <Plus className="mr-3 h-6 w-6" /> Create Pulse
            </Button>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <h4 className="text-2xl font-black uppercase tracking-tighter text-primary opacity-30 shrink-0">Pulse Archives</h4>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-30" />
                <Input 
                  placeholder="Filter Archives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-16 pr-6 rounded-full border-4 border-primary/10 bg-white focus-visible:ring-0 font-bold uppercase text-sm shadow-none"
                />
              </div>
            </div>

            <div className="grid gap-6">
              {!filteredPolls || filteredPolls.length === 0 ? (
                <div className="p-24 text-center border-4 border-dashed border-primary/10 rounded-[4rem] bg-white/50">
                   <p className="text-2xl font-black uppercase opacity-20 tracking-tighter">No Pulses Found in Storage</p>
                </div>
              ) : (
                filteredPolls.map((poll) => (
                  <div key={poll.id} className="bg-white p-8 rounded-[3rem] border-4 border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-primary transition-all">
                    <div className="flex items-center gap-8 w-full sm:w-auto">
                      <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-4 shrink-0", `theme-${poll.theme} border-foreground`)}>
                         <BarChart3 className="h-8 w-8 text-foreground" />
                      </div>
                      <div className="space-y-1 truncate">
                        <p className="text-3xl font-black uppercase tracking-tighter text-primary truncate">{poll.title}</p>
                        <p className="text-sm font-black opacity-30 uppercase tracking-[0.2em]">
                          Deployed: {poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Syncing...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                       <Button 
                         variant="ghost" 
                         onClick={() => handleLaunchExisting(poll)}
                         className="h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-widest border-4 border-primary/5 hover:border-primary hover:bg-primary/5"
                       >
                         <Play className="h-4 w-4 mr-2" /> Launch
                       </Button>
                       <Button 
                         variant="ghost" 
                         onClick={() => router.push(`/presenter/edit/${poll.id}`)}
                         className="h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-widest border-4 border-primary/5 hover:border-primary hover:bg-primary/5"
                       >
                         <Edit2 className="h-4 w-4 mr-2" /> Edit
                       </Button>
                       <Button 
                         variant="ghost" 
                         onClick={() => handleDeletePoll(poll.id)}
                         className="h-14 w-14 rounded-2xl font-black border-4 border-primary/5 hover:text-destructive hover:border-destructive hover:bg-destructive/5"
                       >
                         <Trash2 className="h-5 w-5" />
                       </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-8 border-primary rounded-[4rem] bg-white h-fit sticky top-32 shadow-none overflow-hidden">
             <CardContent className="p-12 space-y-16">
                <div className="space-y-2">
                  <h4 className="text-3xl font-black uppercase tracking-tighter text-primary">Live Pulse</h4>
                  <div className="h-2 w-20 bg-primary rounded-full" />
                </div>
                
                <div className="space-y-12">
                  {[
                    { label: "Active Nodes", val: polls?.length || 0, icon: Activity },
                    { label: "Global Energy", val: (polls?.length || 0) * 8 + 14, icon: TrendingUp },
                    { label: "Total Syncs", val: totalSessions, icon: Users }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-4 group">
                      <div className="flex items-center gap-6">
                        <div className="p-5 bg-primary/5 rounded-[1.5rem] border-4 border-primary/5 transition-colors group-hover:bg-primary/10 group-hover:border-primary/20">
                          <stat.icon className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-base font-black uppercase tracking-[0.4em] opacity-40 text-primary">{stat.label}</span>
                      </div>
                      <span className="text-8xl font-black tracking-tighter text-primary leading-none ml-2">{stat.val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t-4 border-primary/5">
                   <div className="flex items-center gap-4 bg-primary/5 p-6 rounded-[2rem]">
                      <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-black uppercase tracking-widest text-primary">System Healthy</span>
                   </div>
                </div>
             </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}