
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
  // Themed palette using primary color and transparency steps
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--primary) / 0.8)',
    'hsl(var(--primary) / 0.6)',
    'hsl(var(--primary) / 0.4)',
    'hsl(var(--primary) / 0.3)',
    'hsl(var(--primary) / 0.2)',
  ];

  if (question.type === 'multiple-choice' && question.options) {
    const data = question.options.map((opt, idx) => ({
      name: opt.toUpperCase(),
      value: results[idx] || 0
    }));

    return (
      <div className="h-full w-full max-w-5xl animate-in fade-in duration-700 flex items-center px-8">
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} layout="vertical" margin={{ left: 40, right: 60, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={240} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', fontSize: 20, fontWeight: 700, fontFamily: 'Bricolage Grotesque' }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-primary p-5 rounded-[2rem] border-2 border-primary shadow-2xl">
                      <p className="font-bold text-primary-foreground text-2xl leading-none">{payload[0].value} <span className="text-xs uppercase tracking-widest opacity-60">Votes</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 40, 40, 0]} 
              barSize={80}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
          <p className="text-4xl font-bold uppercase opacity-10 tracking-[0.4em]">Listening...</p>
        ) : (
          sorted.map(([word, count], i) => (
            <span 
              key={i} 
              className="font-bold uppercase tracking-tighter transition-all hover:scale-125 cursor-default animate-in zoom-in duration-700"
              style={{ 
                fontSize: `${Math.min(100, 28 + count * 15)}px`, 
                color: colors[i % colors.length],
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
      <div className="h-full w-full max-w-5xl flex flex-col items-center">
        {allResponses.length === 0 ? (
          <p className="text-4xl font-bold uppercase opacity-10 tracking-[0.4em] my-auto">Awaiting transmissions...</p>
        ) : (
          <ScrollArea className="h-full w-full pr-8">
            <div className="grid gap-6 py-8 px-4">
              {allResponses.map((res, i) => (
                <div key={i} className="bg-card p-8 rounded-[3rem] border-2 border-primary/20 animate-in slide-in-from-bottom-8 duration-700">
                  <p className="text-2xl font-bold uppercase tracking-tight">{res.value}</p>
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
      <div className="h-full w-full max-w-4xl flex flex-col items-center justify-center space-y-16">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={s} 
              className={cn(
                "h-24 w-24 transition-all duration-700",
                s <= Math.round(avg) ? "fill-primary text-primary" : "text-muted-foreground/10"
              )} 
            />
          ))}
        </div>
        <div className="text-center space-y-2">
          <span className="text-[12rem] font-black tracking-tighter leading-none">{avg.toFixed(1)}</span>
          <p className="text-2xl font-bold opacity-30 uppercase tracking-[0.8em]">Avg Rating</p>
        </div>
      </div>
    );
  }

  if (question.type === 'slider') {
    const values = allResponses.map(r => Number(r.value));
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    return (
      <div className="h-full w-full max-w-5xl flex flex-col items-center justify-center space-y-20">
        <div className="relative h-24 w-full bg-muted rounded-full border-2 border-primary/20 flex items-center px-12 overflow-hidden">
           <div 
             className="absolute left-0 h-full bg-primary transition-all duration-1000 ease-out"
             style={{ width: `${average}%` }}
           />
           <div className="relative z-10 w-full flex justify-between font-bold text-xl mix-blend-difference text-white uppercase tracking-[0.4em]">
             <span>0</span>
             <span>PULSE INTENSITY</span>
             <span>100</span>
           </div>
        </div>
        <div className="text-center">
          <span className="text-[14rem] font-black tracking-tighter leading-none">{average.toFixed(0)}</span>
          <p className="text-3xl font-bold opacity-30 uppercase tracking-[0.8em] mt-4">Current Synergy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted p-20 rounded-[4rem] text-center border-2 border-dashed">
      <p className="text-4xl font-bold uppercase opacity-10 tracking-[0.4em]">Initializing...</p>
    </div>
  );
}
