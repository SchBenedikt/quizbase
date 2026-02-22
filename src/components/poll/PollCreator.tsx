"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ListChecks, Cloud, SlidersHorizontal, MessageSquare, Star, ChevronDown, ChevronRight, Timer, CheckCircle2, GripVertical, Hash, ListOrdered, Ruler } from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType } from "@/app/types/poll";
import { cn } from "@/lib/utils";

interface PollCreatorProps {
  onSave?: (questions: PollQuestion[]) => void;
  onChange?: (questions: PollQuestion[]) => void;
  initialQuestions?: PollQuestion[];
}

export function PollCreator({ onChange, initialQuestions = [] }: PollCreatorProps) {
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

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (onChange) {
      onChange(questions);
    }
  }, [questions, onChange]);

  const toggleCollapse = (id: string) => {
    const newCollapsed = new Set(collapsedIds);
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id);
    } else {
      newCollapsed.add(id);
    }
    setCollapsedIds(newCollapsed);
  };

  const addQuestion = (type: PollType) => {
    const newQuestion: PollQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: "",
      options: (type === 'multiple-choice' || type === 'ranking') ? ["Option 1", "Option 2"] : undefined,
      range: (type === 'slider' || type === 'guess-number' || type === 'scale') ? { min: 0, max: type === 'scale' ? 10 : 100, step: 1 } : undefined,
      labels: type === 'scale' ? { min: "Disagree", max: "Agree" } : undefined,
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
    <div className="space-y-6 pb-64 presenter-ui max-w-[1400px] mx-auto">
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isCollapsed = collapsedIds.has(q.id);
          return (
            <Card 
              key={q.id} 
              className={cn(
                "border-2 rounded-[1.5rem] bg-card overflow-hidden transition-all hover:border-primary/20 shadow-none group",
                isCollapsed && "hover:bg-muted/30"
              )}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-16 flex flex-col items-center py-6 bg-muted/20 border-r-2 border-foreground/5 shrink-0">
                    <div className="text-xl font-black opacity-20 mb-4">{idx + 1}</div>
                    <GripVertical className="h-5 w-5 opacity-10" />
                  </div>

                  <div className="flex-1 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleCollapse(q.id)}
                          className="h-10 w-10 rounded-[0.75rem]"
                        >
                          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </Button>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-[0.75rem] text-primary">
                            {q.type === 'multiple-choice' && <ListChecks className="h-5 w-5" />}
                            {q.type === 'word-cloud' && <Cloud className="h-5 w-5" />}
                            {q.type === 'open-text' && <MessageSquare className="h-5 w-5" />}
                            {q.type === 'rating' && <Star className="h-5 w-5" />}
                            {q.type === 'slider' && <SlidersHorizontal className="h-5 w-5" />}
                            {q.type === 'guess-number' && <Hash className="h-5 w-5" />}
                            {q.type === 'ranking' && <ListOrdered className="h-5 w-5" />}
                            {q.type === 'scale' && <Ruler className="h-5 w-5" />}
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest opacity-40">{q.type.replace('-', ' ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCollapsed && (
                          <div className="flex items-center gap-3 mr-4">
                            <Timer className="h-4 w-4 opacity-20" />
                            <Input 
                              type="number"
                              value={q.timeLimit || 0}
                              onChange={(e) => updateQuestion(q.id, { timeLimit: parseInt(e.target.value) || 0 })}
                              className="w-14 h-8 text-xs font-black text-center border-2 rounded-[0.5rem] p-0 bg-transparent"
                            />
                            <span className="text-[10px] font-black uppercase opacity-40">sec</span>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeQuestion(q.id)} 
                          disabled={questions.length <= 1}
                          className="h-10 w-10 rounded-[0.75rem] hover:bg-destructive/5 hover:text-destructive text-foreground/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      {isCollapsed ? (
                        <p className="text-xl font-black uppercase tracking-tighter truncate opacity-60">
                          {q.question || "No question text"}
                        </p>
                      ) : (
                        <div className="space-y-8">
                          <div className="relative">
                            <Input 
                              value={q.question} 
                              onChange={(e) => updateQuestion(q.id, { question: e.target.value.toUpperCase() })}
                              placeholder="TYPE YOUR QUESTION HERE..."
                              className="text-2xl font-black h-20 border-2 bg-muted/10 rounded-[1.25rem] pl-8 pr-16 focus-visible:ring-1 border-foreground/10 uppercase tracking-tighter"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <AIQuestionRefiner 
                                currentQuestion={q.question} 
                                onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                              />
                            </div>
                          </div>

                          {(q.type === 'multiple-choice' || q.type === 'ranking') && q.options && (
                            <div className="space-y-4 pt-2">
                              <div className="flex items-center justify-between px-2">
                                <Label className="text-xs font-black uppercase tracking-widest opacity-40">Options {q.type === 'multiple-choice' && "& Correct Answers"}</Label>
                                {q.type === 'multiple-choice' && <span className="text-[10px] font-black uppercase opacity-30 italic">Toggle correct answers</span>}
                              </div>
                              <div className="grid gap-3">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex gap-3 items-center group/opt">
                                    {q.type === 'multiple-choice' && (
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => toggleCorrectAnswer(q.id, oIdx)}
                                        className={cn(
                                          "h-12 w-12 rounded-[0.75rem] border-2 transition-all shrink-0",
                                          q.correctOptionIndices?.includes(oIdx) 
                                            ? "bg-primary text-primary-foreground border-primary" 
                                            : "bg-foreground/5 text-foreground/10 border-transparent hover:border-primary/20"
                                        )}
                                      >
                                        <CheckCircle2 className="h-5 w-5" />
                                      </Button>
                                    )}
                                    <Input 
                                      value={opt} 
                                      onChange={(e) => {
                                        const newOpts = [...q.options!];
                                        newOpts[oIdx] = e.target.value;
                                        updateQuestion(q.id, { options: newOpts });
                                      }}
                                      className="h-12 border-2 bg-card rounded-[0.75rem] px-6 font-bold text-base focus-visible:ring-0 flex-1 border-foreground/10"
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
                                        className="h-12 w-12 rounded-[0.75rem] hover:bg-destructive/5 hover:text-destructive opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <Button 
                                variant="outline" 
                                onClick={() => updateQuestion(q.id, { options: [...q.options!, `OPTION ${q.options!.length + 1}`] })} 
                                className="w-full rounded-[1rem] border-dashed border-2 h-12 text-[10px] font-black uppercase tracking-widest mt-2 hover:bg-primary/5 hover:border-primary transition-all shadow-none"
                              >
                                <Plus className="mr-2 h-4 w-4" /> Add Option
                              </Button>
                            </div>
                          )}

                          {(q.type === 'slider' || q.type === 'guess-number' || q.type === 'scale') && q.range && (
                            <div className="space-y-6 pt-2">
                               <Label className="text-xs font-black uppercase tracking-widest opacity-40">Numeric Parameters</Label>
                               <div className="grid grid-cols-3 gap-6">
                                 <div className="space-y-2">
                                   <span className="text-[10px] font-black uppercase opacity-30">Min Value</span>
                                   <Input 
                                     type="number"
                                     value={q.range.min}
                                     onChange={(e) => updateQuestion(q.id, { range: { ...q.range!, min: parseInt(e.target.value) || 0 } })}
                                     className="h-12 border-2 rounded-[0.75rem] font-bold"
                                   />
                                 </div>
                                 <div className="space-y-2">
                                   <span className="text-[10px] font-black uppercase opacity-30">Max Value</span>
                                   <Input 
                                     type="number"
                                     value={q.range.max}
                                     onChange={(e) => updateQuestion(q.id, { range: { ...q.range!, max: parseInt(e.target.value) || 100 } })}
                                     className="h-12 border-2 rounded-[0.75rem] font-bold"
                                   />
                                 </div>
                                 <div className="space-y-2">
                                   <span className="text-[10px] font-black uppercase opacity-30">Step</span>
                                   <Input 
                                     type="number"
                                     value={q.range.step}
                                     onChange={(e) => updateQuestion(q.id, { range: { ...q.range!, step: parseInt(e.target.value) || 1 } })}
                                     className="h-12 border-2 rounded-[0.75rem] font-bold"
                                   />
                                 </div>
                               </div>

                               {q.type === 'scale' && q.labels && (
                                 <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                     <span className="text-[10px] font-black uppercase opacity-30">Min Label</span>
                                     <Input 
                                       value={q.labels.min}
                                       onChange={(e) => updateQuestion(q.id, { labels: { ...q.labels!, min: e.target.value } })}
                                       className="h-12 border-2 rounded-[0.75rem] font-bold"
                                     />
                                   </div>
                                   <div className="space-y-2">
                                     <span className="text-[10px] font-black uppercase opacity-30">Max Label</span>
                                     <Input 
                                       value={q.labels.max}
                                       onChange={(e) => updateQuestion(q.id, { labels: { ...q.labels!, max: e.target.value } })}
                                       className="h-12 border-2 rounded-[0.75rem] font-bold"
                                     />
                                   </div>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-background/90 dark:bg-card/90 border-2 border-foreground/10 p-3 rounded-[2rem] flex items-center gap-2 z-50 backdrop-blur-md">
        {[
          { type: 'multiple-choice', icon: ListChecks, label: 'Quiz' },
          { type: 'ranking', icon: ListOrdered, label: 'Rank' },
          { type: 'scale', icon: Ruler, label: 'Scale' },
          { type: 'word-cloud', icon: Cloud, label: 'Cloud' },
          { type: 'open-text', icon: MessageSquare, label: 'Text' },
          { type: 'rating', icon: Star, label: 'Rate' },
          { type: 'slider', icon: SlidersHorizontal, label: 'Slider' },
          { type: 'guess-number', icon: Hash, label: 'Guess' }
        ].map((tool) => (
          <Button 
            key={tool.type}
            onClick={() => addQuestion(tool.type as PollType)} 
            className="h-12 px-5 gap-3 bg-transparent hover:bg-primary hover:text-primary-foreground text-foreground border-2 border-transparent font-black uppercase text-[10px] tracking-widest transition-all shadow-none rounded-[1.5rem]"
          >
            <tool.icon className="h-5 w-5" /> <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
