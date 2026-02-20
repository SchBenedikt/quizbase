"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { PollQuestion } from "@/app/types/poll";
import { Card, CardContent } from "@/components/ui/card";

interface ResultChartProps {
  question: PollQuestion;
  results: Record<string, number>;
}

export function ResultChart({ question, results }: ResultChartProps) {
  if (question.type === 'multiple-choice' && question.options) {
    const data = question.options.map((opt, idx) => ({
      name: opt,
      value: results[idx] || 0
    }));

    const colors = ['#E01CBB', '#4B0EA8', '#FF9F00', '#00C49F', '#FF4444'];

    return (
      <div className="h-[400px] w-full animate-in fade-in duration-700">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={120} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--accent))', fontSize: 14, fontWeight: 600 }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 rounded-lg shadow-lg border border-primary/10">
                      <p className="font-bold">{payload[0].value} votes</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 10, 10, 0]} 
              barSize={40}
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

  if (question.type === 'rating') {
    // Basic bar chart for ratings 1-5
    const data = [1, 2, 3, 4, 5].map(v => ({
      name: `${v} ★`,
      value: results[v] || 0
    }));

    return (
      <div className="h-[300px] w-full">
         <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ bottom: 20 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 16, fontWeight: 600 }} />
            <Bar dataKey="value" fill="#4B0EA8" radius={[10, 10, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-secondary/10 p-8 rounded-2xl text-center">
      <p className="text-muted-foreground">Gathering open text responses...</p>
    </div>
  );
}