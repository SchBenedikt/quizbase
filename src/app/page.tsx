"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight, Rocket, Globe, Users, Presentation } from "lucide-react";
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
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full border-t-8 border-primary flex flex-col md:flex-row items-center justify-between gap-12 font-black">
        <div className="flex flex-col gap-4">
          <span className="text-5xl tracking-tighter uppercase leading-none">PopPulse*</span>
          <p className="text-xs opacity-40 uppercase tracking-[0.4em]">Amplifying Human Energy</p>
        </div>
      </footer>
    </div>
  );
}