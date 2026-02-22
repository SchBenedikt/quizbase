"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, Sparkles, ListOrdered, Hash, BrainCircuit, Palette, Monitor, Smartphone, Share2, Activity, Users, Star, CheckCircle2, Trophy, Ruler, Layout, MousePointer2, Plus } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-[#ff9312] text-[#4c2f05]">
      <Header variant="brand" className="text-[#4c2f05]" />

      <main className="flex-grow">
        {/* HERO SECTION - Full Screen Dynamic */}
        <section className="studio-container min-h-[100dvh] flex items-center pt-24 pb-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center w-full">
            <div className="space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
              <header className="space-y-4">
                <h1 className="text-6xl md:text-8xl lg:text-[9.5rem] font-black leading-[0.75] tracking-tighter uppercase">
                  Pure. <br />
                  Pulse. <br />
                  <span className="opacity-30 italic">Energy.</span>
                </h1>
              </header>
              <p className="text-xl md:text-2xl font-bold max-w-xl leading-tight uppercase tracking-tight">
                Transform any room into an interactive experience. No apps, no registration. Just pure energy.
              </p>
              
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4 pt-6 max-w-sm">
                <div className="flex-grow bg-[#4c2f05]/10 rounded-[1.5rem] px-8 h-20 flex items-center border-4 border-[#4c2f05] focus-within:bg-[#4c2f05]/20 transition-all relative overflow-hidden">
                  <Input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="JOIN CODE" 
                    maxLength={6}
                    className="border-none bg-transparent focus-visible:ring-0 text-5xl font-black p-0 placeholder:opacity-10 uppercase h-auto shadow-none text-[#4c2f05] w-full tracking-tighter placeholder:text-[#4c2f05] relative z-10"
                    aria-label="Enter 6-digit session code"
                  />
                </div>
                <Button type="submit" disabled={joinCode.length < 6} className="h-20 px-10 rounded-[1.5rem] text-lg font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all group shrink-0 shadow-none">
                  JOIN NOW <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </form>
            </div>

            {/* PORTRAIT HERO MOCKUP - Shifted Inward */}
            <div className="relative group hidden lg:flex justify-center animate-in fade-in slide-in-from-right-10 duration-1000 lg:-ml-32">
              <div className="relative w-[400px] h-[600px] bg-white rounded-[2.5rem] border-4 border-[#4c2f05] p-8 shadow-[30px_30px_0px_0px_#4c2f05] transform rotate-3 transition-all group-hover:rotate-0 duration-700 flex flex-col">
                <div className="w-20 h-1.5 bg-[#4c2f05]/10 rounded-full mx-auto mb-10 shrink-0" />
                <div className="flex-1 space-y-8 overflow-hidden">
                  <div className="flex items-center justify-between opacity-40">
                    <Zap className="h-5 w-5" />
                    <span className="font-black text-[10px] tracking-widest uppercase">Live Session</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase leading-none tracking-tighter">What is our primary goal?</h3>
                  <div className="space-y-3">
                    <div className="h-16 bg-[#ff9312] rounded-[1.25rem] border-2 border-[#4c2f05] flex items-center px-6">
                      <span className="font-black text-sm uppercase">Innovation</span>
                    </div>
                    <div className="h-16 bg-[#4c2f05]/5 rounded-[1.25rem] border-2 border-dashed border-[#4c2f05]/20 flex items-center px-6">
                      <span className="font-black text-sm uppercase opacity-40">Growth</span>
                    </div>
                    <div className="h-16 bg-[#4c2f05]/5 rounded-[1.25rem] border-2 border-dashed border-[#4c2f05]/20 flex items-center px-6">
                      <span className="font-black text-sm uppercase opacity-40">Sustainability</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t-2 border-[#4c2f05]/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">42 Transmitting</span>
                  </div>
                  <Users className="h-4 w-4 opacity-40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW DEMO: SCREEN TO HAND */}
        <section className="py-40 bg-[#4c2f05] text-[#ff9312] overflow-hidden">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
            <div className="relative">
              {/* Mockup Presentation View */}
              <div className="bg-white rounded-[2rem] border-4 border-[#ff9312] p-8 shadow-[20px_20px_0px_0px_rgba(255,147,18,0.3)] rotate-[-2deg] z-10 relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <div className="w-4 h-4 rounded-full bg-yellow-500" />
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                </div>
                <h4 className="text-3xl font-black uppercase tracking-tighter text-[#4c2f05] mb-6">Live Pulse Results</h4>
                <div className="space-y-4">
                  <div className="h-12 bg-[#ff9312] rounded-[1rem] w-[85%] border-2 border-[#4c2f05]" />
                  <div className="h-12 bg-[#ff9312]/30 rounded-[1rem] w-[45%] border-2 border-[#4c2f05]/20" />
                  <div className="h-12 bg-[#ff9312]/50 rounded-[1rem] w-[65%] border-2 border-[#4c2f05]/20" />
                </div>
              </div>
              
              {/* Mockup Mobile View */}
              <div className="absolute -bottom-20 -right-10 w-64 bg-white rounded-[2.5rem] border-4 border-[#4c2f05] p-6 shadow-[15px_15px_0px_0px_#ff9312] rotate-[5deg] z-20">
                <div className="w-16 h-1 bg-[#4c2f05]/10 rounded-full mx-auto mb-10" />
                <div className="space-y-4">
                  <div className="h-12 bg-[#4c2f05] rounded-[1rem] flex items-center justify-center">
                    <span className="text-white font-black text-xs uppercase">Option A</span>
                  </div>
                  <div className="h-12 bg-[#4c2f05]/10 rounded-[1rem]" />
                  <div className="h-12 bg-[#4c2f05]/10 rounded-[1rem]" />
                </div>
                <div className="mt-12 w-10 h-10 rounded-full border-2 border-[#4c2f05]/10 mx-auto" />
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase tracking-tighter">
                From Screen <br />
                To Hand. <br />
                <span className="opacity-30">Instantly.</span>
              </h2>
              <div className="grid gap-8">
                {[
                  { icon: Monitor, title: "Step 1: Create", desc: "Build your interaction in our minimalist editor." },
                  { icon: Share2, title: "Step 2: Share", desc: "Display the 6-digit code on the big screen." },
                  { icon: Smartphone, title: "Step 3: Pulse", desc: "Audience joins instantly on any mobile device." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-[1rem] bg-[#ff9312] text-[#4c2f05] flex items-center justify-center shrink-0 border-2 border-[#ff9312]">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase tracking-tighter">{step.title}</h4>
                      <p className="font-bold opacity-60 uppercase text-xs tracking-widest">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRESENTATION DISPLAY MOCKUP */}
        <section className="py-40 bg-[#f3f3f1] text-[#4c2f05] overflow-hidden">
          <div className="studio-container space-y-24">
             <div className="text-center space-y-6 max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-8xl font-black leading-[0.8] uppercase tracking-tighter">
                  Command the <br />
                  Grand Stage.
                </h2>
                <p className="text-xl font-bold opacity-70 uppercase max-w-2xl mx-auto">
                   Absolute clarity for thousands. High-octane visuals designed for the biggest screens in the boardroom.
                </p>
             </div>

             <div className="relative group">
                <div className="bg-[#4c2f05] rounded-[2.5rem] border-8 border-[#ff9312] p-12 shadow-[40px_40px_0px_0px_rgba(76,47,5,0.2)] transition-transform duration-700 group-hover:scale-[1.02]">
                   {/* Presentation Header */}
                   <div className="flex items-center justify-between mb-16 pb-8 border-b-4 border-white/10">
                      <div className="flex items-center gap-6">
                         <Zap className="h-12 w-12 text-[#ff9312] fill-current" />
                         <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Live Insight Studio</h3>
                      </div>
                      <div className="bg-[#ff9312] p-6 rounded-[1.5rem] text-[#4c2f05]">
                         <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">JOIN AT POPPULSE.COM</p>
                         <p className="text-6xl font-black tracking-tighter leading-none">X8Y9Z2</p>
                      </div>
                   </div>

                   {/* Main Content Area */}
                   <div className="grid lg:grid-cols-3 gap-12 min-h-[400px]">
                      <div className="lg:col-span-2 space-y-10">
                         <h4 className="text-5xl font-black text-white uppercase leading-none tracking-tight">How likely are you to recommend?</h4>
                         <div className="h-64 flex items-end gap-6 pt-10 px-8 bg-white/5 rounded-[2rem] border-4 border-dashed border-white/10">
                            <div className="bg-[#ff9312] w-full h-[85%] rounded-t-[1.5rem]" />
                            <div className="bg-[#ff9312]/30 w-full h-[45%] rounded-t-[1.5rem]" />
                            <div className="bg-[#ff9312]/60 w-full h-[65%] rounded-t-[1.5rem]" />
                            <div className="bg-[#ff9312]/80 w-full h-[95%] rounded-t-[1.5rem]" />
                         </div>
                      </div>
                      <div className="bg-white/5 rounded-[2.5rem] border-4 border-white/10 p-10 flex flex-col justify-center items-center text-center space-y-6">
                         <div className="w-24 h-24 rounded-full bg-[#ff9312] flex items-center justify-center border-4 border-white">
                            <Users className="h-10 w-10 text-white" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-8xl font-black text-white tracking-tighter leading-none">256</p>
                            <p className="text-xs font-black text-[#ff9312] uppercase tracking-[0.4em]">PARTICIPANTS SYNCED</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* STUDIO ARCHITECT / EDIT MOCKUP */}
        <section className="py-40 bg-[#4c2f05] text-[#ff9312] overflow-hidden border-t-4 border-[#ff9312]">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
             <div className="space-y-12">
                <h2 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase tracking-tighter">
                  Studio <br />
                  Architect. <br />
                  <span className="opacity-30">Zero Friction.</span>
                </h2>
                <p className="text-xl font-bold uppercase opacity-70 leading-tight max-w-lg">
                  Craft your interactive experience in seconds. A surgical, minimalist editor that keeps you focused on the content, not the tool.
                </p>
                <div className="flex flex-col gap-4">
                   {[
                      { icon: Layout, title: "Visual Layout", desc: "Drag, drop, and refine your survey flow." },
                      { icon: MousePointer2, title: "Precision Controls", desc: "Set time limits and correct answers instantly." }
                   ].map((f, i) => (
                      <div key={i} className="flex gap-6 items-center p-6 bg-[#ff9312]/10 rounded-[1.5rem] border-2 border-[#ff9312]/20">
                         <div className="w-12 h-12 rounded-[1rem] bg-[#ff9312] text-[#4c2f05] flex items-center justify-center shrink-0">
                            <f.icon className="h-6 w-6" />
                         </div>
                         <div>
                            <h4 className="font-black uppercase tracking-tight">{f.title}</h4>
                            <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{f.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="relative">
                {/* Editor Shell */}
                <div className="bg-white rounded-[2rem] border-4 border-[#ff9312] shadow-[20px_20px_0px_0px_rgba(255,147,18,0.3)] overflow-hidden">
                   <div className="h-12 bg-[#4c2f05]/5 border-b-2 border-[#4c2f05]/10 flex items-center px-6 gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4c2f05]/10" />
                      <div className="w-3 h-3 rounded-full bg-[#4c2f05]/10" />
                      <div className="w-3 h-3 rounded-full bg-[#4c2f05]/10" />
                   </div>
                   <div className="p-8 space-y-8">
                      {/* Active Edit Question */}
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Edit Question 1</span>
                            <div className="flex gap-2">
                               <div className="w-8 h-8 rounded-[0.5rem] bg-[#4c2f05]/5 flex items-center justify-center"><Plus className="h-4 w-4 opacity-20" /></div>
                            </div>
                         </div>
                         <div className="h-16 bg-[#4c2f05]/5 rounded-[1rem] border-2 border-[#4c2f05]/10 px-6 flex items-center">
                            <span className="font-black uppercase text-sm tracking-tight">What is our primary goal?</span>
                         </div>
                      </div>

                      {/* Tool Palette Floating */}
                      <div className="relative group/tool py-6">
                         <div className="absolute -left-12 top-0 bg-[#ff9312] p-4 rounded-[1.5rem] border-4 border-[#4c2f05] shadow-[10px_10px_0px_0px_#4c2f05] rotate-[-12deg] z-20 space-y-4">
                            <div className="w-10 h-10 rounded-[0.75rem] bg-[#4c2f05] text-white flex items-center justify-center"><ListChecks className="h-5 w-5" /></div>
                            <div className="w-10 h-10 rounded-[0.75rem] bg-white/50 flex items-center justify-center"><Cloud className="h-5 w-5 opacity-40" /></div>
                            <div className="w-10 h-10 rounded-[0.75rem] bg-white/50 flex items-center justify-center"><Ruler className="h-5 w-5 opacity-40" /></div>
                         </div>
                         <div className="bg-white rounded-[1.5rem] border-2 border-dashed border-[#4c2f05]/20 p-6 flex flex-col items-center justify-center space-y-4">
                            <Sparkles className="h-10 w-10 text-[#ff9312] opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Refine with AI</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* LIVE QUIZZES & GAMIFICATION */}
        <section className="py-40 bg-[#f3f3f1] text-[#4c2f05] overflow-hidden">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase tracking-tighter">
                High Stakes. <br />
                Live Quiz. <br />
                <span className="opacity-30">Pure Focus.</span>
              </h2>
              <p className="text-xl font-bold uppercase opacity-70 leading-tight max-w-lg">
                Turn learning into a competitive pulse. Instant feedback, automated scoring, and high-octane results that keep the room locked in.
              </p>
              <div className="flex gap-4">
                <div className="bg-[#4c2f05] text-[#ff9312] p-8 rounded-[1.5rem] border-2 border-[#4c2f05] flex-1">
                   <Trophy className="h-10 w-10 mb-4" />
                   <h4 className="font-black uppercase tracking-tighter">Interactive</h4>
                   <p className="text-[10px] font-bold uppercase opacity-60">Real-time sync</p>
                </div>
                <div className="bg-[#ff9312] text-[#4c2f05] p-8 rounded-[1.5rem] border-2 border-[#4c2f05] flex-1">
                   <CheckCircle2 className="h-10 w-10 mb-4" />
                   <h4 className="font-black uppercase tracking-tighter">Auto-Score</h4>
                   <p className="text-[10px] font-bold uppercase opacity-60">Instant validation</p>
                </div>
              </div>
            </div>

            <div className="relative group flex items-center justify-center min-h-[550px]">
              {/* Main Quiz Options Card (Participant View) */}
              <div className="relative w-80 bg-white rounded-[2rem] border-4 border-[#4c2f05] p-8 shadow-[20px_20px_0px_0px_#ff9312] rotate-3 transition-transform duration-700 z-0 space-y-6">
                 <div className="w-16 h-1.5 bg-[#4c2f05]/10 rounded-full mx-auto mb-8" />
                 <h4 className="text-xl font-black uppercase tracking-tight text-center">Correct Answer?</h4>
                 <div className="space-y-3">
                   {/* Option A - Correct & Selected */}
                   <div className="h-14 bg-green-500 rounded-[1rem] border-2 border-[#4c2f05] flex items-center px-5 gap-3">
                     <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-[#4c2f05]">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                     </div>
                     <span className="font-black text-xs uppercase text-white">Innovation</span>
                   </div>
                   {/* Option B */}
                   <div className="h-14 bg-[#4c2f05]/5 rounded-[1rem] border-2 border-[#4c2f05]/20 flex items-center px-5">
                     <span className="font-black text-xs uppercase opacity-40">Growth</span>
                   </div>
                   {/* Option C */}
                   <div className="h-14 bg-[#4c2f05]/5 rounded-[1rem] border-2 border-[#4c2f05]/20 flex items-center px-5">
                     <span className="font-black text-xs uppercase opacity-40">Stability</span>
                   </div>
                 </div>
              </div>

              {/* Smaller Feedback Card Overlay - Repositioned as OFFSET overlay */}
              <div className="absolute top-0 right-0 lg:-right-10 lg:top-10 w-64 rounded-[2rem] bg-green-500 border-4 border-[#4c2f05] p-8 shadow-[15px_15px_0px_0px_#4c2f05] -rotate-6 group-hover:rotate-0 transition-transform duration-700 z-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-[1.25rem] bg-white flex items-center justify-center border-4 border-[#4c2f05]">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">CORRECT!</h3>
                <p className="text-white/80 font-black uppercase text-[10px] tracking-widest">+100 POINTS</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRECISION & SCALE: SLIDERS & GUESSING */}
        <section className="py-40 bg-[#4c2f05] text-[#ff9312] overflow-hidden">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
             <div className="order-2 lg:order-1 relative group">
                {/* Precision Slider Mockup */}
                <div className="relative rounded-[2rem] bg-white border-4 border-[#ff9312] p-12 shadow-[20px_20px_0px_0px_rgba(255,147,18,0.3)] rotate-[3deg] group-hover:rotate-0 transition-transform duration-700 z-10 space-y-10">
                   <div className="flex justify-between items-center opacity-40">
                      <Ruler className="h-5 w-5 text-[#4c2f05]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#4c2f05]">Precision Scale</span>
                   </div>
                   <div className="text-center">
                      <span className="text-8xl font-black text-[#4c2f05] tracking-tighter">84</span>
                   </div>
                   <div className="relative h-4 bg-[#4c2f05]/10 rounded-full border-2 border-[#4c2f05]">
                      <div className="absolute left-0 top-0 h-full w-[84%] bg-[#ff9312] rounded-full" />
                      <div className="absolute left-[84%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-4 border-[#4c2f05]" />
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase text-[#4c2f05] opacity-40 tracking-widest">
                      <span>Low Intensity</span>
                      <span>High Impact</span>
                   </div>
                </div>

                {/* Guess Number Overlap */}
                <div className="absolute -top-10 -left-10 w-64 bg-[#ff9312] rounded-[2rem] border-4 border-[#4c2f05] p-8 shadow-[15px_15px_0px_0px_white] rotate-[-6deg] z-20 text-[#4c2f05] space-y-4">
                   <Hash className="h-8 w-8 mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Guess</p>
                   <p className="text-6xl font-black tracking-tighter leading-none">42.5</p>
                </div>
             </div>

             <div className="order-1 lg:order-2 space-y-12">
                <h2 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase tracking-tighter">
                  Precision. <br />
                  Nuance. <br />
                  <span className="opacity-30">Scale.</span>
                </h2>
                <p className="text-xl font-bold uppercase opacity-70 leading-tight max-w-lg">
                  Capture the spectrum of sentiment. From precision sliders to numeric estimation, PopPulse gets you the hard data behind the energy.
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="border-2 border-[#ff9312]/20 p-6 rounded-[1.5rem] space-y-2">
                      <SlidersHorizontal className="h-6 w-6" />
                      <h4 className="font-black uppercase text-sm">Fine Control</h4>
                   </div>
                   <div className="border-2 border-[#ff9312]/20 p-6 rounded-[1.5rem] space-y-2">
                      <Hash className="h-6 w-6" />
                      <h4 className="font-black uppercase text-sm">Estimation</h4>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-40 bg-[#4c2f05] text-[#ff9312]">
          <div className="studio-container space-y-32">
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-[8rem] font-black leading-[0.8] uppercase tracking-tighter">
                Tools For <br />
                Impact.
              </h2>
              <p className="text-xs font-black uppercase tracking-widest opacity-40">Zero barriers. High stakes interaction.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Cloud, title: "Word Clouds", desc: "Visualize the collective thought in real-time." },
                { icon: ListOrdered, title: "Ranking", desc: "Prioritize ideas with live audience rankings." },
                { icon: SlidersHorizontal, title: "Precision Sliders", desc: "Capture nuanced sentiment with detailed data." },
                { icon: Sparkles, title: "AI Assistant", desc: "Perfect your questions for clarity and neutrality." },
                { icon: Hash, title: "Numeric Guessing", desc: "Gamify your session with estimation challenges." },
                { icon: BrainCircuit, title: "AI Summaries", desc: "Extract key themes from hundreds of text responses." },
                { icon: ListChecks, title: "Live Quizzes", desc: "Instant feedback with automated scoring." },
                { icon: Palette, title: "Custom Vibes", desc: "Tailor the studio atmosphere to your brand." }
              ].map((tool, i) => (
                <article key={i} className="bg-[#4c2f05] text-[#ff9312] p-10 rounded-[2rem] border-4 border-[#ff9312]/20 space-y-6 transition-all hover:border-[#ff9312] hover:-translate-y-4 duration-300">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-[#ff9312] text-[#4c2f05] flex items-center justify-center border-2 border-[#4c2f05]">
                    <tool.icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{tool.title}</h3>
                  <p className="text-sm font-bold opacity-60 uppercase leading-tight">{tool.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-60 text-center bg-[#ff9312] text-[#4c2f05] border-t-4 border-[#4c2f05]">
          <div className="studio-container space-y-16">
            <h2 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.75]">
              Ready to <br />
              Launch?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" onClick={() => router.push('/login')} className="h-24 px-16 rounded-[1.5rem] text-2xl font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all shadow-none">
                START DASHBOARD
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/join')} className="h-24 px-16 rounded-[1.5rem] text-2xl font-black border-4 border-[#4c2f05] text-[#4c2f05] hover:bg-[#4c2f05] hover:text-[#ff9312] transition-all shadow-none">
                JOIN SESSION
              </Button>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40 pt-12">Instant start. Professional Grade. Always Sync.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#f3f3f1] dark:bg-zinc-950 border-t-4 border-[#4c2f05]/10">
        <div className="py-24 studio-container w-full flex flex-col md:flex-row items-center justify-between gap-12 font-black">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <span className="text-3xl tracking-tighter uppercase leading-none text-[#4c2f05] dark:text-[#ff9312]">PopPulse*</span>
            <p className="text-xs opacity-40 uppercase tracking-widest text-[#4c2f05] dark:text-white">&copy; {new Date().getFullYear()} Studio interaction</p>
          </div>
          <div className="flex gap-12 text-xs uppercase tracking-widest opacity-40 text-[#4c2f05] dark:text-white">
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[#ff9312] transition-colors">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
