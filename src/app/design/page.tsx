"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Zap, Palette, Type, Box, Move, Layers, Sparkles, X } from "lucide-react";

export default function DesignSystemPage() {
  const colors = [
    { name: "Electric Orange (Primary)", hex: "#ff9312", hsl: "33 100% 50%", usage: "Interactive elements, branding, primary actions." },
    { name: "Midnight (Background)", hex: "#0a0a0a", hsl: "0 0% 3.9%", usage: "Core background for dark mode and cinematic sessions." },
    { name: "Studio White", hex: "#ffffff", hsl: "0 0% 100%", usage: "Core background for light mode and content areas." },
    { name: "Surgical Border", hex: "Foreground/10", hsl: "Var-Border", usage: "Standard 2px borders for layout components." },
  ];

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary selection:text-primary-foreground flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-grow pt-40 pb-24">
        <div className="studio-container space-y-24">
          <header className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border-2 border-primary/20 bg-primary/5 shadow-none">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Identity blueprint</span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              Visual <br />
              <span className="text-primary">Architecture.</span>
            </h1>
            <p className="text-2xl font-bold opacity-40 leading-tight tracking-tight">
              A flat, high-contrast design system. No shadows. Balanced casing. Surgical precision.
            </p>
          </header>

          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <Palette className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">01. Palette</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {colors.map((color) => (
                <div key={color.name} className="group">
                  <div 
                    className="h-48 rounded-[2rem] border-4 border-foreground/5 mb-6 transition-transform group-hover:-rotate-2 duration-500 shadow-none" 
                    style={{ backgroundColor: color.hex.startsWith('#') ? color.hex : 'transparent' }}
                  />
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl">{color.name}</h3>
                    <p className="text-xs font-mono opacity-40">{color.hsl}</p>
                    <p className="text-sm font-medium opacity-60 leading-snug">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <Box className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">02. Core rules</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-card border-2 border-foreground/5 p-12 rounded-[2.5rem] flex flex-col justify-center gap-8 shadow-none">
                 <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <X className="h-5 w-5 text-destructive" />
                      <p className="text-xs font-bold uppercase tracking-widest opacity-40">Rule: No shadows</p>
                    </div>
                    <div className="h-24 w-full border-4 border-foreground/10 rounded-[1.5rem] flex items-center justify-center bg-muted/20 shadow-none">
                       <span className="text-sm font-bold opacity-20 tracking-widest">Shadows strictly forbidden</span>
                    </div>
                 </div>
              </div>
              <div className="bg-card border-2 border-foreground/5 p-12 rounded-[2.5rem] flex flex-col justify-center gap-8 shadow-none">
                <div className="space-y-2">
                   <p className="text-xs font-bold uppercase tracking-widest opacity-40">Rule: Balanced casing</p>
                   <div className="space-y-4 pt-4">
                      <p className="text-3xl font-black uppercase tracking-tighter">Headlines are bold.</p>
                      <p className="text-xl font-medium opacity-60">Labels and descriptions use standard case for readability.</p>
                   </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
