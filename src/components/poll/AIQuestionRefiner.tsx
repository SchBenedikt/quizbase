"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { aiQuestionSuggester } from "@/ai/flows/ai-question-suggester";
import { Card, CardContent } from "@/components/ui/card";

interface AIQuestionRefinerProps {
  currentQuestion: string;
  onSelect: (newQuestion: string) => void;
}

export function AIQuestionRefiner({ currentQuestion, onSelect }: AIQuestionRefinerProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
    <div className="space-y-6">
      <Button 
        type="button"
        variant="outline" 
        size="lg"
        onClick={handleSuggest}
        disabled={loading || !currentQuestion}
        className="rounded-full h-14 px-8 gap-3 border-4 border-primary/20 text-primary font-black uppercase tracking-widest hover:bg-primary hover:text-background transition-all"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        AI Refine
      </Button>

      {suggestions.length > 0 && (
        <div className="grid gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-[10px] font-black text-primary opacity-40 uppercase tracking-[0.4em] px-2">AI Proposals</p>
          {suggestions.map((suggestion, idx) => (
            <Card 
              key={idx} 
              className="cursor-pointer border-4 border-primary/10 hover:border-primary hover:bg-primary/5 transition-all group rounded-[2rem] overflow-hidden bg-white/5"
              onClick={() => {
                onSelect(suggestion.toUpperCase());
                setSuggestions([]);
              }}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                <span className="text-xl font-black uppercase tracking-tighter leading-none">{suggestion}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}