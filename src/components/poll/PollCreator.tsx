
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical, ListChecks, Cloud, SlidersHorizontal, Palette, Sparkles } from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType, AppTheme } from "@/app/types/poll";
import { cn } from "@/lib/utils";

interface PollCreatorProps {
  onSave: (questions: PollQuestion[], theme: AppTheme) => void;
  initialQuestions?: PollQuestion[];
}

export function PollCreator({ onSave, initialQuestions = [] }: PollCreatorProps) {
  const [questions, setQuestions] = useState<PollQuestion[]>(initialQuestions.length > 0 ? initialQuestions : [
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: "What's the main focus today?",
      options: ["Growth", "Innovation", "Stability"],
      createdAt: Date.now()
    }
  ]);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>('orange');

  const addQuestion = (type: PollType) => {
    const newQuestion: PollQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: "",
      options: type === 'multiple-choice' ? ["Option 1", "Option 2"] : undefined,
      range: type === 'slider' ? { min: 0, max: 100, step: 1 } : undefined,
      createdAt: Date.now()
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<PollQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
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
    { name: 'green', color: '#b5ff12', label: 'Energy' },
    { name: 'red', color: '#ff4b12', label: 'Hot' },
    { name: 'blue', color: '#1293ff', label: 'Cool' },
  ];

  return (
    <div className="space-y-12 pb-48 presenter-ui">
      {/* Theme Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Palette className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-black uppercase tracking-tighter">Visual Vibe</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {themes.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setSelectedTheme(t.name)}
              className={cn(
                "flex items-center justify-between px-8 py-5 rounded-[2rem] border-4 transition-all hover:scale-[1.02] active:scale-95",
                selectedTheme === t.name 
                  ? "border-primary bg-primary text-background" 
                  : "border-primary/10 bg-white text-primary"
              )}
            >
              <span className="font-black uppercase tracking-tighter text-lg">{t.label}</span>
              <div 
                className="w-6 h-6 rounded-full border-2 border-primary/20"
                style={{ backgroundColor: t.color }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Questions Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between sticky top-32 z-20 bg-[#f3f3f1]/90 backdrop-blur-md py-6 border-b-4 border-primary/10">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Structure</h2>
          <Button 
            type="button"
            onClick={() => onSave(questions, selectedTheme)} 
            className="rounded-[2.5rem] h-16 px-12 text-xl font-black bg-primary text-background hover:opacity-90 transition-all uppercase tracking-tighter shadow-none"
          >
            Launch Live Pulse
          </Button>
        </div>

        <div className="grid gap-8">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-8 border-primary rounded-[3rem] bg-white overflow-hidden shadow-none transition-all hover:border-primary/80">
              <CardContent className="p-10">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="bg-primary text-background w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-grow space-y-8">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Interactive Element</Label>
                      <span className="px-5 py-1.5 bg-primary/5 rounded-full text-[10px] font-black uppercase text-primary border-2 border-primary/10">
                        {q.type.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex gap-4">
                      <Input 
                        value={q.question} 
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        placeholder="Enter your question..."
                        className="text-2xl font-black h-20 border-4 border-primary/10 bg-white rounded-3xl px-8 focus-visible:ring-0 placeholder:opacity-20 shadow-none"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-primary hover:bg-destructive hover:text-white h-20 w-20 rounded-3xl border-4 border-primary/10 transition-all">
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>

                    <AIQuestionRefiner 
                      currentQuestion={q.question} 
                      onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                    />

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid gap-4 pl-8 border-l-4 border-primary/10 mt-6">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-3 items-center group">
                            <GripVertical className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                            <Input 
                              value={opt} 
                              onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                              className="h-14 border-2 border-primary/10 bg-primary/5 rounded-2xl px-6 focus-visible:ring-0 font-black text-md shadow-none"
                            />
                            {q.options!.length > 2 && (
                               <Button variant="ghost" size="icon" onClick={() => {
                                 const newOpts = q.options!.filter((_, i) => i !== oIdx);
                                 updateQuestion(q.id, { options: newOpts });
                               }} className="rounded-xl">
                                 <Trash2 className="h-4 w-4 opacity-40 hover:opacity-100" />
                               </Button>
                            )}
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          onClick={() => updateQuestion(q.id, { options: [...q.options!, `Option ${q.options!.length + 1}`] })} 
                          className="rounded-2xl border-2 border-dashed border-primary/30 font-black h-14 uppercase tracking-widest text-xs hover:border-primary shadow-none"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Option
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

      {/* Command Menu */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-primary p-3 rounded-[3rem] flex items-center gap-2 border-4 border-primary z-50">
        <Button onClick={() => addQuestion('multiple-choice')} className="rounded-full h-16 px-6 gap-3 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase text-xs shadow-none">
          <ListChecks className="h-6 w-6" /> Poll
        </Button>
        <div className="w-1 h-8 bg-white/20 rounded-full" />
        <Button onClick={() => addQuestion('word-cloud')} className="rounded-full h-16 px-6 gap-3 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase text-xs shadow-none">
          <Cloud className="h-6 w-6" /> Cloud
        </Button>
        <div className="w-1 h-8 bg-white/20 rounded-full" />
        <Button onClick={() => addQuestion('slider')} className="rounded-full h-16 px-6 gap-3 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase text-xs shadow-none">
          <SlidersHorizontal className="h-6 w-6" /> Slider
        </Button>
      </div>
    </div>
  );
}
