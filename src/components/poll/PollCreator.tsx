"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ListChecks, Cloud, SlidersHorizontal, MessageSquare, Star, ChevronDown, ChevronUp, Map } from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType } from "@/app/types/poll";
import { cn } from "@/lib/utils";

interface PollCreatorProps {
  onSave?: (questions: PollQuestion[]) => void;
  onChange?: (questions: PollQuestion[]) => void;
  initialQuestions?: PollQuestion[];
}

export function PollCreator({ onSave, onChange, initialQuestions = [] }: PollCreatorProps) {
  const [questions, setQuestions] = useState<PollQuestion[]>(initialQuestions.length > 0 ? initialQuestions : [
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: "WHAT IS OUR PRIMARY GOAL?",
      options: ["Growth", "Innovation", "Stability"],
      createdAt: Date.now()
    }
  ]);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (onChange) {
      onChange(questions);
    }
  }, [questions, onChange]);

  const scrollToQuestion = (id: string) => {
    questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const addQuestion = (type: PollType) => {
    const newQuestion: PollQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: "",
      options: type === 'multiple-choice' ? ["Option 1", "Option 2"] : undefined,
      createdAt: Date.now()
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<PollQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    [newQuestions[idx], newQuestions[targetIdx]] = [newQuestions[targetIdx], newQuestions[idx]];
    setQuestions(newQuestions);
  };

  return (
    <div className="space-y-12 pb-48 presenter-ui">
      {/* Interaction Control Bar */}
      <section className="space-y-6">
        <div className="sticky top-24 z-30 bg-background/95 dark:bg-background/95 backdrop-blur-sm py-6 border-b-2 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 rounded-[1.5rem]">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
              <Map className="h-6 w-6 text-primary" /> Interaction Flow
            </h2>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => scrollToQuestion(q.id)}
                  className="w-10 h-10 rounded-[1rem] border-2 border-foreground/10 hover:border-primary hover:bg-primary/5 transition-all font-black text-xs flex items-center justify-center bg-card shadow-none"
                >
                  {idx + 1}
                </button>
              ))}
              <div className="px-4 py-2 bg-muted rounded-[1rem] text-[10px] font-black uppercase tracking-widest flex items-center">
                {questions.length} TOTAL
              </div>
            </div>
          </div>
          {onSave && (
            <Button 
              type="button"
              onClick={() => onSave(questions)} 
              className="rounded-[1.25rem] h-14 px-10 font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all uppercase text-sm shadow-none border-2 border-primary shrink-0"
            >
              Update All
            </Button>
          )}
        </div>

        <div className="grid gap-8">
          {questions.map((q, idx) => (
            <Card 
              key={q.id} 
              ref={(el) => { questionRefs.current[q.id] = el; }}
              className="border-2 rounded-[1.5rem] bg-card overflow-hidden transition-all hover:border-primary/30 shadow-none scroll-mt-60"
            >
              <CardContent className="p-10">
                <div className="flex gap-8">
                  <div className="flex flex-col gap-3 shrink-0">
                    <div className="bg-foreground text-background w-14 h-14 rounded-[1.25rem] flex items-center justify-center font-black text-xl border-2 border-foreground">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="h-11 w-14 rounded-[1rem] hover:bg-foreground/5">
                        <ChevronUp className="h-6 w-6" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="h-11 w-14 rounded-[1rem] hover:bg-foreground/5">
                        <ChevronDown className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-grow space-y-8">
                    <div className="flex items-center justify-between border-b-2 border-foreground/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-[0.75rem] text-primary">
                          {q.type === 'multiple-choice' && <ListChecks className="h-5 w-5" />}
                          {q.type === 'word-cloud' && <Cloud className="h-5 w-5" />}
                          {q.type === 'open-text' && <MessageSquare className="h-5 w-5" />}
                          {q.type === 'rating' && <Star className="h-5 w-5" />}
                          {q.type === 'slider' && <SlidersHorizontal className="h-5 w-5" />}
                        </div>
                        <Label className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Interaction Type: {q.type.replace('-', ' ')}</Label>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeQuestion(q.id)} 
                        disabled={questions.length <= 1}
                        className="h-12 w-12 rounded-[1rem] text-foreground/20 hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="relative">
                        <Input 
                          value={q.question} 
                          onChange={(e) => updateQuestion(q.id, { question: e.target.value.toUpperCase() })}
                          placeholder="TYPE YOUR QUESTION HERE..."
                          className="text-2xl font-black h-20 border-2 bg-muted/30 rounded-[1.25rem] pl-8 pr-16 focus-visible:ring-1 shadow-none uppercase tracking-tight"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AIQuestionRefiner 
                            currentQuestion={q.question} 
                            onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                          />
                        </div>
                      </div>
                    </div>

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid gap-4 pt-4 bg-muted/20 p-6 rounded-[1.25rem] border-2 border-dashed border-foreground/10">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-3 items-center">
                            <div className="h-12 w-12 bg-foreground/5 rounded-[0.75rem] flex items-center justify-center font-black text-xs text-foreground/30">
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <Input 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...q.options!];
                                newOpts[oIdx] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                              className="h-12 border-2 bg-card rounded-[1rem] px-6 font-bold text-sm shadow-none"
                            />
                            {q.options!.length > 2 && (
                               <Button variant="ghost" size="icon" onClick={() => {
                                 const newOpts = q.options!.filter((_, i) => i !== oIdx);
                                 updateQuestion(q.id, { options: newOpts });
                               }} className="h-12 w-12 rounded-[1rem] hover:bg-destructive/5 hover:text-destructive">
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                            )}
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          onClick={() => updateQuestion(q.id, { options: [...q.options!, `OPTION ${q.options!.length + 1}`] })} 
                          className="rounded-[1rem] border-dashed border-2 h-14 text-xs font-black uppercase tracking-widest mt-2 shadow-none hover:bg-primary/5 hover:border-primary transition-all"
                        >
                          <Plus className="mr-3 h-5 w-5" /> Add New Option
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Floating Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-background dark:bg-card border-2 border-foreground/10 p-4 rounded-[2rem] flex items-center gap-3 z-50 shadow-none backdrop-blur-md">
        {[
          { type: 'multiple-choice', icon: ListChecks, label: 'Poll' },
          { type: 'word-cloud', icon: Cloud, label: 'Cloud' },
          { type: 'open-text', icon: MessageSquare, label: 'Open' },
          { type: 'rating', icon: Star, label: 'Rate' },
          { type: 'slider', icon: SlidersHorizontal, label: 'Slider' }
        ].map((tool) => (
          <Button 
            key={tool.type}
            onClick={() => addQuestion(tool.type as PollType)} 
            className="h-14 px-8 gap-4 bg-transparent hover:bg-foreground hover:text-background text-foreground border-2 border-transparent font-black uppercase text-xs tracking-[0.2em] transition-all shadow-none rounded-[1.5rem]"
          >
            <tool.icon className="h-5 w-5" /> <span className="hidden lg:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}