"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ListChecks, Cloud, SlidersHorizontal, Palette, MessageSquare, Star, ChevronDown, ChevronUp } from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType, AppTheme } from "@/app/types/poll";
import { cn } from "@/lib/utils";

interface PollCreatorProps {
  onSave: (questions: PollQuestion[], theme: AppTheme) => void;
  initialQuestions?: PollQuestion[];
  initialTheme?: AppTheme;
}

export function PollCreator({ onSave, initialQuestions = [], initialTheme = 'orange' }: PollCreatorProps) {
  const [questions, setQuestions] = useState<PollQuestion[]>(initialQuestions.length > 0 ? initialQuestions : [
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: "What's our focus today?",
      options: ["Growth", "Innovation", "Quality"],
      createdAt: Date.now()
    }
  ]);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(initialTheme);

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

  const themes: { name: AppTheme; color: string; label: string }[] = [
    { name: 'orange', color: '#ff9312', label: 'Classic' },
    { name: 'green', color: '#b5ff12', label: 'Neon' },
    { name: 'red', color: '#ff4b12', label: 'Vivid' },
    { name: 'blue', color: '#1293ff', label: 'Hydro' },
  ];

  return (
    <div className="space-y-12 pb-48 presenter-ui">
      <section className="space-y-6 bg-card p-8 rounded-3xl border border-border">
        <div className="flex items-center gap-3 px-1">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold tracking-tight">Theme</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {themes.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setSelectedTheme(t.name)}
              className={cn(
                "flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all hover:border-primary/40",
                selectedTheme === t.name ? "border-primary bg-primary/5" : "border-border bg-muted"
              )}
            >
              <span className="font-bold text-sm">{t.label}</span>
              <div className="w-5 h-5 rounded-md" style={{ backgroundColor: t.color }} />
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between sticky top-24 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-border mb-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight">Flow</h2>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{questions.length} Nodes</p>
          </div>
          <Button 
            type="button"
            onClick={() => onSave(questions, selectedTheme)} 
            className="rounded-xl h-12 px-8 font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all uppercase text-xs"
          >
            Save Pulse
          </Button>
        </div>

        <div className="grid gap-6">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border border-border rounded-3xl bg-card overflow-hidden transition-all hover:border-primary/20">
              <CardContent className="p-8">
                <div className="flex gap-6">
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="bg-muted text-foreground/40 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">
                      {idx + 1}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="h-8 w-10">
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="h-8 w-10">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-grow space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Interaction</Label>
                      <div className="px-3 py-1 bg-muted rounded-full text-[9px] font-bold uppercase opacity-60">
                        {q.type.replace('-', ' ')}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Input 
                        value={q.question} 
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        placeholder="Type your question..."
                        className="text-lg font-bold h-14 border border-border bg-muted rounded-xl px-6 focus-visible:ring-1 shadow-none"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeQuestion(q.id)} 
                        disabled={questions.length <= 1}
                        className="h-14 w-14 rounded-xl hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <AIQuestionRefiner 
                      currentQuestion={q.question} 
                      onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                    />

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid gap-3 pt-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2 items-center">
                            <Input 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...q.options!];
                                newOpts[oIdx] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                              className="h-11 border border-border bg-muted/50 rounded-lg px-4 font-medium text-sm"
                            />
                            {q.options!.length > 2 && (
                               <Button variant="ghost" size="icon" onClick={() => {
                                 const newOpts = q.options!.filter((_, i) => i !== oIdx);
                                 updateQuestion(q.id, { options: newOpts });
                               }} className="h-11 w-11">
                                 <Trash2 className="h-3.5 w-3.5 opacity-30" />
                               </Button>
                            )}
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          onClick={() => updateQuestion(q.id, { options: [...q.options!, `Option ${q.options!.length + 1}`] })} 
                          className="rounded-lg border-dashed border-2 h-10 text-[10px] font-bold uppercase tracking-widest mt-2"
                        >
                          <Plus className="mr-2 h-3 w-3" /> Add Choice
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

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background p-2 rounded-2xl flex items-center gap-1 z-50">
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
            className="h-11 px-4 gap-2 bg-transparent hover:bg-background/10 text-background border-none font-bold uppercase text-[9px] tracking-wider"
          >
            <tool.icon className="h-4 w-4" /> <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}