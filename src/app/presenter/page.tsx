
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
      toast({ variant: "destructive", title: "Title missing", description: "Please give your survey a name." });
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
    toast({ title: "Survey deleted", description: "The survey has been removed from your dashboard." });
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
            <h1 className="text-4xl font-black uppercase tracking-tighter">Create New Survey</h1>
          </div>
          
          <div className="bg-white dark:bg-card p-12 rounded-[1.5rem] border-2 mb-12 shadow-none">
            <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2 mb-4 block">Survey Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g., Annual Strategy Review"
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
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-32 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center border-2 border-primary">
                <Zap className="h-8 w-8 text-primary-foreground fill-current" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase">Dashboard</h1>
            </div>
            <p className="text-xs font-black opacity-40 uppercase tracking-widest ml-2">Manage your surveys</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsCreating(true)}
            className="h-20 px-12 rounded-[1.5rem] text-lg font-black bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tight shadow-none"
          >
            <Plus className="mr-3 h-6 w-6" /> NEW SURVEY
          </Button>
        </div>

        <div className="space-y-8">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 opacity-30" />
            <Input 
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-16 pl-16 pr-8 rounded-[1.5rem] border-2 bg-white dark:bg-card focus-visible:ring-0 font-bold text-lg shadow-none"
            />
          </div>

          {pollsLoading ? (
            <div className="p-32 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto opacity-20" /></div>
          ) : !filteredPolls || filteredPolls.length === 0 ? (
            <div className="p-40 text-center border-2 border-dashed rounded-[1.5rem] bg-muted/30 space-y-4">
               <Sparkles className="h-12 w-12 mx-auto opacity-10" />
               <p className="text-sm font-black uppercase opacity-30 tracking-widest">No surveys found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPolls.map((poll) => (
                <div key={poll.id} className="bg-white dark:bg-card p-8 rounded-[1.5rem] border-2 flex flex-col gap-6 group hover:border-primary transition-all shadow-none h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center border-2 shrink-0 bg-muted group-hover:bg-primary/5 transition-colors">
                       <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <Button 
                       variant="ghost" 
                       size="icon"
                       onClick={() => handleDeletePoll(poll.id)}
                       className="h-10 w-10 rounded-[1rem] hover:text-destructive hover:bg-destructive/10 shadow-none -mt-2 -mr-2"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                  
                  <div className="space-y-1 flex-1 min-h-[4rem]">
                    <p className="text-2xl font-black tracking-tighter uppercase leading-tight line-clamp-2">{poll.title}</p>
                    <p className="text-xs font-black opacity-40 uppercase tracking-widest">
                      Created on: {poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString('en-US') : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t-2 border-foreground/5">
                     <Button 
                       variant="ghost" 
                       onClick={() => handleLaunchExisting(poll)}
                       className="flex-1 h-12 rounded-[1rem] font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-none"
                     >
                       <Play className="h-4 w-4 mr-2 fill-current" /> Launch
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => router.push(`/presenter/edit/${poll.id}`)}
                       className="h-12 w-12 rounded-[1rem] font-black uppercase text-xs tracking-widest hover:bg-muted shadow-none p-0"
                     >
                       <Edit2 className="h-4 w-4" />
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
