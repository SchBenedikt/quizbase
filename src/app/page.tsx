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
        <section className="px-6 pt-12 pb-32 max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black leading-[0.8] tracking-tighter uppercase">
                Your <br />
                Voice. <br />
                <span className="opacity-30 italic">Live.</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-bold max-w-xl leading-tight uppercase tracking-tight opacity-80">
              Transform any room into an interactive experience. No apps, no stress. Pure energy.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="flex-grow bg-white/10 rounded-[1.5rem] px-8 py-4 flex items-center border-2 border-foreground/20 focus-within:border-foreground transition-all">
                <span className="font-black opacity-40 mr-4 text-xs tracking-widest uppercase">CODE:</span>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="000000" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-3xl font-black p-0 placeholder:opacity-10 uppercase h-auto shadow-none"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} className="h-20 px-12 rounded-[1.5rem] text-xl font-black bg-foreground text-background border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all group shrink-0 shadow-none">
                JOIN NOW <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="relative group perspective-1000">
            <div className="relative rounded-[1.5rem] overflow-hidden border-2 border-foreground transform lg:rotate-2 transition-all group-hover:rotate-0 duration-1000">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/poppulse1/800/1000"} 
                alt="PopPulse Interaction"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] contrast-125 transition-all group-hover:scale-105 duration-1000"
                data-ai-hint="presentation interactive"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              <div className="absolute top-10 right-10 bg-background border-2 border-foreground p-6 rounded-[1.5rem]">
                <Zap className="h-10 w-10 fill-foreground text-foreground" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-foreground text-background py-40 px-6">
          <div className="max-w-[1400px] mx-auto space-y-32">
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-[7rem] font-black leading-[0.8] uppercase tracking-tighter">
                True <br />
                Interaction.
              </h2>
              <p className="text-xs font-black uppercase tracking-widest opacity-40">Built for Maximum Reach</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Cloud, title: "Word Clouds", desc: "See what your audience really thinks." },
                { icon: ListChecks, title: "Polls", desc: "Instant results. Real-time decisions." },
                { icon: SlidersHorizontal, title: "Sliders", desc: "High-precision data for deep insights." },
                { icon: Sparkles, title: "AI Assistant", desc: "Optimize your questions in seconds." }
              ].map((tool, i) => (
                <div key={i} className="bg-background text-foreground p-10 rounded-[1.5rem] border-2 border-background space-y-6 transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-foreground text-background flex items-center justify-center border-2 border-foreground">
                    <tool.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{tool.title}</h3>
                  <p className="text-sm font-bold opacity-60 uppercase leading-tight">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-40 px-6 space-y-60 overflow-hidden">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
                Engage <br />
                Everyone. <br />
                <span className="opacity-20 italic">Everywhere.</span>
              </h2>
              <p className="text-xl font-bold uppercase opacity-70 leading-tight max-w-lg">
                PopPulse* removes all barriers. No registration for participants – the human connection is central.
              </p>
              <div className="flex gap-6 items-center p-8 bg-foreground/5 rounded-[1.5rem] border-2 border-foreground/10">
                <Users2 className="h-10 w-10 text-primary" />
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tighter">100% Participation</h4>
                  <p className="font-bold opacity-40 uppercase text-xs tracking-widest">Everyone gets a voice</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-[1.5rem] overflow-hidden border-2 border-foreground -rotate-1 group">
              <Image 
                src="https://picsum.photos/seed/audience/800/800"
                alt="Engaged Audience"
                width={800}
                height={800}
                className="object-cover aspect-square contrast-110 group-hover:scale-105 transition-transform duration-1000"
                data-ai-hint="audience happy"
              />
            </div>
          </div>
        </section>

        <section className="py-60 px-6 text-center bg-foreground text-background">
          <div className="max-w-[1400px] mx-auto space-y-16">
            <h2 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.75]">
              Ready for <br />
              Your Event?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" onClick={() => router.push('/login')} className="h-20 px-16 rounded-[1.5rem] text-xl font-black bg-background text-foreground border-2 border-background hover:bg-transparent hover:text-background transition-all shadow-none">
                START NOW
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/join')} className="h-20 px-16 rounded-[1.5rem] text-xl font-black border-2 border-background hover:bg-background hover:text-foreground transition-all shadow-none">
                JOIN SESSION
              </Button>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40 pt-12">No account needed. Instant start.</p>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-[1400px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 font-black border-t-2 border-foreground">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <span className="text-3xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-xs opacity-40 uppercase tracking-widest">Global Real-time Interaction</p>
        </div>
        <div className="flex gap-12 text-xs uppercase tracking-widest opacity-40">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Imprint</Link>
          <Link href="#" className="hover:text-primary transition-colors">Status</Link>
        </div>
      </footer>
    </div>
  );
}
