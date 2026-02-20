"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { PollQuestion } from "@/app/types/poll";
import { Card, CardContent } from "@/components/ui/card";

interface ResultChartProps {
  question: PollQuestion;
  results: Record<string, number>;
}

export function ResultChart({ question, results }: ResultChartProps) {
  const colors = ['#E01CBB', '#4B0EA8', '#FF9F00', '#00C49F', '#FF4444'];

  if (question.type === 'multiple-choice' && question.options) {
    const data = question.options.map((opt, idx) => ({
      name: opt,
      value: results[idx] || 0
    }));

    return (
      <div className="h-[400px] w-full animate-in fade-in duration-700">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--primary))', fontSize: 16, fontWeight: 900 }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 border-4 border-primary rounded-2xl">
                      <p className="font-black text-primary">{payload[0].value} VOTES</p>
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
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (question.type === 'word-cloud') {
    // Mocking a Word Cloud with tags of different sizes
    const words = Object.entries(results).map(([word, count]) => ({
      text: word,
      size: 20 + count * 10,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    return (
      <div className="min-h-[400px] flex flex-wrap items-center justify-center gap-6 p-12">
        {words.length === 0 ? (
          <p className="text-3xl font-black uppercase opacity-20">Waiting for vibes...</p>
        ) : (
          words.map((w, i) => (
            <span 
              key={i} 
              className="font-black uppercase tracking-tighter transition-all hover:scale-110 cursor-default"
              style={{ fontSize: `${w.size}px`, color: w.color }}
            >
              {w.text}
            </span>
          ))
        )}
      </div>
    );
  }

  if (question.type === 'slider') {
    const average = Object.values(results).length > 0 
      ? Object.values(results).reduce((a, b) => a + b, 0) / Object.values(results).length 
      : 0;

    return (
      <div className="py-20 text-center space-y-12">
        <div className="relative h-24 bg-primary/10 rounded-full border-4 border-primary flex items-center px-8">
           <div 
             className="absolute left-0 h-full bg-primary rounded-full transition-all duration-1000"
             style={{ width: `${average}%` }}
           />
           <div className="relative z-10 w-full flex justify-between px-4 font-black text-xl mix-blend-difference text-white">
             <span>0</span>
             <span>AVERAGE: {average.toFixed(1)}</span>
             <span>100</span>
           </div>
        </div>
        <p className="text-8xl font-black uppercase tracking-tighter">{average.toFixed(0)}</p>
      </div>
    );
  }

  if (question.type === 'rating') {
    const data = [1, 2, 3, 4, 5].map(v => ({
      name: `${v}★`,
      value: results[v] || 0
    }));

    return (
      <div className="h-[300px] w-full">
         <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ bottom: 20 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 20, fontWeight: 900, fill: 'hsl(var(--primary))' }} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[20, 20, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 p-20 rounded-[4rem] text-center">
      <p className="text-3xl font-black uppercase opacity-20 tracking-tighter">Gathering data...</p>
    </div>
  );
}
