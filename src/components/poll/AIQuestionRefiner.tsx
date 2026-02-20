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
    <div className="space-y-4">
      <Button 
        type="button"
        variant="outline" 
        size="sm"
        onClick={handleSuggest}
        disabled={loading || !currentQuestion}
        className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary hover:text-white"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Refine with AI
      </Button>

      {suggestions.length > 0 && (
        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">AI Suggestions</p>
          {suggestions.map((suggestion, idx) => (
            <Card 
              key={idx} 
              className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => {
                onSelect(suggestion);
                setSuggestions([]);
              }}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                <span className="text-sm leading-tight">{suggestion}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}