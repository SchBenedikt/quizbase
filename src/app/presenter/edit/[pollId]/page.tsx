"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { ArrowLeft, Loader2 } from "lucide-react";
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
    return doc(db, `users/${user.uid}/polls/${resolvedParams.pollId}`);
  }, [user, db, resolvedParams.pollId]);

  const { data: poll, isLoading: pollLoading } = useDoc(pollRef);

  const questionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/polls/${resolvedParams.pollId}/questions`), orderBy("order", "asc"));
  }, [user, db, resolvedParams.pollId]);

  const { data: initialQuestions } = useCollection<PollQuestion>(questionsQuery);

  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (poll) {
      setSessionTitle(poll.title);
    }
  }, [poll]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleUpdate = async (questions: PollQuestion[], theme: AppTheme) => {
    if (!sessionTitle || !user || !poll) return;

    setLoading(true);
    try {
      // Update poll meta
      await setDoc(pollRef!, { title: sessionTitle, theme, updatedAt: serverTimestamp() }, { merge: true });

      // Update questions (simplified: overwrite for MVP)
      const qCol = collection(db, `users/${user.uid}/polls/${resolvedParams.pollId}/questions`);
      const batch = writeBatch(db);
      
      // We'd ideally delete old questions or track IDs, but for this interaction 
      // we'll just upsert and rely on the UI list.
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qRef = doc(qCol, q.id);
        batch.set(qRef, { ...q, pollId: resolvedParams.pollId, order: i }, { merge: true });
      }
      
      await batch.commit();
      toast({ title: "Pulse Updated", description: "Changes have been persisted across all sessions." });
      router.push("/presenter");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (pollLoading || !poll || !initialQuestions) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f3f3f1]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f1] presenter-ui font-body">
      <Header variant="minimal" />
      <div className="max-w-5xl mx-auto px-6 py-12 pb-40">
        <div className="flex items-center gap-6 mt-32 mb-12">
          <Button variant="ghost" size="icon" onClick={() => router.push('/presenter')} className="rounded-full h-14 w-14 border-4 border-primary text-primary">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-primary">Edit Pulse</h1>
        </div>
        
        <div className="space-y-4 mb-12">
          <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-4 text-primary">Pulse Title</label>
          <Input 
            value={sessionTitle} 
            onChange={(e) => setSessionTitle(e.target.value)}
            className="text-3xl font-black h-20 border-8 border-primary bg-white rounded-[2rem] px-10 focus-visible:ring-0 uppercase text-primary shadow-none"
          />
        </div>

        <PollCreator 
          onSave={handleUpdate} 
          initialQuestions={initialQuestions} 
          initialTheme={poll.theme as AppTheme} 
        />
      </div>
    </div>
  );
}