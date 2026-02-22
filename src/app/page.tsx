"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, Sparkles, ListOrdered, Hash, BrainCircuit, Palette, Monitor, Smartphone, Share2, BarChart3, MessageSquareText, Activity, Users, Heart, Star, CheckCircle2, Trophy } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const router = useRouter();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-poll');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length >= 6) {
      router.push(`/p/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ff9312] text-[#4c2f05]">
      <Header variant="brand" className="text-[#4c2f05]" />

      <main className="flex-grow pt-32">
        {/* HERO SECTION */}
        <section className="studio-container pt-12 pb-32 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
            <header className="space-y-4">
              <h1 className="text-6xl md:text-8xl lg:text-[9.5rem] font-black leading-[0.75] tracking-tighter uppercase">
                Your <br />
                Voice. <br />
                <span className="opacity-30 italic">Live.</span>
              </h1>
            </header>
            <p className="text-xl md:text-2xl font-bold max-w-xl leading-tight uppercase tracking-tight">
              Transform any room into an interactive experience. No apps, no registration. Just pure energy.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="flex-grow bg-white/20 rounded-[1.5rem] px-8 py-6 min-h-[7rem] flex items-center border-4 border-[#4c2f05] focus-within:bg-white/30 transition-all relative overflow-hidden">
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="JOIN CODE" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-7xl font-black p-0 placeholder:opacity-10 uppercase h-auto shadow-none text-[#4c2f05] w-full tracking-tighter placeholder:text-[#4c2f05] relative z-10"
                  aria-label="Enter 6-digit session code"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} className="h-[7rem] px-12 rounded-[1.5rem] text-xl font-black bg-[#4c2f05] text-[#ff9312] border-4 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all group shrink-0 shadow-none">
                JOIN NOW <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="relative group hidden lg:block animate-in fade-in slide-in-from-right-10 duration-1000">
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-[#4c2f05] transform rotate-2 transition-all group-hover:rotate-0 duration-1000 shadow-[30px_30px_0px_0px_#4c2f05]">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/poppulse1/800/1000"} 
                alt="Audience participating in a live survey"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] contrast-125 transition-all group-hover:scale-105 duration-1000"
                priority
                data-ai-hint="presentation interactive"
              />
              <div className="absolute inset-0 bg-[#4c2f05]/10 mix-blend-multiply" />
              <div className="absolute top-10 right-10 bg-[#ff9312] border-4 border-[#4c2f05] p-6 rounded-[1.5rem] animate-bounce">
                <Zap className="h-10 w-10 fill-[#4c2f05] text-[#4c2f05]" />
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

        {/* AUDIENCE PULSE: WORD CLOUDS */}
        <section className="py-40 bg-[#f3f3f1] text-[#4c2f05] overflow-hidden">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
            <div className="order-2 lg:order-1 space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase tracking-tighter">
                Live <br />
                Sentiment. <br />
                <span className="opacity-30 italic">Pure Pulse.</span>
              </h2>
              <p className="text-xl font-bold uppercase opacity-70 leading-tight max-w-lg">
                Visualize the room's energy with real-time word clouds. As responses pour in, common themes grow, creating a living portrait of collective thought.
              </p>
              <div className="flex gap-4">
                <div className="bg-[#4c2f05] text-[#ff9312] p-8 rounded-[1.5rem] border-2 border-[#4c2f05] flex-1 group hover:-translate-y-2 transition-transform">
                  <Cloud className="h-10 w-10 mb-4" />
                  <h4 className="font-black uppercase tracking-tighter">Dynamic Clouds</h4>
                  <p className="text-[10px] font-bold uppercase opacity-60">Instant word growth</p>
                </div>
                <div className="bg-[#ff9312] text-[#4c2f05] p-8 rounded-[1.5rem] border-2 border-[#4c2f05] flex-1 group hover:-translate-y-2 transition-transform">
                  <Activity className="h-10 w-10 mb-4" />
                  <h4 className="font-black uppercase tracking-tighter">Live Flow</h4>
                  <p className="text-[10px] font-bold uppercase opacity-60">High-octane updates</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative group">
              {/* Word Cloud Mockup */}
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-[#4c2f05] bg-white p-12 shadow-[20px_20px_0px_0px_#ff9312] rotate-[2deg] group-hover:rotate-0 transition-transform duration-700 z-10 flex flex-wrap items-center justify-center gap-6 min-h-[400px]">
                <span className="text-6xl font-black uppercase tracking-tighter text-[#ff9312]">Innovation</span>
                <span className="text-3xl font-black uppercase tracking-tighter opacity-20">Scale</span>
                <span className="text-4xl font-black uppercase tracking-tighter opacity-40">Growth</span>
                <span className="text-2xl font-black uppercase tracking-tighter opacity-10">Future</span>
                <span className="text-5xl font-black uppercase tracking-tighter text-[#4c2f05]">Impact</span>
                <span className="text-3xl font-black uppercase tracking-tighter opacity-30">Strategy</span>
                <div className="absolute top-6 left-6 bg-[#4c2f05] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live Sentiment
                </div>
              </div>

              {/* Overlapping Phone Mockup */}
              <div className="absolute -bottom-10 -left-10 w-56 bg-[#4c2f05] rounded-[2rem] border-4 border-white p-6 shadow-[15px_15px_0px_0px_rgba(76,47,5,0.1)] rotate-[-6deg] z-20 hidden sm:block">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4">Your Input</p>
                <div className="h-12 bg-white/10 rounded-[1rem] border-2 border-white/20 mb-6 flex items-center px-4">
                  <span className="text-white font-black text-xs">INNOVATION</span>
                </div>
                <div className="h-12 bg-[#ff9312] rounded-[1rem] flex items-center justify-center border-2 border-[#4c2f05]">
                  <ArrowRight className="h-5 w-5 text-[#4c2f05]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUIZ SCORE: GAMIFIED SYNC */}
        <section className="py-40 bg-[#4c2f05] text-[#ff9312] overflow-hidden">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
            <div className="relative group">
              {/* Leaderboard/Quiz Card */}
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-[#ff9312] bg-white p-10 shadow-[20px_20px_0px_0px_rgba(255,147,18,0.3)] rotate-[-3deg] group-hover:rotate-0 transition-transform duration-700 z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Trophy className="h-8 w-8 text-[#4c2f05]" />
                  <h4 className="text-3xl font-black uppercase tracking-tighter text-[#4c2f05]">Top Scores</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Alpha", score: 2450, color: "#ff9312" },
                    { name: "Beta", score: 1890, color: "rgba(255,147,18,0.3)" },
                    { name: "Gamma", score: 1540, color: "rgba(255,147,18,0.1)" }
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[0.75rem] border-2 border-[#4c2f05] flex items-center justify-center font-black text-[#4c2f05]">
                        {i + 1}
                      </div>
                      <div className="flex-1 h-12 rounded-[1rem] border-2 border-[#4c2f05] overflow-hidden relative">
                         <div className="absolute inset-0 transition-all duration-1000" style={{ backgroundColor: p.color, width: `${(p.score/2450)*100}%` }} />
                         <div className="absolute inset-0 px-4 flex items-center justify-between z-10">
                           <span className="font-black uppercase text-xs text-[#4c2f05]">{p.name}</span>
                           <span className="font-black text-xs text-[#4c2f05]">{p.score}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone "Correct" View */}
              <div className="absolute -top-12 -right-12 w-64 bg-green-500 rounded-[2.5rem] border-4 border-[#4c2f05] p-8 shadow-[15px_15px_0px_0px_#ff9312] rotate-[8deg] z-20 hidden md:block">
                <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mb-8" />
                <div className="flex flex-col items-center gap-6 text-white">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white/20 border-4 border-white flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div className="text-center">
                    <h5 className="text-2xl font-black uppercase leading-none">Correct!</h5>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">+500 Points</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase tracking-tighter">
                Live <br />
                Quizzes. <br />
                <span className="opacity-30">Pure Focus.</span>
              </h2>
              <p className="text-xl font-bold uppercase opacity-70 leading-tight">
                Turn your presentation into a high-stakes arena. Instant scoring, automated leaderboards, and real-time feedback keep every pulse racing.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-[#ff9312] rounded-[1rem] border-2 border-[#ff9312]">
                     <Star className="h-6 w-6 text-[#4c2f05]" />
                   </div>
                   <span className="font-black uppercase text-xs tracking-tighter">Auto-Scoring</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-[#ff9312] rounded-[1rem] border-2 border-[#ff9312]">
                     <Users className="h-6 w-6 text-[#4c2f05]" />
                   </div>
                   <span className="font-black uppercase text-xs tracking-tighter">Live Ranking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI DEMO: INTELLIGENT FLOW */}
        <section className="py-40 bg-[#ff9312] text-[#4c2f05] border-t-4 border-[#4c2f05]">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
            <div className="relative">
              {/* Mockup AI Suggestion Box */}
              <div className="bg-[#4c2f05] rounded-[2rem] p-10 shadow-[20px_20px_0px_0px_rgba(76,47,5,0.3)] rotate-[-3deg] relative z-10 group hover:rotate-0 transition-transform duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6 text-[#ff9312]" />
                  <span className="text-[10px] font-black text-[#ff9312] uppercase tracking-[0.4em]">AI Assistant active</span>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-white/10 rounded-[1rem] border-2 border-[#ff9312]/20">
                    <p className="text-white font-bold opacity-40 text-xs uppercase mb-2">Original</p>
                    <p className="text-[#ff9312] font-black uppercase tracking-tight">Do you like the new plan?</p>
                  </div>
                  <div className="p-6 bg-[#ff9312] rounded-[1rem] border-2 border-[#4c2f05] animate-in slide-in-from-bottom-4 duration-1000">
                    <p className="text-[#4c2f05] font-bold opacity-60 text-xs uppercase mb-2">AI Refined</p>
                    <p className="text-[#4c2f05] font-black uppercase tracking-tight">To what extent does the proposed strategy align with your 2024 goals?</p>
                  </div>
                </div>
              </div>

              {/* Chat Bubble Accent */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#4c2f05] rounded-[1.5rem] flex items-center justify-center border-4 border-[#ff9312] animate-bounce hidden md:flex">
                <MessageSquareText className="h-10 w-10 text-[#ff9312]" />
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase tracking-tighter">
                Refine with <br />
                Intelligence. <br />
                <span className="opacity-30">GenAI Ready.</span>
              </h2>
              <p className="text-xl font-bold uppercase opacity-70 leading-tight">
                Don't settle for boring questions. Use our integrated AI to craft questions that spark engagement, maintain neutrality, and extract meaningful data.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tighter">Question Suggester</h4>
                  <p className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Perfect clarity and tone</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tighter">Text Analysis</h4>
                  <p className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Summarize 100s of responses</p>
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
      <footer className="py-24 studio-container w-full flex flex-col md:flex-row items-center justify-between gap-12 font-black border-t-4 border-[#4c2f05]/10">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <span className="text-3xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-xs opacity-40 uppercase tracking-widest">&copy; {new Date().getFullYear()} Studio interaction</p>
        </div>
        <div className="flex gap-12 text-xs uppercase tracking-widest opacity-40">
          <Link href="#" className="hover:text-[#4c2f05] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#4c2f05] transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-[#4c2f05] transition-colors">Status</Link>
        </div>
      </footer>
    </div>
  );
}
