"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { PollQuestion } from "@/app/types/poll";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultChartProps {
  question: PollQuestion;
  results: Record<string, number>;
  allResponses?: any[];
}

export function ResultChart({ question, results, allResponses = [] }: ResultChartProps) {
  // Theme-friendly expressive colors
  const colors = ['#E01CBB', '#4B0EA8', '#FF9F00', '#00C49F', '#FF4444', '#1293ff'];

  if (question.type === 'multiple-choice' && question.options) {
    const data = question.options.map((opt, idx) => ({
      name: opt.toUpperCase(),
      value: results[idx] || 0
    }));

    const maxVal = Math.max(...data.map(d => d.value), 1);

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
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 24, fontWeight: 900, fontFamily: 'Bricolage Grotesque' }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-foreground p-6 rounded-[2rem] border-4 border-foreground shadow-2xl">
                      <p className="font-black text-background text-3xl leading-none">{payload[0].value} <span className="text-sm uppercase tracking-widest opacity-60">Votes</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 40, 40, 0]} 
              barSize={100}
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
      <div className="h-full w-full flex flex-wrap items-center justify-center gap-12 p-16 overflow-hidden">
        {entries.length === 0 ? (
          <p className="text-5xl font-black uppercase opacity-10 tracking-[0.4em]">Listening for signals...</p>
        ) : (
          sorted.map(([word, count], i) => (
            <span 
              key={i} 
              className="font-black uppercase tracking-tighter transition-all hover:scale-125 cursor-default animate-in zoom-in duration-700"
              style={{ 
                fontSize: `${Math.min(100, 32 + count * 16)}px`, 
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
          <p className="text-5xl font-black uppercase opacity-10 tracking-[0.4em] my-auto">Awaiting transmissions...</p>
        ) : (
          <ScrollArea className="h-full w-full pr-8">
            <div className="grid gap-8 py-10 px-4">
              {allResponses.map((res, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm p-10 rounded-[3.5rem] border-8 border-foreground animate-in slide-in-from-bottom-8 duration-700">
                  <p className="text-3xl font-black uppercase tracking-tight leading-tight">{res.value}</p>
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
      <div className="h-full w-full max-w-4xl flex flex-col items-center justify-center space-y-20">
        <div className="flex gap-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={s} 
              className={cn(
                "h-24 w-24 transition-all duration-700",
                s <= Math.round(avg) ? "fill-foreground text-foreground" : "text-foreground/10"
              )} 
            />
          ))}
        </div>
        <div className="text-center space-y-4">
          <span className="text-[14rem] font-black tracking-tighter leading-none">{avg.toFixed(1)}</span>
          <p className="text-3xl font-black opacity-30 uppercase tracking-[0.8em]">Avg Star Rating</p>
        </div>
      </div>
    );
  }

  if (question.type === 'slider') {
    const values = allResponses.map(r => Number(r.value));
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    return (
      <div className="h-full w-full max-w-5xl flex flex-col items-center justify-center space-y-24">
        <div className="relative h-28 w-full bg-foreground/10 rounded-full border-8 border-foreground flex items-center px-16 overflow-hidden">
           <div 
             className="absolute left-0 h-full bg-foreground transition-all duration-1000 ease-out"
             style={{ width: `${average}%` }}
           />
           <div className="relative z-10 w-full flex justify-between font-black text-2xl mix-blend-difference text-white uppercase tracking-[0.4em]">
             <span>0</span>
             <span>PULSE INTENSITY</span>
             <span>100</span>
           </div>
        </div>
        <div className="text-center">
          <span className="text-[16rem] font-black tracking-tighter leading-none">{average.toFixed(0)}</span>
          <p className="text-4xl font-black opacity-30 uppercase tracking-[0.8em] mt-6">Current Synergy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-foreground/5 p-24 rounded-[5rem] text-center border-8 border-dashed border-foreground/5">
      <p className="text-5xl font-black uppercase opacity-10 tracking-[0.4em]">Initializing Data Stream...</p>
    </div>
  );
}
