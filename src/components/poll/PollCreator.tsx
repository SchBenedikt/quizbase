"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Trash2, Plus, ListChecks, Cloud, SlidersHorizontal, MessageSquare, 
  Star, ChevronDown, ChevronRight, Timer, CheckCircle2, 
  Hash, ListOrdered, Ruler, ArrowUp, ArrowDown, Zap, Image as ImageIcon, ToggleLeft
} from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface PollCreatorProps {
  onSave?: (questions: PollQuestion[]) => void;
  onChange?: (questions: PollQuestion[]) => void;
  initialQuestions?: PollQuestion[];
  isQuiz?: boolean;
}

export function PollCreator({ onChange, initialQuestions = [], isQuiz = false }: PollCreatorProps) {
  const [questions, setQuestions] = useState<PollQuestion[]>(initialQuestions.length > 0 ? initialQuestions : [
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: "What is our primary focus for next quarter?",
      options: ["Growth", "Stability", "Innovation"],
      correctOptionIndices: [],
      timeLimit: 20,
      isDoublePoints: false,
      createdAt: Date.now()
    }
  ]);

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set(questions.map(q => q.id)));

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
      options: (type === 'multiple-choice' || type === 'ranking') ? ["Option 1", "Option 2"] : 
               type === 'true-false' ? ["True", "False"] : undefined,
      range: (type === 'slider' || type === 'guess-number' || type === 'scale') ? { min: 0, max: type === 'scale' ? 10 : 100, step: 1 } : undefined,
      labels: type === 'scale' ? { min: "Disagree", max: "Agree" } : undefined,
      correctOptionIndices: [],
      timeLimit: 20,
      isDoublePoints: false,
      createdAt: Date.now()
    };
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    // Add new question to collapsed state
    setCollapsedIds(prev => new Set([...prev, newQuestion.id]));
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
    if (targetIdx < 0 || targetIdx >= newQuestions.length) return;
    
    const temp = newQuestions[idx];
    newQuestions[idx] = newQuestions[targetIdx];
    newQuestions[targetIdx] = temp;
    
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
    <div className="space-y-6 pb-32">
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isCollapsed = collapsedIds.has(q.id);
          return (
            <Card 
              key={q.id} 
              className={cn(
                "border border-foreground/8 rounded-xl bg-card overflow-hidden transition-all hover:border-primary/20 shadow-none group",
                isCollapsed && "hover:bg-muted/20",
                q.isDoublePoints && "border-yellow-400/30"
              )}
            >
              <CardContent className="p-0">
                <div className="flex h-full">
                  <div className={cn(
                    "w-16 flex flex-col items-center bg-muted/10 border-r border-foreground/5 shrink-0 gap-3",
                    isCollapsed ? "py-4" : "py-8"
                  )}>
                    <div className="text-xl font-semibold opacity-30">{idx + 1}</div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="h-10 w-10 rounded-lg hover:bg-primary/10 disabled:opacity-20 border border-transparent hover:border-primary/20 shadow-none"
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveQuestion(idx, 'down')}
                        disabled={idx === questions.length - 1}
                        className="h-10 w-10 rounded-lg hover:bg-primary/10 disabled:opacity-20 border border-transparent hover:border-primary/20 shadow-none"
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className={cn("flex-1 flex flex-col justify-center", isCollapsed ? "p-6" : "p-8 space-y-8")}>
                    <header className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleCollapse(q.id)}
                          className="h-12 w-12 rounded-xl border border-foreground/5 bg-card hover:bg-muted shadow-none"
                        >
                          {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                        </Button>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex items-center justify-center bg-primary text-primary-foreground rounded-xl shadow-none",
                            isCollapsed ? "w-10 h-10" : "w-12 h-12"
                          )}>
                            {q.type === 'multiple-choice' && <ListChecks className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'true-false' && <ToggleLeft className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'word-cloud' && <Cloud className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'open-text' && <MessageSquare className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'rating' && <Star className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'slider' && <SlidersHorizontal className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'guess-number' && <Hash className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'ranking' && <ListOrdered className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                            {q.type === 'scale' && <Ruler className={isCollapsed ? "h-5 w-5" : "h-6 w-6"} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium uppercase tracking-wide opacity-50 leading-none mb-2">Type</span>
                            <span className={cn("font-semibold capitalize tracking-tight leading-none", isCollapsed ? "text-base" : "text-lg")}>{q.type.replace('-', ' ')}</span>
                          </div>
                          {isCollapsed && q.question && (
                            <div className="ml-4 border-l border-foreground/10 pl-4 truncate max-w-md hidden lg:block">
                              <span className="text-base font-medium opacity-60">{q.question}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeQuestion(q.id)} 
                          disabled={questions.length <= 1}
                          className="h-10 w-10 rounded-lg hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 text-muted-foreground/40 shadow-none"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </header>

                    {!isCollapsed && (
                      <div className="grid lg:grid-cols-[1fr,300px] gap-8">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <Label className="text-base font-medium">Question</Label>
                            <div className="relative group">
                              <Input 
                                value={q.question} 
                                onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                                placeholder="Enter your question here..."
                                className="text-2xl font-semibold h-14 border border-foreground/10 bg-card rounded-lg px-5 focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <AIQuestionRefiner 
                                  currentQuestion={q.question} 
                                  onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                                />
                              </div>
                            </div>
                          </div>

                              {(q.type === 'multiple-choice' || q.type === 'ranking' || q.type === 'true-false') && q.options && (
                            <div className="space-y-5">
                              <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Answer options</Label>
                                {(q.type === 'multiple-choice' || q.type === 'true-false') && isQuiz && <span className="text-sm font-medium text-primary">Select correct answer</span>}
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex gap-3 group/opt">
                                    {(q.type === 'multiple-choice' || q.type === 'true-false') && isQuiz && (
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => toggleCorrectAnswer(q.id, oIdx)}
                                        className={cn(
                                          "h-12 w-12 rounded-lg border transition-all shrink-0 shadow-none",
                                          q.correctOptionIndices?.includes(oIdx) 
                                            ? "bg-green-500 text-white border-green-600" 
                                            : "bg-muted/20 text-muted-foreground border-foreground/10 hover:border-primary/40"
                                        )}
                                      >
                                        <CheckCircle2 className="h-6 w-6" />
                                      </Button>
                                    )}
                                    <div className="flex-1 relative">
                                      <Input 
                                        value={opt} 
                                        readOnly={q.type === 'true-false'}
                                        onChange={(e) => {
                                          const newOpts = [...q.options!];
                                          newOpts[oIdx] = e.target.value;
                                          updateQuestion(q.id, { options: newOpts });
                                        }}
                                        className={cn("h-12 border border-foreground/10 bg-card rounded-lg px-4 font-medium text-base focus-visible:ring-1 focus-visible:ring-primary shadow-none", q.type === 'true-false' && "opacity-60 cursor-default")}
                                      />
                                      {q.type !== 'true-false' && q.options!.length > 2 && (
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
                                          className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/opt:opacity-100 transition-opacity shadow-none"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {q.type !== 'true-false' && (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => updateQuestion(q.id, { options: [...q.options!, `New option`] })} 
                                    className="h-12 rounded-lg border-dashed border-foreground/20 font-medium hover:bg-primary/5 hover:border-primary transition-colors text-base shadow-none"
                                  >
                                    <Plus className="mr-3 h-5 w-5" /> Add option
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6 lg:border-l lg:border-foreground/5 lg:pl-8">
                           <div className="space-y-5">
                              <Label className="text-base font-medium">Visual anchor</Label>
                              <div className="aspect-[4/3] bg-muted/20 rounded-lg border border-dashed border-foreground/10 flex flex-col items-center justify-center gap-4 overflow-hidden relative group/image">
                                {q.imageHint ? (
                                  <img 
                                    src={`https://picsum.photos/seed/${q.imageHint}/800/600`} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover opacity-80 group-hover/image:opacity-100 transition-opacity" 
                                  />
                                ) : (
                                  <ImageIcon className="h-10 w-10 opacity-20" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                                   <p className="text-white font-medium text-base">Stage visual anchor</p>
                                </div>
                              </div>
                              <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
                                <Input 
                                  value={q.imageHint || ""} 
                                  onChange={(e) => updateQuestion(q.id, { imageHint: e.target.value })}
                                  placeholder="Visual keyword..."
                                  className="h-12 pl-12 rounded-lg text-base border border-foreground/10 bg-card focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                                />
                              </div>
                           </div>

                           <div className="space-y-5 pt-5 border-t border-foreground/5">
                              <Label className="text-base font-medium">Parameters</Label>
                              
                              {isQuiz && (
                                <div className="flex items-center justify-between p-5 rounded-lg border border-foreground/10 bg-muted/20">
                                   <div className="flex items-center gap-4">
                                      <Zap className={cn("h-5 w-5 transition-colors", q.isDoublePoints ? "text-yellow-500 fill-current" : "opacity-30")} />
                                      <div className="flex flex-col">
                                         <span className="text-base font-medium leading-none">Double points</span>
                                         <span className="text-sm opacity-50 mt-1">High stakes</span>
                                      </div>
                                   </div>
                                   <Switch 
                                      checked={q.isDoublePoints} 
                                      onCheckedChange={(val) => updateQuestion(q.id, { isDoublePoints: val })} 
                                   />
                                </div>
                              )}

                              <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium opacity-50">Time limit</span>
                                    <span className="text-base font-medium tabular-nums">{q.timeLimit || 0}s</span>
                                 </div>
                                 <Input 
                                    type="number"
                                    value={q.timeLimit || 0}
                                    onChange={(e) => updateQuestion(q.id, { timeLimit: parseInt(e.target.value) || 0 })}
                                    className="h-12 text-center text-xl font-semibold border border-foreground/10 bg-card rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                                 />
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background p-4 rounded-xl flex items-center gap-4 z-50 border border-background/20 shadow-lg">
        <div className="flex items-center gap-3 px-5 py-3 border-r border-background/10">
           <Plus className="h-5 w-5" />
           <span className="text-sm font-medium uppercase tracking-wide">Add</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto max-w-[70vw] no-scrollbar px-4">
          {[
            { type: 'multiple-choice', icon: ListChecks, label: 'Choice' },
            { type: 'true-false', icon: ToggleLeft, label: 'True/False' },
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
              className="h-10 px-4 gap-3 bg-white/10 hover:bg-primary hover:text-primary-foreground border border-transparent font-medium text-sm transition-colors shadow-none rounded-lg whitespace-nowrap"
            >
              <tool.icon className="h-4 w-4" /> {tool.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
