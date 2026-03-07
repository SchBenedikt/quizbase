"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { PollQuestion } from "@/app/types/poll";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultChartProps {
  question: PollQuestion;
  results: Record<string, number>;
  allResponses?: any[];
  isQuizMode?: boolean;
}

export function ResultChart({ question, results, allResponses = [], isQuizMode = false }: ResultChartProps) {
  const chartColor = 'currentColor';

  if ((question.type === 'multiple-choice' || question.type === 'true-false' || question.type === 'ranking') && question.options) {
    let data: any[] = [];

    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      data = question.options.map((opt, idx) => ({
        name: opt,
        value: results[idx] || 0,
        isCorrect: isQuizMode && question.correctOptionIndices?.includes(idx)
      }));
    } else {
      const optionScores: Record<number, number> = {};
      const numOptions = question.options.length;
      
      allResponses.forEach(res => {
        if (Array.isArray(res.value)) {
          res.value.forEach((optIdx: number, rankIdx: number) => {
            const points = numOptions - rankIdx;
            optionScores[optIdx] = (optionScores[optIdx] || 0) + points;
          });
        }
      });

      data = question.options.map((opt, idx) => ({
        name: opt,
        value: allResponses.length > 0 ? optionScores[idx] / allResponses.length : 0
      })).sort((a, b) => b.value - a.value);
    }

    return (
      <div className="h-full w-full max-w-[1400px] animate-in fade-in duration-1000 flex items-center px-10">
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data} layout="vertical" margin={{ left: 60, right: 120, top: 20, bottom: 20 }}>
            <XAxis 
              type="number" 
              hide 
              domain={[0, 'dataMax']}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={240} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', fontSize: 20, fontWeight: 800, fontFamily: 'Bricolage Grotesque' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ 
                backgroundColor: 'currentColor', 
                border: 'none', 
                borderRadius: '16px',
                color: 'var(--background)',
                padding: '20px',
                fontSize: '18px',
                fontWeight: '700'
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="text-center">
                      <p className="font-black text-4xl leading-none">
                        {Number(payload[0]?.value ?? 0).toFixed(1)}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mt-2 font-bold">
                        {question.type === 'multiple-choice' ? 'TOTAL RESPONSES' : 'AVERAGE PRIORITY'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 24, 24, 0]} 
              barSize={70}
              animationDuration={2000}
              animationBegin={300}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isCorrect ? "hsl(142 71% 45%)" : chartColor} 
                  fillOpacity={entry.isCorrect ? 1 : (1 - (index * 0.12))} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (question.type === 'word-cloud') {
    const entries = Object.entries(results);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...entries.map(e => e[1]), 1);

    return (
      <div className="h-full w-full flex flex-wrap items-center justify-center gap-8 p-16 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse bg-current/10">
              <div className="w-10 h-10 rounded-full bg-current/30"></div>
            </div>
            <p className="text-4xl font-black opacity-20 tracking-widest animate-pulse">Awaiting pulse feedback...</p>
          </div>
        ) : (
          sorted.map(([word, count], i) => {
            const fontSize = Math.min(140, 36 + (count / maxCount) * 84);
            const opacity = 0.6 + (count / maxCount) * 0.4;
            const animationDelay = i * 100;
            
            return (
              <span 
                key={i} 
                className="font-black tracking-tight transition-all duration-500 hover:scale-125 cursor-default animate-in zoom-in duration-700"
                style={{ 
                  fontSize: `${fontSize}px`, 
                  opacity,
                  animationDelay: `${animationDelay}ms`,
                  lineHeight: 1.1
                }}
              >
                {word}
              </span>
            );
          })
        )}
      </div>
    );
  }

  if (question.type === 'open-text') {
    return (
      <div className="h-full w-full max-w-[1200px] flex flex-col items-center">
        {allResponses.length === 0 ? (
          <p className="text-3xl font-bold opacity-10 tracking-widest my-auto animate-pulse">Stand by for signals...</p>
        ) : (
          <ScrollArea className="h-full w-full pr-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 px-4">
              {allResponses.map((res, i) => (
                <div key={i} className="bg-foreground text-background p-8 rounded-[1.25rem] border-2 border-foreground animate-in slide-in-from-bottom-10 duration-700">
                  <p className="text-xl font-bold tracking-tight leading-snug">"{res.value}"</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  if (question.type === 'rating') {
    const total = allResponses.length;
    const avg = total > 0 ? allResponses.reduce((acc, r) => acc + Number(r.value), 0) / total : 0;

    return (
      <div className="h-full w-full max-w-4xl flex flex-col items-center justify-center space-y-10">
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={s} 
              className={cn(
                "h-16 w-16 transition-all duration-1000",
                s <= Math.round(avg) ? "fill-current" : "opacity-10"
              )} 
            />
          ))}
        </div>
        <div className="text-center space-y-1">
          <span className="text-6xl font-black tracking-tighter leading-none">{avg.toFixed(1)}</span>
          <p className="text-xl font-bold opacity-30 uppercase tracking-[0.4em] mt-3">Studio Average</p>
        </div>
      </div>
    );
  }

  if (question.type === 'slider' || question.type === 'guess-number' || question.type === 'scale') {
    const values = allResponses.map(r => Number(r.value));
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const min = question.range?.min ?? 0;
    const max = question.range?.max ?? 100;
    const percentage = ((average - min) / (max - min)) * 100;

    // For guess-number questions in quiz mode, show frequency distribution
    if (question.type === 'guess-number') {
      // Create frequency map
      const frequencyMap: Record<number, number> = {};
      values.forEach(val => {
        frequencyMap[val] = (frequencyMap[val] || 0) + 1;
      });
      
      // Sort by frequency, then by value
      const sortedEntries = Object.entries(frequencyMap)
        .sort(([,a], [,b]) => b - a)
        .sort(([,a], [,b]) => a === b ? Number(a) - Number(b) : 0);
      
      const maxFreq = Math.max(...Object.values(frequencyMap), 1);

      return (
        <div className="h-full w-full max-w-[1200px] flex flex-col items-center justify-center space-y-8">
          {/* Correct Answer Display for Quiz Mode */}
          {question.correctAnswer !== undefined && (
            <div className="text-center space-y-2">
              <p className="text-lg font-bold opacity-60 uppercase tracking-[0.3em]">Correct Answer</p>
              <div className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 bg-green-500 text-white border-green-600">
                <span className="text-4xl font-black">{question.correctAnswer}</span>
              </div>
            </div>
          )}

          {/* Frequency Distribution */}
          <div className="w-full max-w-2xl space-y-4">
            <p className="text-center text-lg font-bold opacity-60 uppercase tracking-[0.3em]">Answer Distribution</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedEntries.map(([value, count]) => (
                <div key={value} className="flex items-center gap-3">
                  <span className="w-12 text-right font-bold tabular-nums">{value}</span>
                  <div className="flex-1 h-8 bg-black/5 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-current transition-all duration-1000 ease-out"
                      style={{ width: `${(count / maxFreq) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-left font-bold tabular-nums">{count}</span>
                  {values.length > 0 && (
                    <span className="w-12 text-left text-sm opacity-60">
                      {Math.round((count / values.length) * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Average Display */}
          <div className="text-center space-y-2">
            <span className="text-4xl font-black tracking-tighter leading-none">{average.toFixed(1)}</span>
            <p className="text-lg font-bold opacity-30 uppercase tracking-[0.5em]">Average Guess</p>
          </div>
        </div>
      );
    }

    // Handle slider and scale questions (original logic)
    return (
      <div className="h-full w-full max-w-[1000px] flex flex-col items-center justify-center space-y-16">
        <div className="relative h-16 w-full bg-black/5 rounded-[1.25rem] border-2 border-current flex items-center px-10 overflow-hidden">
           <div 
             className="absolute left-0 h-full bg-current transition-all duration-1500 ease-out"
             style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
           />
           <div className="relative z-10 w-full flex justify-between font-bold text-lg mix-blend-difference text-white uppercase tracking-[0.2em]">
             <span>{question.labels?.min || min}</span>
             <span className="opacity-40">Consensus</span>
             <span>{question.labels?.max || max}</span>
           </div>
        </div>
        <div className="text-center">
          <span className="text-6xl font-black tracking-tighter leading-none">{average.toFixed(0)}</span>
          <p className="text-2xl font-bold opacity-30 uppercase tracking-[0.5em] mt-4">
            Collective Result
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-16 rounded-[1.5rem] text-center border-2 border-dashed border-current/10">
      <p className="text-2xl font-bold opacity-10 tracking-[0.4em] animate-pulse">CONNECTING TO PULSE...</p>
    </div>
  );
}
