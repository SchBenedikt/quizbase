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
  const [questions, setQuestions] = useState<PollQuestion[]>(initialQuestions);
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
      <Card className="border-4 border-foreground rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Palette className="h-6 w-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Choose Visual Vibe</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {themes.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setSelectedTheme(t.name)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl border-4 transition-all hover:scale-105 active:scale-95",
                  selectedTheme === t.name 
                    ? "border-foreground scale-105 bg-foreground text-background" 
                    : "border-foreground/10 bg-white text-foreground"
                )}
              >
                <div 
                  className="w-8 h-8 rounded-full border-2 border-foreground"
                  style={{ backgroundColor: t.color }}
                />
                <span className="font-black uppercase tracking-tighter text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md py-6 border-b-4 border-foreground">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Question Lineup</h2>
        <Button 
          type="button"
          onClick={() => onSave(questions, selectedTheme)} 
          className="rounded-[2rem] h-14 px-10 text-lg font-black bg-foreground text-white hover:opacity-90 transition-all uppercase"
        >
          Launch Live Session
        </Button>
      </div>

      <div className="grid gap-6">
        {questions.length === 0 ? (
          <div className="p-20 border-8 border-dashed border-foreground/10 rounded-[4rem] text-center space-y-6">
            <p className="text-2xl font-black opacity-20 uppercase tracking-tighter">Your lineup is empty</p>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest leading-none">Add questions using the menu below</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <Card key={q.id} className="border-4 border-foreground rounded-[2.5rem] bg-white overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="bg-foreground text-background w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-grow space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Slide Content</Label>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-foreground/10 text-foreground px-4 py-1 rounded-full">
                        {q.type.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Input 
                        value={q.question} 
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value.toUpperCase() })}
                        placeholder="ENTER QUESTION..."
                        className="text-xl font-black h-16 border-4 border-foreground bg-white rounded-2xl px-6 focus-visible:ring-0 uppercase placeholder:opacity-20"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-foreground hover:bg-foreground hover:text-white h-16 w-16 rounded-2xl border-4 border-foreground/10 transition-all">
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>
                    <AIQuestionRefiner 
                      currentQuestion={q.question} 
                      onSelect={(refined) => updateQuestion(q.id, { question: refined.toUpperCase() })}
                    />

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid gap-3 pl-4 border-l-4 border-foreground/10">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-3 items-center">
                            <GripVertical className="h-5 w-5 opacity-20" />
                            <Input 
                              value={opt} 
                              onChange={(e) => updateOption(q.id, oIdx, e.target.value.toUpperCase())}
                              className="h-12 border-2 border-foreground/20 bg-foreground/5 rounded-xl px-4 focus-visible:ring-0 uppercase font-bold text-sm"
                            />
                          </div>
                        ))}
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
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-foreground p-2 rounded-[2.5rem] flex items-center gap-2 border-4 border-foreground z-50">
        <Button onClick={() => addQuestion('multiple-choice')} className="rounded-[2rem] h-16 px-6 gap-3 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase tracking-tighter">
          <ListChecks className="h-6 w-6" /> POLL
        </Button>
        <Button onClick={() => addQuestion('word-cloud')} className="rounded-[2rem] h-16 px-6 gap-3 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase tracking-tighter">
          <Cloud className="h-6 w-6" /> CLOUD
        </Button>
        <Button onClick={() => addQuestion('slider')} className="rounded-[2rem] h-16 px-6 gap-3 bg-transparent hover:bg-white/10 text-white border-none font-black uppercase tracking-tighter">
          <SlidersHorizontal className="h-6 w-6" /> SLIDER
        </Button>
      </div>
    </div>
  );
}