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
    return query(collection(db, `users/${user.uid}/surveys`), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: polls, isLoading: pollsLoading } = useCollection(pollsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleStartSession = async (questions: PollQuestion[]) => {
    if (!sessionTitle) {
      toast({ variant: "destructive", title: "Title missing", description: "Please give your presentation a name." });
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const sessionRef = doc(collection(db, "sessions"));
      const pollRef = doc(collection(db, `users/${user.uid}/surveys`));

      await setDoc(pollRef, {
        id: pollRef.id,
        userId: user.uid,
        title: sessionTitle,
        createdAt: serverTimestamp(),
      });

      const savedQuestionIds: string[] = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qRef = doc(collection(db, `users/${user.uid}/surveys/${pollRef.id}/questions`));
        
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
      toast({ variant: "destructive", title: "Launch failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = (pollId: string) => {
    if (!user) return;
    const pollRef = doc(db, `users/${user.uid}/surveys/${pollId}`);
    deleteDocumentNonBlocking(pollRef);
    toast({ title: "Survey deleted", description: "The presentation has been removed from your dashboard." });
  };

  const handleLaunchExisting = async (poll: any) => {
    if (!user) return;
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
      const qCol = collection(db, `users/${user.uid}/surveys/${poll.id}/questions`);
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
      toast({ variant: "destructive", title: "Launch failed", description: e.message });
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
        <div className="max-w-[1400px] mx-auto px-6 py-40">
          <div className="flex items-center gap-6 mb-16">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-[1.5rem] h-14 w-14 border-2 shadow-none">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-4xl font-black uppercase tracking-tighter">New Presentation</h1>
          </div>
          
          <div className="bg-white dark:bg-card p-12 rounded-[1.5rem] border-2 mb-12 shadow-none">
            <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 mb-4 block">Survey Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="E.G., QUARTERLY STRATEGY REVIEW"
              className="text-5xl font-black h-24 border-none bg-transparent focus-visible:ring-0 placeholder:opacity-10 shadow-none p-0 uppercase tracking-tighter"
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
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-32 space-y-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-2 border-foreground/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.25rem] bg-primary flex items-center justify-center border-2 border-primary">
                <Zap className="h-8 w-8 text-primary-foreground fill-current" />
              </div>
              <div>
                <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Dashboard</h1>
                <p className="text-xs font-black opacity-40 uppercase tracking-[0.4em] ml-1 mt-2">Manage your presentations</p>
              </div>
            </div>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsCreating(true)}
            className="h-20 px-12 rounded-[1.5rem] text-xl font-black bg-foreground text-background border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all uppercase tracking-tight shadow-none"
          >
            <Plus className="mr-3 h-6 w-6" /> NEW SURVEY
          </Button>
        </div>

        <div className="space-y-12">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 opacity-30" />
            <Input 
              placeholder="SEARCH PRESENTATIONS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-20 pl-16 pr-8 rounded-[1.5rem] border-2 bg-white dark:bg-card focus-visible:ring-0 font-black text-2xl uppercase shadow-none tracking-tight"
            />
          </div>

          {pollsLoading ? (
            <div className="p-40 text-center"><Loader2 className="h-16 w-16 animate-spin mx-auto opacity-10" /></div>
          ) : !filteredPolls || filteredPolls.length === 0 ? (
            <div className="p-40 text-center border-2 border-dashed rounded-[1.5rem] bg-muted/20 space-y-6">
               <Sparkles className="h-16 w-16 mx-auto opacity-10" />
               <p className="text-sm font-black uppercase opacity-30 tracking-[0.5em]">No presentations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredPolls.map((poll) => (
                <div key={poll.id} className="bg-white dark:bg-card p-10 rounded-[1.5rem] border-2 flex flex-col gap-10 group hover:border-primary transition-all shadow-none h-full relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center border-2 shrink-0 bg-muted group-hover:bg-primary/5 transition-colors">
                       <BarChart3 className="h-7 w-7 text-primary" />
                    </div>
                    <Button 
                       variant="ghost" 
                       size="icon"
                       onClick={() => handleDeletePoll(poll.id)}
                       className="h-12 w-12 rounded-[1rem] hover:text-destructive hover:bg-destructive/5 shadow-none transition-colors"
                     >
                       <Trash2 className="h-5 w-5" />
                     </Button>
                  </div>
                  
                  <div className="flex-1 min-h-[5rem]">
                    <p className="text-3xl font-black tracking-tighter uppercase leading-[0.9] line-clamp-3 group-hover:text-primary transition-colors">{poll.title}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t-2 border-foreground/5">
                     <Button 
                       variant="ghost" 
                       onClick={() => handleLaunchExisting(poll)}
                       className="flex-1 h-14 rounded-[1.25rem] font-black uppercase text-xs tracking-widest hover:bg-foreground hover:text-background transition-all shadow-none"
                     >
                       <Play className="h-4 w-4 mr-3 fill-current" /> Launch
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => router.push(`/presenter/edit/${poll.id}`)}
                       className="h-14 w-14 rounded-[1.25rem] font-black uppercase text-xs tracking-widest hover:bg-muted shadow-none p-0 border-2 border-transparent hover:border-foreground/10"
                     >
                       <Edit2 className="h-5 w-5" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}