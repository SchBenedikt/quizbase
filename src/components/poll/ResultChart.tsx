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
        name: opt.toUpperCase(),
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
        name: opt.toUpperCase(),
        value: allResponses.length > 0 ? optionScores[idx] / allResponses.length : 0
      })).sort((a, b) => b.value - a.value);
    }

    return (
      <div className="h-full w-full max-w-[1400px] animate-in fade-in duration-1000 flex items-center px-12">
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} layout="vertical" margin={{ left: 60, right: 100, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={280} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', fontSize: 24, fontWeight: 900, fontFamily: 'Bricolage Grotesque' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-foreground p-8 rounded-[1.5rem] border-2 border-background shadow-none">
                      <p className="font-black text-background text-5xl leading-none">
                        {payload[0].value.toFixed(1)}
                        <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 ml-4 block mt-2">
                          {question.type === 'multiple-choice' ? 'TOTAL VOTES' : 'AVG SCORE'}
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
              radius={[0, 40, 40, 0]} 
              barSize={120}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColor} fillOpacity={1 - (index * 0.1)} />
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
      <div className="h-full w-full flex flex-wrap items-center justify-center gap-16 p-20 overflow-hidden">
        {entries.length === 0 ? (
          <p className="text-5xl font-black uppercase opacity-10 tracking-[0.8em] animate-pulse">Waiting for responses...</p>
        ) : (
          sorted.map(([word, count], i) => (
            <span 
              key={i} 
              className="font-black uppercase tracking-tighter transition-all hover:scale-125 cursor-default animate-in zoom-in duration-1000"
              style={{ 
                fontSize: `${Math.min(180, 48 + count * 24)}px`, 
                opacity: 0.8 + (count / Math.max(...entries.map(e => e[1]))) * 0.2
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
      <div className="h-full w-full max-w-[1400px] flex flex-col items-center">
        {allResponses.length === 0 ? (
          <p className="text-5xl font-black uppercase opacity-10 tracking-[0.8em] my-auto animate-pulse">No responses yet...</p>
        ) : (
          <ScrollArea className="h-full w-full pr-12">
            <div className="grid gap-12 py-12 px-8">
              {allResponses.map((res, i) => (
                <div key={i} className="bg-foreground text-background p-16 rounded-[1.5rem] border-2 border-foreground animate-in slide-in-from-bottom-20 duration-1000">
                  <p className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9]">{res.value}</p>
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
      <div className="h-full w-full max-w-5xl flex flex-col items-center justify-center space-y-12">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={s} 
              className={cn(
                "h-24 w-24 transition-all duration-1000",
                s <= Math.round(avg) ? "fill-current" : "opacity-10"
              )} 
            />
          ))}
        </div>
        <div className="text-center space-y-2">
          <span className="text-8xl font-black tracking-tighter leading-none">{avg.toFixed(1)}</span>
          <p className="text-4xl font-black opacity-20 uppercase tracking-[0.8em] mt-4">AVERAGE</p>
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
      <div className="h-full w-full max-w-[1400px] flex flex-col items-center justify-center space-y-24">
        {(question.type === 'slider' || question.type === 'scale') && (
          <div className="relative h-24 w-full bg-black/5 rounded-[1.5rem] border-2 border-current flex items-center px-12 overflow-hidden">
             <div 
               className="absolute left-0 h-full bg-current transition-all duration-1500 ease-out"
               style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
             />
             <div className="relative z-10 w-full flex justify-between font-black text-2xl mix-blend-difference text-white uppercase tracking-[0.4em]">
               <span>{question.labels?.min || min}</span>
               <span className="opacity-40">{question.type === 'scale' ? 'SYNC SCALE' : 'INTENSITY'}</span>
               <span>{question.labels?.max || max}</span>
             </div>
          </div>
        )}
        <div className="text-center">
          <span className="text-8xl font-black tracking-tighter leading-none">{average.toFixed(question.type === 'guess-number' ? 1 : 0)}</span>
          <p className="text-5xl font-black opacity-20 uppercase tracking-[1em] mt-6">
            {question.type === 'guess-number' ? 'PRECISION AVERAGE' : 'RESULT'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-20 rounded-[1.5rem] text-center border-2 border-dashed border-current/10">
      <p className="text-3xl font-black uppercase opacity-10 tracking-[0.6em] animate-pulse">CONNECTING...</p>
    </div>
  );
}