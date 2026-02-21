
"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { PollQuestion } from "@/app/types/poll";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResultChartProps {
  question: PollQuestion;
  results: Record<string, number>;
  allResponses?: any[];
}

export function ResultChart({ question, results, allResponses = [] }: ResultChartProps) {
  const colors = ['#E01CBB', '#4B0EA8', '#FF9F00', '#00C49F', '#FF4444'];

  if (question.type === 'multiple-choice' && question.options) {
    const data = question.options.map((opt, idx) => ({
      name: opt.toUpperCase(),
      value: results[idx] || 0
    }));

    return (
      <div className="h-full w-full max-w-5xl animate-in fade-in duration-700 flex items-center">
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} layout="vertical" margin={{ left: 40, right: 60, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={200} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 20, fontWeight: 900, fontFamily: 'Bricolage Grotesque' }}
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
              radius={[0, 32, 32, 0]} 
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
          <p className="text-4xl font-black uppercase opacity-10 tracking-[0.2em]">Waiting for vibes...</p>
        ) : (
          sorted.map(([word, count], i) => (
            <span 
              key={i} 
              className="font-black uppercase tracking-tighter transition-all hover:scale-110 cursor-default animate-in zoom-in duration-500"
              style={{ 
                fontSize: `${Math.min(100, 24 + count * 12)}px`, 
                color: colors[i % colors.length],
                opacity: 0.6 + (count / Math.max(...entries.map(e => e[1]))) * 0.4
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
      <div className="h-full w-full max-w-4xl flex flex-col items-center">
        {allResponses.length === 0 ? (
          <p className="text-4xl font-black uppercase opacity-10 tracking-[0.2em] my-auto">Waiting for responses...</p>
        ) : (
          <ScrollArea className="h-full w-full pr-6">
            <div className="grid gap-6 py-6">
              {allResponses.map((res, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border-4 border-foreground animate-in slide-in-from-bottom-4 duration-500">
                  <p className="text-2xl font-black uppercase tracking-tight">{res.value}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  if (question.type === 'slider') {
    const values = Object.values(results);
    const totalVotes = values.reduce((a, b) => a + b, 0);
    const average = totalVotes > 0 
      ? Object.entries(results).reduce((acc, [val, count]) => acc + (Number(val) * count), 0) / totalVotes 
      : 0;

    return (
      <div className="h-full w-full max-w-4xl flex flex-col items-center justify-center space-y-20">
        <div className="relative h-24 w-full bg-foreground/5 rounded-full border-8 border-foreground flex items-center px-12 overflow-hidden">
           <div 
             className="absolute left-0 h-full bg-foreground transition-all duration-1000 ease-out"
             style={{ width: `${average}%` }}
           />
           <div className="relative z-10 w-full flex justify-between font-black text-xl mix-blend-difference text-white uppercase tracking-widest">
             <span>0</span>
             <span>Current Intensity: {average.toFixed(1)}</span>
             <span>100</span>
           </div>
        </div>
        <div className="text-center">
          <span className="text-[14rem] font-black tracking-tighter leading-none">{average.toFixed(0)}</span>
          <p className="text-2xl font-black opacity-30 uppercase tracking-[0.6em] mt-4">PULSE STRENGTH</p>
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
