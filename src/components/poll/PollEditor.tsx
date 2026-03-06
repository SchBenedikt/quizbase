"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion } from "@/app/types/poll";
import { ArrowLeft, Loader2, CheckCircle2, Palette, Sun, Moon, Trophy, BarChart3, Shuffle } from "lucide-react";
import { IconPicker } from "@/components/ui/IconPicker";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUser } from "@/firebase";

interface PollEditorProps {
  initialPoll: any;
  initialQuestions: PollQuestion[];
  pollId: string;
}

export function PollEditor({ initialPoll, initialQuestions, pollId }: PollEditorProps) {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [sessionTitle, setSessionTitle] = useState(initialPoll?.title || "");
  const [theme, setTheme] = useState<string>(initialPoll?.theme || "orange");
  const [customColor, setCustomColor] = useState<string | null>(initialPoll?.customColor || null);
  const [isQuiz, setIsQuiz] = useState<boolean>(initialPoll?.isQuiz ?? false);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(initialPoll?.shuffleQuestions ?? false);
  const [selectedIcon, setSelectedIcon] = useState<string>(initialPoll?.icon || "BarChart3");
  const [currentQuestions, setCurrentQuestions] = useState<PollQuestion[]>(initialQuestions);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const performSave = useCallback(async (questionsToSave: PollQuestion[], titleToSave: string, themeToSave: string, customColorToSave: string | null, isQuizToSave: boolean, shuffleSave?: boolean, iconToSave?: string) => {
    if (!user) return;
    
    try {
      const pollRef = doc(db, `users/${user.uid}/surveys/${pollId}`);
      
      // Check if this is a new survey by trying to get the document
      const pollDoc = await getDoc(pollRef);
      const isNewSurvey = !pollDoc.exists();
      
      const surveyData: any = { 
        title: titleToSave, 
        theme: themeToSave, 
        customColor: customColorToSave,
        isQuiz: isQuizToSave,
        shuffleQuestions: shuffleSave ?? false,
        icon: iconToSave || "BarChart3",
        updatedAt: serverTimestamp() 
      };
      
      // Add createdAt for new surveys
      if (isNewSurvey) {
        surveyData.createdAt = serverTimestamp();
        surveyData.isPublic = false; // Default to private for new surveys
        surveyData.sessionCount = 0; // Initialize session count
      }
      
      await setDoc(pollRef, surveyData, { merge: true });

      const finalQCol = collection(db, `users/${user.uid}/surveys/${pollId}/questions`);
      const batch = writeBatch(db);

      for (let i = 0; i < questionsToSave.length; i++) {
        const q = questionsToSave[i];
        const qRef = doc(finalQCol, q.id);
        
        const qData: any = {
          id: q.id,
          pollId: pollId,
          type: q.type,
          question: q.question,
          order: i,
          createdAt: q.createdAt || Date.now()
        };

        if (q.options) qData.options = q.options;
        if (q.correctOptionIndices) qData.correctOptionIndices = q.correctOptionIndices;
        if (q.correctAnswer !== undefined) qData.correctAnswer = q.correctAnswer;
        if (q.timeLimit !== undefined) qData.timeLimit = q.timeLimit;
        if (q.range) qData.range = q.range;
        if (q.labels) qData.labels = q.labels;
        if (q.description) qData.description = q.description;
        if (q.imageUrl) qData.imageUrl = q.imageUrl;
        if (q.imageHint) qData.imageHint = q.imageHint;

        batch.set(qRef, qData, { merge: true });
      }
      
      await batch.commit();
      setLastSaved(Date.now());
    } catch (e: any) {
      console.error("Autosave failed:", e);
    }
  }, [user, db, pollId]);

  // Debounced Autosave
  React.useEffect(() => {
    if (!initialQuestions) return; 

    const timer = setTimeout(() => {
      if (currentQuestions.length > 0) {
        performSave(currentQuestions, sessionTitle, theme, customColor, isQuiz, shuffleQuestions, selectedIcon);
      }
    }, 2000); 

    return () => clearTimeout(timer);
  }, [currentQuestions, sessionTitle, theme, customColor, isQuiz, shuffleQuestions, selectedIcon, initialQuestions, performSave]);

  const handleManualSave = async () => {
    setLoading(true);
    await performSave(currentQuestions, sessionTitle, theme, customColor, isQuiz, shuffleQuestions, selectedIcon);
    toast({ title: "Survey Saved", description: "All changes have been synced." });
    setLoading(false);
  };

  const updateVibe = (newTheme: string, newColor?: string) => {
    setTheme(newTheme);
    setCustomColor(newColor || null);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] dark:bg-background font-body selection:bg-primary selection:text-primary-foreground">
      <div className="container mx-auto px-6 py-28 pb-40 max-w-screen-2xl">
        <div className="flex flex-col gap-8 mb-16">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10 rounded-lg border border-foreground/10 bg-card hover:bg-muted shadow-none">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold tracking-tight">Edit Survey</h1>
              {lastSaved && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Autosaved {new Date(lastSaved).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="bg-card p-6 rounded-lg border border-foreground/8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">Survey Details</h2>
              <p className="text-base text-muted-foreground">Configure your survey identity and presentation style</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-base font-medium">Title</label>
                <Input 
                  value={sessionTitle} 
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Enter survey title..."
                  className="h-12 border border-foreground/10 bg-background rounded-lg px-4 focus-visible:ring-1 focus-visible:ring-primary font-medium text-base"
                  aria-label="Survey Title"
                />
              </div>

              <IconPicker 
                selectedIcon={selectedIcon}
                onIconChange={setSelectedIcon}
                className="mt-4"
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Survey vs Quiz toggle */}
                <div className="flex rounded-lg border border-foreground/10 overflow-hidden h-12 bg-muted/30">
                  <button
                    onClick={() => setIsQuiz(false)}
                    className={`flex-1 px-5 flex items-center justify-center gap-2 text-sm font-medium transition-all ${!isQuiz ? 'bg-foreground text-background' : 'hover:bg-foreground/5'}`}
                  >
                    <BarChart3 className="h-4 w-4" /> Survey
                  </button>
                  <button
                    onClick={() => setIsQuiz(true)}
                    className={`flex-1 px-5 flex items-center justify-center gap-2 text-sm font-medium transition-all ${isQuiz ? 'bg-primary text-primary-foreground' : 'hover:bg-foreground/5'}`}
                  >
                    <Trophy className="h-4 w-4" /> Quiz
                  </button>
                </div>

                {/* Shuffle Questions toggle */}
                <button
                  onClick={() => setShuffleQuestions(!shuffleQuestions)}
                  className={`flex items-center gap-2 h-12 px-5 rounded-lg border text-sm font-medium transition-all ${shuffleQuestions ? 'bg-foreground text-background border-foreground' : 'border-foreground/10 hover:bg-foreground/5'}`}
                >
                  <Shuffle className="h-4 w-4" /> Shuffle
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-lg border border-foreground/10 font-medium gap-2 bg-card hover:bg-muted shadow-none text-base">
                      <Palette className="h-5 w-5" /> 
                      <span className="capitalize">{theme === 'custom' && customColor ? 'Custom' : theme}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-6 rounded-lg border border-foreground/8 bg-card" align="end">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium mb-4">Presentation Style</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Button onClick={() => updateVibe('orange')} className="h-10 px-4 bg-[#ff9312] text-white rounded-lg font-medium text-sm border-0 hover:bg-[#ff9312]/90">Orange</Button>
                          <Button onClick={() => updateVibe('red')} className="h-10 px-4 bg-[#780c16] text-[#e9c0e9] rounded-lg font-medium text-sm border-0 hover:bg-[#780c16]/90">Red</Button>
                          <Button onClick={() => updateVibe('green')} className="h-10 px-4 bg-[#d2e822] text-[#254e1a] rounded-lg font-medium text-sm border-0 hover:bg-[#d2e822]/90">Acid</Button>
                          <Button onClick={() => updateVibe('blue')} className="h-10 px-4 bg-[#0d99ff] text-white rounded-lg font-medium text-sm border-0 hover:bg-[#0d99ff]/90">Blue</Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-4">Minimalist</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Button onClick={() => updateVibe('minimal-light')} className="h-10 px-4 bg-[#f4f4f5] text-zinc-950 rounded-lg font-medium text-sm border border-zinc-200 hover:bg-zinc-100"><Sun className="w-4 h-4 mr-2" /> Light</Button>
                          <Button onClick={() => updateVibe('minimal-dark')} className="h-10 px-4 bg-[#18181b] text-zinc-100 rounded-lg font-medium text-sm border border-zinc-800 hover:bg-zinc-700"><Moon className="w-4 h-4 mr-2" /> Dark</Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-3">Custom</h3>
                        <Input 
                          type="color" 
                          value={customColor || "#ff9312"}
                          className="h-10 w-full rounded-lg border border-foreground/10 p-1 cursor-pointer"
                          onChange={(e) => updateVibe('custom', e.target.value)}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  onClick={handleManualSave}
                  disabled={loading}
                  className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-none text-base"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <PollCreator 
            initialQuestions={initialQuestions} 
            onChange={setCurrentQuestions}
            isQuiz={isQuiz}
          />
        </div>
      </div>
    </div>
  );
}
