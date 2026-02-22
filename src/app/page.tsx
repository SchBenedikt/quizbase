
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, Sparkles, ListOrdered, Hash, Monitor, Smartphone, Share2, CheckCircle2, Ruler, MessageSquare, Star, Palette, Settings2, Activity } from "lucide-react";
import { Header } from "@/components/layout/Header";

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
        <section className="studio-container min-h-[100dvh] flex items-center pt-24 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
              <header className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.85] tracking-tighter uppercase">
                  Pop. <br />
                  Pulse. <br />
                  <span className="opacity-30 italic">*</span>
                </h1>
              </header>
              <p className="text-sm md:text-base font-bold max-w-sm leading-tight uppercase tracking-tight">
                Transform any room into an interactive experience. No apps, no registration. Just pure energy.
              </p>
              
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4 pt-4 max-w-sm">
                <div className="flex-grow bg-[#4c2f05]/10 rounded-[1.5rem] px-8 h-14 flex items-center border-4 border-[#4c2f05] focus-within:bg-[#4c2f05]/20 transition-all relative overflow-hidden">
                  <Input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="JOIN CODE" 
                    maxLength={6}
                    className="border-none bg-transparent focus-visible:ring-0 text-2xl font-black p-0 placeholder:opacity-10 uppercase h-auto shadow-none text-[#4c2f05] w-full tracking-tighter placeholder:text-[#4c2f05] relative z-10"
                    aria-label="Enter 6-digit session code"
                  />
                </div>
                <button type="submit" disabled={joinCode.length < 6} className="h-14 px-8 rounded-[1.5rem] text-[10px] font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all group shrink-0 shadow-none uppercase flex items-center justify-center gap-2 tracking-widest">
                  JOIN NOW <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="relative group flex justify-center animate-in fade-in slide-in-from-right-10 duration-1000 lg:-ml-20 py-10 px-4">
              <div className="relative w-full max-w-[280px] aspect-[4/6] bg-white rounded-[2.5rem] border-4 border-[#4c2f05] p-6 shadow-[15px_15px_0px_0px_#4c2f05] transform rotate-3 transition-all group-hover:rotate-0 duration-700 flex flex-col">
                <div className="w-20 h-1.5 bg-[#4c2f05]/10 rounded-full mx-auto mb-10 shrink-0" />
                <div className="flex-1 space-y-8 overflow-hidden">
                  <div className="flex items-center justify-between opacity-40">
                    <Zap className="h-4 w-4" />
                    <span className="font-black text-[10px] tracking-widest uppercase">Live Session</span>
                  </div>
                  <h3 className="text-xl font-black uppercase leading-none tracking-tighter">What is our primary goal?</h3>
                  <div className="space-y-3">
                    <div className="h-12 bg-[#ff9312] rounded-[1.25rem] border-2 border-[#4c2f05] flex items-center px-6 transition-transform hover:scale-[1.02] cursor-pointer">
                      <span className="font-black text-xs uppercase">Innovation</span>
                    </div>
                    <div className="h-12 bg-[#4c2f05]/5 rounded-[1.25rem] border-2 border-dashed border-[#4c2f05]/20 flex items-center px-6">
                      <span className="font-black text-xs uppercase opacity-40">Growth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW DEMO */}
        <section className="py-24 bg-[#4c2f05] text-[#ff9312] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative px-6 flex justify-center lg:justify-start">
              <div className="bg-white rounded-[2rem] border-4 border-[#ff9312] p-8 shadow-[15px_15px_0px_0px_rgba(255,147,18,0.3)] rotate-[-2deg] z-10 relative max-w-[340px] w-full">
                <h4 className="text-lg font-black uppercase tracking-tighter text-[#4c2f05] mb-6">Live Pulse Results</h4>
                <div className="space-y-4">
                  <div className="h-8 bg-[#ff9312] rounded-[1rem] w-[85%] border-2 border-[#4c2f05] transition-all duration-1000" />
                  <div className="h-8 bg-[#ff9312]/30 rounded-[1rem] w-[45%] border-2 border-[#4c2f05]/20" />
                  <div className="h-8 bg-[#ff9312]/50 rounded-[1rem] w-[65%] border-2 border-[#4c2f05]/20" />
                </div>
              </div>
              <div className="absolute -bottom-8 -right-4 w-44 bg-white rounded-[2.5rem] border-4 border-[#4c2f05] p-6 shadow-[10px_10px_0px_0px_#ff9312] rotate-[5deg] z-20 hidden sm:block">
                <div className="w-16 h-1 bg-[#4c2f05]/10 rounded-full mx-auto mb-8" />
                <div className="h-10 bg-[#4c2f05] rounded-[1rem] flex items-center justify-center animate-pulse">
                  <span className="text-white font-black text-[10px] uppercase">Option A</span>
                </div>
              </div>
            </div>

            <div className="space-y-8 px-4">
              <h2 className="text-3xl md:text-4xl font-black leading-[0.9] uppercase tracking-tighter">
                From Screen <br />
                To Hand. <br />
                <span className="opacity-30">Instantly.</span>
              </h2>
              <div className="grid gap-6">
                {[
                  { icon: Monitor, title: "Step 1: Create", desc: "Build your interaction in our minimalist editor." },
                  { icon: Share2, title: "Step 2: Share", desc: "Display the 6-digit code on the big screen." },
                  { icon: Smartphone, title: "Step 3: Pulse", desc: "Audience joins instantly on any mobile device." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="w-10 h-10 rounded-[1rem] bg-[#ff9312] text-[#4c2f05] flex items-center justify-center shrink-0 border-2 border-[#ff9312]">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black uppercase tracking-tighter leading-none">{step.title}</h4>
                      <p className="font-bold opacity-60 uppercase text-[10px] tracking-widest">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GRAND STAGE DISPLAY */}
        <section className="py-24 bg-[#f3f3f1] text-[#4c2f05] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8 px-4">
                <h2 className="text-3xl md:text-4xl font-black leading-[0.9] uppercase tracking-tighter">
                  Command the <br />
                  Grand Stage.
                </h2>
                <p className="text-base font-bold opacity-70 uppercase leading-tight max-w-sm">
                   Absolute clarity for thousands. visuals designed for the biggest screens in the boardroom.
                </p>
             </div>

             <div className="relative group px-4">
                <div className="bg-[#4c2f05] rounded-[2rem] border-4 border-[#4c2f05] p-8 shadow-[20px_20px_0px_0px_rgba(76,47,5,0.1)] rotate-3 group-hover:rotate-0 transition-transform duration-700">
                   <div className="flex items-center justify-between mb-8 border-b-2 border-white/10 pb-6">
                      <Zap className="h-6 w-6 text-[#ff9312] fill-current" />
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Studio</span>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">How likely are you to recommend?</h4>
                      <div className="h-24 flex items-end gap-3 pt-8 px-4 bg-white/5 rounded-[1.5rem] border-2 border-dashed border-white/10">
                         <div className="bg-[#ff9312] w-full h-[85%] rounded-t-[1rem]" />
                         <div className="bg-[#ff9312]/30 w-full h-[45%] rounded-t-[1rem]" />
                         <div className="bg-[#ff9312]/60 w-full h-[65%] rounded-t-[1rem]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* QUIZ FEEDBACK */}
        <section className="py-24 bg-[#f3f3f1] text-[#4c2f05] overflow-x-clip border-t-4 border-[#4c2f05]/5">
          <div className="studio-container grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 px-4">
              <h2 className="text-3xl md:text-4xl font-black leading-[0.9] uppercase tracking-tighter">
                High Stakes. <br />
                Live Quiz.
              </h2>
              <p className="text-base font-bold uppercase opacity-70 leading-tight max-w-sm">
                Turn learning into a competitive pulse. Instant feedback and high-octane results.
              </p>
            </div>

            <div className="relative group flex items-center justify-center min-h-[400px] px-4">
              <div className="relative w-full max-w-[280px] bg-white rounded-[2rem] border-4 border-[#4c2f05] p-8 shadow-[15px_15px_0px_0px_#ff9312] rotate-3 transition-transform duration-700 space-y-6">
                 <h4 className="text-lg font-black uppercase tracking-tight text-center">Correct Answer?</h4>
                 <div className="space-y-3">
                   <div className="h-12 bg-green-500 rounded-[1rem] border-2 border-[#4c2f05] flex items-center px-5 gap-3">
                     <CheckCircle2 className="h-4 w-4 text-white" />
                     <span className="font-black text-[10px] uppercase text-white">Innovation</span>
                   </div>
                   <div className="h-12 bg-[#4c2f05]/5 rounded-[1rem] border-2 border-[#4c2f05]/20 flex items-center px-5">
                     <span className="font-black text-[10px] uppercase opacity-40">Growth</span>
                   </div>
                 </div>
              </div>
              <div className="absolute top-4 right-4 w-40 rounded-[2rem] bg-green-500 border-4 border-[#4c2f05] p-6 shadow-[10px_10px_0px_0px_#4c2f05] -rotate-6 group-hover:rotate-0 transition-transform duration-700 z-10 flex flex-col items-center justify-center text-center space-y-2 hidden sm:flex">
                <CheckCircle2 className="h-8 w-8 text-white animate-bounce" />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">CORRECT!</h3>
                <p className="text-white/80 font-black uppercase text-[8px] tracking-widest">+100 PTS</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRECISION DATA */}
        <section className="py-24 bg-[#4c2f05] text-[#ff9312] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8 px-4 order-last lg:order-first">
                <div className="relative group">
                   <div className="bg-white rounded-[2rem] border-4 border-[#ff9312] p-10 shadow-[20px_20px_0px_0px_rgba(255,147,18,0.2)] -rotate-3 group-hover:rotate-0 transition-all duration-700">
                      <div className="space-y-12">
                         <div className="text-center">
                            <span className="text-8xl font-black tracking-tighter text-[#4c2f05] leading-none">84.2</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#4c2f05]/30 mt-4">Precision Average</p>
                         </div>
                         <div className="h-4 bg-[#4c2f05]/10 rounded-full border-2 border-[#4c2f05] relative overflow-hidden">
                            <div className="absolute left-0 h-full bg-[#ff9312] w-[84%] animate-in slide-in-from-left-full duration-1000" />
                         </div>
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40 text-[#4c2f05]">
                            <span>Intensity</span>
                            <span>Scale 0-100</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-8 px-4">
                <h2 className="text-3xl md:text-4xl font-black leading-[0.9] uppercase tracking-tighter">
                  Precision <br />
                  Data Points.
                </h2>
                <p className="text-base font-bold opacity-70 uppercase leading-tight max-sm">
                   Capture nuanced sentiment with sliders and numeric guessing. High-fidelity feedback for complex decisions.
                </p>
             </div>
          </div>
        </section>

        {/* STUDIO ARCHITECT */}
        <section className="py-24 bg-[#f3f3f1] text-[#4c2f05] overflow-x-clip">
          <div className="studio-container grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8 px-4">
                <h2 className="text-3xl md:text-4xl font-black leading-[0.9] uppercase tracking-tighter">
                  Studio <br />
                  Architect. <br />
                  <span className="opacity-30">Zero Friction.</span>
                </h2>
                <p className="text-base font-bold opacity-70 uppercase leading-tight max-w-sm">
                   A surgical interface for survey creation. Build complex interactions in minutes with a minimalist command palette.
                </p>
             </div>

             <div className="relative group px-4">
                {/* Editor Surface - Clean Studio Layout */}
                <div className="bg-white rounded-[2.5rem] border-4 border-[#4c2f05] p-10 shadow-[30px_30px_0px_0px_rgba(76,47,5,0.05)] rotate-2 group-hover:rotate-0 transition-transform duration-700">
                   <div className="space-y-8">
                      <div className="space-y-3">
                         <div className="h-3 bg-[#4c2f05]/5 rounded-full w-24" />
                         <div className="h-16 bg-[#4c2f05]/5 rounded-[1.25rem] border-2 border-dashed border-[#4c2f05]/10 flex items-center px-6">
                            <span className="text-lg font-black uppercase tracking-tighter opacity-20">WHAT IS OUR CORE VALUE?</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-12 bg-[#4c2f05]/5 rounded-[1rem] border-2 border-[#4c2f05]/10" />
                         <div className="h-12 bg-[#ff9312] rounded-[1rem] border-2 border-[#4c2f05]" />
                      </div>
                   </div>
                </div>

                {/* Floating Tool Palette */}
                <div className="absolute -top-12 -right-4 bg-[#4c2f05] p-6 rounded-[2rem] border-4 border-[#ff9312] shadow-[15px_15px_0px_0px_#4c2f05] -rotate-6 group-hover:rotate-0 transition-all duration-700 z-20">
                   <div className="grid grid-cols-2 gap-3">
                      {[Cloud, ListChecks, SlidersHorizontal, MessageSquare, Star, Ruler].map((Icon, i) => (
                         <div key={i} className="w-10 h-10 bg-white/10 rounded-[0.75rem] flex items-center justify-center border-2 border-white/5 hover:bg-[#ff9312] hover:text-[#4c2f05] transition-colors cursor-pointer">
                            <Icon className="h-5 w-5 text-white" />
                         </div>
                      ))}
                   </div>
                   <div className="mt-6 pt-4 border-t-2 border-white/5 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-[#ff9312] animate-pulse" />
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 bg-[#4c2f05] text-[#ff9312]">
          <div className="studio-container space-y-20">
            <div className="text-center space-y-4 px-4">
              <h2 className="text-4xl md:text-5xl font-black leading-[0.85] uppercase tracking-tighter">
                Tools For <br />
                Impact.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
              {[
                { icon: Cloud, title: "Word Clouds", desc: "Visualize the collective thought in real-time." },
                { icon: ListOrdered, title: "Ranking", desc: "Prioritize ideas with live audience rankings." },
                { icon: SlidersHorizontal, title: "Precision Sliders", desc: "Capture nuanced sentiment with detailed data." },
                { icon: Sparkles, title: "AI Assistant", desc: "Perfect your questions for clarity and neutrality." }
              ].map((tool, i) => (
                <article key={i} className="bg-[#4c2f05] text-[#ff9312] p-8 rounded-[2rem] border-4 border-[#ff9312]/20 space-y-4 transition-all hover:border-[#ff9312] hover:-translate-y-2 duration-300">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-[#ff9312] text-[#4c2f05] flex items-center justify-center border-2 border-[#4c2f05]">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{tool.title}</h3>
                  <p className="text-[10px] font-bold opacity-60 uppercase leading-tight">{tool.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 text-center bg-[#ff9312] text-[#4c2f05] border-t-4 border-[#4c2f05]">
          <div className="studio-container space-y-12 px-4">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.8]">
              Ready to <br />
              Launch?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login" className="h-16 px-10 rounded-[1.5rem] text-[10px] font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all flex items-center justify-center uppercase tracking-widest">
                START DASHBOARD
              </Link>
              <Link href="/join" className="h-16 px-10 rounded-[1.5rem] text-[10px] font-black border-4 border-[#4c2f05] text-[#4c2f05] hover:bg-[#4c2f05] hover:text-[#ff9312] transition-all flex items-center justify-center uppercase tracking-widest">
                JOIN SESSION
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f3f3f1] dark:bg-zinc-950 border-t-4 border-[#4c2f05]/10">
        <div className="py-12 studio-container flex flex-col md:flex-row items-center justify-between gap-8 font-black px-4">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-xl tracking-tighter uppercase leading-none text-[#4c2f05] dark:text-[#ff9312]">PopPulse*</span>
            <p className="text-[10px] opacity-40 uppercase tracking-widest text-[#4c2f05] dark:text-white">&copy; {new Date().getFullYear()} Studio interaction</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase tracking-widest opacity-40 text-[#4c2f05] dark:text-white">
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
