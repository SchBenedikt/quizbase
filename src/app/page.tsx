"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Rocket, Globe, Users, Presentation } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
    <div className="flex flex-col min-h-screen bg-background text-primary">
      {/* Navigation */}
      <header className="px-6 py-8 max-w-7xl mx-auto w-full">
        <nav className="bg-white/10 border-4 border-primary rounded-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black font-headline tracking-tighter uppercase">PopPulse*</span>
          </div>
          <div className="hidden lg:flex items-center gap-10 font-black text-xs uppercase tracking-[0.2em]">
            <Link href="#" className="hover:opacity-50 transition-opacity">Manifesto</Link>
            <Link href="#" className="hover:opacity-50 transition-opacity">The Tools</Link>
            <Link href="#" className="hover:opacity-50 transition-opacity">Showcase</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="rounded-full px-6 font-black uppercase text-xs hover:bg-primary hover:text-background transition-colors">
              <Link href="/join">Login</Link>
            </Button>
            <Button asChild className="rounded-full px-8 font-black uppercase text-xs bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all">
              <Link href="/presenter">Host a Session</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1 bg-primary text-background rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
                New Era of Interaction
              </div>
              <h1 className="text-8xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase">
                YOUR <br />
                VOICE. <br />
                <span className="opacity-30 italic">LIVE.</span>
              </h1>
            </div>
            <p className="text-2xl md:text-3xl font-bold max-w-xl leading-none uppercase tracking-tight">
              Transform your classroom or office into an active energy field.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-6 pt-6">
              <div className="flex-grow bg-white/10 rounded-[2.5rem] px-10 py-4 flex items-center border-4 border-primary">
                <span className="font-black opacity-30 mr-2 text-xl">CODE:</span>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="000000" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-2xl font-black p-0 placeholder:opacity-10 uppercase h-auto text-primary"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} size="lg" className="h-24 px-12 rounded-[2.5rem] text-2xl font-black bg-primary text-background group border-4 border-primary hover:bg-transparent hover:text-primary transition-all">
                JOIN PULSE <ArrowRight className="ml-3 h-10 w-10 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="relative rounded-[5rem] overflow-hidden border-8 border-primary transform lg:rotate-3 transition-transform hover:rotate-0 duration-700">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/poppulse1/800/1000"} 
                alt="PopPulse Interaction"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] contrast-125"
                data-ai-hint="audience cheering"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              <div className="absolute bottom-12 right-12 bg-background border-4 border-primary p-8 rounded-[3rem]">
                <Zap className="h-12 w-12 fill-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-primary py-40 px-6 border-y-8 border-primary">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-10">
              <h2 className="text-7xl md:text-[12rem] font-black text-background leading-[0.75] uppercase tracking-tighter">
                STUDENTS. <br />
                WORKERS. <br />
                FLOW.
              </h2>
              <p className="text-background/90 text-2xl md:text-4xl font-black max-w-4xl mx-auto uppercase tracking-tighter leading-none italic">
                From lecture halls to boardrooms. Word clouds, sliders, and real-time vibe checks.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "WordCloud", text: "Visual Vibes" },
                { label: "Sliders", text: "Pulse Checks" },
                { label: "Polls", text: "Instant Data" },
                { label: "AI", text: "Refined" }
              ].map((stat, i) => (
                <div key={i} className="bg-background p-10 rounded-[3rem] border-4 border-background text-center space-y-2 group hover:bg-transparent hover:border-background transition-colors cursor-default">
                  <p className="text-4xl font-black text-primary group-hover:text-background uppercase tracking-tighter leading-none">{stat.label}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:text-background group-hover:opacity-100">{stat.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-40 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-10">
              <h3 className="text-6xl font-black uppercase tracking-tighter leading-none">THE <br />PROCESS.</h3>
              <p className="text-xl font-bold uppercase opacity-60">Three steps to pure engagement for any presentation.</p>
            </div>
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
              {[
                { icon: Rocket, title: "Create", desc: "Build your interactive deck with AI-powered questions." },
                { icon: Globe, title: "Invite", desc: "Share your 6-digit code. Join instantly from any device." },
                { icon: Presentation, title: "Present", desc: "Display results live in a distraction-free fullscreen view." },
                { icon: Users, title: "Engage", desc: "Turn passive listeners into active participants." }
              ].map((step, i) => (
                <div key={i} className="bg-white/5 border-4 border-primary/20 p-12 rounded-[4rem] space-y-6 hover:border-primary transition-all">
                  <div className="bg-primary text-background w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-4 border-primary">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-4xl font-black uppercase tracking-tighter">{step.title}</h4>
                  <p className="text-lg font-bold opacity-60 uppercase leading-none">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full border-t-8 border-primary flex flex-col md:flex-row items-center justify-between gap-12 font-black">
        <div className="flex flex-col gap-4">
          <span className="text-5xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-xs opacity-40 uppercase tracking-[0.4em]">Amplifying Human Energy</p>
        </div>
        <div className="flex flex-wrap justify-center gap-10 text-[10px] uppercase tracking-[0.4em]">
          <Link href="#" className="hover:underline">Manifesto</Link>
          <Link href="#" className="hover:underline">Privacy</Link>
          <Link href="#" className="hover:underline">Connect</Link>
          <Link href="#" className="hover:underline">Press</Link>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-40 uppercase tracking-widest italic leading-none">Global HQ / Berlin</p>
          <p className="text-xs opacity-20 uppercase tracking-widest mt-1">Est. 2024</p>
        </div>
      </footer>
    </div>
  );
}