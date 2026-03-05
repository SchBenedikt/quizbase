"use client";

import { use, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, BarChart3, Trophy, Hash, Star, MessageSquare, Target,
  TrendingUp, Minus, Download, Calendar, Clock, CheckCircle2, XCircle,
  AlertCircle, Activity, Flame, Table2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { PollQuestion, PollSession, PollParticipant, PollResponse } from "@/app/types/poll";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, CartesianGrid
} from "recharts";
import { useResolvedParam } from "@/hooks/use-resolved-param";

// ─── Stat helpers ─────────────────────────────────────────────────────────────
function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
function minVal(values: number[]) { return values.length ? Math.min(...values) : 0; }
function maxVal(values: number[]) { return values.length ? Math.max(...values) : 0; }
function median(sorted: number[]) {
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function stddev(values: number[]) {
  if (values.length < 2) return 0;
  const mean = avg(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
function DifficultyBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const level = score < 30 ? { label: "Easy", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
    : score < 60 ? { label: "Medium", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
    : { label: "Hard", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold", level.cls)}>{level.label}</span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, highlight, warn }: {
  label: string; value: string | number; sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  highlight?: boolean; warn?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-5 space-y-2 shadow-none",
      highlight ? "bg-primary/5 border-primary/30" : warn ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30" : "bg-card"
    )}>
      <div className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-wider", warn ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
        {Icon && <Icon className={cn("h-3.5 w-3.5", highlight ? "text-primary" : warn ? "text-red-500" : "")} />}
        {label}
      </div>
      <p className={cn("text-3xl font-black tabular-nums", highlight ? "text-primary" : warn ? "text-red-600 dark:text-red-400" : "")}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Per-Question Stats ────────────────────────────────────────────────────────
function QuestionStats({ question, responses, participants, isQuiz, qIndex }: {
  question: PollQuestion;
  responses: PollResponse[];
  participants: PollParticipant[];
  isQuiz: boolean;
  qIndex: number;
}) {
  const qResponses = responses.filter(r => r.questionId === question.id);
  const total = qResponses.length;
  const noResponse = participants.filter(p => !qResponses.find(r => r.userId === p.id)).length;

  // ── Multiple choice / True-False ─────────────────────────────────────────
  if ((question.type === 'multiple-choice' || question.type === 'true-false') && question.options) {
    const counts: Record<number, number> = {};
    qResponses.forEach(r => { const idx = Number(r.value); counts[idx] = (counts[idx] || 0) + 1; });
    const data = question.options.map((opt, idx) => ({
      name: opt.length > 22 ? opt.slice(0, 22) + "…" : opt,
      fullName: opt,
      count: counts[idx] || 0,
      pct: total > 0 ? Math.round(((counts[idx] || 0) / total) * 100) : 0,
      isCorrect: isQuiz && question.correctOptionIndices?.includes(idx),
    }));
    const topOption = data.reduce((a, b) => (a.count > b.count ? a : b), data[0]);
    const correctCount = isQuiz ? data.filter(d => d.isCorrect).reduce((a, b) => a + b.count, 0) : 0;
    const correctRate = total > 0 ? (correctCount / total) * 100 : 0;
    const difficultyScore = isQuiz ? 100 - correctRate : null;

    const userSelections = participants.map(p => {
      const r = qResponses.find(r => r.userId === p.id);
      const idx = r ? Number(r.value) : -1;
      return { nickname: p.nickname || "Anon", value: idx >= 0 ? question.options![idx] : "—", idx, answered: !!r };
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          {isQuiz && <DifficultyBadge score={difficultyScore} />}
          {isQuiz && <span className="text-xs text-muted-foreground">{Math.round(correctRate)}% correct</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Response Rate" value={`${participants.length > 0 ? Math.round((total / participants.length) * 100) : 0}%`} icon={TrendingUp} />
          <StatCard label="Most Chosen" value={topOption?.name || "—"} sub={`${topOption?.pct ?? 0}% chose this`} icon={Target} highlight />
          {noResponse > 0 && <StatCard label="No Response" value={noResponse} sub="participants skipped" icon={AlertCircle} warn />}
          {isQuiz && noResponse === 0 && (
            <StatCard label="Correct" value={`${correctCount}/${total}`} sub={`${Math.round(correctRate)}% accuracy`} icon={CheckCircle2} highlight={correctRate >= 70} />
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response Distribution</h4>
            <ResponsiveContainer width="100%" height={Math.max(140, data.length * 44)}>
              <BarChart data={data} layout="vertical" margin={{ left: 0, right: 50 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-foreground text-background px-4 py-2 rounded-xl text-sm font-bold shadow-xl">
                    {payload[0]?.payload?.fullName}: {payload[0]?.value} votes ({payload[0]?.payload?.pct}%)
                  </div>
                ) : null} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={28} label={{ position: 'right', formatter: (v: number) => v > 0 ? `${v}` : '', fontSize: 12, fontWeight: 700 }}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.isCorrect ? "hsl(142 71% 45%)" : "currentColor"} fillOpacity={Math.max(0.4, 0.95 - i * 0.08)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Individual Responses</h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {userSelections.map((u, i) => (
                <div key={i} className="flex items-center justify-between text-sm gap-3">
                  <span className="font-medium truncate text-muted-foreground min-w-0">{u.nickname}</span>
                  {u.answered ? (
                    <span className={cn(
                      "font-semibold shrink-0 px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1",
                      isQuiz && question.correctOptionIndices?.includes(u.idx)
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-foreground"
                    )}>
                      {isQuiz && (question.correctOptionIndices?.includes(u.idx) ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3 opacity-50" />)}
                      {u.value}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40 italic">skipped</span>
                  )}
                </div>
              ))}
              {userSelections.length === 0 && <p className="text-sm text-muted-foreground/50">No responses yet</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Rating ─────────────────────────────────────────────────────────────────
  if (question.type === 'rating') {
    const values = qResponses.map(r => Number(r.value)).filter(v => v >= 1 && v <= 5);
    const sortedVals = [...values].sort((a, b) => a - b);
    const distribution = [1, 2, 3, 4, 5].map(s => ({ star: `${s}★`, count: values.filter(v => v === s).length }));
    const userRatings = participants.map(p => {
      const r = qResponses.find(r => r.userId === p.id);
      return { nickname: p.nickname || "Anon", value: r ? Number(r.value) : null };
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Average" value={avg(values).toFixed(2)} icon={Star} highlight />
          <StatCard label="Median" value={median(sortedVals).toFixed(1)} icon={Activity} />
          <StatCard label="Min" value={minVal(values)} icon={Minus} />
          <StatCard label="Max" value={maxVal(values)} icon={TrendingUp} />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Star Distribution</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={distribution}>
                <XAxis dataKey="star" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-foreground text-background px-3 py-1.5 rounded-xl text-sm font-bold">{payload[0]?.value} votes</div>
                ) : null} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Std deviation</span><span className="font-bold">{stddev(values).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-bold">{distribution.length > 0 ? distribution.reduce((a, b) => a.count > b.count ? a : b, distribution[0])?.star : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">5★ rate</span><span className="font-bold">{values.length > 0 ? Math.round((values.filter(v => v === 5).length / values.length) * 100) : 0}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">1★ rate</span><span className="font-bold">{values.length > 0 ? Math.round((values.filter(v => v === 1).length / values.length) * 100) : 0}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Positive (≥4★)</span><span className="font-bold">{values.length > 0 ? Math.round((values.filter(v => v >= 4).length / values.length) * 100) : 0}%</span></div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Individual Ratings</h4>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {userRatings.map((u, i) => (
                <div key={i} className="flex items-center justify-between text-sm gap-3">
                  <span className="font-medium truncate text-muted-foreground">{u.nickname}</span>
                  <span className="font-bold shrink-0">{u.value !== null ? "★".repeat(u.value) + "☆".repeat(5 - u.value) : <span className="text-xs opacity-40 italic">skipped</span>}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Slider / Scale / Guess Number ─────────────────────────────────────────
  if (question.type === 'slider' || question.type === 'scale' || question.type === 'guess-number') {
    const values = qResponses.map(r => Number(r.value));
    const sortedVals = [...values].sort((a, b) => a - b);
    const min = question.range?.min ?? 0;
    const max = question.range?.max ?? 100;
    const step = question.range?.step ?? 1;
    const buckets = 8;
    const bucketSize = (max - min) / buckets || 1;
    const histData = Array.from({ length: buckets }, (_, i) => {
      const lo = min + i * bucketSize;
      const hi = lo + bucketSize;
      return { range: `${Math.round(lo)}–${Math.round(hi)}`, count: values.filter(v => v >= lo && (i === buckets - 1 ? v <= hi : v < hi)).length };
    });
    const userValues = participants.map(p => {
      const r = qResponses.find(r => r.userId === p.id);
      return { nickname: p.nickname || "Anon", value: r ? Number(r.value) : null };
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Average" value={avg(values).toFixed(1)} icon={BarChart3} highlight />
          <StatCard label="Median" value={median(sortedVals).toFixed(1)} icon={Activity} />
          <StatCard label="Min" value={minVal(values)} icon={Minus} />
          <StatCard label="Max" value={maxVal(values)} icon={TrendingUp} />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distribution Histogram</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={histData}>
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-foreground text-background px-3 py-1.5 rounded-xl text-sm font-bold">{payload[0]?.value} responses</div>
                ) : null} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Std deviation</span><span className="font-bold">{stddev(values).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Range</span><span className="font-bold">{min} – {max}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Step</span><span className="font-bold">{step}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Below avg</span><span className="font-bold">{values.filter(v => v < avg(values)).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Above avg</span><span className="font-bold">{values.filter(v => v > avg(values)).length}</span></div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Individual Values</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {userValues.map((u, i) => (
              <div key={i} className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2 text-sm gap-2">
                <span className="font-medium truncate text-muted-foreground">{u.nickname}</span>
                <span className="font-bold shrink-0 text-foreground tabular-nums">{u.value !== null ? u.value : <span className="text-xs opacity-40">—</span>}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Open Text ─────────────────────────────────────────────────────────────
  if (question.type === 'open-text') {
    const texts = qResponses.map(r => ({ text: String(r.value), userId: r.userId }));
    const userTexts = participants.map(p => {
      const r = qResponses.find(r => r.userId === p.id);
      return { nickname: p.nickname || "Anon", text: r ? String(r.value) : null };
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Avg Length" value={`${texts.length > 0 ? Math.round(avg(texts.map(t => t.text.length))) : 0} chars`} icon={Hash} />
          {noResponse > 0 && <StatCard label="No Response" value={noResponse} icon={AlertCircle} warn />}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Responses ({total})</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {texts.map((t, i) => (
                <div key={i} className="flex gap-3 items-start py-2 border-b border-foreground/5 last:border-0">
                  <span className="text-xs text-muted-foreground mt-0.5 shrink-0 tabular-nums w-5">{i + 1}.</span>
                  <p className="text-sm font-medium leading-relaxed">"{t.text}"</p>
                </div>
              ))}
              {texts.length === 0 && <p className="text-sm text-muted-foreground/50 text-center py-4">No responses yet</p>}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Per Participant</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {userTexts.map((u, i) => (
                <div key={i} className="space-y-0.5 py-2 border-b border-foreground/5 last:border-0">
                  <p className="text-xs font-semibold text-muted-foreground">{u.nickname}</p>
                  {u.text ? <p className="text-sm font-medium">"{u.text}"</p> : <p className="text-xs italic opacity-30">skipped</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Word Cloud ─────────────────────────────────────────────────────────────
  if (question.type === 'word-cloud') {
    const texts = qResponses.map(r => String(r.value).trim().toUpperCase());
    const freq: Record<string, number> = {};
    texts.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const chartData = sorted.slice(0, 12).map(([word, count]) => ({ name: word, count }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Unique Words" value={sorted.length} icon={Hash} highlight />
          {noResponse > 0 && <StatCard label="No Response" value={noResponse} icon={AlertCircle} warn />}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Words</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-foreground text-background px-3 py-1.5 rounded-xl text-sm font-bold">{payload[0]?.value}×</div>
                ) : null} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency Table</h4>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {sorted.map(([word, count], i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-bold">{word}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden w-24">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(count / sorted[0][1]) * 100}%` }} />
                    </div>
                    <span className="font-semibold text-muted-foreground tabular-nums w-6 text-right">×{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="text-sm text-muted-foreground py-8 text-center">No statistics available for this question type.</div>;
}

// ─── Cross-User Response Matrix ──────────────────────────────────────────────
function ResponseMatrix({ questions, responses, participants, isQuiz }: {
  questions: PollQuestion[];
  responses: PollResponse[];
  participants: PollParticipant[];
  isQuiz: boolean;
}) {
  if (participants.length === 0 || questions.length === 0) return null;

  const getCellValue = (userId: string, question: PollQuestion): { display: string; correct: boolean | null } => {
    const r = responses.find(r => r.userId === userId && r.questionId === question.id);
    if (!r) return { display: "—", correct: null };
    const val = r.value;
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      const idx = Number(val);
      const label = question.options?.[idx] ?? String(val);
      const correct = isQuiz && question.correctOptionIndices !== undefined ? question.correctOptionIndices.includes(idx) : null;
      return { display: label.length > 16 ? label.slice(0, 16) + "…" : label, correct };
    }
    if (question.type === 'ranking' && Array.isArray(val)) {
      return { display: (val as unknown as number[]).map(i => question.options?.[Number(i)] ?? i).join(" > ").slice(0, 18), correct: null };
    }
    const strVal = String(val).slice(0, 18);
    return { display: strVal, correct: null };
  };

  return (
    <div className="rounded-2xl border bg-card shadow-none overflow-hidden">
      <div className="p-5 border-b">
        <h3 className="font-bold text-sm flex items-center gap-2"><Table2 className="h-4 w-4 text-primary" /> Full Response Matrix</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Every participant's answer to every question</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground sticky left-0 bg-muted/30 min-w-[120px]">Participant</th>
              {isQuiz && <th className="text-center px-4 py-3 font-semibold text-muted-foreground min-w-[70px]">Score</th>}
              {questions.map((q, i) => (
                <th key={q.id} className="text-left px-3 py-3 font-semibold text-muted-foreground min-w-[130px] max-w-[160px]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-primary/10 text-primary font-black text-[10px]">{i + 1}</span>
                    <span className="truncate">{q.question.slice(0, 20)}{q.question.length > 20 ? "…" : ""}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participants.map((p, pi) => (
              <tr key={p.id} className={cn("border-b last:border-0", pi % 2 === 0 ? "bg-muted/10" : "")}>
                <td className="px-4 py-2.5 font-semibold sticky left-0 bg-inherit">{p.nickname || "Anon"}</td>
                {isQuiz && <td className="px-4 py-2.5 text-center font-bold tabular-nums text-primary">{p.score ?? 0}</td>}
                {questions.map(q => {
                  const cell = getCellValue(p.id, q);
                  return (
                    <td key={q.id} className="px-3 py-2.5">
                      {cell.display === "—" ? (
                        <span className="opacity-20 font-medium">—</span>
                      ) : (
                        <span className={cn(
                          "px-2 py-0.5 rounded-md font-medium inline-block",
                          cell.correct === true ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          cell.correct === false ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-muted/50"
                        )}>
                          {cell.correct === true && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                          {cell.correct === false && <XCircle className="inline h-3 w-3 mr-1 opacity-50" />}
                          {cell.display}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Score Distribution ───────────────────────────────────────────────────────
function ScoreDistribution({ participants }: { participants: PollParticipant[] }) {
  if (!participants.length) return null;
  const scores = participants.map(p => p.score || 0).sort((a, b) => a - b);
  const maxScore = maxVal(scores);
  const buckets = 6;
  const bucketSize = maxScore > 0 ? Math.ceil(maxScore / buckets) : 1;
  const histData = Array.from({ length: buckets }, (_, i) => {
    const lo = i * bucketSize;
    const hi = lo + bucketSize;
    return { range: `${lo}–${hi}`, count: scores.filter(s => s >= lo && (i === buckets - 1 ? s <= hi : s < hi)).length };
  });

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score Distribution</h4>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={histData}>
          <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis hide />
          <Tooltip content={({ active, payload }) => active && payload?.length ? (
            <div className="bg-foreground text-background px-3 py-1.5 rounded-xl text-sm font-bold">{payload[0]?.value} players</div>
          ) : null} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(33 100% 50%)" />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="text-center"><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-lg font-black">{avg(scores).toFixed(0)}</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Highest</p><p className="text-lg font-black text-primary">{maxVal(scores)}</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Lowest</p><p className="text-lg font-black">{minVal(scores)}</p></div>
      </div>
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function csvEscape(value: string | number) {
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function exportCSV(session: PollSession, questions: PollQuestion[], responses: PollResponse[], participants: PollParticipant[]) {
  const headers = ["Participant", "Score", ...questions.map((q, i) => `Q${i + 1}: ${q.question}`)];
  const rows = participants.map(p => {
    const cells = questions.map(q => {
      const r = responses.find(r => r.userId === p.id && r.questionId === q.id);
      if (!r) return "";
      if (Array.isArray(r.value)) return (r.value as unknown as number[]).map(i => q.options?.[Number(i)] ?? i).join(" > ");
      if ((q.type === 'multiple-choice' || q.type === 'true-false') && q.options) return q.options[Number(r.value)] ?? String(r.value);
      return String(r.value);
    });
    return [p.nickname || "Anon", p.score ?? 0, ...cells];
  });
  const csv = [headers, ...rows].map(r => r.map(c => csvEscape(c)).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `quizbase-session-${session.code}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Quiz Question Performance Trend ─────────────────────────────────────────
function findByRate(data: { label: string; correctRate: number }[], dir: 'max' | 'min') {
  return data.reduce((a, b) => dir === 'max' ? (a.correctRate >= b.correctRate ? a : b) : (a.correctRate <= b.correctRate ? a : b), data[0]);
}

function QuizPerformanceTrend({ questions, responses, participants }: {
  questions: PollQuestion[];
  responses: PollResponse[];
  participants: PollParticipant[];
}) {
  const mcQuestions = questions.filter(
    q => (q.type === 'multiple-choice' || q.type === 'true-false') && q.correctOptionIndices?.length
  );
  if (mcQuestions.length < 2) return null;

  const data = mcQuestions.map((q, i) => {
    const qResps = responses.filter(r => r.questionId === q.id);
    const total = qResps.length;
    const correct = qResps.filter(r => q.correctOptionIndices?.includes(Number(r.value))).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { label: `Q${questions.indexOf(q) + 1}`, correctRate: rate, responses: total };
  });

  const avgRate = Math.round(data.reduce((sum, d) => sum + d.correctRate, 0) / data.length);

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Question Performance Trend
        </h3>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
          avg {avgRate}% correct
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
          <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
            <div className="bg-card border rounded-xl px-4 py-2 shadow-lg text-sm space-y-1">
              <p className="font-bold">{label}</p>
              <p className="text-green-600 dark:text-green-400 font-semibold">{payload[0]?.value}% correct</p>
              <p className="text-muted-foreground text-xs">{data.find(d => d.label === label)?.responses} responses</p>
            </div>
          ) : null} />
          <Line
            type="monotone"
            dataKey="correctRate"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Easiest</p>
          <p className="text-sm font-black">{findByRate(data, 'max').label}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Avg Correct</p>
          <p className="text-sm font-black text-primary">{avgRate}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Hardest</p>
          <p className="text-sm font-black">{findByRate(data, 'min').label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Engagement Score ─────────────────────────────────────────────────────────
const PARTICIPATION_WEIGHT = 0.6;
const RESPONSE_RATE_WEIGHT = 0.4;

function EngagementScore({ participationRate, questions, responses, participants, isQuiz }: {
  participationRate: number;
  questions: PollQuestion[];
  responses: PollResponse[];
  participants: PollParticipant[];
  isQuiz: boolean;
}) {
  // Composite score: PARTICIPATION_WEIGHT × participation + RESPONSE_RATE_WEIGHT × avg per-question response rate
  const avgQResponseRate = useMemo(() => {
    if (!questions.length || !participants.length) return 0;
    const rates = questions.map(q => {
      const count = responses.filter(r => r.questionId === q.id).length;
      return participants.length > 0 ? (count / participants.length) * 100 : 0;
    });
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  }, [questions, responses, participants]);

  const score = Math.round(participationRate * PARTICIPATION_WEIGHT + avgQResponseRate * RESPONSE_RATE_WEIGHT);
  const level = score >= 80 ? { label: "Excellent", cls: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/20" }
    : score >= 60 ? { label: "Good", cls: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20" }
    : score >= 40 ? { label: "Fair", cls: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/20" }
    : { label: "Low", cls: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" };

  return (
    <div className={cn("rounded-2xl border p-5 flex items-center gap-5", level.bg)}>
      <div className="space-y-1 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Engagement Score</p>
        <div className="flex items-baseline gap-2">
          <p className={cn("text-5xl font-black tabular-nums", level.cls)}>{score}</p>
          <span className={cn("text-sm font-bold", level.cls)}>/ 100 · {level.label}</span>
        </div>
        <p className="text-xs text-muted-foreground">Based on participation rate ({participationRate}%) and avg response rate ({avgQResponseRate}%)</p>
      </div>
      <div className="shrink-0">
        <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-current" style={{ borderColor: `currentColor` }}>
          <Activity className={cn("h-7 w-7", level.cls)} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SessionStatsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId: rawSessionId } = use(params);
  const sessionId = useResolvedParam(rawSessionId, 1);
  const db = useFirestore();

  const sessionRef = useMemoFirebase(() => doc(db, "sessions", sessionId), [db, sessionId]);
  const { data: session } = useDoc<PollSession>(sessionRef);

  const questionsQuery = useMemoFirebase(() => {
    if (!session?.userId || !session?.pollId) return null;
    return query(collection(db, `users/${session.userId}/surveys/${session.pollId}/questions`), orderBy("order", "asc"));
  }, [db, session?.userId, session?.pollId]);
  const { data: questions } = useCollection<PollQuestion>(questionsQuery);

  const responsesRef = useMemoFirebase(() => collection(db, `sessions/${sessionId}/responses`), [db, sessionId]);
  const { data: allResponses } = useCollection<PollResponse>(responsesRef);

  const participantsQuery = useMemoFirebase(() =>
    query(collection(db, `sessions/${sessionId}/participants`), orderBy("score", "desc")),
    [db, sessionId]
  );
  const { data: participants } = useCollection<PollParticipant>(participantsQuery);

  const activeParticipants = useMemo(() => participants?.filter(p => p.status === 'active') || [], [participants]);
  const totalResponses = allResponses?.length ?? 0;
  const avgResponsesPerQ = questions?.length ? (totalResponses / questions.length).toFixed(1) : "0";
  const isQuiz = !!session?.isQuiz;
  const sessionDate = session?.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000) : null;

  // Overall participation rate
  const overallParticipationRate = useMemo(() => {
    if (!activeParticipants.length || !questions?.length) return 0;
    const expected = activeParticipants.length * questions.length;
    return expected > 0 ? Math.round((totalResponses / expected) * 100) : 0;
  }, [activeParticipants, questions, totalResponses]);

  const handleExport = useCallback(() => {
    if (!session || !questions || !allResponses || !participants) return;
    exportCSV(session, questions, allResponses, activeParticipants);
  }, [session, questions, allResponses, participants, activeParticipants]);

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Header variant="minimal" />

      <main className="flex-1 container mx-auto px-6 pt-28 pb-16 space-y-10 max-w-screen-2xl">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
          <div className="flex items-start gap-4">
            <Link href={`/presenter/${sessionId}`}>
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shadow-none mt-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Session Analytics</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{session?.title ?? "Loading…"}</span>
                <span className="opacity-30">·</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold">{session?.code ?? "—"}</span>
                {isQuiz && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">Quiz</span>}
                {!isQuiz && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold">Survey</span>}
                {session?.status === 'ended' && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">Ended</span>}
              </div>
              {sessionDate && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {sessionDate.toLocaleDateString(undefined, { dateStyle: "long" })}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sessionDate.toLocaleTimeString(undefined, { timeStyle: "short" })}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="h-10 px-5 rounded-xl gap-2 font-semibold text-sm shadow-none"
            onClick={handleExport}
            disabled={!session || !questions || !allResponses}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* ── Top-level summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Participants" value={activeParticipants.length} icon={Users} />
          <StatCard label="Questions" value={questions?.length ?? 0} icon={BarChart3} />
          <StatCard label="Total Responses" value={totalResponses} icon={MessageSquare} />
          <StatCard label="Participation Rate" value={`${overallParticipationRate}%`} icon={Activity} highlight={overallParticipationRate >= 80} warn={overallParticipationRate < 50} />
        </div>

        {/* ── Engagement Score ── */}
        {activeParticipants.length > 0 && questions && questions.length > 0 && (
          <EngagementScore
            participationRate={overallParticipationRate}
            questions={questions}
            responses={allResponses ?? []}
            participants={activeParticipants}
            isQuiz={isQuiz}
          />
        )}

        {/* ── Quiz question performance trend ── */}
        {isQuiz && questions && questions.length >= 2 && allResponses && (
          <QuizPerformanceTrend
            questions={questions}
            responses={allResponses}
            participants={activeParticipants}
          />
        )}

        {/* ── Quiz leaderboard ── */}
        {isQuiz && activeParticipants.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> Leaderboard & Scores</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Final Rankings</h4>
                <div className="space-y-1.5">
                  {activeParticipants.map((p, i) => (
                    <div key={p.id} className={cn(
                      "flex items-center gap-4 px-4 py-2.5 rounded-xl",
                      i === 0 ? "bg-primary/10 border border-primary/20" : i < 3 ? "bg-muted/50" : "bg-muted/20"
                    )}>
                      <span className={cn("w-6 text-center text-sm font-black shrink-0", i === 0 ? "text-primary" : "text-muted-foreground")}>{i + 1}</span>
                      <span className="flex-1 text-sm font-semibold truncate">{p.nickname || "Anon"}</span>
                      {p.streak > 1 && <span className="text-xs flex items-center gap-0.5"><Flame className="h-3 w-3 text-orange-500" />{p.streak}</span>}
                      <span className="text-sm font-bold tabular-nums shrink-0">{p.score ?? 0} pts</span>
                    </div>
                  ))}
                </div>
              </div>
              <ScoreDistribution participants={activeParticipants} />
            </div>
          </div>
        )}

        {/* ── Response Matrix ── */}
        {activeParticipants.length > 0 && questions && questions.length > 0 && allResponses && (
          <ResponseMatrix
            questions={questions}
            responses={allResponses}
            participants={activeParticipants}
            isQuiz={isQuiz}
          />
        )}

        {/* ── Per-question analysis ── */}
        {questions && questions.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Per-Question Deep Analysis</h2>
            {questions.map((q, i) => {
              const qResponses = allResponses?.filter(r => r.questionId === q.id) ?? [];
              const responseCount = qResponses.length;
              const responseRate = activeParticipants.length > 0 ? Math.round((responseCount / activeParticipants.length) * 100) : 0;
              return (
                <div key={q.id} className="rounded-2xl border bg-muted/10 overflow-hidden shadow-none">
                  <div className="px-6 py-4 flex flex-wrap items-start gap-3 border-b bg-muted/20">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base leading-snug">{q.question}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide bg-muted px-2 py-0.5 rounded">{q.type}</span>
                        <span className="text-xs text-muted-foreground">{responseCount}/{activeParticipants.length} responses ({responseRate}%)</span>
                        {q.timeLimit && q.timeLimit > 0 && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" />{q.timeLimit}s</span>}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <QuestionStats
                      question={q}
                      responses={allResponses ?? []}
                      participants={activeParticipants}
                      isQuiz={isQuiz}
                      qIndex={i}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(!questions || questions.length === 0) && (
          <div className="py-32 text-center border border-dashed rounded-2xl text-muted-foreground text-sm">
            Loading statistics…
          </div>
        )}
      </main>
    </div>
  );
}
