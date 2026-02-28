"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Monitor, Share2, Smartphone, Users, Timer, CheckSquare, AlignLeft, Hash, SlidersHorizontal, Star, List, ToggleLeft, Target, Gauge } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

// ─── Stats numbers ──────────────────────────────────────────────────────────
const STATS = [
  { value: "9", label: "Question types", suffix: "" },
  { value: "100", label: "Free forever", suffix: "%" },
  { value: "6", label: "Digit join code", suffix: "-" },
  { value: "0", label: "App required", suffix: "" },
];

// ─── Question types showcase ────────────────────────────────────────────────
const QUESTION_TYPES = [
  { icon: CheckSquare, label: "Multiple Choice", desc: "Classic A/B/C/D with live vote bars" },
  { icon: ToggleLeft, label: "True / False", desc: "Quick ✓/✗ check — ideal for icebreakers" },
  { icon: Star, label: "Star Rating", desc: "Animated 1–5 ★ average in real time" },
  { icon: AlignLeft, label: "Open Text", desc: "Free-form responses shown as a live feed" },
  { icon: Hash, label: "Word Cloud", desc: "Most-said words appear largest" },
  { icon: SlidersHorizontal, label: "Slider", desc: "Continuous numeric vote on a range" },
  { icon: Gauge, label: "Scale", desc: "Discrete step rating with a custom label" },
  { icon: List, label: "Ranking", desc: "Drag-to-rank with consensus order result" },
  { icon: Target, label: "Guess the Number", desc: "Closest answer wins — great for quizzes" },
];

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const router = useRouter();

  const [heroSelected, setHeroSelected] = useState<number | null>(null);
  const [stageVotes, setStageVotes] = useState([90, 40, 70, 55]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length >= 6) {
      router.push(`/p/${joinCode.toUpperCase()}`);
    }
  };

  const handleStageVote = (idx: number) => {
    const newVotes = [...stageVotes];
    newVotes[idx] = Math.min(100, newVotes[idx] + 5);
    setStageVotes(newVotes);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ff9312] text-[#4c2f05] overflow-x-clip font-body">
      <Header variant="brand" className="text-[#4c2f05]" />

      <main className="flex-grow">
        <section className="studio-container min-h-[100dvh] flex items-center pt-28 pb-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
              <header className="space-y-4">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter uppercase">
                  Quiz. <br />
                  Base.
                </h1>
              </header>
              <p className="text-lg md:text-xl font-semibold max-w-sm leading-relaxed opacity-80">
                Transform any room into a live interaction studio. Zero barriers. Real-time engagement.
              </p>
              
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-sm">
                <div className="flex-grow bg-[#4c2f05]/10 rounded-xl px-6 h-14 flex items-center border-2 border-[#4c2f05] focus-within:bg-[#4c2f05]/20 transition-all relative overflow-hidden">
                  <Input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Join code" 
                    maxLength={6}
                    className="border-none bg-transparent focus-visible:ring-0 text-2xl font-bold p-0 placeholder:opacity-20 uppercase h-auto shadow-none text-[#4c2f05] w-full tracking-widest placeholder:text-[#4c2f05] relative z-10"
                    aria-label="Enter 6-digit session code"
                  />
                </div>
                <button type="submit" disabled={joinCode.length < 6} className="h-14 px-8 rounded-xl text-sm font-bold bg-[#4c2f05] text-[#ff9312] border-2 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all group shrink-0 shadow-none uppercase flex items-center justify-center gap-2 tracking-wider">
                  Join <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="relative group flex justify-center animate-in fade-in slide-in-from-right-10 duration-1000 py-16 px-4">
              <div className="relative w-full max-w-[600px] aspect-video bg-white rounded-2xl border-2 border-[#4c2f05] p-8 transform -rotate-2 transition-all group-hover:rotate-0 duration-700 hidden md:flex flex-col z-0 shadow-none">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#4c2f05]/10">
                   <div className="flex items-center gap-3">
                     <Zap className="h-5 w-5 fill-current" />
                     <span className="font-bold text-xs uppercase tracking-widest">Live Session</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Live</span>
                     </div>
                     <span className="text-xs font-medium uppercase tracking-wider opacity-30">X8Y9Z2</span>
                   </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                   <h3 className="text-xl font-bold tracking-tight leading-tight max-w-md">What is our primary goal?</h3>
                   <div className="w-full h-40 flex items-end gap-4 px-8 bg-[#4c2f05]/5 rounded-xl border border-dashed border-[#4c2f05]/10 py-4">
                     <div className="bg-[#ff9312] w-full rounded-t-lg border border-[#4c2f05]/30 transition-all duration-500" style={{ height: heroSelected === 0 ? '95%' : '85%' }} />
                     <div className="bg-[#ff9312]/30 w-full rounded-t-lg border border-[#4c2f05]/10 transition-all duration-500" style={{ height: heroSelected === 1 ? '55%' : '45%' }} />
                     <div className="bg-[#ff9312]/60 w-full rounded-t-lg border border-[#4c2f05]/20 transition-all duration-500" style={{ height: heroSelected === 2 ? '75%' : '65%' }} />
                   </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#4c2f05]/10 flex justify-between items-center opacity-30">
                    <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">256 Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Timer className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">15s Left</span>
                    </div>
                </div>
              </div>

              <div className="relative md:absolute md:-bottom-12 md:-right-4 w-full max-w-[280px] aspect-[4/7] bg-white rounded-3xl border-2 border-[#4c2f05] p-8 transform rotate-4 transition-all group-hover:rotate-2 duration-700 flex flex-col z-20 shadow-none">
                <div className="w-16 h-1.5 bg-[#4c2f05]/10 rounded-full mx-auto mb-8 shrink-0" />
                <div className="flex-1 space-y-6 overflow-hidden">
                  <div className="flex items-center justify-between opacity-30">
                    <Zap className="h-4 w-4" />
                    <span className="font-bold text-[10px] tracking-wider uppercase">Quizbase</span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight">Your choice?</h3>
                  <div className="space-y-2.5">
                    {['Innovation', 'Growth', 'Stability'].map((opt, i) => (
                      <div 
                        key={opt}
                        onClick={() => setHeroSelected(i)}
                        className={cn(
                          "h-12 rounded-xl border flex items-center px-4 transition-all cursor-pointer active:scale-95",
                          heroSelected === i 
                            ? "bg-[#ff9312] border-[#4c2f05]/40" 
                            : "bg-[#4c2f05]/5 border-dashed border-[#4c2f05]/15 hover:bg-[#4c2f05]/10"
                        )}
                      >
                        <span className={cn("font-semibold text-sm", heroSelected === i ? "opacity-100" : "opacity-40")}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="border-t-2 border-b-2 border-[#4c2f05] bg-[#4c2f05] text-[#ff9312]">
          <div className="studio-container grid grid-cols-2 sm:grid-cols-4 divide-x-2 divide-[#ff9312]/20">
            {STATS.map((s, i) => (
              <div key={i} className="py-8 px-6 text-center space-y-1">
                <p className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter leading-none">
                  {s.suffix === '-' ? (
                    <>{s.value}<span className="text-2xl opacity-50 ml-0.5">-digit</span></>
                  ) : s.suffix === '%' ? (
                    <>{s.value}<span className="text-2xl opacity-50">%</span></>
                  ) : (
                    s.value
                  )}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-50">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 bg-[#4c2f05] text-[#ff9312] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative px-6 flex justify-center lg:justify-start">
              <div className="bg-white rounded-2xl border-2 border-[#ff9312] p-10 rotate-[-2deg] z-10 relative max-w-[380px] w-full shadow-none">
                <h4 className="text-xl font-bold text-[#4c2f05] mb-6">Live Pulse Status</h4>
                <div className="space-y-4">
                  <div className="h-10 bg-[#ff9312] rounded-lg w-[85%] transition-all duration-1000" />
                  <div className="h-10 bg-[#ff9312]/30 rounded-lg w-[45%]" />
                  <div className="h-10 bg-[#ff9312]/60 rounded-lg w-[65%]" />
                </div>
                <div className="mt-8 flex justify-between items-center">
                   <div className="h-7 w-7 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[#4c2f05] opacity-40">Sync Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-10 px-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] uppercase tracking-tighter">
                From Screen <br />
                To Hand. <br />
                <span className="opacity-30">Instantly.</span>
              </h2>
              <div className="grid gap-8">
                {[
                  { icon: Monitor, title: "Create", desc: "Build your interaction in the studio editor." },
                  { icon: Share2, title: "Share", desc: "Broadcast the code to your audience." },
                  { icon: Smartphone, title: "Engage", desc: "Audience joins and votes on any device." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-xl bg-[#ff9312] text-[#4c2f05] flex items-center justify-center shrink-0">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold uppercase tracking-tight">{step.title}</h4>
                      <p className="font-medium opacity-50 text-sm leading-snug">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Quizbase — unique features */}
        <section className="py-24 bg-[#ff9312] text-[#4c2f05]">
          <div className="studio-container px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                Why Quizbase?
              </h2>
              <p className="text-base font-semibold opacity-60 max-w-xl mx-auto">
                Everything Mentimeter and Kahoot offer — plus unique features you won't find anywhere else.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { emoji: '👍', title: 'Live Emoji Reactions', desc: 'Audience sends emoji reactions in real time — they float up on the presenter screen for instant crowd energy.' },
                { emoji: '🏆', title: 'Quiz & Survey Modes', desc: 'Switch between scored quiz mode (with streak bonuses and leaderboard) and anonymous survey mode per session.' },
                { emoji: '🗂️', title: '9 Question Types', desc: 'Multiple choice, True/False, ranking, word cloud, star rating, slider, scale, open text, and number guess.' },
                { emoji: '⚡', title: 'Zero Barriers', desc: 'Participants join with a 6-digit code — no app download, no account, no friction.' },
                { emoji: '🎨', title: 'Live Theming', desc: 'Pick a theme color per session. The presenter and participant views update in real time.' },
                { emoji: '🆓', title: 'Free & Open Source', desc: 'No paywalls. No participant limits. No slideshow taxes. Just pure live interaction.' },
              ].map((feat, i) => (
                <div key={i} className="bg-[#4c2f05]/8 border border-[#4c2f05]/15 rounded-2xl p-7 space-y-3 hover:bg-[#4c2f05]/12 transition-colors">
                  <span className="text-4xl">{feat.emoji}</span>
                  <h3 className="text-lg font-bold tracking-tight">{feat.title}</h3>
                  <p className="text-sm font-medium opacity-60 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Question Types Showcase ── */}
        <section className="py-24 bg-[#4c2f05] text-[#ff9312] border-t-2 border-[#ff9312]/10">
          <div className="studio-container px-4">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                9 Question Types
              </h2>
              <p className="text-base font-semibold opacity-50 max-w-xl mx-auto">
                Every engagement format you need — all in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {QUESTION_TYPES.map((qt, i) => (
                <div key={i} className="bg-[#ff9312]/5 border border-[#ff9312]/15 rounded-2xl p-5 space-y-3 hover:bg-[#ff9312]/10 hover:border-[#ff9312]/30 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-[#ff9312] text-[#4c2f05] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <qt.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold leading-tight">{qt.label}</h3>
                    <p className="text-xs font-medium opacity-40 leading-snug">{qt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 text-center bg-[#ff9312] text-[#4c2f05] border-t-2 border-[#4c2f05]/20">
          <div className="studio-container space-y-12 px-4">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
              Ready to <br />
              Launch?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login" className="h-14 px-10 rounded-xl text-sm font-bold bg-[#4c2f05] text-[#ff9312] border-2 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all flex items-center justify-center uppercase tracking-wider">
                Start Dashboard
              </Link>
              <Link href="/join" className="h-14 px-10 rounded-xl text-sm font-bold border-2 border-[#4c2f05] text-[#4c2f05] hover:bg-[#4c2f05] hover:text-[#ff9312] transition-all flex items-center justify-center uppercase tracking-wider">
                Join Session
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
