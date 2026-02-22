"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion } from "@/app/types/poll";
import { ArrowLeft, Loader2, CheckCircle2, Palette, Sun, Moon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, query, orderBy, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [theme, setTheme] = useState<string>("orange");
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<PollQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  useEffect(() => {
    if (poll) {
      setSessionTitle(poll.title || "");
      setTheme(poll.theme || "orange");
      setCustomColor(poll.customColor || null);
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

  const performSave = useCallback(async (questionsToSave: PollQuestion[], titleToSave: string, themeToSave: string, customColorToSave: string | null) => {
    if (!user || !pollRef) return;
    
    try {
      await setDoc(pollRef, { 
        title: titleToSave, 
        theme: themeToSave, 
        customColor: customColorToSave,
        updatedAt: serverTimestamp() 
      }, { merge: true });

      const finalQCol = collection(db, `users/${user.uid}/surveys/${resolvedParams.pollId}/questions`);
      const batch = writeBatch(db);

      for (let i = 0; i < questionsToSave.length; i++) {
        const q = questionsToSave[i];
        const qRef = doc(finalQCol, q.id);
        
        const qData: any = {
          id: q.id,
          pollId: resolvedParams.pollId,
          type: q.type,
          question: q.question,
          order: i,
          createdAt: q.createdAt || Date.now()
        };

        if (q.options) qData.options = q.options;
        if (q.correctOptionIndices) qData.correctOptionIndices = q.correctOptionIndices;
        if (q.timeLimit !== undefined) qData.timeLimit = q.timeLimit;
        if (q.range) qData.range = q.range;
        if (q.labels) qData.labels = q.labels;

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
    if (!initialQuestions) return; 

    const timer = setTimeout(() => {
      if (currentQuestions.length > 0) {
        performSave(currentQuestions, sessionTitle, theme, customColor);
      }
    }, 2000); 

    return () => clearTimeout(timer);
  }, [currentQuestions, sessionTitle, theme, customColor, initialQuestions, performSave]);

  const handleManualSave = async () => {
    setLoading(true);
    await performSave(currentQuestions, sessionTitle, theme, customColor);
    toast({ title: "Survey Saved", description: "All changes have been synced." });
    setLoading(false);
  };

  const updateVibe = (newTheme: string, newColor?: string) => {
    setTheme(newTheme);
    setCustomColor(newColor || null);
  };

  if (pollLoading || !poll || !initialQuestions) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary selection:text-primary-foreground">
      <Header variant="minimal" />
      <div className="studio-container px-6 py-12 pb-40">
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-32 mb-12">
          <div className="flex items-center gap-6 w-full">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[1.25rem] h-12 w-12 border-2 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter truncate">Edit Survey</h1>
              {lastSaved && (
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] opacity-40 mt-1 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> Autosaved {new Date(lastSaved).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 mb-12">
          <div className="space-y-3 w-full">
            <label className="text-xs font-black uppercase tracking-[0.5em] opacity-40 ml-4">Survey Identity</label>
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                value={sessionTitle} 
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="SURVEY TITLE..."
                className="text-xl font-black h-14 border-2 bg-card rounded-[1.25rem] px-8 focus-visible:ring-1 border-foreground/10 uppercase shadow-none tracking-tighter flex-1"
                aria-label="Survey Title"
              />
              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-14 px-6 rounded-[1.25rem] border-2 font-black uppercase text-xs tracking-widest gap-3 shadow-none flex-1 md:flex-none">
                      <Palette className="h-5 w-5" /> Vibe
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-6 rounded-[1.5rem] border-2 bg-background flex flex-col gap-4 text-foreground" align="end">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Presentation Style</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => updateVibe('orange')} className="bg-[#ff9312] text-white rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Orange</Button>
                      <Button onClick={() => updateVibe('red')} className="bg-[#780c16] text-[#e9c0e9] rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Red</Button>
                      <Button onClick={() => updateVibe('green')} className="bg-[#d2e822] text-[#254e1a] rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Acid</Button>
                      <Button onClick={() => updateVibe('blue')} className="bg-[#0d99ff] text-white rounded-[1rem] font-black h-12 border-2 uppercase text-[10px]">Blue</Button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">Minimalist Presets</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => updateVibe('minimal-light')} className="bg-[#f4f4f5] text-zinc-950 rounded-[1rem] font-black h-12 border-2 border-zinc-200 uppercase text-[10px]"><Sun className="w-3 h-3 mr-2" /> Studio Light</Button>
                      <Button onClick={() => updateVibe('minimal-dark')} className="bg-[#18181b] text-zinc-100 rounded-[1rem] font-black h-12 border-2 border-zinc-800 uppercase text-[10px]"><Moon className="w-3 h-3 mr-2" /> Studio Dark</Button>
                    </div>
                    <div className="space-y-3 pt-3 border-t-2">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Custom Theme</p>
                      <Input 
                        type="color" 
                        value={customColor || "#ff9312"}
                        className="h-12 w-full rounded-[1rem] border-2 p-1 cursor-pointer"
                        onChange={(e) => updateVibe('custom', e.target.value)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={handleManualSave}
                  disabled={loading}
                  className="h-14 px-8 rounded-[1.25rem] bg-foreground text-background font-black uppercase tracking-widest text-xs border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all flex-1 md:flex-none shadow-none"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <PollCreator 
          initialQuestions={initialQuestions} 
          onChange={setCurrentQuestions}
        />
      </div>
    </div>
  );
}
