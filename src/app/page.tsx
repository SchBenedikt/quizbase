"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, MessageSquare, Star, Ruler, Activity, Users, Timer, Monitor, Share2, Smartphone, ListOrdered, Hash } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

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
        <section className="studio-container min-h-[100dvh] flex items-center pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center w-full">
            <div className="space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
              <header className="space-y-6">
                <h1 className="text-8xl md:text-9xl lg:text-[11rem] font-black leading-[0.75] tracking-tighter uppercase">
                  Quiz. <br />
                  Base. <br />
                  <span className="opacity-30 italic">*</span>
                </h1>
              </header>
              <p className="text-2xl md:text-3xl font-bold max-w-sm leading-tight tracking-tight">
                Transform any room into a living interaction studio. Zero barriers. Absolute energy.
              </p>
              
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-6 pt-6 max-w-sm">
                <div className="flex-grow bg-[#4c2f05]/10 rounded-[1.5rem] px-8 h-20 flex items-center border-4 border-[#4c2f05] focus-within:bg-[#4c2f05]/20 transition-all relative overflow-hidden">
                  <Input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Join code" 
                    maxLength={6}
                    className="border-none bg-transparent focus-visible:ring-0 text-4xl font-black p-0 placeholder:opacity-10 uppercase h-auto shadow-none text-[#4c2f05] w-full tracking-tighter placeholder:text-[#4c2f05] relative z-10"
                    aria-label="Enter 6-digit session code"
                  />
                </div>
                <button type="submit" disabled={joinCode.length < 6} className="h-20 px-10 rounded-[1.5rem] text-sm font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all group shrink-0 shadow-none uppercase flex items-center justify-center gap-3 tracking-widest">
                  Join Now <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="relative group flex justify-center animate-in fade-in slide-in-from-right-10 duration-1000 py-20 px-4">
              <div className="relative w-full max-w-[650px] aspect-video bg-white rounded-[2.5rem] border-4 border-[#4c2f05] p-10 transform -rotate-3 transition-all group-hover:rotate-0 duration-700 hidden md:flex flex-col z-0 shadow-none">
                <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-[#4c2f05]/10">
                   <div className="flex items-center gap-4">
                     <Zap className="h-8 w-8 fill-current" />
                     <span className="font-black text-xs uppercase tracking-widest">Studio Broadcast</span>
                   </div>
                   <div className="flex items-center gap-6">
                     <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest opacity-40">Code: X8Y9Z2</span>
                   </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                   <h3 className="text-3xl font-black uppercase tracking-tight leading-none max-w-md">What is our primary goal?</h3>
                   <div className="w-full h-48 flex items-end gap-5 px-10 bg-[#4c2f05]/5 rounded-[1.5rem] border-2 border-dashed border-[#4c2f05]/10 py-6">
                     <div className="bg-[#ff9312] w-full rounded-t-[1rem] border-2 border-[#4c2f05] transition-all duration-500" style={{ height: heroSelected === 0 ? '95%' : '85%' }} />
                     <div className="bg-[#ff9312]/30 w-full rounded-t-[1rem] border-2 border-[#4c2f05]/10 transition-all duration-500" style={{ height: heroSelected === 1 ? '55%' : '45%' }} />
                     <div className="bg-[#ff9312]/60 w-full rounded-t-[1rem] border-2 border-[#4c2f05]/20 transition-all duration-500" style={{ height: heroSelected === 2 ? '75%' : '65%' }} />
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t-2 border-[#4c2f05]/10 flex justify-between items-center opacity-40">
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">256 Present</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Timer className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">15s Remaining</span>
                    </div>
                </div>
              </div>

              <div className="relative md:absolute md:-bottom-16 md:-right-8 w-full max-w-[320px] aspect-[4/7] bg-white rounded-[3rem] border-4 border-[#4c2f05] p-10 transform rotate-6 transition-all group-hover:rotate-3 duration-700 flex flex-col z-20 shadow-none">
                <div className="w-24 h-2 bg-[#4c2f05]/10 rounded-full mx-auto mb-12 shrink-0" />
                <div className="flex-1 space-y-10 overflow-hidden">
                  <div className="flex items-center justify-between opacity-40">
                    <Zap className="h-5 w-5" />
                    <span className="font-black text-xs tracking-widest uppercase">Mobile Sync</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight tracking-tighter">Your choice?</h3>
                  <div className="space-y-4">
                    {['Innovation', 'Growth', 'Stability'].map((opt, i) => (
                      <div 
                        key={opt}
                        onClick={() => setHeroSelected(i)}
                        className={cn(
                          "h-16 rounded-[1.25rem] border-2 flex items-center px-6 transition-all cursor-pointer active:scale-95",
                          heroSelected === i 
                            ? "bg-[#ff9312] border-[#4c2f05] translate-x-1" 
                            : "bg-[#4c2f05]/5 border-dashed border-[#4c2f05]/20 hover:bg-[#4c2f05]/10"
                        )}
                      >
                        <span className={cn("font-bold text-sm", heroSelected === i ? "opacity-100" : "opacity-40")}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-40 bg-[#4c2f05] text-[#ff9312] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative px-6 flex justify-center lg:justify-start">
              <div className="bg-white rounded-[2.5rem] border-4 border-[#ff9312] p-12 rotate-[-3deg] z-10 relative max-w-[420px] w-full shadow-none">
                <h4 className="text-3xl font-black uppercase tracking-tighter text-[#4c2f05] mb-10">Live Pulse Status</h4>
                <div className="space-y-8">
                  <div className="h-14 bg-[#ff9312] rounded-[1.25rem] w-[85%] border-2 border-[#4c2f05] transition-all duration-1000" />
                  <div className="h-14 bg-[#ff9312]/30 rounded-[1.25rem] w-[45%] border-2 border-[#4c2f05]/20" />
                  <div className="h-14 bg-[#ff9312]/60 rounded-[1.25rem] w-[65%] border-2 border-[#4c2f05]/20" />
                </div>
                <div className="mt-12 flex justify-between items-center">
                   <div className="h-10 w-10 rounded-full bg-green-500 animate-pulse border-2 border-[#4c2f05]" />
                   <span className="text-xs font-black uppercase tracking-widest text-[#4c2f05] opacity-40">Sync Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-16 px-4">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] uppercase tracking-tighter">
                From Screen <br />
                To Hand. <br />
                <span className="opacity-30">Instantly.</span>
              </h2>
              <div className="grid gap-12">
                {[
                  { icon: Monitor, title: "Step 1: Create", desc: "Build your interaction in the surgical studio editor." },
                  { icon: Share2, title: "Step 2: Share", desc: "Broadcast the unique code to your audience screen." },
                  { icon: Smartphone, title: "Step 3: Pulse", desc: "Audience joins and votes on any mobile device." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-8 items-start">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#ff9312] text-[#4c2f05] flex items-center justify-center shrink-0 border-2 border-[#ff9312]">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{step.title}</h4>
                      <p className="font-bold opacity-60 text-lg leading-snug">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-60 text-center bg-[#ff9312] text-[#4c2f05] border-t-8 border-[#4c2f05]">
          <div className="studio-container space-y-24 px-4">
            <h2 className="text-8xl md:text-9xl lg:text-[12rem] font-black uppercase tracking-tighter leading-[0.75]">
              Ready to <br />
              Launch?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-10">
              <Link href="/login" className="h-28 px-20 rounded-[2rem] text-lg font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all flex items-center justify-center uppercase tracking-widest">
                Start Dashboard
              </Link>
              <Link href="/join" className="h-28 px-20 rounded-[2rem] text-lg font-black border-4 border-[#4c2f05] text-[#4c2f05] hover:bg-[#4c2f05] hover:text-[#ff9312] transition-all flex items-center justify-center uppercase tracking-widest">
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
