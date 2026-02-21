"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Plus, Activity, ArrowLeft, Play, BarChart3, Edit2, Trash2, Search, Zap } from "lucide-react";
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
    if (!confirm("Are you sure you want to remove this interaction? All associated data will be deleted.")) return;

    try {
      const pollRef = doc(db, `users/${user.uid}/polls/${pollId}`);
      await deleteDoc(pollRef);
      toast({ title: "Pulse Deleted", description: "The interaction has been removed from your archive." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed", description: e.message });
    }
  };

  const handleLaunchExisting = async (poll: any) => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
      const qCol = collection(db, `users/${user.uid}/polls/${poll.id}/questions`);
      const qSnap = await getDocs(query(qCol, orderBy("order", "asc")));
      const firstQId = qSnap.docs[0]?.id || null;

      await setDoc(sessionRef, {
        id: sessionRef.id,
        pollId: poll.id,
        userId: user.uid,
        code,
        status: "active",
        currentQuestionId: firstQId,
        theme: poll.theme,
        createdAt: serverTimestamp(),
      });

      router.push(`/presenter/${sessionRef.id}?code=${code}&title=${encodeURIComponent(poll.title)}&theme=${poll.theme}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Launch Failed", description: e.message });
    }
  };

  const filteredPolls = polls?.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isUserLoading || !user) return null;

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#f3f3f1] presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-5xl mx-auto px-6 py-32 pb-40">
          <div className="flex items-center gap-6 mb-12">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-12 w-12 border-4 border-primary text-primary hover:bg-primary hover:text-white transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-0.5">
              <h1 className="text-4xl font-bold uppercase tracking-tight text-primary">New Architecture</h1>
              <p className="text-xs font-semibold opacity-40 uppercase tracking-widest text-primary">Define the field of interaction</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-12 bg-white p-8 rounded-[2rem] border-8 border-primary/10">
            <label className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 ml-4 text-primary">Pulse Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Town Hall Feedback"
              className="text-2xl font-bold h-20 border-none bg-transparent focus-visible:ring-0 uppercase placeholder:opacity-10 text-primary shadow-none"
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
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-24 space-y-12 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <Zap className="h-7 w-7 text-primary fill-primary" />
              <h1 className="text-6xl font-bold uppercase tracking-tight leading-none text-primary">Your Vault.</h1>
            </div>
            <p className="text-lg font-semibold opacity-40 uppercase tracking-[0.2em] text-primary">System Online, {user.displayName?.split(' ')[0] || 'Presenter'}.</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsCreating(true)}
            className="h-16 px-10 rounded-[1.5rem] text-lg font-bold bg-primary text-white border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tight"
          >
            <Plus className="mr-3 h-5 w-5" /> Create Pulse
          </Button>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <h4 className="text-xl font-bold uppercase tracking-tight text-primary opacity-30 shrink-0">Pulse Archives</h4>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-30" />
              <Input 
                placeholder="Filter Archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-14 pr-6 rounded-full border-4 border-primary/10 bg-white focus-visible:ring-0 font-semibold uppercase text-[10px] shadow-none"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {!filteredPolls || filteredPolls.length === 0 ? (
              <div className="p-20 text-center border-4 border-dashed border-primary/10 rounded-[3rem] bg-white/50">
                 <p className="text-xl font-bold uppercase opacity-20 tracking-tight">No Pulses Found in Storage</p>
              </div>
            ) : (
              filteredPolls.map((poll) => (
                <div key={poll.id} className="bg-white p-6 rounded-[2rem] border-4 border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-primary transition-all">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center border-4 shrink-0", `theme-${poll.theme} border-foreground`)}>
                       <BarChart3 className="h-6 w-6 text-foreground" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <p className="text-2xl font-bold uppercase tracking-tight text-primary truncate">{poll.title}</p>
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.1em]">
                        Deployed: {poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                     <Button 
                       variant="ghost" 
                       onClick={() => handleLaunchExisting(poll)}
                       className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest border-4 border-primary/5 hover:border-primary hover:bg-primary/5"
                     >
                       <Play className="h-4 w-4 mr-2" /> Launch
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => router.push(`/presenter/edit/${poll.id}`)}
                       className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest border-4 border-primary/5 hover:border-primary hover:bg-primary/5"
                     >
                       <Edit2 className="h-4 w-4 mr-2" /> Edit
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => handleDeletePoll(poll.id)}
                       className="h-12 w-12 rounded-xl font-bold border-4 border-primary/5 hover:text-destructive hover:border-destructive hover:bg-destructive/5"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}