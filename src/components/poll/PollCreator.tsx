"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical, ListChecks, Cloud, SlidersHorizontal, Palette, MessageSquare, Star, ChevronDown, ChevronUp } from "lucide-react";
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
      question: "What's our primary objective today?",
      options: ["Accelerate Growth", "Drive Innovation", "Ensure Quality"],
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

  const updateOption = (questionId: string, idx: number, val: string) => {
    const q = questions.find(q => q.id === questionId);
    if (q && q.options) {
      const newOpts = [...q.options];
      newOpts[idx] = val;
      updateQuestion(questionId, { options: newOpts });
    }
  };

  const themes: { name: AppTheme; color: string; label: string }[] = [
    { name: 'orange', color: '#ff9312', label: 'Classic' },
    { name: 'green', color: '#b5ff12', label: 'Neon' },
    { name: 'red', color: '#ff4b12', label: 'Vivid' },
    { name: 'blue', color: '#1293ff', label: 'Hydro' },
  ];

  return (
    <div className="space-y-16 pb-48 presenter-ui">
      <section className="space-y-8 bg-white p-12 rounded-[3.5rem] border-8 border-primary/5">
        <div className="flex items-center gap-4 px-4">
          <Palette className="h-7 w-7 text-primary" />
          <h3 className="text-3xl font-black uppercase tracking-tighter text-primary">Visual Architecture</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {themes.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setSelectedTheme(t.name)}
              className={cn(
                "flex items-center justify-between px-8 py-8 rounded-[2.5rem] border-4 transition-all hover:scale-[1.02] active:scale-95 group",
                selectedTheme === t.name 
                  ? "border-primary bg-primary text-white" 
                  : "border-primary/5 bg-[#f3f3f1] text-primary"
              )}
            >
              <span className="font-black uppercase tracking-tighter text-xl">{t.label}</span>
              <div 
                className="w-10 h-10 rounded-2xl border-4 border-white/20 transition-transform group-hover:rotate-12"
                style={{ backgroundColor: t.color }}
              />
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between sticky top-24 z-20 bg-[#f3f3f1]/90 backdrop-blur-xl py-8 border-b-8 border-primary/5 px-4 gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-primary">Interaction Flow</h2>
            <p className="text-sm font-bold opacity-40 uppercase tracking-widest text-primary">{questions.length} Active Node(s)</p>
          </div>
          <Button 
            type="button"
            onClick={() => onSave(questions, selectedTheme)} 
            className="w-full sm:w-auto rounded-[2rem] h-20 px-16 text-2xl font-black bg-primary text-white border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter shadow-none"
          >
            Save Changes
          </Button>
        </div>

        <div className="grid gap-12">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-8 border-primary/10 rounded-[4rem] bg-white overflow-hidden shadow-none transition-all hover:border-primary/30 relative">
              <CardContent className="p-12">
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex flex-col gap-4 shrink-0">
                    <div className="bg-primary text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-3xl">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="rounded-xl h-12 w-16 border-2 border-primary/5">
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="rounded-xl h-12 w-16 border-2 border-primary/5">
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-grow space-y-10">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-black uppercase tracking-[0.5em] opacity-40">Interaction Type</Label>
                      <div className="px-6 py-2 bg-primary/5 rounded-full text-xs font-black uppercase text-primary border-4 border-primary/5">
                        {q.type.replace('-', ' ')}
                      </div>
                    </div>
                    
                    <div className="flex gap-6">
                      <Input 
                        value={q.question} 
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        placeholder="Draft the query..."
                        className="text-3xl font-black h-24 border-4 border-primary/5 bg-[#f3f3f1] rounded-[2.5rem] px-10 focus-visible:ring-0 placeholder:opacity-20 shadow-none text-primary"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeQuestion(q.id)} 
                        disabled={questions.length <= 1}
                        className="text-primary hover:bg-destructive hover:text-white h-24 w-24 rounded-[2.5rem] border-4 border-primary/5 transition-all shrink-0"
                      >
                        <Trash2 className="h-8 w-8" />
                      </Button>
                    </div>

                    <div className="pl-4">
                      <AIQuestionRefiner 
                        currentQuestion={q.question} 
                        onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                      />
                    </div>

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid gap-6 pl-10 border-l-8 border-primary/10 mt-10">
                        <Label className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-2">Options Logic</Label>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-4 items-center group">
                            <GripVertical className="h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity cursor-grab shrink-0" />
                            <Input 
                              value={opt} 
                              onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                              className="h-16 border-4 border-primary/5 bg-[#f3f3f1] rounded-2xl px-8 focus-visible:ring-0 font-black text-xl shadow-none text-primary"
                            />
                            {q.options!.length > 2 && (
                               <Button variant="ghost" size="icon" onClick={() => {
                                 const newOpts = q.options!.filter((_, i) => i !== oIdx);
                                 updateQuestion(q.id, { options: newOpts });
                               }} className="rounded-xl h-16 w-16 shrink-0">
                                 <Trash2 className="h-5 w-5 opacity-20 hover:opacity-100" />
                               </Button>
                            )}
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          onClick={() => updateQuestion(q.id, { options: [...q.options!, `Option ${q.options!.length + 1}`] })} 
                          className="rounded-[2rem] border-4 border-dashed border-primary/20 font-black h-16 uppercase tracking-widest text-sm hover:border-primary shadow-none mt-2"
                        >
                          <Plus className="mr-3 h-5 w-5" /> Append Choice
                        </Button>
                      </div>
                    )}

                    {q.type === 'slider' && (
                      <div className="flex gap-4 items-center pl-10 mt-6 bg-primary/5 p-6 rounded-[2rem] border-4 border-primary/5">
                        <SlidersHorizontal className="h-6 w-6 text-primary" />
                        <span className="text-sm font-black uppercase tracking-widest text-primary">Range Selector (0-100) Active</span>
                      </div>
                    )}

                    {q.type === 'rating' && (
                      <div className="flex gap-4 items-center pl-10 mt-6 bg-primary/5 p-6 rounded-[2rem] border-4 border-primary/5">
                         <Star className="h-6 w-6 text-primary fill-primary" />
                         <span className="text-sm font-black uppercase tracking-widest text-primary">5-Star Feedback Protocol Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-primary/95 backdrop-blur-xl p-4 rounded-[4rem] flex items-center gap-2 border-8 border-white/10 z-50">
        {[
          { type: 'multiple-choice', icon: ListChecks, label: 'Poll' },
          { type: 'word-cloud', icon: Cloud, label: 'Cloud' },
          { type: 'open-text', icon: MessageSquare, label: 'Open' },
          { type: 'rating', icon: Star, label: 'Rate' },
          { type: 'slider', icon: SlidersHorizontal, label: 'Slide' }
        ].map((tool, i) => (
          <div key={tool.type} className="flex items-center">
            <Button 
              onClick={() => addQuestion(tool.type as PollType)} 
              className="rounded-full h-16 px-6 gap-3 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase text-[10px] tracking-[0.3em] shadow-none transition-all"
            >
              <tool.icon className="h-6 w-6" /> <span className="hidden sm:inline">{tool.label}</span>
            </Button>
            {i < 4 && <div className="w-1 h-8 bg-white/10 rounded-full mx-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}
