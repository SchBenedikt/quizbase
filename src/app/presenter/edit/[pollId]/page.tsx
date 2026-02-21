"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion } from "@/app/types/poll";
import { ArrowLeft, Loader2, Save, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, query, orderBy, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function EditPollPage({ params }: { params: Promise<{ pollId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const pollRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, `users/${user.uid}/surveys/${resolvedParams.pollId}`);
  }, [user, db, resolvedParams.pollId]);

  const { data: poll, isLoading: pollLoading } = useDoc(pollRef);

  const questionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/surveys/${resolvedParams.pollId}/questions`), orderBy("order", "asc"));
  }, [user, db, resolvedParams.pollId]);

  const { data: initialQuestions } = useCollection<PollQuestion>(questionsQuery);

  const [sessionTitle, setSessionTitle] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState<PollQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  useEffect(() => {
    if (poll) {
      setSessionTitle(poll.title);
    }
  }, [poll]);

  useEffect(() => {
    if (initialQuestions) {
      setCurrentQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const performSave = useCallback(async (questionsToSave: PollQuestion[], titleToSave: string) => {
    if (!titleToSave || !user || !pollRef) return;
    
    try {
      await setDoc(pollRef, { title: titleToSave, updatedAt: serverTimestamp() }, { merge: true });

      const qCol = collection(db, `users/${user.uid}/surveys/${resolvedParams.pollId}/questions`);
      const batch = writeBatch(db);
      
      for (let i = 0; i < questionsToSave.length; i++) {
        const q = questionsToSave[i];
        const qRef = doc(qCol, q.id);
        
        const qData: any = {
          id: q.id,
          pollId: resolvedParams.pollId,
          type: q.type,
          question: q.question,
          order: i,
          createdAt: q.createdAt || Date.now()
        };

        if (q.options) qData.options = q.options;
        if (q.range) qData.range = q.range;

        batch.set(qRef, qData, { merge: true });
      }
      
      await batch.commit();
      setLastSaved(Date.now());
    } catch (e: any) {
      console.error("Autosave failed:", e);
    }
  }, [user, pollRef, db, resolvedParams.pollId]);

  // Debounced Autosave
  useEffect(() => {
    if (!initialQuestions) return; // Wait for initial data

    const timer = setTimeout(() => {
      if (currentQuestions.length > 0) {
        performSave(currentQuestions, sessionTitle);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [currentQuestions, sessionTitle, initialQuestions, performSave]);

  const handleManualSave = async () => {
    setLoading(true);
    await performSave(currentQuestions, sessionTitle);
    toast({ title: "Survey Saved", description: "All changes have been synced." });
    setLoading(false);
  };

  if (pollLoading || !poll || !initialQuestions) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background presenter-ui font-body">
      <Header variant="minimal" />
      <div className="max-w-[1400px] mx-auto px-6 py-12 pb-40">
        <div className="flex items-center gap-6 mt-32 mb-12">
          <Button variant="ghost" size="icon" onClick={() => router.push('/presenter')} className="rounded-[1.5rem] h-14 w-14 border-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-5xl font-black uppercase tracking-tighter">Edit Survey</h1>
            {lastSaved && (
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" /> Autosaved {new Date(lastSaved).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-6 mb-12">
          <div className="flex-1 space-y-4 w-full">
            <label className="text-xs font-black uppercase tracking-[0.5em] opacity-40 ml-4">Survey Title</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              className="text-3xl font-black h-20 border-2 bg-card rounded-[1.5rem] px-10 focus-visible:ring-0 uppercase shadow-none"
            />
          </div>
          <Button 
            onClick={handleManualSave}
            disabled={loading}
            className="h-20 px-12 rounded-[1.5rem] bg-foreground text-background font-black uppercase tracking-tighter text-xl border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all shrink-0 shadow-none"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Save className="mr-3 h-6 w-6" /> Save Now</>}
          </Button>
        </div>

        <PollCreator 
          initialQuestions={initialQuestions} 
          onChange={setCurrentQuestions}
        />
      </div>
    </div>
  );
}