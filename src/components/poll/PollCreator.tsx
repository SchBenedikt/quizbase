"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ListChecks, Cloud, SlidersHorizontal, MessageSquare, Star, ChevronDown, ChevronUp, Map, Timer, CheckCircle2, GripVertical } from "lucide-react";
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
      correctOptionIndices: [],
      timeLimit: 0,
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
      correctOptionIndices: [],
      timeLimit: 0,
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

  const toggleCorrectAnswer = (qId: string, optIdx: number) => {
    const question = questions.find(q => q.id === qId);
    if (!question) return;

    const currentIndices = question.correctOptionIndices || [];
    const newIndices = currentIndices.includes(optIdx)
      ? currentIndices.filter(i => i !== optIdx)
      : [...currentIndices, optIdx];

    updateQuestion(qId, { correctOptionIndices: newIndices });
  };

  return (
    <div className="space-y-16 pb-64 presenter-ui max-w-[1400px] mx-auto">
      {/* Interaction Flow Header */}
      <div className="sticky top-24 z-30 bg-background/90 backdrop-blur-md py-8 border-b-2 border-foreground/10 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 rounded-[1.5rem] px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-tight">Interaction Flow</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => scrollToQuestion(q.id)}
                className="group relative flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-[1rem] border-2 border-foreground/10 hover:border-primary hover:bg-primary/5 transition-all font-black text-sm flex items-center justify-center bg-card shadow-none">
                  {idx + 1}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background scale-0 group-hover:scale-100 transition-transform" />
              </button>
            ))}
            <button 
              onClick={() => addQuestion('multiple-choice')}
              className="w-12 h-12 rounded-[1rem] border-2 border-dashed border-foreground/20 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
            >
              <Plus className="h-5 w-5 opacity-40" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Steps</p>
          <p className="text-4xl font-black tracking-tighter leading-none">{questions.length}</p>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-12">
        {questions.map((q, idx) => (
          <Card 
            key={q.id} 
            ref={(el) => { questionRefs.current[q.id] = el; }}
            className="border-2 rounded-[1.5rem] bg-card overflow-hidden transition-all hover:border-primary/20 shadow-none scroll-mt-64 group"
          >
            <CardContent className="p-0">
              <div className="flex">
                {/* Left Drag/Order Bar */}
                <div className="w-16 flex flex-col items-center justify-between py-8 bg-muted/20 border-r-2 border-foreground/5 shrink-0">
                  <div className="text-2xl font-black opacity-20">{idx + 1}</div>
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="h-10 w-10 rounded-[0.75rem] hover:bg-foreground/5">
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="h-10 w-10 rounded-[0.75rem] hover:bg-foreground/5">
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </div>
                  <GripVertical className="h-5 w-5 opacity-10" />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-[1rem] text-primary">
                          {q.type === 'multiple-choice' && <ListChecks className="h-6 w-6" />}
                          {q.type === 'word-cloud' && <Cloud className="h-6 w-6" />}
                          {q.type === 'open-text' && <MessageSquare className="h-6 w-6" />}
                          {q.type === 'rating' && <Star className="h-6 w-6" />}
                          {q.type === 'slider' && <SlidersHorizontal className="h-6 w-6" />}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">{q.type.replace('-', ' ')}</span>
                      </div>
                      
                      <div className="h-8 w-px bg-foreground/10" />

                      <div className="flex items-center gap-4">
                        <Timer className="h-5 w-5 opacity-20" />
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            value={q.timeLimit || 0}
                            onChange={(e) => updateQuestion(q.id, { timeLimit: parseInt(e.target.value) || 0 })}
                            className="w-16 h-10 text-sm font-black text-center border-2 rounded-[0.75rem] p-0 bg-transparent"
                            placeholder="0"
                          />
                          <span className="text-xs font-black uppercase opacity-40 tracking-tight">seconds</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeQuestion(q.id)} 
                      disabled={questions.length <= 1}
                      className="h-12 w-12 rounded-[1rem] hover:bg-destructive/5 hover:text-destructive transition-colors text-foreground/20"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="relative">
                    <Input 
                      value={q.question} 
                      onChange={(e) => updateQuestion(q.id, { question: e.target.value.toUpperCase() })}
                      placeholder="TYPE YOUR QUESTION HERE..."
                      className="text-3xl font-black h-24 border-2 bg-muted/10 rounded-[1.25rem] pl-10 pr-20 focus-visible:ring-1 border-foreground/10 uppercase tracking-tighter"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AIQuestionRefiner 
                        currentQuestion={q.question} 
                        onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                      />
                    </div>
                  </div>

                  {q.type === 'multiple-choice' && q.options && (
                    <div className="space-y-4 pt-6">
                      <div className="flex items-center justify-between px-4">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-40">Options & Correct Answers</Label>
                        <span className="text-[10px] font-black uppercase opacity-30 italic">Check multiple for multi-correct quizzes</span>
                      </div>
                      <div className="grid gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-4 items-center group/opt">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleCorrectAnswer(q.id, oIdx)}
                              className={cn(
                                "h-14 w-14 rounded-[1rem] border-2 transition-all shrink-0",
                                q.correctOptionIndices?.includes(oIdx) 
                                  ? "bg-primary text-primary-foreground border-primary" 
                                  : "bg-foreground/5 text-foreground/10 border-transparent hover:border-primary/20"
                              )}
                            >
                              <CheckCircle2 className="h-6 w-6" />
                            </Button>
                            <Input 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...q.options!];
                                newOpts[oIdx] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                              className="h-14 border-2 bg-card rounded-[1rem] px-8 font-bold text-lg focus-visible:ring-0 flex-1 border-foreground/10"
                            />
                            {q.options!.length > 2 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  const newOpts = q.options!.filter((_, i) => i !== oIdx);
                                  const newIndices = (q.correctOptionIndices || [])
                                    .filter(i => i !== oIdx)
                                    .map(i => i > oIdx ? i - 1 : i);
                                  updateQuestion(q.id, { options: newOpts, correctOptionIndices: newIndices });
                                }} 
                                className="h-14 w-14 rounded-[1rem] hover:bg-destructive/5 hover:text-destructive opacity-0 group-hover/opt:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => updateQuestion(q.id, { options: [...q.options!, `OPTION ${q.options!.length + 1}`] })} 
                        className="w-full rounded-[1.25rem] border-dashed border-2 h-16 text-xs font-black uppercase tracking-widest mt-4 hover:bg-primary/5 hover:border-primary transition-all shadow-none"
                      >
                        <Plus className="mr-3 h-5 w-5" /> Add Option
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Tool Dock */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-background dark:bg-card border-2 border-foreground/10 p-4 rounded-[2.5rem] flex items-center gap-4 z-50 backdrop-blur-md">
        {[
          { type: 'multiple-choice', icon: ListChecks, label: 'Quiz' },
          { type: 'word-cloud', icon: Cloud, label: 'Cloud' },
          { type: 'open-text', icon: MessageSquare, label: 'Text' },
          { type: 'rating', icon: Star, label: 'Rate' },
          { type: 'slider', icon: SlidersHorizontal, label: 'Slider' }
        ].map((tool) => (
          <Button 
            key={tool.type}
            onClick={() => addQuestion(tool.type as PollType)} 
            className="h-16 px-8 gap-4 bg-transparent hover:bg-primary hover:text-primary-foreground text-foreground border-2 border-transparent font-black uppercase text-sm tracking-widest transition-all shadow-none rounded-[2rem]"
          >
            <tool.icon className="h-6 w-6" /> <span className="hidden lg:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
