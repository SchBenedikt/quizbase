"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, GripVertical, ListChecks, Type, Star } from "lucide-react";
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
      options: type === 'multiple-choice' ? ["Option 1", "Option 2"] : undefined,
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
      updateQuestion(questionId, { options: [...q.options, `Option ${q.options.length + 1}`] });
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
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4">
        <h2 className="text-2xl font-bold font-headline text-accent">Design Your Session</h2>
        <Button onClick={() => onSave(questions)} className="rounded-full px-8 shadow-lg shadow-primary/20">
          Save Session
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="border-dashed border-2 bg-secondary/20 py-20 text-center">
          <CardContent className="space-y-4">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Plus className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Your session is empty</h3>
            <p className="text-muted-foreground">Add your first question to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-2 border-transparent hover:border-primary/10 transition-all shadow-md overflow-hidden bg-white">
              <div className="bg-secondary/30 h-1" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-accent text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-grow space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question Text</Label>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase bg-secondary px-2 py-0.5 rounded text-accent">
                          {q.type === 'multiple-choice' && <ListChecks className="h-3 w-3" />}
                          {q.type === 'open-text' && <Type className="h-3 w-3" />}
                          {q.type === 'rating' && <Star className="h-3 w-3" />}
                          {q.type.replace('-', ' ')}
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Input 
                          value={q.question} 
                          onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          placeholder="Type your question here..."
                          className="text-lg font-medium h-12 focus-visible:ring-primary border-none bg-secondary/20"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <AIQuestionRefiner 
                        currentQuestion={q.question} 
                        onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                      />
                    </div>

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choices</Label>
                        <div className="grid gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-2 items-center group">
                              <GripVertical className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity cursor-grab" />
                              <Input 
                                value={opt} 
                                onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                                className="border-none bg-secondary/30 focus-visible:ring-primary/50"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={q.options?.length <= 2}
                                onClick={() => removeOption(q.id, oIdx)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => addOption(q.id)}
                            className="w-fit gap-2 text-primary font-bold mt-2"
                          >
                            <Plus className="h-4 w-4" /> Add Option
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
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-accent/95 backdrop-blur-lg p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-in slide-in-from-bottom-10">
        <Button onClick={() => addQuestion('multiple-choice')} className="rounded-xl h-12 gap-2 bg-transparent hover:bg-white/10 text-white border-none">
          <ListChecks className="h-5 w-5" /> Multiple Choice
        </Button>
        <div className="w-px h-8 bg-white/10" />
        <Button onClick={() => addQuestion('open-text')} className="rounded-xl h-12 gap-2 bg-transparent hover:bg-white/10 text-white border-none">
          <Type className="h-5 w-5" /> Open Text
        </Button>
        <div className="w-px h-8 bg-white/10" />
        <Button onClick={() => addQuestion('rating')} className="rounded-xl h-12 gap-2 bg-transparent hover:bg-white/10 text-white border-none">
          <Star className="h-5 w-5" /> Rating
        </Button>
      </div>
    </div>
  );
}