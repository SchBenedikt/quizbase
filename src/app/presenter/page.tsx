"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Plus, ArrowLeft, Play, BarChart3, Edit2, Trash2, Search, Zap, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc, getDocs } from "firebase/firestore";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pollsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/polls`), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: polls, isLoading: pollsLoading } = useCollection(pollsQuery);

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

      // Save Poll Meta
      await setDoc(pollRef, {
        id: pollRef.id,
        userId: user.uid,
        title: sessionTitle,
        theme,
        createdAt: serverTimestamp(),
      });

      // Save Questions - Cleanly handle undefined fields for Firestore
      const savedQuestionIds: string[] = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qRef = doc(collection(db, `users/${user.uid}/polls/${pollRef.id}/questions`));
        
        const qData: any = {
          id: qRef.id,
          pollId: pollRef.id,
          type: q.type,
          question: q.question,
          order: i,
          createdAt: q.createdAt || Date.now()
        };
        
        // Only include optional fields if they exist
        if (q.options) qData.options = q.options;
        if (q.range) qData.range = q.range;

        await setDoc(qRef, qData);
        savedQuestionIds.push(qRef.id);
      }

      // Create Active Session
      await setDoc(sessionRef, {
        id: sessionRef.id,
        pollId: pollRef.id,
        userId: user.uid,
        code,
        status: "active",
        currentQuestionId: savedQuestionIds[0] || null,
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
    setDeletingId(pollId);
    try {
      const pollRef = doc(db, `users/${user.uid}/polls/${pollId}`);
      await deleteDoc(pollRef);
      toast({ title: "Poll Removed", description: "The poll has been deleted from your vault." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: e.message });
    } finally {
      setDeletingId(null);
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
      <div className="min-h-screen bg-muted presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-4xl mx-auto px-6 py-32">
          <div className="flex items-center gap-6 mb-12">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-12 w-12 border border-foreground/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Create Pulse</h1>
          </div>
          
          <div className="bg-card p-8 rounded-3xl border border-border mb-8">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Pulse Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Product Feedback"
              className="text-2xl font-bold h-16 border-none bg-transparent focus-visible:ring-0 placeholder:opacity-10 shadow-none p-0 mt-2"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted presenter-ui flex flex-col font-body">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-24 space-y-12 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-6 w-6 text-primary fill-primary" />
              <h1 className="text-4xl font-bold tracking-tight">Vault</h1>
            </div>
            <p className="text-sm font-medium opacity-40 uppercase tracking-widest">System Online, {user.displayName?.split(' ')[0] || 'Presenter'}</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsCreating(true)}
            className="h-14 px-8 rounded-2xl text-md font-bold bg-primary text-primary-foreground border-none hover:opacity-90 transition-all uppercase tracking-tight"
          >
            <Plus className="mr-2 h-5 w-5" /> New Pulse
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
              <Input 
                placeholder="Search pulses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-11 pr-4 rounded-xl border border-border bg-card focus-visible:ring-1 font-medium text-sm shadow-none"
              />
            </div>
          </div>

          <div className="grid gap-3">
            {pollsLoading ? (
              <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
            ) : !filteredPolls || filteredPolls.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-border rounded-3xl bg-card/50">
                 <p className="text-sm font-bold uppercase opacity-20 tracking-widest">No pulses found</p>
              </div>
            ) : (
              filteredPolls.map((poll) => (
                <div key={poll.id} className="bg-card p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border-2 shrink-0", `theme-${poll.theme} border-foreground`)}>
                       <BarChart3 className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <p className="text-lg font-bold tracking-tight truncate">{poll.title}</p>
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-wider">
                        {poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                     <Button 
                       variant="ghost" 
                       onClick={() => handleLaunchExisting(poll)}
                       className="h-10 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10"
                     >
                       <Play className="h-4 w-4 mr-2" /> Launch
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => router.push(`/presenter/edit/${poll.id}`)}
                       className="h-10 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-foreground/5"
                     >
                       <Edit2 className="h-4 w-4 mr-2" /> Edit
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="icon"
                       disabled={deletingId === poll.id}
                       onClick={() => handleDeletePoll(poll.id)}
                       className="h-10 w-10 rounded-xl hover:text-destructive hover:bg-destructive/5"
                     >
                       {deletingId === poll.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
