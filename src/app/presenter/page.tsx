"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion } from "@/app/types/poll";
import { Plus, ArrowLeft, Play, BarChart3, Edit2, Trash2, Search, Zap, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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

  const { data: polls, isLoading: pollsLoading } = useCollection(pollsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleStartSession = async (questions: PollQuestion[]) => {
    if (!sessionTitle) {
      toast({ variant: "destructive", title: "Required", description: "Give your pulse a name." });
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
        createdAt: serverTimestamp(),
      });

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
        
        if (q.options) qData.options = q.options;

        await setDoc(qRef, qData);
        savedQuestionIds.push(qRef.id);
      }

      await setDoc(sessionRef, {
        id: sessionRef.id,
        pollId: pollRef.id,
        userId: user.uid,
        code,
        status: "active",
        currentQuestionId: savedQuestionIds[0] || null,
        createdAt: serverTimestamp(),
      });

      router.push(`/presenter/${sessionRef.id}?code=${code}&title=${encodeURIComponent(sessionTitle)}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = (pollId: string) => {
    if (!user) return;
    const pollRef = doc(db, `users/${user.uid}/polls/${pollId}`);
    deleteDocumentNonBlocking(pollRef);
    toast({ title: "Pulse Removed", description: "The poll has been deleted." });
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
        createdAt: serverTimestamp(),
      });

      router.push(`/presenter/${sessionRef.id}?code=${code}&title=${encodeURIComponent(poll.title)}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    }
  };

  const filteredPolls = polls?.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isUserLoading || !user) return null;

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-4xl mx-auto px-6 py-32">
          <div className="flex items-center gap-6 mb-12">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-12 w-12 border">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Create Pulse</h1>
          </div>
          
          <div className="bg-card p-8 rounded-3xl border mb-8">
            <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Pulse Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Workshop Vibe"
              className="text-2xl font-bold h-16 border-none bg-transparent focus-visible:ring-0 placeholder:opacity-10 shadow-none p-0 mt-2"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background presenter-ui flex flex-col font-body">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-24 space-y-12 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <Zap className="h-8 w-8 text-primary fill-primary" />
              <h1 className="text-4xl font-bold tracking-tight">Vault</h1>
            </div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.3em]">System Online.</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsCreating(true)}
            className="h-16 px-10 rounded-2xl text-md font-bold bg-primary text-primary-foreground border-none hover:opacity-90 transition-all uppercase tracking-tight"
          >
            <Plus className="mr-3 h-5 w-5" /> New Pulse
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
              <Input 
                placeholder="Search your pulse vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-14 pr-6 rounded-xl border-2 bg-card focus-visible:ring-1 font-medium text-md shadow-none"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {pollsLoading ? (
              <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-20" /></div>
            ) : !filteredPolls || filteredPolls.length === 0 ? (
              <div className="p-24 text-center border-4 border-dashed rounded-[3rem] bg-card/50">
                 <p className="text-sm font-bold uppercase opacity-20 tracking-widest">No pulses found</p>
              </div>
            ) : (
              filteredPolls.map((poll) => (
                <div key={poll.id} className="bg-card p-6 rounded-[2.5rem] border flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 bg-muted">
                       <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1 truncate">
                      <p className="text-xl font-bold tracking-tight truncate">{poll.title}</p>
                      <p className="text-xs font-bold opacity-30 uppercase tracking-[0.1em]">
                        Created {poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Today'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                     <Button 
                       variant="ghost" 
                       onClick={() => handleLaunchExisting(poll)}
                       className="h-12 px-6 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-primary/10 text-primary"
                     >
                       <Play className="h-5 w-5 mr-3" /> Launch
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => router.push(`/presenter/edit/${poll.id}`)}
                       className="h-12 px-6 rounded-xl font-bold uppercase text-[11px] tracking-widest"
                     >
                       <Edit2 className="h-5 w-5 mr-3" /> Edit
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="icon"
                       onClick={() => handleDeletePoll(poll.id)}
                       className="h-12 w-12 rounded-xl hover:text-destructive hover:bg-destructive/10"
                     >
                       <Trash2 className="h-5 w-5" />
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