
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, Sparkles, ListOrdered, Hash, Monitor, Smartphone, Share2, MessageSquare, Star, Ruler, Activity, Users, Timer } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length >= 6) {
      router.push(`/p/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ff9312] text-[#4c2f05] overflow-x-clip">
      <Header variant="brand" className="text-[#4c2f05]" />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="studio-container min-h-[100dvh] flex items-center pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center w-full">
            <div className="space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
              <header className="space-y-6">
                <h1 className="text-8xl md:text-9xl lg:text-[11rem] font-black leading-[0.75] tracking-tighter uppercase">
                  Pop. <br />
                  Pulse. <br />
                  <span className="opacity-30 italic">*</span>
                </h1>
              </header>
              <p className="text-2xl md:text-3xl font-bold max-w-sm leading-tight uppercase tracking-tight">
                Transform any room into a living interaction studio. Zero barriers. Absolute energy.
              </p>
              
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-6 pt-6 max-w-sm">
                <div className="flex-grow bg-[#4c2f05]/10 rounded-[1.5rem] px-8 h-20 flex items-center border-4 border-[#4c2f05] focus-within:bg-[#4c2f05]/20 transition-all relative overflow-hidden">
                  <Input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="JOIN CODE" 
                    maxLength={6}
                    className="border-none bg-transparent focus-visible:ring-0 text-4xl font-black p-0 placeholder:opacity-10 uppercase h-auto shadow-none text-[#4c2f05] w-full tracking-tighter placeholder:text-[#4c2f05] relative z-10"
                    aria-label="Enter 6-digit session code"
                  />
                </div>
                <button type="submit" disabled={joinCode.length < 6} className="h-20 px-10 rounded-[1.5rem] text-[12px] font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all group shrink-0 shadow-none uppercase flex items-center justify-center gap-3 tracking-[0.2em]">
                  JOIN NOW <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* EXPANDED HERO MOCKUP: THE BROADCAST STUDIO */}
            <div className="relative group flex justify-center animate-in fade-in slide-in-from-right-10 duration-1000 py-20 px-4">
              {/* Desktop Display Mockup - The Broadcaster */}
              <div className="relative w-full max-w-[650px] aspect-video bg-white rounded-[2.5rem] border-4 border-[#4c2f05] p-10 shadow-[35px_35px_0px_0px_#4c2f05] transform -rotate-3 transition-all group-hover:rotate-0 duration-700 hidden md:flex flex-col z-0">
                <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-[#4c2f05]/10">
                   <div className="flex items-center gap-4">
                     <Zap className="h-8 w-8 fill-current" />
                     <span className="font-black text-[12px] uppercase tracking-[0.3em]">Studio Broadcast</span>
                   </div>
                   <div className="flex items-center gap-6">
                     <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
                     </div>
                     <span className="text-[12px] font-black uppercase tracking-widest opacity-40">Code: X8Y9Z2</span>
                   </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                   <h3 className="text-3xl font-black uppercase tracking-tight leading-none max-w-md">What is our primary goal?</h3>
                   <div className="w-full h-48 flex items-end gap-5 px-10 bg-[#4c2f05]/5 rounded-[1.5rem] border-2 border-dashed border-[#4c2f05]/10 py-6">
                     <div className="bg-[#ff9312] w-full h-[85%] rounded-t-[1rem] border-2 border-[#4c2f05]" />
                     <div className="bg-[#ff9312]/30 w-full h-[45%] rounded-t-[1rem] border-2 border-[#4c2f05]/10" />
                     <div className="bg-[#ff9312]/60 w-full h-[65%] rounded-t-[1rem] border-2 border-[#4c2f05]/20" />
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t-2 border-[#4c2f05]/10 flex justify-between items-center opacity-40">
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">256 Present</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Timer className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">15s Remaining</span>
                    </div>
                </div>
              </div>

              {/* Mobile Phone Mockup Overlay - The Participant */}
              <div className="relative md:absolute md:-bottom-16 md:-right-8 w-full max-w-[320px] aspect-[4/7] bg-white rounded-[3rem] border-4 border-[#4c2f05] p-10 shadow-[20px_20px_0px_0px_#4c2f05] transform rotate-6 transition-all group-hover:rotate-3 duration-700 flex flex-col z-20">
                <div className="w-24 h-2 bg-[#4c2f05]/10 rounded-full mx-auto mb-12 shrink-0" />
                <div className="flex-1 space-y-10 overflow-hidden">
                  <div className="flex items-center justify-between opacity-40">
                    <Zap className="h-5 w-5" />
                    <span className="font-black text-[12px] tracking-[0.3em] uppercase">Mobile Sync</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight tracking-tighter">Your choice?</h3>
                  <div className="space-y-4">
                    <div className="h-16 bg-[#ff9312] rounded-[1.25rem] border-2 border-[#4c2f05] flex items-center px-6 transition-transform hover:scale-[1.02] cursor-pointer">
                      <span className="font-black text-[12px] uppercase">Innovation</span>
                    </div>
                    <div className="h-16 bg-[#4c2f05]/5 rounded-[1.25rem] border-2 border-dashed border-[#4c2f05]/20 flex items-center px-6">
                      <span className="font-black text-[12px] uppercase opacity-40">Growth</span>
                    </div>
                    <div className="h-16 bg-[#4c2f05]/5 rounded-[1.25rem] border-2 border-dashed border-[#4c2f05]/20 flex items-center px-6">
                      <span className="font-black text-[12px] uppercase opacity-40">Stability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW DEMO - FROM SCREEN TO HAND */}
        <section className="py-40 bg-[#4c2f05] text-[#ff9312] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative px-6 flex justify-center lg:justify-start">
              <div className="bg-white rounded-[2.5rem] border-4 border-[#ff9312] p-12 shadow-[25px_25px_0px_0px_rgba(255,147,18,0.2)] rotate-[-3deg] z-10 relative max-w-[420px] w-full">
                <h4 className="text-3xl font-black uppercase tracking-tighter text-[#4c2f05] mb-10">Live Pulse Status</h4>
                <div className="space-y-8">
                  <div className="h-14 bg-[#ff9312] rounded-[1.25rem] w-[85%] border-2 border-[#4c2f05] transition-all duration-1000" />
                  <div className="h-14 bg-[#ff9312]/30 rounded-[1.25rem] w-[45%] border-2 border-[#4c2f05]/20" />
                  <div className="h-14 bg-[#ff9312]/60 rounded-[1.25rem] w-[65%] border-2 border-[#4c2f05]/20" />
                </div>
                <div className="mt-12 flex justify-between items-center">
                   <div className="h-10 w-10 rounded-full bg-green-500 animate-pulse border-2 border-[#4c2f05]" />
                   <span className="text-[12px] font-black uppercase tracking-widest text-[#4c2f05] opacity-40">Sync Active</span>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-6 w-56 bg-white rounded-[3rem] border-4 border-[#4c2f05] p-10 shadow-[20px_20px_0px_0px_#ff9312] rotate-[5deg] z-20 hidden sm:block">
                <div className="w-24 h-1.5 bg-[#4c2f05]/10 rounded-full mx-auto mb-10" />
                <div className="h-14 bg-[#4c2f05] rounded-[1.25rem] flex items-center justify-center animate-bounce duration-1000">
                  <span className="text-white font-black text-sm uppercase">Option A</span>
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
                      <p className="font-bold opacity-60 uppercase text-[14px] tracking-widest leading-snug">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GRAND STAGE DISPLAY - BROADCAST UI */}
        <section className="py-40 bg-[#f3f3f1] text-[#4c2f05] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-12 px-4">
                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] uppercase tracking-tighter">
                  Command the <br />
                  Grand Stage.
                </h2>
                <p className="text-2xl font-bold opacity-70 uppercase leading-tight max-w-sm">
                   Absolute visual clarity for thousands. Designed for the high-resolution boardrooms and grand stages.
                </p>
             </div>

             <div className="relative group px-4">
                <div className="bg-[#4c2f05] rounded-[3rem] border-4 border-[#4c2f05] p-16 shadow-[40px_40px_0px_0px_rgba(76,47,5,0.1)] rotate-3 group-hover:rotate-0 transition-transform duration-700">
                   <div className="flex items-center justify-between mb-16 border-b-2 border-white/10 pb-12">
                      <Zap className="h-12 w-12 text-[#ff9312] fill-current" />
                      <div className="flex items-center gap-8">
                         <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[14px] font-black text-white uppercase tracking-[0.4em]">Live Studio</span>
                         </div>
                         <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full">
                            <Users className="h-5 w-5 text-[#ff9312]" />
                            <span className="text-xl font-black text-white">4.2K</span>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-12">
                      <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">How likely are you to recommend?</h4>
                      <div className="h-56 flex items-end gap-8 pt-12 px-10 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                         <div className="bg-[#ff9312] w-full h-[90%] rounded-t-[1.5rem]" />
                         <div className="bg-[#ff9312]/30 w-full h-[40%] rounded-t-[1.5rem]" />
                         <div className="bg-[#ff9312]/60 w-full h-[70%] rounded-t-[1.5rem]" />
                         <div className="bg-[#ff9312]/40 w-full h-[55%] rounded-t-[1.5rem]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* STUDIO ARCHITECT - ZERO FRICTION EDITOR */}
        <section className="py-40 bg-[#f3f3f1] text-[#4c2f05] overflow-x-clip border-t-2 border-foreground/5">
          <div className="studio-container grid lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-12 px-4">
                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] uppercase tracking-tighter">
                  Studio <br />
                  Architect. <br />
                  <span className="opacity-30">Zero Friction.</span>
                </h2>
                <p className="text-2xl font-bold opacity-70 uppercase leading-tight max-w-sm">
                   A surgical, frameless interface for high-stakes survey creation. Build complex interactions in minutes.
                </p>
             </div>

             <div className="relative group px-4">
                {/* Editor Surface - Frameless Layered System */}
                <div className="bg-white rounded-[3rem] border-4 border-[#4c2f05] p-16 shadow-[45px_45px_0px_0px_rgba(76,47,5,0.05)] rotate-2 group-hover:rotate-0 transition-transform duration-700 relative overflow-hidden">
                   <div className="space-y-16">
                      <div className="space-y-8">
                         <div className="flex items-center gap-4">
                            <Activity className="h-6 w-6 text-primary" />
                            <div className="h-6 bg-[#4c2f05]/10 rounded-full w-48" />
                         </div>
                         <div className="h-32 bg-[#4c2f05]/5 rounded-[1.5rem] border-2 border-dashed border-[#4c2f05]/10 flex items-center px-12">
                            <span className="text-4xl font-black uppercase tracking-tighter opacity-20">CORE VALUE?</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-10">
                         <div className="h-20 bg-[#4c2f05]/5 rounded-[1.5rem] border-2 border-[#4c2f05]/10" />
                         <div className="h-20 bg-[#ff9312] rounded-[1.5rem] border-2 border-[#4c2f05]" />
                      </div>
                   </div>
                </div>

                {/* Floating Command Palette */}
                <div className="absolute -top-20 -right-8 bg-[#4c2f05] p-12 rounded-[2.5rem] border-4 border-[#ff9312] shadow-[25px_25px_0px_0px_#4c2f05] -rotate-6 group-hover:rotate-0 transition-all duration-700 z-20">
                   <div className="grid grid-cols-2 gap-6">
                      {[Cloud, ListChecks, SlidersHorizontal, MessageSquare, Star, Ruler, ListOrdered, Hash].map((Icon, i) => (
                         <div key={i} className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border-2 border-white/5 hover:bg-[#ff9312] hover:text-[#4c2f05] transition-colors cursor-pointer group/tool">
                            <Icon className="h-8 w-8 text-white group-hover/tool:scale-110 transition-transform" />
                         </div>
                      ))}
                   </div>
                   <div className="mt-12 pt-10 border-t-2 border-white/5 flex flex-col items-center gap-4">
                      <Zap className="h-10 w-10 text-[#ff9312] animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-white tracking-[0.5em] opacity-40">Command Ready</span>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* AUDIENCE PULSE - WORD CLOUDS & SENTIMENT */}
        <section className="py-40 bg-[#4c2f05] text-[#ff9312] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-12 px-4 order-2 lg:order-1">
                <div className="relative h-[500px] w-full bg-white/5 rounded-[3rem] border-4 border-dashed border-[#ff9312]/20 p-12 flex flex-wrap items-center justify-center gap-12 overflow-hidden group">
                   {[
                     { text: "INNOVATION", size: "text-7xl", rotate: "-rotate-6", opacity: "opacity-100" },
                     { text: "FAST", size: "text-4xl", rotate: "rotate-3", opacity: "opacity-60" },
                     { text: "ENERGY", size: "text-6xl", rotate: "-rotate-2", opacity: "opacity-90" },
                     { text: "SCALE", size: "text-5xl", rotate: "rotate-6", opacity: "opacity-70" },
                     { text: "SYMBOLS", size: "text-3xl", rotate: "-rotate-12", opacity: "opacity-40" },
                     { text: "DYNAMIC", size: "text-5xl", rotate: "rotate-1", opacity: "opacity-80" }
                   ].map((word, i) => (
                     <span key={i} className={cn("font-black uppercase tracking-tighter transition-all group-hover:scale-110 duration-700 cursor-default", word.size, word.rotate, word.opacity)}>
                       {word.text}
                     </span>
                   ))}
                </div>
             </div>
             <div className="space-y-12 px-4 order-1 lg:order-2">
                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] uppercase tracking-tighter">
                  Audience <br />
                  Sentiment. <br />
                  <span className="opacity-30">In Motion.</span>
                </h2>
                <p className="text-2xl font-bold opacity-70 uppercase leading-tight max-w-sm">
                   Visualize the collective thought of thousands in high-fidelity word clouds and sentiment streams.
                </p>
             </div>
          </div>
        </section>

        {/* PRIORITY RANKING - LIVE COLLECTIVE FEEDBACK */}
        <section className="py-40 bg-[#f3f3f1] text-[#4c2f05] overflow-x-clip border-t-2 border-foreground/5">
           <div className="studio-container grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12 px-4">
                 <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] uppercase tracking-tighter">
                   Prioritize <br />
                   Ideas. <br />
                   <span className="opacity-30">Live.</span>
                 </h2>
                 <p className="text-2xl font-bold opacity-70 uppercase leading-tight max-w-sm">
                    Let the audience reshape the data. Real-time ranking and voting for high-stakes decision making.
                 </p>
              </div>
              <div className="relative group px-4">
                 <div className="bg-white rounded-[3rem] border-4 border-[#4c2f05] p-16 shadow-[40px_40px_0px_0px_rgba(76,47,5,0.05)] rotate-[-2deg] group-hover:rotate-0 transition-transform duration-700">
                    <div className="space-y-8">
                       {[
                         { title: "INNOVATIVE GROWTH", score: 85, color: "bg-[#ff9312]" },
                         { title: "STABILITY FIRST", score: 45, color: "bg-[#4c2f05]/20" },
                         { title: "USER EXPERIENCE", score: 65, color: "bg-[#ff9312]/60" }
                       ].map((item, i) => (
                         <div key={i} className="space-y-4">
                            <div className="flex justify-between items-center">
                               <span className="text-xl font-black uppercase tracking-tighter">{item.title}</span>
                               <span className="text-[14px] font-black opacity-40 uppercase tracking-widest">{item.score}% SYNC</span>
                            </div>
                            <div className="h-14 bg-[#4c2f05]/5 rounded-[1.25rem] border-2 border-[#4c2f05]/10 overflow-hidden relative">
                               <div 
                                 className={cn("absolute left-0 h-full transition-all duration-1000", item.color)} 
                                 style={{ width: `${item.score}%` }}
                               />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-60 text-center bg-[#ff9312] text-[#4c2f05] border-t-8 border-[#4c2f05]">
          <div className="studio-container space-y-24 px-4">
            <h2 className="text-8xl md:text-9xl lg:text-[12rem] font-black uppercase tracking-tighter leading-[0.75]">
              Ready to <br />
              Launch?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-10">
              <Link href="/login" className="h-28 px-20 rounded-[2rem] text-[16px] font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all flex items-center justify-center uppercase tracking-[0.3em]">
                START DASHBOARD
              </Link>
              <Link href="/join" className="h-28 px-20 rounded-[2rem] text-[16px] font-black border-4 border-[#4c2f05] text-[#4c2f05] hover:bg-[#4c2f05] hover:text-[#ff9312] transition-all flex items-center justify-center uppercase tracking-[0.3em]">
                JOIN SESSION
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f3f3f1] dark:bg-zinc-950 border-t-4 border-[#4c2f05]/10">
        <div className="py-24 studio-container flex flex-col md:flex-row items-center justify-between gap-20 font-black px-4">
          <div className="flex flex-col gap-6 text-center md:text-left">
            <span className="text-5xl tracking-tighter uppercase leading-none text-[#4c2f05] dark:text-[#ff9312]">PopPulse*</span>
            <p className="text-[14px] opacity-40 uppercase tracking-[0.4em] text-[#4c2f05] dark:text-white">&copy; {new Date().getFullYear()} Studio interaction</p>
          </div>
          <div className="flex flex-wrap justify-center gap-16 text-[14px] uppercase tracking-[0.4em] opacity-40 text-[#4c2f05] dark:text-white">
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

