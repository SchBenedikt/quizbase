
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, X } from "lucide-react";
import { aiQuestionSuggester } from "@/ai/flows/ai-question-suggester";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AIQuestionRefinerProps {
  currentQuestion: string;
  onSelect: (newQuestion: string) => void;
}

export function AIQuestionRefiner({ currentQuestion, onSelect }: AIQuestionRefinerProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleSuggest = async () => {
    if (!currentQuestion) return;
    setLoading(true);
    try {
      const result = await aiQuestionSuggester({ question: currentQuestion });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button"
          variant="ghost" 
          size="icon"
          onClick={handleSuggest}
          disabled={loading || !currentQuestion}
          className="rounded-[1rem] h-12 w-12 text-primary hover:bg-primary/10 transition-all shadow-none"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      
      {suggestions.length > 0 && (
        <PopoverContent className="w-[450px] p-6 rounded-[1.5rem] border-2 border-foreground/10 bg-background flex flex-col gap-4 shadow-none mr-12" align="end">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-primary opacity-40 uppercase tracking-[0.4em]">AI Proposals</p>
            <Button variant="ghost" size="icon" onClick={() => setSuggestions([])} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3">
            {suggestions.map((suggestion, idx) => (
              <Card 
                key={idx} 
                className="cursor-pointer border-2 border-primary/10 hover:border-primary hover:bg-primary/5 transition-all group rounded-[1.25rem] overflow-hidden bg-white/5 shadow-none"
                onClick={() => {
                  onSelect(suggestion.toUpperCase());
                  setSuggestions([]);
                  setOpen(false);
                }}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                  <span className="text-sm font-bold uppercase tracking-tight leading-tight">{suggestion}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
