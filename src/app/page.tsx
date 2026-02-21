"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, Sparkles, Users2 } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Header } from "@/components/layout/Header";

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
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="flex-grow pt-32">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
                Live Interaction Protocol v4.0
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase">
                Your <br />
                Voice. <br />
                <span className="opacity-20 italic">Live.</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-bold max-w-xl leading-tight uppercase tracking-tight opacity-70">
              Transform any room into an active data field. No apps, no friction. Just energy.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="flex-grow bg-white/20 rounded-[2rem] px-8 py-4 flex items-center border-4 border-foreground/20 focus-within:border-foreground transition-all">
                <span className="font-black opacity-30 mr-4 text-sm tracking-widest">CODE:</span>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="000000" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-3xl font-black p-0 placeholder:opacity-10 uppercase h-auto shadow-none"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} className="h-20 px-12 rounded-[2rem] text-xl font-black bg-foreground text-background border-4 border-foreground hover:bg-transparent hover:text-foreground transition-all group shrink-0">
                JOIN NOW <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="relative group perspective-1000">
            <div className="relative rounded-[4rem] overflow-hidden border-8 border-foreground transform lg:rotate-3 transition-all group-hover:rotate-0 duration-1000 shadow-[20px_20px_0px_rgba(0,0,0,0.1)]">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/poppulse1/800/1000"} 
                alt="PopPulse Interaction"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] contrast-125 transition-all group-hover:scale-105 duration-1000"
                data-ai-hint="presentation interactive"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
              <div className="absolute top-10 right-10 bg-background border-4 border-foreground p-6 rounded-[2rem] animate-float">
                <Zap className="h-10 w-10 fill-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-foreground text-background py-40 px-6">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-[8rem] font-black leading-[0.8] uppercase tracking-tighter">
                Studio <br />
                Grade Flow.
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-40">Built for high-stakes interaction</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Cloud, title: "Clouds", desc: "Watch collective truth crystallize in real-time." },
                { icon: ListChecks, title: "Pulse", desc: "Instant consensus. Decisions at the speed of light." },
                { icon: SlidersHorizontal, title: "Nuance", desc: "High-fidelity sliders for deep qualitative data." },
                { icon: Sparkles, title: "AI Gen", desc: "Refine questions with neural clarity in seconds." }
              ].map((tool, i) => (
                <div key={i} className="bg-background text-foreground p-12 rounded-[3.5rem] border-4 border-background space-y-6 transition-all hover:-translate-y-4 hover:rotate-1">
                  <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center">
                    <tool.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{tool.title}</h3>
                  <p className="text-sm font-bold opacity-60 uppercase leading-tight">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact */}
        <section className="py-40 px-6 space-y-60 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
                Engage <br />
                Everyone. <br />
                <span className="opacity-20 italic">Everywhere.</span>
              </h2>
              <p className="text-xl font-bold uppercase opacity-60 leading-tight max-w-lg">
                PopPulse* removes the friction of accounts, letting human energy take center stage in any room.
              </p>
              <div className="flex gap-6 items-center p-10 bg-foreground/5 rounded-[3rem] border-4 border-foreground/10">
                <Users2 className="h-10 w-10 text-primary" />
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter">100% Inclusion</h4>
                  <p className="font-bold opacity-40 uppercase text-[10px] tracking-widest">Total Participation Protocol</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-[4rem] overflow-hidden border-8 border-foreground -rotate-2 group">
              <Image 
                src="https://picsum.photos/seed/audience/800/800"
                alt="Engaged Audience"
                width={800}
                height={800}
                className="object-cover aspect-square contrast-110 group-hover:scale-110 transition-transform duration-1000"
                data-ai-hint="audience happy"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-60 px-6 text-center bg-foreground text-background">
          <div className="max-w-4xl mx-auto space-y-16">
            <h2 className="text-7xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.75]">
              Ready to <br />
              Pulse?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" onClick={() => router.push('/login')} className="h-24 px-16 rounded-[2.5rem] text-2xl font-black bg-background text-foreground border-4 border-background hover:bg-transparent hover:text-background transition-all">
                START STUDIO
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/join')} className="h-24 px-16 rounded-[2.5rem] text-2xl font-black border-4 border-background hover:bg-background hover:text-foreground transition-all">
                JOIN SESSION
              </Button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 pt-12">Zero Friction. Instant Sync. Built for the bold.</p>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 font-black border-t-8 border-foreground">
        <div className="flex flex-col gap-4">
          <span className="text-4xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.4em]">Amplifying Human Energy globally</p>
        </div>
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] opacity-40">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="#" className="hover:text-primary transition-colors">OS Status</Link>
        </div>
      </footer>
    </div>
  );
}
