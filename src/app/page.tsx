
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, Sparkles, MessageSquare, Target, Radio, Layers, Users2, ShieldCheck, Rocket } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Header } from "@/components/layout/Header";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const router = useRouter();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-poll');
  const featureImage = PlaceHolderImages.find(img => img.id === 'feature-live');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length >= 6) {
      router.push(`/p/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary">
      <Header />

      <main className="flex-grow pt-32">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1 bg-primary text-background rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
                Live Interaction Protocol v3.0
              </div>
              <h1 className="text-8xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase">
                YOUR <br />
                VOICE. <br />
                <span className="opacity-30 italic">LIVE.</span>
              </h1>
            </div>
            <p className="text-2xl md:text-3xl font-bold max-w-xl leading-none uppercase tracking-tight">
              Stop presenting. Start pulsing. Transform any room into an active data field in seconds.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-6 pt-6">
              <div className="flex-grow bg-white/10 rounded-[2.5rem] px-10 py-4 flex items-center border-4 border-primary transition-all hover:bg-white/20">
                <span className="font-black opacity-30 mr-2 text-xl">PULSE:</span>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="000000" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-2xl font-black p-0 placeholder:opacity-10 uppercase h-auto text-primary shadow-none"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} size="lg" className="h-24 px-12 rounded-[2.5rem] text-2xl font-black bg-primary text-background group border-4 border-primary hover:bg-transparent hover:text-primary transition-all active:scale-95">
                JOIN NOW <ArrowRight className="ml-3 h-10 w-10 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="relative group">
            <div className="relative rounded-[5rem] overflow-hidden border-8 border-primary transform lg:rotate-3 transition-transform group-hover:rotate-0 duration-700">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/poppulse1/800/1000"} 
                alt="PopPulse Interaction"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] contrast-125 transition-all group-hover:scale-110 duration-700"
                data-ai-hint="presentation interactive"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              <div className="absolute bottom-12 right-12 bg-background border-4 border-primary p-8 rounded-[3rem] animate-bounce">
                <Zap className="h-12 w-12 fill-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview Grid */}
        <section id="features" className="bg-primary py-40 px-6 border-y-8 border-primary">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-10">
              <h2 className="text-7xl md:text-[12rem] font-black text-background leading-[0.75] uppercase tracking-tighter">
                ENGINEERED <br />
                FOR FLOW.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Cloud, title: "Word Clouds", desc: "Watch sentiment crystallize in real-time. Bigger words, deeper truth." },
                { icon: ListChecks, title: "Live Polls", desc: "Instant consensus. Make decisions as fast as the room speaks." },
                { icon: SlidersHorizontal, title: "Scales", desc: "Quantify the vibe. High-fidelity sliders for nuanced feedback." },
                { icon: Sparkles, title: "AI Refine", desc: "Perfect your prompts. AI-powered question polishing for clarity." }
              ].map((tool, i) => (
                <div key={i} className="bg-background p-12 rounded-[4rem] border-4 border-background space-y-6 transition-all hover:-translate-y-4 hover:rotate-1">
                  <tool.icon className="h-16 w-16 text-primary" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter">{tool.title}</h3>
                  <p className="text-xl font-bold opacity-70 leading-tight uppercase">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Dive Sections */}
        <section className="py-40 px-6 bg-background space-y-60">
          {/* Section 1: Education */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <h2 className="text-7xl font-black uppercase tracking-tighter leading-[0.8]">
                CLASSROOMS <br />
                ON FIRE.
              </h2>
              <p className="text-2xl font-bold uppercase opacity-60">
                Engage every student, not just the front row. PopPulse* removes the friction of apps and accounts, letting learning take center stage.
              </p>
              <div className="grid gap-6">
                <div className="flex gap-6 items-start p-8 bg-primary/5 rounded-[3rem] border-4 border-primary/10">
                  <Users2 className="h-10 w-10 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl font-black uppercase">100% Participation</h4>
                    <p className="font-bold opacity-60 uppercase">Everyone votes, everyone speaks, everyone matters.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start p-8 bg-primary/5 rounded-[3rem] border-4 border-primary/10">
                  <ShieldCheck className="h-10 w-10 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl font-black uppercase">Safe Space</h4>
                    <p className="font-bold opacity-60 uppercase">Fully anonymous responses encourage radical honesty.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-[5rem] overflow-hidden border-8 border-primary rotate-3">
              <Image 
                src="https://picsum.photos/seed/students/800/800"
                alt="Students using PopPulse"
                width={800}
                height={800}
                className="object-cover aspect-square contrast-125"
                data-ai-hint="students technology"
              />
            </div>
          </div>

          {/* Section 2: Enterprise */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative rounded-[5rem] overflow-hidden border-8 border-primary -rotate-3">
              <Image 
                src="https://picsum.photos/seed/office/800/800"
                alt="Boardroom using PopPulse"
                width={800}
                height={800}
                className="object-cover aspect-square contrast-125"
                data-ai-hint="office meeting"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-12">
              <h2 className="text-7xl font-black uppercase tracking-tighter leading-[0.8]">
                MEETINGS <br />
                THAT WORK.
              </h2>
              <p className="text-2xl font-bold uppercase opacity-60">
                Cut through the noise. Get real-time data on strategy, alignment, and energy. PopPulse* turns passive listeners into active contributors.
              </p>
              <div className="grid gap-6">
                <div className="flex gap-6 items-start p-8 bg-primary/5 rounded-[3rem] border-4 border-primary/10">
                  <Rocket className="h-10 w-10 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl font-black uppercase">Agile Alignment</h4>
                    <p className="font-bold opacity-60 uppercase">Vote on roadmaps and priorities in real-time.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start p-8 bg-primary/5 rounded-[3rem] border-4 border-primary/10">
                  <Layers className="h-10 w-10 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl font-black uppercase">Visual Themes</h4>
                    <p className="font-bold opacity-60 uppercase">Brand your pulse. Multiple high-octane themes to fit your vibe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Expanded) */}
        <section id="how-it-works" className="py-40 px-6 bg-primary border-y-8 border-primary">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center">
              <h2 className="text-7xl md:text-[10rem] font-black text-background leading-[0.8] uppercase tracking-tighter">
                THE THREE <br />
                SECOND SETUP.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { step: "01", title: "CRAFT", desc: "Build your pulse. Multiple choice, word clouds, or sliders. Polish it with AI." },
                { step: "02", title: "BROADCAST", desc: "Launch and share your code. No apps. No accounts. No friction for participants." },
                { step: "03", title: "VISUALIZE", desc: "Watch as results stream in with high-octane animations and real-time charts." }
              ].map((s, i) => (
                <div key={i} className="bg-background p-12 rounded-[4rem] border-4 border-background space-y-6 flex flex-col items-center text-center group">
                  <span className="text-6xl font-black opacity-20 group-hover:opacity-100 transition-all duration-300">{s.step}</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">{s.title}</h3>
                  <p className="text-xl font-bold opacity-70 uppercase leading-tight">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-60 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.8]">
              READY TO <br />
              PULSE?
            </h2>
            <p className="text-3xl font-bold uppercase opacity-60">JOIN THOUSANDS TRANSFORMING INTERACTION.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12">
              <Button size="lg" onClick={() => router.push('/login')} className="h-24 px-16 rounded-[2.5rem] text-2xl font-black bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all active:scale-95">
                GET STARTED FREE
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/join')} className="h-24 px-16 rounded-[2.5rem] text-2xl font-black border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                JOIN A SESSION
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full border-t-8 border-primary flex flex-col md:flex-row items-center justify-between gap-12 font-black">
        <div className="flex flex-col gap-4">
          <span className="text-5xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-xs opacity-40 uppercase tracking-[0.4em]">Amplifying Human Energy Globally</p>
        </div>
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] opacity-60">
          <Link href="#" className="hover:text-primary transition-colors">Instagram</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
