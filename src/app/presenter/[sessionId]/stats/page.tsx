"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Users, BarChart3, Trophy, Hash, Star, MessageSquare, Target, TrendingUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { PollQuestion, PollSession, PollParticipant, PollResponse } from "@/app/types/poll";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
  PieChart, Pie, Legend
} from "recharts";

// ─── Stat helpers ────────────────────────────────────────────────────────────
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, highlight }: {
  label: string; value: string | number; sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-5 space-y-2 shadow-none",
      highlight ? "bg-primary/5 border-primary/30" : "bg-card"
    )}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className={cn("h-3.5 w-3.5", highlight ? "text-primary" : "")} />}
        {label}
      </div>
      <p className={cn("text-3xl font-black tabular-nums", highlight ? "text-primary" : "")}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Per-Question Stats ────────────────────────────────────────────────────────
function QuestionStats({ question, responses, participants, isQuiz }: {
  question: PollQuestion;
  responses: PollResponse[];
  participants: PollParticipant[];
  isQuiz: boolean;
}) {
  const qResponses = responses.filter(r => r.questionId === question.id);
  const total = qResponses.length;

  // ── Multiple choice / True-False ─────────────────────────────────────────
  if ((question.type === 'multiple-choice' || question.type === 'true-false') && question.options) {
    const counts: Record<number, number> = {};
    qResponses.forEach(r => {
      const idx = Number(r.value);
      counts[idx] = (counts[idx] || 0) + 1;
    });
    const data = question.options.map((opt, idx) => ({
      name: opt.length > 20 ? opt.slice(0, 20) + "…" : opt,
      fullName: opt,
      count: counts[idx] || 0,
      pct: total > 0 ? Math.round(((counts[idx] || 0) / total) * 100) : 0,
      isCorrect: isQuiz && question.correctOptionIndices?.includes(idx),
    }));
    const topOption = data.reduce((a, b) => (a.count > b.count ? a : b), data[0]);

    // Per-user selections
    const userSelections = participants.map(p => {
      const r = qResponses.find(r => r.userId === p.id);
      return { nickname: p.nickname || "Anon", value: r ? question.options![Number(r.value)] : "—", idx: r ? Number(r.value) : -1 };
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Response Rate" value={`${participants.length > 0 ? Math.round((total / participants.length) * 100) : 0}%`} icon={TrendingUp} />
          <StatCard label="Most Chosen" value={topOption?.name || "—"} sub={`${topOption?.pct ?? 0}% chose this`} icon={Target} highlight />
          {isQuiz && (
            <StatCard
              label="Correct Answers"
              value={`${data.filter(d => d.isCorrect).reduce((a, b) => a + b.count, 0)}`}
              sub={`of ${total} responses`}
              icon={Trophy}
            />
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Distribution Bar Chart */}
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={130} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip
                  content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-foreground text-background px-4 py-2 rounded-xl text-sm font-bold shadow-xl">
                      {payload[0]?.payload?.fullName}: {payload[0]?.value} votes ({payload[0]?.payload?.pct}%)
                    </div>
                  ) : null}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={28}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.isCorrect ? "hsl(142 71% 45%)" : "currentColor"} fillOpacity={Math.max(0.4, 0.95 - i * 0.08)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Individual responses */}
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Individual Responses</h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {userSelections.map((u, i) => (
                <div key={i} className="flex items-center justify-between text-sm gap-3">
                  <span className="font-medium truncate text-muted-foreground min-w-0">{u.nickname}</span>
                  <span className={cn(
                    "font-semibold shrink-0 px-2.5 py-0.5 rounded-lg text-xs",
                    isQuiz && question.correctOptionIndices?.includes(u.idx) ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    u.idx >= 0 ? "bg-muted text-foreground" : "opacity-30"
                  )}>{u.value}</span>
                </div>
              ))}
              {userSelections.length === 0 && <p className="text-sm text-muted-foreground/50">No responses yet</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Rating ────────────────────────────────────────────────────────────────
  if (question.type === 'rating') {
    const values = qResponses.map(r => Number(r.value)).filter(v => v >= 1 && v <= 5);
    const sortedVals = [...values].sort((a, b) => a - b);
    const distribution = [1, 2, 3, 4, 5].map(s => ({ star: `${s}★`, count: values.filter(v => v === s).length }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Average" value={avg(values).toFixed(2)} icon={Star} highlight />
          <StatCard label="Min" value={minVal(values)} icon={Minus} />
          <StatCard label="Max" value={maxVal(values)} icon={TrendingUp} />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Star Distribution</h4>
            <ResponsiveContainer width="100%" height={180}>
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
              <div className="flex justify-between"><span className="text-muted-foreground">Median</span><span className="font-bold">{median(sortedVals).toFixed(1)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-bold">{distribution.length > 0 ? distribution.reduce((a,b)=>a.count>b.count?a:b, distribution[0])?.star : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">5-star rate</span><span className="font-bold">{values.length>0?Math.round((values.filter(v=>v===5).length/values.length)*100):0}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">1-star rate</span><span className="font-bold">{values.length>0?Math.round((values.filter(v=>v===1).length/values.length)*100):0}%</span></div>
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

    // Build histogram buckets
    const buckets = 8;
    const bucketSize = (max - min) / buckets || 1;
    const histData = Array.from({ length: buckets }, (_, i) => {
      const lo = min + i * bucketSize;
      const hi = lo + bucketSize;
      return {
        range: `${Math.round(lo)}–${Math.round(hi)}`,
        count: values.filter(v => v >= lo && (i === buckets - 1 ? v <= hi : v < hi)).length,
      };
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Average" value={avg(values).toFixed(1)} icon={BarChart3} highlight />
          <StatCard label="Min" value={minVal(values)} icon={Minus} />
          <StatCard label="Max" value={maxVal(values)} icon={TrendingUp} />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distribution Histogram</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={histData}>
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
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
              <div className="flex justify-between"><span className="text-muted-foreground">Median</span><span className="font-bold">{median(sortedVals).toFixed(1)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Std range</span><span className="font-bold">{min} – {max}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Step</span><span className="font-bold">{step}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Below avg</span><span className="font-bold">{values.filter(v => v < avg(values)).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Above avg</span><span className="font-bold">{values.filter(v => v > avg(values)).length}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Open Text / Word Cloud ────────────────────────────────────────────────
  if (question.type === 'open-text' || question.type === 'word-cloud') {
    const texts = qResponses.map(r => String(r.value));
    // Word frequency for word-cloud
    const freq: Record<string, number> = {};
    texts.forEach(t => { const w = t.trim().toUpperCase(); freq[w] = (freq[w] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Responses" value={total} icon={Users} />
          <StatCard label="Unique Entries" value={Object.keys(freq).length} icon={Hash} highlight />
        </div>
        {question.type === 'word-cloud' ? (
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Words</h4>
            <div className="flex flex-wrap gap-2">
              {sorted.map(([word, count], i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-bold">
                  {word} <span className="opacity-50 text-xs">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Responses</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {texts.map((text, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-xs text-muted-foreground mt-1 shrink-0 tabular-nums">{i + 1}.</span>
                  <p className="text-sm font-medium leading-relaxed">"{text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground py-8 text-center">
      No statistics available for this question type.
    </div>
  );
}

// ─── Score Distribution (Quiz mode) ──────────────────────────────────────────
function ScoreDistribution({ participants }: { participants: PollParticipant[] }) {
  if (!participants.length) return null;
  const scores = participants.map(p => p.score || 0).sort((a, b) => a - b);
  const maxScore = maxVal(scores);
  const buckets = 6;
  const bucketSize = maxScore > 0 ? Math.ceil(maxScore / buckets) : 1;
  const histData = Array.from({ length: buckets }, (_, i) => {
    const lo = i * bucketSize;
    const hi = lo + bucketSize;
    return {
      range: `${lo}–${hi}`,
      count: scores.filter(s => s >= lo && (i === buckets - 1 ? s <= hi : s < hi)).length,
    };
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
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SessionStatsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
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

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Header variant="minimal" />

      <main className="flex-1 studio-container pt-28 pb-16 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/presenter/${sessionId}`}>
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shadow-none">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Session Statistics</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{session?.title ?? "Loading…"} · Code: {session?.code ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Top-level stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Participants" value={activeParticipants.length} icon={Users} />
          <StatCard label="Questions" value={questions?.length ?? 0} icon={BarChart3} />
          <StatCard label="Total Responses" value={totalResponses} icon={MessageSquare} />
          <StatCard label="Avg Responses/Q" value={avgResponsesPerQ} icon={TrendingUp} highlight />
        </div>

        {/* Quiz mode — leaderboard + score distribution */}
        {isQuiz && activeParticipants.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> Leaderboard</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-none">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Players</h4>
                <div className="space-y-2">
                  {activeParticipants.slice(0, 10).map((p, i) => (
                    <div key={p.id} className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl",
                      i === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/40"
                    )}>
                      <span className={cn("w-6 text-center text-sm font-black", i === 0 ? "text-primary" : "text-muted-foreground")}>{i + 1}</span>
                      <span className="flex-1 text-sm font-semibold truncate">{p.nickname || "Anon"}</span>
                      <span className="text-sm font-bold tabular-nums">{p.score ?? 0}</span>
                      {p.streak > 1 && <span className="text-xs text-muted-foreground">🔥{p.streak}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <ScoreDistribution participants={activeParticipants} />
            </div>
          </div>
        )}

        {/* Per-question stats */}
        {questions && questions.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Per-Question Analysis</h2>
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-2xl border bg-muted/20 p-6 space-y-5 shadow-none">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-base leading-snug">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{q.type}</p>
                  </div>
                </div>
                <QuestionStats
                  question={q}
                  responses={allResponses ?? []}
                  participants={activeParticipants}
                  isQuiz={isQuiz}
                />
              </div>
            ))}
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
