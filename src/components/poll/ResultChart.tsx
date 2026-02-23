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
}

export function ResultChart({ question, results, allResponses = [] }: ResultChartProps) {
  const chartColor = 'currentColor';

  if ((question.type === 'multiple-choice' || question.type === 'ranking') && question.options) {
    let data: any[] = [];

    if (question.type === 'multiple-choice') {
      data = question.options.map((opt, idx) => ({
        name: opt,
        value: results[idx] || 0
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
      <div className="h-full w-full max-w-[1200px] animate-in fade-in duration-1000 flex items-center px-8">
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data} layout="vertical" margin={{ left: 40, right: 100, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={220} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', fontSize: 18, fontWeight: 700, fontFamily: 'Bricolage Grotesque' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-foreground p-6 rounded-[1rem] border-2 border-background shadow-none">
                      <p className="font-black text-background text-3xl leading-none">
                        {payload[0].value.toFixed(1)}
                        <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 ml-3 block mt-1.5">
                          {question.type === 'multiple-choice' ? 'Total Responses' : 'Average Priority'}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 20, 20, 0]} 
              barSize={60}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColor} fillOpacity={1 - (index * 0.15)} />
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

    return (
      <div className="h-full w-full flex flex-wrap items-center justify-center gap-10 p-12 overflow-hidden">
        {entries.length === 0 ? (
          <p className="text-3xl font-bold opacity-10 tracking-widest animate-pulse">Awaiting pulse feedback...</p>
        ) : (
          sorted.map(([word, count], i) => (
            <span 
              key={i} 
              className="font-bold tracking-tight transition-all hover:scale-110 cursor-default animate-in zoom-in duration-700"
              style={{ 
                fontSize: `${Math.min(120, 32 + count * 16)}px`, 
                opacity: 0.7 + (count / Math.max(...entries.map(e => e[1]))) * 0.3
              }}
            >
              {word}
            </span>
          ))
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

    return (
      <div className="h-full w-full max-w-[1000px] flex flex-col items-center justify-center space-y-16">
        {(question.type === 'slider' || question.type === 'scale') && (
          <div className="relative h-16 w-full bg-black/5 rounded-[1.25rem] border-2 border-current flex items-center px-10 overflow-hidden">
             <div 
               className="absolute left-0 h-full bg-current transition-all duration-1500 ease-out"
               style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
             />
             <div className="relative z-10 w-full flex justify-between font-bold text-lg mix-blend-difference text-white uppercase tracking-[0.2em]">
               <span>{question.labels?.min || min}</span>
               <span className="opacity-40">{question.type === 'scale' ? 'Consensus' : 'Intensity'}</span>
               <span>{question.labels?.max || max}</span>
             </div>
          </div>
        )}
        <div className="text-center">
          <span className="text-6xl font-black tracking-tighter leading-none">{average.toFixed(question.type === 'guess-number' ? 1 : 0)}</span>
          <p className="text-2xl font-bold opacity-30 uppercase tracking-[0.5em] mt-4">
            {question.type === 'guess-number' ? 'Precision Avg' : 'Collective Result'}
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
