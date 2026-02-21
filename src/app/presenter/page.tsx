"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion } from "@/app/types/poll";
import { Plus, ArrowLeft, Play, BarChart3, Edit2, Trash2, Search, Zap, Loader2, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
      toast({ variant: "destructive", title: "Missing Identity", description: "Give your pulse a name." });
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
        theme: 'orange'
      });

      router.push(`/presenter/${sessionRef.id}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transmission Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = (pollId: string) => {
    if (!user) return;
    const pollRef = doc(db, `users/${user.uid}/polls/${pollId}`);
    deleteDocumentNonBlocking(pollRef);
    toast({ title: "Pulse Erased", description: "Document removed from vault." });
  };

  const handleLaunchExisting = async (poll: any) => {
    if (!user) return;
    setLoading(true);
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
        theme: 'orange'
      });

      router.push(`/presenter/${sessionRef.id}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Launch Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredPolls = polls?.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isUserLoading || !user) return null;

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background presenter-ui font-body">
        <Header variant="minimal" />
        <div className="max-w-4xl mx-auto px-6 py-40">
          <div className="flex items-center gap-6 mb-16">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-14 w-14 border-2 shadow-none">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Create Pulse</h1>
          </div>
          
          <div className="bg-white p-12 rounded-[2.5rem] border-2 mb-12 shadow-none">
            <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 mb-4 block">Identity Signature</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Q1 STRATEGY VIBE"
              className="text-4xl font-black h-24 border-none bg-transparent focus-visible:ring-0 placeholder:opacity-10 shadow-none p-0 uppercase"
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
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-32 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center border-2 border-primary">
                <Zap className="h-8 w-8 text-primary-foreground fill-current" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase">Vault</h1>
            </div>
            <p className="text-xs font-black opacity-40 uppercase tracking-widest ml-2">Secure Pulse Repository</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsCreating(true)}
            className="h-20 px-12 rounded-2xl text-lg font-black bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tight shadow-none"
          >
            <Plus className="mr-3 h-6 w-6" /> NEW PULSE
          </Button>
        </div>

        <div className="space-y-8">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 opacity-30" />
            <Input 
              placeholder="Search pulse archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-16 pl-16 pr-8 rounded-xl border-2 bg-white focus-visible:ring-0 font-bold text-lg shadow-none"
            />
          </div>

          <div className="grid gap-6">
            {pollsLoading ? (
              <div className="p-32 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto opacity-20" /></div>
            ) : !filteredPolls || filteredPolls.length === 0 ? (
              <div className="p-40 text-center border-2 border-dashed rounded-[3rem] bg-muted/30 space-y-4">
                 <Sparkles className="h-12 w-12 mx-auto opacity-10" />
                 <p className="text-sm font-black uppercase opacity-30 tracking-widest">No pulses archived</p>
              </div>
            ) : (
              filteredPolls.map((poll) => (
                <div key={poll.id} className="bg-white p-8 rounded-[2rem] border-2 flex flex-col sm:flex-row items-center justify-between gap-8 group hover:border-primary transition-all shadow-none">
                  <div className="flex items-center gap-8 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center border-2 shrink-0 bg-muted group-hover:bg-primary/5 transition-colors">
                       <BarChart3 className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-1 truncate">
                      <p className="text-2xl font-black tracking-tighter truncate uppercase leading-tight">{poll.title}</p>
                      <p className="text-xs font-black opacity-40 uppercase tracking-widest">
                        Sync: {poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                     <Button 
                       variant="ghost" 
                       onClick={() => handleLaunchExisting(poll)}
                       className="h-12 px-6 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-none"
                     >
                       <Play className="h-4 w-4 mr-2 fill-current" /> Launch
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => router.push(`/presenter/edit/${poll.id}`)}
                       className="h-12 px-6 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-muted shadow-none"
                     >
                       <Edit2 className="h-4 w-4 mr-2" /> Edit
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="icon"
                       onClick={() => handleDeletePoll(poll.id)}
                       className="h-12 w-12 rounded-xl hover:text-destructive hover:bg-destructive/10 shadow-none"
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
