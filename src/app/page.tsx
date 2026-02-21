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
              <div className="inline-block px-4 py-1 bg-primary text-background rounded-full text-[10px] font-bold uppercase tracking-[0.4em]">
                Live Interaction Protocol v3.0
              </div>
              <h1 className="text-6xl md:text-[7rem] font-extrabold leading-[0.9] tracking-tight uppercase">
                Your <br />
                Voice. <br />
                <span className="opacity-30 italic">Live.</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-semibold max-w-xl leading-tight uppercase tracking-tight opacity-80">
              Stop presenting. Start pulsing. Transform any room into an active data field in seconds.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-6 pt-6">
              <div className="flex-grow bg-white/10 rounded-[2rem] px-10 py-4 flex items-center border-4 border-primary transition-all hover:bg-white/20">
                <span className="font-bold opacity-30 mr-2 text-lg">PULSE:</span>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="000000" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-xl font-bold p-0 placeholder:opacity-10 uppercase h-auto text-primary shadow-none"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} size="lg" className="h-20 px-12 rounded-[2rem] text-xl font-bold bg-primary text-background group border-4 border-primary hover:bg-transparent hover:text-primary transition-all active:scale-95">
                Join Now <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="relative group">
            <div className="relative rounded-[4rem] overflow-hidden border-8 border-primary transform lg:rotate-2 transition-transform group-hover:rotate-0 duration-700">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/poppulse1/800/1000"} 
                alt="PopPulse Interaction"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] contrast-125 transition-all group-hover:scale-105 duration-700"
                data-ai-hint="presentation interactive"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              <div className="absolute bottom-10 right-10 bg-background border-4 border-primary p-6 rounded-[2rem] animate-bounce">
                <Zap className="h-10 w-10 fill-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview Grid */}
        <section id="features" className="bg-primary py-40 px-6 border-y-8 border-primary">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-10">
              <h2 className="text-5xl md:text-[8rem] font-extrabold text-background leading-[0.85] uppercase tracking-tight">
                Engineered <br />
                For Flow.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Cloud, title: "Word Clouds", desc: "Watch sentiment crystallize in real-time. Bigger words, deeper truth." },
                { icon: ListChecks, title: "Live Polls", desc: "Instant consensus. Make decisions as fast as the room speaks." },
                { icon: SlidersHorizontal, title: "Scales", desc: "Quantify the vibe. High-fidelity sliders for nuanced feedback." },
                { icon: Sparkles, title: "AI Refine", desc: "Perfect your prompts. AI-powered question polishing for clarity." }
              ].map((tool, i) => (
                <div key={i} className="bg-background p-10 rounded-[3rem] border-4 border-background space-y-6 transition-all hover:-translate-y-2 hover:rotate-1">
                  <tool.icon className="h-12 w-12 text-primary" />
                  <h3 className="text-3xl font-bold uppercase tracking-tight">{tool.title}</h3>
                  <p className="text-lg font-semibold opacity-70 leading-tight uppercase">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Dive Sections */}
        <section className="py-40 px-6 bg-background space-y-60">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl font-extrabold uppercase tracking-tight leading-[0.9]">
                Classrooms <br />
                on Fire.
              </h2>
              <p className="text-xl font-semibold uppercase opacity-60 leading-relaxed">
                Engage every student, not just the front row. PopPulse* removes the friction of apps and accounts, letting learning take center stage.
              </p>
              <div className="grid gap-6">
                <div className="flex gap-6 items-start p-8 bg-primary/5 rounded-[2.5rem] border-4 border-primary/10">
                  <Users2 className="h-8 w-8 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold uppercase">100% Participation</h4>
                    <p className="font-semibold opacity-60 uppercase text-sm">Everyone votes, everyone speaks, everyone matters.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-[4rem] overflow-hidden border-8 border-primary rotate-2">
              <Image 
                src="https://picsum.photos/seed/students/800/800"
                alt="Students using PopPulse"
                width={800}
                height={800}
                className="object-cover aspect-square contrast-110"
                data-ai-hint="students technology"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-60 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-6xl md:text-[9rem] font-extrabold uppercase tracking-tight leading-[0.8]">
              Ready to <br />
              Pulse?
            </h2>
            <p className="text-2xl font-semibold uppercase opacity-60">Join thousands transforming interaction.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12">
              <Button size="lg" onClick={() => router.push('/login')} className="h-20 px-16 rounded-[2rem] text-xl font-bold bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all active:scale-95">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/join')} className="h-20 px-16 rounded-[2rem] text-xl font-bold border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                Join a Session
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full border-t-8 border-primary flex flex-col md:flex-row items-center justify-between gap-12 font-bold">
        <div className="flex flex-col gap-4">
          <span className="text-4xl tracking-tight uppercase leading-none">PopPulse*</span>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.4em]">Amplifying Human Energy Globally</p>
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