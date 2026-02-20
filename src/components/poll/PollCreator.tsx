"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical, ListChecks, Type, Star, Cloud, SlidersHorizontal } from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType } from "@/app/types/poll";

interface PollCreatorProps {
  onSave: (questions: PollQuestion[]) => void;
  initialQuestions?: PollQuestion[];
}

export function PollCreator({ onSave, initialQuestions = [] }: PollCreatorProps) {
  const [questions, setQuestions] = useState<PollQuestion[]>(initialQuestions);

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

  const addOption = (questionId: string) => {
    const q = questions.find(q => q.id === questionId);
    if (q && q.options) {
      updateQuestion(questionId, { options: [...q.options, `OPTION ${q.options.length + 1}`] });
    }
  };

  const updateOption = (questionId: string, idx: number, val: string) => {
    const q = questions.find(q => q.id === questionId);
    if (q && q.options) {
      const newOpts = [...q.options];
      newOpts[idx] = val;
      updateQuestion(questionId, { options: newOpts });
    }
  };

  const removeOption = (questionId: string, idx: number) => {
    const q = questions.find(q => q.id === questionId);
    if (q && q.options && q.options.length > 2) {
      updateQuestion(questionId, { options: q.options.filter((_, i) => i !== idx) });
    }
  };

  return (
    <div className="space-y-12 pb-48 text-primary">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/90 backdrop-blur-md py-6 border-b-4 border-primary">
        <h2 className="text-4xl font-black uppercase tracking-tighter">The Lineup</h2>
        <Button onClick={() => onSave(questions)} className="rounded-[2rem] h-16 px-12 text-xl font-black bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase">
          Launch Session
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="border-4 border-dashed border-primary/30 bg-primary/5 py-32 text-center rounded-[4rem] shadow-none">
          <CardContent className="space-y-6">
            <div className="bg-primary text-background w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-primary">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Empty Deck</h3>
            <p className="text-xl font-bold opacity-40 uppercase tracking-widest">Add your first interactive slide.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-4 border-primary rounded-[3rem] overflow-hidden bg-white/10 shadow-none">
              <CardContent className="p-10">
                <div className="flex items-start gap-8">
                  <div className="bg-primary text-background w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border-2 border-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-grow space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Slide Question</Label>
                        <div className="flex items-center gap-3 text-xs font-black uppercase bg-primary text-background px-4 py-1.5 rounded-full border-2 border-primary">
                          {q.type === 'multiple-choice' && <ListChecks className="h-4 w-4" />}
                          {q.type === 'open-text' && <Type className="h-4 w-4" />}
                          {q.type === 'rating' && <Star className="h-4 w-4" />}
                          {q.type === 'word-cloud' && <Cloud className="h-4 w-4" />}
                          {q.type === 'slider' && <SlidersHorizontal className="h-4 w-4" />}
                          {q.type.replace('-', ' ')}
                        </div>
                      </div>
                      <div className="flex gap-4 items-start">
                        <Input 
                          value={q.question} 
                          onChange={(e) => updateQuestion(q.id, { question: e.target.value.toUpperCase() })}
                          placeholder="WHAT IS THE QUESTION?"
                          className="text-3xl font-black h-20 border-4 border-primary bg-white/10 rounded-[2rem] px-8 focus-visible:ring-0 uppercase placeholder:opacity-10 shadow-none"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-primary hover:bg-primary hover:text-background h-16 w-16 rounded-[1.5rem] border-4 border-primary/10 transition-all shadow-none">
                          <Trash2 className="h-6 w-6" />
                        </Button>
                      </div>
                      <AIQuestionRefiner 
                        currentQuestion={q.question} 
                        onSelect={(refined) => updateQuestion(q.id, { question: refined.toUpperCase() })}
                      />
                    </div>

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Choices</Label>
                        <div className="grid gap-3">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-4 items-center group">
                              <GripVertical className="h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity cursor-grab" />
                              <Input 
                                value={opt} 
                                onChange={(e) => updateOption(q.id, oIdx, e.target.value.toUpperCase())}
                                className="h-16 border-4 border-primary/20 bg-white/5 rounded-[1.5rem] px-6 focus-visible:ring-0 uppercase font-bold shadow-none"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={q.options?.length <= 2}
                                onClick={() => removeOption(q.id, oIdx)}
                                className="opacity-0 group-hover:opacity-100 h-12 w-12 rounded-xl transition-all border-2 border-primary/10 text-primary hover:bg-primary hover:text-background shadow-none"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => addOption(q.id)}
                            className="w-fit h-14 px-8 gap-3 text-primary font-black uppercase tracking-widest border-4 border-primary/10 rounded-[1.5rem] hover:bg-primary hover:text-background transition-all shadow-none"
                          >
                            <Plus className="h-5 w-5" /> ADD OPTION
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Menu */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-primary p-3 rounded-[3rem] flex items-center gap-3 border-4 border-primary animate-in slide-in-from-bottom-20 duration-500 z-50">
        <Button onClick={() => addQuestion('multiple-choice')} className="rounded-[2rem] h-20 px-8 gap-4 bg-transparent hover:bg-white/10 text-background border-none text-xl font-black uppercase tracking-tighter shadow-none">
          <ListChecks className="h-8 w-8" /> CHOICE
        </Button>
        <div className="w-1 h-12 bg-background/20 rounded-full" />
        <Button onClick={() => addQuestion('word-cloud')} className="rounded-[2rem] h-20 px-8 gap-4 bg-transparent hover:bg-white/10 text-background border-none text-xl font-black uppercase tracking-tighter shadow-none">
          <Cloud className="h-8 w-8" /> WORDCLOUD
        </Button>
        <div className="w-1 h-12 bg-background/20 rounded-full" />
        <Button onClick={() => addQuestion('slider')} className="rounded-[2rem] h-20 px-8 gap-4 bg-transparent hover:bg-white/10 text-background border-none text-xl font-black uppercase tracking-tighter shadow-none">
          <SlidersHorizontal className="h-8 w-8" /> SLIDER
        </Button>
        <div className="w-1 h-12 bg-background/20 rounded-full" />
        <Button onClick={() => addQuestion('rating')} className="rounded-[2rem] h-20 px-8 gap-4 bg-transparent hover:bg-white/10 text-background border-none text-xl font-black uppercase tracking-tighter shadow-none">
          <Star className="h-8 w-8" /> STARS
        </Button>
      </div>
    </div>
  );
}
