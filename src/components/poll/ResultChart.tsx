
"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { PollQuestion } from "@/app/types/poll";

interface ResultChartProps {
  question: PollQuestion;
  results: Record<string, number>;
}

export function ResultChart({ question, results }: ResultChartProps) {
  const colors = ['#E01CBB', '#4B0EA8', '#FF9F00', '#00C49F', '#FF4444'];

  if (question.type === 'multiple-choice' && question.options) {
    const data = question.options.map((opt, idx) => ({
      name: opt.toUpperCase(),
      value: results[idx] || 0
    }));

    return (
      <div className="h-[400px] w-full animate-in fade-in duration-700">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 60, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={160} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 16, fontWeight: 900 }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-foreground p-4 rounded-2xl border-4 border-foreground">
                      <p className="font-black text-background text-lg">{payload[0].value} VOTES</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 24, 24, 0]} 
              barSize={64}
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
      <div className="min-h-[400px] flex flex-wrap items-center justify-center gap-8 p-12">
        {entries.length === 0 ? (
          <p className="text-4xl font-black uppercase opacity-10 tracking-widest">Waiting for nodes...</p>
        ) : (
          sorted.map(([word, count], i) => (
            <span 
              key={i} 
              className="font-black uppercase tracking-tighter transition-all hover:scale-110 cursor-default animate-in zoom-in duration-500"
              style={{ 
                fontSize: `${Math.min(120, 32 + count * 16)}px`, 
                color: colors[i % colors.length],
                opacity: 0.5 + (count / Math.max(...entries.map(e => e[1]))) * 0.5
              }}
            >
              {word}
            </span>
          ))
        )}
      </div>
    );
  }

  if (question.type === 'slider') {
    const values = Object.values(results);
    const average = values.length > 0 
      ? values.reduce((a, b) => Number(a) + Number(b), 0) / values.length 
      : 0;

    return (
      <div className="py-12 w-full max-w-4xl text-center space-y-16">
        <div className="relative h-28 bg-foreground/5 rounded-full border-8 border-foreground flex items-center px-12 overflow-hidden">
           <div 
             className="absolute left-0 h-full bg-foreground transition-all duration-1000 ease-out"
             style={{ width: `${average}%` }}
           />
           <div className="relative z-10 w-full flex justify-between font-black text-2xl mix-blend-difference text-white uppercase tracking-widest">
             <span>0</span>
             <span>Current Pulse: {average.toFixed(1)}</span>
             <span>100</span>
           </div>
        </div>
        <div className="space-y-2">
          <span className="text-[12rem] font-black tracking-tighter leading-none">{average.toFixed(0)}</span>
          <p className="text-xl font-black opacity-30 uppercase tracking-[0.5em]">Intensity Level</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-foreground/5 p-20 rounded-[4rem] text-center border-4 border-dashed border-foreground/10">
      <p className="text-4xl font-black uppercase opacity-20 tracking-tighter">Syncing Data Streams...</p>
    </div>
  );
}
