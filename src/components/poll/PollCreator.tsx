
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Trash2, Plus, ListChecks, Cloud, SlidersHorizontal, MessageSquare, 
  Star, ChevronDown, ChevronRight, Timer, CheckCircle2, GripVertical, 
  Hash, ListOrdered, Ruler, ArrowUp, ArrowDown, Zap, Image as ImageIcon 
} from "lucide-react";
import { AIQuestionRefiner } from "./AIQuestionRefiner";
import { PollQuestion, PollType } from "@/app/types/poll";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

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
      question: "What is our primary focus for next quarter?",
      options: ["Growth", "Stability", "Innovation"],
      correctOptionIndices: [],
      timeLimit: 0,
      isDoublePoints: false,
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
      isDoublePoints: false,
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
    <div className="space-y-6 pb-64 presenter-ui max-w-[1200px] mx-auto">
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isCollapsed = collapsedIds.has(q.id);
          return (
            <Card 
              key={q.id} 
              className={cn(
                "border-2 rounded-[1.25rem] bg-card overflow-hidden transition-all hover:border-primary/20 shadow-sm group",
                isCollapsed && "hover:bg-muted/30",
                q.isDoublePoints && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-14 flex flex-col items-center py-6 bg-muted/20 border-r-2 border-foreground/5 shrink-0 gap-4">
                    <div className="text-lg font-black opacity-20">{idx + 1}</div>
                    <div className="flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="h-7 w-7 rounded-[0.4rem] hover:bg-primary/10 disabled:opacity-5"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveQuestion(idx, 'down')}
                        disabled={idx === questions.length - 1}
                        className="h-7 w-7 rounded-[0.4rem] hover:bg-primary/10 disabled:opacity-5"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <GripVertical className="h-4 w-4 opacity-10 mt-auto" />
                  </div>

                  <div className="flex-1 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleCollapse(q.id)}
                          className="h-9 w-9 rounded-[0.6rem]"
                        >
                          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-[0.6rem] text-primary">
                            {q.type === 'multiple-choice' && <ListChecks className="h-4 w-4" />}
                            {q.type === 'word-cloud' && <Cloud className="h-4 w-4" />}
                            {q.type === 'open-text' && <MessageSquare className="h-4 w-4" />}
                            {q.type === 'rating' && <Star className="h-4 w-4" />}
                            {q.type === 'slider' && <SlidersHorizontal className="h-4 w-4" />}
                            {q.type === 'guess-number' && <Hash className="h-4 w-4" />}
                            {q.type === 'ranking' && <ListOrdered className="h-4 w-4" />}
                            {q.type === 'scale' && <Ruler className="h-4 w-4" />}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{q.type.replace('-', ' ')}</span>
                          {q.isDoublePoints && (
                            <Zap className="h-4 w-4 text-primary fill-current animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {!isCollapsed && (
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              <Zap className="h-3.5 w-3.5 text-primary" />
                              <Switch 
                                checked={q.isDoublePoints} 
                                onCheckedChange={(val) => updateQuestion(q.id, { isDoublePoints: val })} 
                              />
                              <span className="text-[9px] font-black uppercase opacity-40">2X Points</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Timer className="h-3.5 w-3.5 opacity-20" />
                              <Input 
                                type="number"
                                value={q.timeLimit || 0}
                                onChange={(e) => updateQuestion(q.id, { timeLimit: parseInt(e.target.value) || 0 })}
                                className="w-12 h-7 text-[10px] font-black text-center border-2 rounded-[0.4rem] p-0 bg-transparent"
                              />
                              <span className="text-[9px] font-black uppercase opacity-40">sec</span>
                            </div>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeQuestion(q.id)} 
                          disabled={questions.length <= 1}
                          className="h-9 w-9 rounded-[0.6rem] hover:bg-destructive/5 hover:text-destructive text-foreground/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      {isCollapsed ? (
                        <p className="text-lg font-bold tracking-tight truncate opacity-60">
                          {q.question || "No question text draft"}
                        </p>
                      ) : (
                        <div className="space-y-8">
                          <div className="grid md:grid-cols-[1fr,240px] gap-8">
                            <div className="space-y-4">
                              <div className="relative">
                                <Input 
                                  value={q.question} 
                                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                                  placeholder="Type your question draft..."
                                  className="text-xl font-bold h-16 border-2 bg-muted/5 rounded-[1rem] pl-6 pr-14 focus-visible:ring-1 border-foreground/5 tracking-tight"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <AIQuestionRefiner 
                                    currentQuestion={q.question} 
                                    onSelect={(refined) => updateQuestion(q.id, { question: refined })}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20" />
                                  <Input 
                                    value={q.imageHint || ""} 
                                    onChange={(e) => updateQuestion(q.id, { imageHint: e.target.value, imageUrl: e.target.value ? `https://picsum.photos/seed/${Math.random()}/800/600` : "" })}
                                    placeholder="Visual Context (e.g. 'Modern Office')..."
                                    className="h-10 pl-11 rounded-[0.75rem] text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="aspect-video bg-muted/30 rounded-[1rem] border-2 border-dashed border-foreground/5 flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                              {q.imageHint ? (
                                <img src={`https://picsum.photos/seed/${q.imageHint}/800/600`} alt="Preview" className="w-full h-full object-cover opacity-50" />
                              ) : (
                                <ImageIcon className="h-8 w-8 opacity-10" />
                              )}
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-20 absolute bottom-3">Stage Visual Preview</span>
                            </div>
                          </div>

                          {(q.type === 'multiple-choice' || q.type === 'ranking') && q.options && (
                            <div className="space-y-4 pt-2">
                              <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Options {q.type === 'multiple-choice' && "& Correct Answers"}</Label>
                                {q.type === 'multiple-choice' && <span className="text-[9px] font-bold opacity-30 italic">Toggle correct answers</span>}
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
                                          "h-10 w-10 rounded-[0.6rem] border-2 transition-all shrink-0",
                                          q.correctOptionIndices?.includes(oIdx) 
                                            ? "bg-primary text-primary-foreground border-primary" 
                                            : "bg-foreground/5 text-foreground/10 border-transparent hover:border-primary/20"
                                        )}
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Input 
                                      value={opt} 
                                      onChange={(e) => {
                                        const newOpts = [...q.options!];
                                        newOpts[oIdx] = e.target.value;
                                        updateQuestion(q.id, { options: newOpts });
                                      }}
                                      className="h-11 border-2 bg-card rounded-[0.6rem] px-5 font-medium text-sm focus-visible:ring-0 flex-1 border-foreground/5"
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
                                        className="h-10 w-10 rounded-[0.6rem] hover:bg-destructive/5 hover:text-destructive opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <Button 
                                variant="outline" 
                                onClick={() => updateQuestion(q.id, { options: [...q.options!, `New Option`] })} 
                                className="w-full rounded-[0.75rem] border-dashed border-2 h-11 text-[9px] font-black uppercase tracking-widest mt-2 hover:bg-primary/5 hover:border-primary transition-all shadow-none"
                              >
                                <Plus className="mr-2 h-3.5 w-3.5" /> Add Option
                              </Button>
                            </div>
                          )}

                          {(q.type === 'slider' || q.type === 'guess-number' || q.type === 'scale') && q.range && (
                            <div className="space-y-6 pt-2">
                               <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Numeric Parameters</Label>
                               <div className="grid grid-cols-3 gap-6">
                                 <div className="space-y-2">
                                   <span className="text-[9px] font-black uppercase opacity-30">Min</span>
                                   <Input 
                                     type="number"
                                     value={q.range.min}
                                     onChange={(e) => updateQuestion(q.id, { range: { ...q.range!, min: parseInt(e.target.value) || 0 } })}
                                     className="h-10 border-2 rounded-[0.6rem] font-bold text-sm"
                                   />
                                 </div>
                                 <div className="space-y-2">
                                   <span className="text-[9px] font-black uppercase opacity-30">Max</span>
                                   <Input 
                                     type="number"
                                     value={q.range.max}
                                     onChange={(e) => updateQuestion(q.id, { range: { ...q.range!, max: parseInt(e.target.value) || 100 } })}
                                     className="h-10 border-2 rounded-[0.6rem] font-bold text-sm"
                                   />
                                 </div>
                                 <div className="space-y-2">
                                   <span className="text-[9px] font-black uppercase opacity-30">Step</span>
                                   <Input 
                                     type="number"
                                     value={q.range.step}
                                     onChange={(e) => updateQuestion(q.id, { range: { ...q.range!, step: parseInt(e.target.value) || 1 } })}
                                     className="h-10 border-2 rounded-[0.6rem] font-bold text-sm"
                                   />
                                 </div>
                               </div>

                               {q.type === 'scale' && q.labels && (
                                 <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                     <span className="text-[9px] font-black uppercase opacity-30">Lower Label</span>
                                     <Input 
                                       value={q.labels.min}
                                       onChange={(e) => updateQuestion(q.id, { labels: { ...q.labels!, min: e.target.value } })}
                                       className="h-10 border-2 rounded-[0.6rem] font-bold text-sm"
                                     />
                                   </div>
                                   <div className="space-y-2">
                                     <span className="text-[9px] font-black uppercase opacity-30">Upper Label</span>
                                     <Input 
                                       value={q.labels.max}
                                       onChange={(e) => updateQuestion(q.id, { labels: { ...q.labels!, max: e.target.value } })}
                                       className="h-10 border-2 rounded-[0.6rem] font-bold text-sm"
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

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-background/90 dark:bg-card/90 border-2 border-foreground/5 p-2.5 rounded-[1.5rem] flex items-center gap-1.5 z-50 backdrop-blur-md shadow-2xl">
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
            className="h-10 px-4 gap-2.5 bg-transparent hover:bg-primary hover:text-primary-foreground text-foreground border-2 border-transparent font-black uppercase text-[9px] tracking-widest transition-all shadow-none rounded-[1rem]"
          >
            <tool.icon className="h-4 w-4" /> <span className="hidden md:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
