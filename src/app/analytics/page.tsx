"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3, Users, Trophy, Calendar, TrendingUp,
  ChevronRight, Loader2, ArrowUpRight, Activity, Zap,
  Search, CalendarDays, Flame, ArrowUp, ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  AreaChart, Area, CartesianGrid
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function fmtDate(ts: any, fmt: 'short' | 'long' = 'short') {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, fmt === 'long'
    ? { day: "numeric", month: "long", year: "numeric" }
    : { day: "numeric", month: "short", year: "numeric" });
}

function fmtTime(ts: any) {
  if (!ts?.seconds) return "";
  return new Date(ts.seconds * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function monthKey(ts: any): string {
  if (!ts?.seconds) return "?";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Summary Card ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, sub, trend }: {
  label: string; value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string; trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-none">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-4xl font-black tabular-nums tracking-tight">{value}</p>
        {trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500 mb-1 shrink-0" />}
        {trend === 'down' && <ArrowDown className="h-4 w-4 text-red-400 mb-1 shrink-0" />}
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [filterType, setFilterType] = useState<"all" | "quiz" | "survey">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  // Load all sessions (up to 200)
  const sessionsQuery = useMemoFirebase(() => {
    if (!user?.uid || isUserLoading) return null;
    return query(
      collection(db, "sessions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(200)
    );
  }, [user, db, isUserLoading]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection<{
    id: string; title: string; code: string; createdAt: any;
    isQuiz?: boolean; status?: string; pollId?: string;
  }>(sessionsQuery);

  // ── Date helpers ──
  const now = useMemo(() => new Date(), []);
  const startOfWeek = useMemo(() => {
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); return d;
  }, [now]);
  const startOfMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const startOfPrevMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now]);

  const tsDate = (ts: any) => ts?.seconds ? new Date(ts.seconds * 1000) : null;

  // ── Aggregate KPIs ──
  const totalSessions = sessions?.length ?? 0;
  const quizCount = sessions?.filter(s => s.isQuiz).length ?? 0;
  const surveyCount = totalSessions - quizCount;
  const endedCount = sessions?.filter(s => s.status === 'ended').length ?? 0;
  const activeCount = totalSessions - endedCount;

  const thisWeekCount = useMemo(() =>
    sessions?.filter(s => { const d = tsDate(s.createdAt); return d && d >= startOfWeek; }).length ?? 0,
    [sessions, startOfWeek]
  );
  const thisMonthCount = useMemo(() =>
    sessions?.filter(s => { const d = tsDate(s.createdAt); return d && d >= startOfMonth; }).length ?? 0,
    [sessions, startOfMonth]
  );
  const prevMonthCount = useMemo(() =>
    sessions?.filter(s => { const d = tsDate(s.createdAt); return d && d >= startOfPrevMonth && d < startOfMonth; }).length ?? 0,
    [sessions, startOfMonth, startOfPrevMonth]
  );

  // Average sessions per month (over all months that have data)
  const avgPerMonth = useMemo(() => {
    if (!sessions?.length) return 0;
    const months = new Set(sessions.map(s => monthKey(s.createdAt)));
    const oneDecimal = 10;
    return Math.round((sessions.length / Math.max(months.size, 1)) * oneDecimal) / oneDecimal;
  }, [sessions]);

  // Most active weekday
  const weekdayData = useMemo(() => {
    if (!sessions) return WEEKDAYS.map((d, i) => ({ day: d, count: 0, isTop: false }));
    const counts = [0, 0, 0, 0, 0, 0, 0];
    sessions.forEach(s => { const d = tsDate(s.createdAt); if (d) counts[d.getDay()]++; });
    const max = Math.max(...counts);
    return WEEKDAYS.map((d, i) => ({ day: d, count: counts[i], isTop: counts[i] === max && max > 0 }));
  }, [sessions]);
  const mostActiveDay = weekdayData.find(d => d.isTop)?.day ?? "—";

  // ── Activity timeline (sessions per month) ──
  const activityData = useMemo(() => {
    if (!sessions) return [];
    const counts: Record<string, { label: string; sessions: number; quiz: number; survey: number }> = {};
    sessions.forEach(s => {
      const key = monthKey(s.createdAt);
      if (!counts[key]) counts[key] = { label: key, sessions: 0, quiz: 0, survey: 0 };
      counts[key].sessions++;
      if (s.isQuiz) counts[key].quiz++;
      else counts[key].survey++;
    });
    return Object.values(counts).reverse();
  }, [sessions]);

  // ── Filtered & sorted session list ──
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const list = sessions
      .filter(s => {
        if (filterType === 'quiz') return !!s.isQuiz;
        if (filterType === 'survey') return !s.isQuiz;
        return true;
      })
      .filter(s => !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.code?.includes(search));
    if (sortDir === 'asc') return [...list].reverse();
    return list;
  }, [sessions, filterType, search, sortDir]);

  if (isUserLoading || !user) return null;

  const monthTrend = thisMonthCount > prevMonthCount ? 'up' : thisMonthCount < prevMonthCount ? 'down' : null;

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Header variant="minimal" />

      <main className="flex-1 container mx-auto px-6 pt-28 pb-16 space-y-10 max-w-screen-2xl">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
            <p className="text-base text-muted-foreground">
              All your sessions and surveys — sorted, filtered, and analyzed.
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="h-10 px-5 rounded-xl gap-2 font-semibold text-sm shadow-none shrink-0"
          >
            <Zap className="h-4 w-4" /> Go to Dashboard
          </Button>
        </div>

        {/* ── KPI Row 1: totals ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Sessions" value={totalSessions} icon={Activity} sub="all time" />
          <KpiCard label="Quiz Sessions" value={quizCount} icon={Trophy} sub={`${pct(quizCount, totalSessions)}% of total`} />
          <KpiCard label="Survey Sessions" value={surveyCount} icon={BarChart3} sub={`${pct(surveyCount, totalSessions)}% of total`} />
          <KpiCard label="Ended Sessions" value={endedCount} icon={TrendingUp} sub={`${activeCount} still active`} />
        </div>

        {/* ── KPI Row 2: temporal insights ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="This Week" value={thisWeekCount} icon={CalendarDays} sub="sessions since Sunday" />
          <KpiCard
            label="This Month"
            value={thisMonthCount}
            icon={Calendar}
            trend={monthTrend}
            sub={prevMonthCount > 0 ? `vs ${prevMonthCount} last month` : "first month"}
          />
          <KpiCard label="Avg / Month" value={avgPerMonth} icon={TrendingUp} sub={`over ${activityData.length} months`} />
          <KpiCard label="Most Active Day" value={mostActiveDay} icon={Flame} sub="day with most sessions" />
        </div>

        {/* ── Activity Timeline ── */}
        {activityData.length > 1 && (
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Session Activity
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="bg-card border rounded-xl px-4 py-2 shadow-lg text-sm space-y-1">
                      <p className="font-bold">{label}</p>
                      <p className="text-primary">{payload[0]?.value} sessions</p>
                    </div>
                  ) : null}
                />
                <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Weekday + Type breakdown side by side ── */}
        {totalSessions > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Weekday bar */}
            <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Sessions by Weekday
              </h2>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weekdayData} margin={{ left: -10, right: 5 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-foreground text-background px-3 py-1.5 rounded-xl text-sm font-bold">{payload[0]?.value} sessions</div>
                  ) : null} />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]} barSize={24}>
                    {weekdayData.map((d, i) => (
                      <Cell key={i} fill="currentColor" fillOpacity={d.isTop ? 1 : 0.35} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Type breakdown */}
            <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Session Type Breakdown
              </h2>
              <div className="space-y-3 mt-2">
                {[
                  { label: "Quiz sessions", value: quizCount, percent: pct(quizCount, totalSessions) },
                  { label: "Survey sessions", value: surveyCount, percent: pct(surveyCount, totalSessions) },
                  { label: "Ended", value: endedCount, percent: pct(endedCount, totalSessions) },
                  { label: "Still active", value: activeCount, percent: pct(activeCount, totalSessions) },
                ].map((row, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">{row.label}</span>
                      <span className="font-bold tabular-nums">{row.value} <span className="text-muted-foreground font-normal text-xs">({row.percent}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${row.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Session List ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> All Sessions
              {filteredSessions.length !== totalSessions && (
                <span className="text-xs text-muted-foreground font-normal">({filteredSessions.length} of {totalSessions})</span>
              )}
            </h2>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search sessions…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-9 pl-8 pr-3 rounded-xl border text-sm w-44 shadow-none"
                />
              </div>
              {/* Filter by type */}
              <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
                {(["all", "quiz", "survey"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize",
                      filterType === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Sort direction */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="h-9 px-3 rounded-xl gap-1.5 text-xs font-semibold shadow-none"
              >
                {sortDir === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
                {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
              </Button>
            </div>
          </div>

          {sessionsLoading ? (
            <div className="py-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto opacity-20" /></div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-24 text-center border border-dashed rounded-2xl text-muted-foreground text-sm">
              {totalSessions === 0 ? "No sessions yet. Launch your first survey from the Dashboard." : "No sessions match the current filter."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSessions.map((session, i) => (
                <div
                  key={session.id}
                  className="group bg-card border rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4 hover:border-primary/30 transition-all shadow-none"
                >
                  {/* Index */}
                  <span className="text-xs font-black text-muted-foreground/40 tabular-nums w-5 shrink-0">{i + 1}</span>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-bold truncate leading-tight">{session.title || "Untitled Session"}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded font-bold">{session.code}</span>
                      {session.isQuiz ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Quiz</span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Survey</span>
                      )}
                      {session.status === 'ended' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Ended</span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">{mounted ? fmtDate(session.createdAt, 'short') : "—"}</span>
                    {mounted && session.createdAt?.seconds && (
                      <span className="opacity-50">{fmtTime(session.createdAt)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/presenter/${session.id}/stats`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 rounded-xl gap-1.5 text-xs font-semibold shadow-none"
                      >
                        <BarChart3 className="h-3.5 w-3.5" /> Analytics
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </Button>
                    </Link>
                    <Link href={`/presenter/${session.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-xl gap-1.5 text-xs font-semibold shadow-none opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" /> Open
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
