"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ListChecks, Cloud, SlidersHorizontal, MessageSquare, Star, ChevronDown, ChevronUp } from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType } from "@/app/types/poll";
import { cn } from "@/lib/utils";

interface PollCreatorProps {
  onSave: (questions: PollQuestion[]) => void;
  initialQuestions?: PollQuestion[];
}

export function PollCreator({ onSave, initialQuestions = [] }: PollCreatorProps) {
  const [questions, setQuestions] = useState<PollQuestion[]>(initialQuestions.length > 0 ? initialQuestions : [
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: "What's our focus today?",
      options: ["Growth", "Innovation", "Quality"],
      createdAt: Date.now()
    }
  ]);

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
      <section className="space-y-6">
        <div className="flex items-center justify-between sticky top-24 z-20 bg-background/90 py-4 border-b-2 mb-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight uppercase">Flow</h2>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">{questions.length} Nodes</p>
          </div>
          <Button 
            type="button"
            onClick={() => onSave(questions)} 
            className="rounded-xl h-12 px-8 font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all uppercase text-xs shadow-none border-2 border-primary"
          >
            Save Pulse
          </Button>
        </div>

        <div className="grid gap-6">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-2 rounded-[2rem] bg-card overflow-hidden transition-all hover:border-primary/40 shadow-none">
              <CardContent className="p-8">
                <div className="flex gap-6">
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="bg-muted text-foreground/40 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 border-transparent">
                      {idx + 1}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="h-10 w-12">
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="h-10 w-12">
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-grow space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest opacity-40">Interaction</Label>
                      <div className="px-4 py-1.5 bg-muted rounded-full text-[10px] font-bold uppercase opacity-60 border-2 border-transparent">
                        {q.type.replace('-', ' ')}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Input 
                        value={q.question} 
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        placeholder="Type your question..."
                        className="text-xl font-bold h-16 border-2 bg-muted rounded-2xl px-6 focus-visible:ring-1 shadow-none"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeQuestion(q.id)} 
                        disabled={questions.length <= 1}
                        className="h-16 w-16 rounded-2xl hover:text-destructive border-2 border-transparent"
                      >
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>

                    <AIQuestionRefiner 
                      currentQuestion={q.question} 
                      onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                    />

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid gap-4 pt-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-3 items-center">
                            <Input 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...q.options!];
                                newOpts[oIdx] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                              className="h-12 border-2 bg-muted/30 rounded-xl px-6 font-bold text-sm shadow-none"
                            />
                            {q.options!.length > 2 && (
                               <Button variant="ghost" size="icon" onClick={() => {
                                 const newOpts = q.options!.filter((_, i) => i !== oIdx);
                                 updateQuestion(q.id, { options: newOpts });
                               }} className="h-12 w-12 border-2 border-transparent">
                                 <Trash2 className="h-4 w-4 opacity-40" />
                               </Button>
                            )}
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          onClick={() => updateQuestion(q.id, { options: [...q.options!, `Option ${q.options!.length + 1}`] })} 
                          className="rounded-xl border-dashed border-2 h-12 text-xs font-bold uppercase tracking-widest mt-2 shadow-none"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Choice
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

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background p-3 rounded-2xl flex items-center gap-2 z-50 shadow-none border-2 border-foreground">
        {[
          { type: 'multiple-choice', icon: ListChecks, label: 'Poll' },
          { type: 'word-cloud', icon: Cloud, label: 'Cloud' },
          { type: 'open-text', icon: MessageSquare, label: 'Open' },
          { type: 'rating', icon: Star, label: 'Rate' },
          { type: 'slider', icon: SlidersHorizontal, label: 'Slide' }
        ].map((tool) => (
          <Button 
            key={tool.type}
            onClick={() => addQuestion(tool.type as PollType)} 
            className="h-12 px-6 gap-3 bg-transparent hover:bg-background hover:text-foreground text-background border-2 border-transparent font-bold uppercase text-[10px] tracking-widest transition-all shadow-none"
          >
            <tool.icon className="h-5 w-5" /> <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
