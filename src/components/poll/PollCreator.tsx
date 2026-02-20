
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical, ListChecks, Type, Star, Cloud, SlidersHorizontal, Palette } from "lucide-react";
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
      question: "FIRST TOPIC?",
      options: ["OPTION A", "OPTION B"],
      createdAt: Date.now()
    }
  ]);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>('orange');

  const addQuestion = (type: PollType) => {
    const newQuestion: PollQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: "",
      options: type === 'multiple-choice' ? ["OPTION 1", "OPTION 2"] : undefined,
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
      {/* Theme Selector */}
      <Card className="border-8 border-foreground rounded-[4rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex items-center gap-6">
            <Palette className="h-8 w-8" />
            <h3 className="text-3xl font-black uppercase tracking-tighter">Choose Visual Vibe</h3>
          </div>
          <div className="flex flex-wrap gap-6">
            {themes.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setSelectedTheme(t.name)}
                className={cn(
                  "flex items-center gap-4 px-10 py-6 rounded-[2rem] border-4 transition-all hover:scale-105 active:scale-95",
                  selectedTheme === t.name 
                    ? "border-foreground scale-105 bg-foreground text-background" 
                    : "border-foreground/10 bg-white text-foreground"
                )}
              >
                <div 
                  className="w-10 h-10 rounded-full border-2 border-foreground"
                  style={{ backgroundColor: t.color }}
                />
                <span className="font-black uppercase tracking-tighter text-xl">{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between sticky top-0 z-20 bg-[#f3f3f1]/80 backdrop-blur-md py-8 border-b-8 border-foreground">
        <h2 className="text-4xl font-black uppercase tracking-tighter">Pulse Architecture</h2>
        <Button 
          type="button"
          onClick={() => onSave(questions, selectedTheme)} 
          className="rounded-[2.5rem] h-20 px-16 text-2xl font-black bg-foreground text-white hover:opacity-90 transition-all uppercase tracking-tighter"
        >
          Launch Live Session
        </Button>
      </div>

      <div className="grid gap-10">
        {questions.length === 0 ? (
          <div className="p-32 border-8 border-dashed border-foreground/10 rounded-[5rem] text-center space-y-8">
            <p className="text-4xl font-black opacity-20 uppercase tracking-tighter">Architecture is empty</p>
            <p className="text-sm font-bold opacity-40 uppercase tracking-widest leading-none">Add elements via the command menu below</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <Card key={q.id} className="border-8 border-foreground rounded-[4rem] bg-white overflow-hidden shadow-none">
              <CardContent className="p-12">
                <div className="flex items-start gap-10">
                  <div className="bg-foreground text-background w-16 h-16 rounded-[2rem] flex items-center justify-center font-black text-3xl shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-grow space-y-10">
                    <div className="flex items-center justify-between">
                      <Label className="text-[12px] font-black uppercase tracking-[0.5em] opacity-40">Interactive Element</Label>
                      <div className="flex items-center gap-3 text-[12px] font-black uppercase bg-foreground/10 text-foreground px-6 py-2 rounded-full">
                        {q.type.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <Input 
                        value={q.question} 
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value.toUpperCase() })}
                        placeholder="ENTER PROMPT..."
                        className="text-3xl font-black h-24 border-8 border-foreground bg-white rounded-[2rem] px-10 focus-visible:ring-0 uppercase placeholder:opacity-20"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-foreground hover:bg-foreground hover:text-white h-24 w-24 rounded-[2rem] border-8 border-foreground/10 transition-all">
                        <Trash2 className="h-8 w-8" />
                      </Button>
                    </div>
                    <AIQuestionRefiner 
                      currentQuestion={q.question} 
                      onSelect={(refined) => updateQuestion(q.id, { question: refined.toUpperCase() })}
                    />

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid gap-6 pl-10 border-l-8 border-foreground/10">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-4 items-center group">
                            <GripVertical className="h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                            <Input 
                              value={opt} 
                              onChange={(e) => updateOption(q.id, oIdx, e.target.value.toUpperCase())}
                              className="h-16 border-4 border-foreground/20 bg-foreground/5 rounded-2xl px-8 focus-visible:ring-0 uppercase font-black text-lg"
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
                        <Button variant="outline" onClick={() => {
                           updateQuestion(q.id, { options: [...q.options!, `OPTION ${q.options!.length + 1}`] });
                        }} className="rounded-2xl border-4 border-dashed border-foreground/20 font-black h-16 uppercase">
                          <Plus className="mr-2" /> ADD OPTION
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-foreground p-4 rounded-[4rem] flex items-center gap-4 border-4 border-foreground z-50">
        <Button onClick={() => addQuestion('multiple-choice')} className="rounded-[3rem] h-20 px-8 gap-4 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase tracking-tighter">
          <ListChecks className="h-8 w-8" /> POLL
        </Button>
        <Button onClick={() => addQuestion('word-cloud')} className="rounded-[3rem] h-20 px-8 gap-4 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase tracking-tighter">
          <Cloud className="h-8 w-8" /> CLOUD
        </Button>
        <Button onClick={() => addQuestion('slider')} className="rounded-[3rem] h-20 px-8 gap-4 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase tracking-tighter">
          <SlidersHorizontal className="h-8 w-8" /> SLIDER
        </Button>
      </div>
    </div>
  );
}
