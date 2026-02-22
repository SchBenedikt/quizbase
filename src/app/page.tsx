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
    <div className="flex flex-col min-h-screen bg-[#ff9312] text-[#4c2f05]">
      <Header variant="brand" className="text-[#4c2f05]" />

      <main className="flex-grow pt-32">
        <section className="studio-container pt-12 pb-32 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <header className="space-y-4">
              <h1 className="text-6xl md:text-8xl lg:text-[9.5rem] font-black leading-[0.75] tracking-tighter uppercase">
                Your <br />
                Voice. <br />
                <span className="opacity-30 italic">Live.</span>
              </h1>
            </header>
            <p className="text-xl md:text-2xl font-bold max-w-xl leading-tight uppercase tracking-tight">
              Transform any room into an interactive experience. No apps, no stress. Pure energy.
            </p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="flex-grow bg-white/20 rounded-[1.5rem] px-8 py-4 min-h-[5.5rem] flex items-center border-2 border-[#4c2f05]/20 focus-within:border-[#4c2f05] transition-all">
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="JOIN CODE" 
                  maxLength={6}
                  className="border-none bg-transparent focus-visible:ring-0 text-5xl font-black p-0 placeholder:opacity-20 uppercase h-auto shadow-none text-[#4c2f05] w-full tracking-tighter placeholder:text-[#4c2f05]"
                  aria-label="Enter 6-digit session code"
                />
              </div>
              <Button type="submit" disabled={joinCode.length < 6} className="h-[5.5rem] px-12 rounded-[1.5rem] text-xl font-black bg-[#4c2f05] text-[#ff9312] border-2 border-[#4c2f05] hover:bg-transparent hover:text-[#4c2f05] transition-all group shrink-0 shadow-none">
                JOIN NOW <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="relative group hidden lg:block">
            <div className="relative rounded-[1.5rem] overflow-hidden border-2 border-[#4c2f05] transform rotate-2 transition-all group-hover:rotate-0 duration-1000">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/poppulse1/800/1000"} 
                alt="Audience participating in a live survey using smartphones"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] contrast-125 transition-all group-hover:scale-105 duration-1000"
                priority
                data-ai-hint="presentation interactive"
              />
              <div className="absolute inset-0 bg-[#4c2f05]/10 mix-blend-multiply" />
              <div className="absolute top-10 right-10 bg-[#ff9312] border-2 border-[#4c2f05] p-6 rounded-[1.5rem]">
                <Zap className="h-10 w-10 fill-[#4c2f05] text-[#4c2f05]" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-[#4c2f05] text-[#ff9312] py-40">
          <div className="studio-container space-y-32">
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-[7rem] font-black leading-[0.8] uppercase tracking-tighter">
                True <br />
                Interaction.
              </h2>
              <p className="text-xs font-black uppercase tracking-widest opacity-40">Professional Engagement Tools</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Cloud, title: "Word Clouds", desc: "Instantly visualize collective audience thoughts." },
                { icon: ListChecks, title: "Live Polls", desc: "Real-time decisions and instant audience feedback." },
                { icon: SlidersHorizontal, title: "Precision Sliders", desc: "Capture detailed sentiment with high-precision data." },
                { icon: Sparkles, title: "AI Assistant", desc: "Perfect your questions for clarity and neutrality." }
              ].map((tool, i) => (
                <article key={i} className="bg-[#ff9312] text-[#4c2f05] p-10 rounded-[1.5rem] border-2 border-[#ff9312] space-y-6 transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-[#4c2f05] text-[#ff9312] flex items-center justify-center border-2 border-[#4c2f05]">
                    <tool.icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{tool.title}</h3>
                  <p className="text-sm font-bold opacity-60 uppercase leading-tight">{tool.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-40 space-y-40">
          <div className="studio-container grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
                Zero Barriers. <br />
                Instant Access. <br />
                <span className="opacity-20 italic">No Apps.</span>
              </h2>
              <p className="text-xl font-bold uppercase opacity-70 leading-tight max-w-lg">
                Participation should be easy. PopPulse* removes all registration requirements for your audience. One code, total sync.
              </p>
              <div className="flex gap-6 items-center p-8 bg-[#4c2f05]/5 rounded-[1.5rem] border-2 border-[#4c2f05]/10">
                <Users2 className="h-10 w-10 text-[#4c2f05]" />
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tighter text-[#4c2f05]">100% Participation</h4>
                  <p className="font-bold opacity-40 uppercase text-xs tracking-widest">Global accessibility</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-[1.5rem] overflow-hidden border-2 border-[#4c2f05] -rotate-1 group hidden lg:block">
              <Image 
                src="https://picsum.photos/seed/audience/800/800"
                alt="Happy audience engaging with interactive presentation"
                width={800}
                height={800}
                className="object-cover aspect-square contrast-110 group-hover:scale-105 transition-transform duration-1000"
                data-ai-hint="audience happy"
              />
            </div>
          </div>
        </section>

        <section className="py-60 text-center bg-[#4c2f05] text-[#ff9312]">
          <div className="studio-container space-y-16">
            <h2 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.75]">
              Ready to <br />
              Launch?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" onClick={() => router.push('/login')} className="h-20 px-16 rounded-[1.5rem] text-xl font-black bg-[#ff9312] text-[#4c2f05] border-2 border-[#ff9312] hover:bg-transparent hover:text-[#ff9312] transition-all shadow-none">
                START DASHBOARD
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/join')} className="h-20 px-16 rounded-[1.5rem] text-xl font-black border-2 border-[#ff9312] text-[#ff9312] hover:bg-[#ff9312] hover:text-[#4c2f05] transition-all shadow-none">
                JOIN SESSION
              </Button>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40 pt-12">Instant start. No credit card required.</p>
          </div>
        </section>
      </main>

      <footer className="py-24 studio-container w-full flex flex-col md:flex-row items-center justify-between gap-12 font-black border-t-2 border-[#4c2f05]/10">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <span className="text-3xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-xs opacity-40 uppercase tracking-widest">&copy; {new Date().getFullYear()} Studio interaction</p>
        </div>
        <div className="flex gap-12 text-xs uppercase tracking-widest opacity-40">
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-primary transition-colors">Status</Link>
        </div>
      </footer>
    </div>
  );
}
