"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Cloud, ListChecks, SlidersHorizontal, Sparkles, MessageSquare, Target, Radio } from "lucide-react";
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
                New Era of Interaction
              </div>
              <h1 className="text-8xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase">
                YOUR <br />
                VOICE. <br />
                <span className="opacity-30 italic">LIVE.</span>
              </h1>
            </div>
            <p className="text-2xl md:text-3xl font-bold max-w-xl leading-none uppercase tracking-tight">
              Transform your classroom or office into an active energy field. Zero friction, pure vibe.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-6 pt-6">
              <div className="flex-grow bg-white/10 rounded-[2.5rem] px-10 py-4 flex items-center border-4 border-primary transition-all hover:bg-white/20">
                <span className="font-black opacity-30 mr-2 text-xl">CODE:</span>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="000000" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-2xl font-black p-0 placeholder:opacity-10 uppercase h-auto text-primary shadow-none"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} size="lg" className="h-24 px-12 rounded-[2.5rem] text-2xl font-black bg-primary text-background group border-4 border-primary hover:bg-transparent hover:text-primary transition-all active:scale-95">
                JOIN PULSE <ArrowRight className="ml-3 h-10 w-10 group-hover:translate-x-2 transition-transform" />
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
                data-ai-hint="audience cheering"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              <div className="absolute bottom-12 right-12 bg-background border-4 border-primary p-8 rounded-[3rem] animate-bounce">
                <Zap className="h-12 w-12 fill-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-primary py-40 px-6 border-y-8 border-primary">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-10">
              <h2 className="text-7xl md:text-[12rem] font-black text-background leading-[0.75] uppercase tracking-tighter">
                TOOLS FOR <br />
                THE BOLD.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Cloud, title: "Word Clouds", desc: "Real-time sentiment visualized instantly." },
                { icon: ListChecks, title: "Live Polls", desc: "Make decisions in a split second." },
                { icon: SlidersHorizontal, title: "Sliders", desc: "Measure the energy and scale of your room." }
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

        {/* How It Works */}
        <section id="how-it-works" className="py-40 px-6 bg-background">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12 order-2 lg:order-1 group">
               <div className="relative rounded-[5rem] overflow-hidden border-8 border-primary -rotate-3 transition-transform group-hover:rotate-0 duration-700">
                <Image 
                  src={featureImage?.imageUrl || "https://picsum.photos/seed/poppulse2/800/1000"} 
                  alt="Process"
                  width={800}
                  height={1000}
                  className="object-cover aspect-[4/5] contrast-125 transition-all group-hover:scale-105 duration-700"
                  data-ai-hint="data visualization"
                />
              </div>
            </div>
            <div className="space-y-12 order-1 lg:order-2">
              <h2 className="text-7xl font-black uppercase tracking-tighter leading-[0.8]">
                THREE STEPS <br />
                TO FLOW.
              </h2>
              <div className="space-y-10">
                {[
                  { step: "01", title: "CREATE", desc: "Draft your pulse questions in seconds with our AI refiner." },
                  { step: "02", title: "SHARE", desc: "Broadcast your code. No apps, no signups for participants." },
                  { step: "03", title: "EVOLVE", desc: "Watch the energy take shape as results stream in live." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-8 group cursor-default">
                    <span className="text-5xl font-black opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all duration-300">{s.step}</span>
                    <div className="space-y-2 transition-transform group-hover:translate-x-4 duration-300">
                      <h4 className="text-3xl font-black uppercase tracking-tighter">{s.title}</h4>
                      <p className="text-lg font-bold opacity-60 uppercase">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="bg-primary py-40 px-6 border-y-8 border-primary">
           <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-20">
              <h2 className="text-8xl md:text-[14rem] font-black text-background leading-[0.75] uppercase tracking-tighter">
                AMPLIFY <br /> EVERYTHING.
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {[
                  { icon: Target, label: "Engagement", value: "100%" },
                  { icon: Radio, label: "Real-time", value: "LIVE" },
                  { icon: MessageSquare, label: "Feedback", value: "PURE" },
                  { icon: Sparkles, label: "Experience", value: "BEYOND" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 p-10 rounded-[3rem] border-4 border-background/20 flex flex-col items-center gap-4 text-background transition-all hover:bg-white/20 hover:scale-105 duration-300">
                    <item.icon className="h-10 w-10" />
                    <span className="text-4xl font-black tracking-tighter">{item.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">{item.label}</span>
                  </div>
                ))}
              </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-7xl font-black uppercase tracking-tighter leading-none">READY TO PULSE?</h2>
            <p className="text-2xl font-bold uppercase opacity-60">Join thousands of educators and leaders transforming their rooms.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
              <Button size="lg" onClick={() => router.push('/presenter')} className="h-24 px-12 rounded-[2.5rem] text-2xl font-black bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all">
                LAUNCH DASHBOARD
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/join')} className="h-24 px-12 rounded-[2.5rem] text-2xl font-black border-4 border-primary text-primary hover:bg-primary hover:text-background transition-all">
                JOIN SESSION
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full border-t-8 border-primary flex flex-col md:flex-row items-center justify-between gap-12 font-black">
        <div className="flex flex-col gap-4">
          <span className="text-5xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-xs opacity-40 uppercase tracking-[0.4em]">Amplifying Human Energy</p>
        </div>
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] opacity-60">
          <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
