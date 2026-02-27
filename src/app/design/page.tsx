
"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Zap, Palette, Type, Box, Move, Layers, Sparkles } from "lucide-react";

export default function DesignSystemPage() {
  const colors = [
    { name: "Electric Orange (Primary)", hex: "#ff9312", hsl: "33 100% 50%", usage: "Interactive elements, branding, primary actions." },
    { name: "Midnight (Background)", hex: "#0a0a0a", hsl: "0 0% 3.9%", usage: "Core background for dark mode and cinematic sessions." },
    { name: "Studio White", hex: "#ffffff", hsl: "0 0% 100%", usage: "Core background for light mode and content areas." },
    { name: "Surgical Border", hex: "Foreground/10", hsl: "Var-Border", usage: "Standard 2px borders for layout components." },
  ];

  const themes = [
    { name: "Acid Green", bg: "#d2e822", fg: "#254e1a", description: "High-visibility, energetic interactions." },
    { name: "Deep Red", bg: "#780c16", fg: "#e9c0e9", description: "Dramatic, high-stakes environments." },
    { name: "Studio Blue", bg: "#0d99ff", fg: "#ffffff", description: "Professional, broadcast-ready clarity." },
  ];

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary selection:text-primary-foreground flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-grow pt-40 pb-24">
        <div className="studio-container space-y-24">
          {/* Hero Section */}
          <header className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border-2 border-primary/20 bg-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Blueprint</span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              Visual <br />
              <span className="text-primary">Architecture.</span>
            </h1>
            <p className="text-2xl font-bold opacity-40 leading-tight uppercase tracking-tight">
              The high-octane design system behind the Quizbase interaction studio.
            </p>
          </header>

          {/* Color Palette */}
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <Palette className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">01. Color Palette</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {colors.map((color) => (
                <div key={color.name} className="group">
                  <div 
                    className="h-48 rounded-[2rem] border-4 border-foreground/5 mb-6 shadow-xl transition-transform group-hover:-rotate-2 duration-500" 
                    style={{ backgroundColor: color.hex.startsWith('#') ? color.hex : 'transparent' }}
                  />
                  <div className="space-y-2">
                    <h3 className="font-black uppercase tracking-tight text-xl">{color.name}</h3>
                    <p className="text-xs font-mono opacity-40">{color.hsl}</p>
                    <p className="text-sm font-bold opacity-60 leading-snug">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Themes */}
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <Layers className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">02. Dynamic Themes</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {themes.map((theme) => (
                <div key={theme.name} className="p-10 rounded-[2.5rem] border-4 border-foreground/5 space-y-6" style={{ backgroundColor: theme.bg, color: theme.fg }}>
                  <Zap className="h-10 w-10 fill-current" />
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{theme.name}</h3>
                  <p className="text-lg font-bold opacity-70 uppercase tracking-tight leading-none">{theme.description}</p>
                  <div className="pt-6 flex gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-current opacity-30" />
                    <div className="h-8 w-8 rounded-full border-2 border-current opacity-60" />
                    <div className="h-8 w-8 rounded-full border-2 border-current opacity-100" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <Type className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">03. Typography</h2>
            </div>
            <div className="bg-card border-2 border-foreground/5 p-16 rounded-[3rem] space-y-12">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.5em] opacity-40">Primary Typeface: Bricolage Grotesque</p>
                <h3 className="text-9xl font-black uppercase tracking-tighter leading-none">The Stage.</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-12 pt-12 border-t-2 border-foreground/5">
                <div className="space-y-4">
                  <p className="text-5xl font-black uppercase tracking-tighter">Bold Impact.</p>
                  <p className="text-lg opacity-60 font-bold leading-tight">Used for headlines, authoritative indicators, and high-stakes numeric data.</p>
                </div>
                <div className="space-y-4">
                  <p className="text-2xl font-bold uppercase tracking-tight">System Readability.</p>
                  <p className="text-lg opacity-60 font-medium leading-relaxed">Used for descriptions, labels, and secondary UI metadata.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Core Elements */}
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <Box className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-black uppercase tracking-tighter">04. Core Elements</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-card border-2 border-foreground/5 p-12 rounded-[2.5rem] flex flex-col justify-center gap-8">
                 <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">The Surgical Border</p>
                    <div className="h-20 w-full border-4 border-foreground/5 rounded-[1.5rem] flex items-center justify-center">
                       <span className="text-sm font-black uppercase opacity-20 tracking-widest">2px / 4px Standard</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">The Studio Radius</p>
                    <div className="flex gap-4">
                       <div className="h-20 w-20 bg-muted rounded-[1.5rem] border-2 border-foreground/5" />
                       <div className="h-20 w-20 bg-muted rounded-[2rem] border-2 border-foreground/5" />
                       <div className="h-20 w-20 bg-muted rounded-[2.5rem] border-2 border-foreground/5" />
                    </div>
                 </div>
              </div>
              <div className="bg-card border-2 border-foreground/5 p-12 rounded-[2.5rem] flex flex-col justify-center gap-8">
                <div className="space-y-2">
                   <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Motion & State</p>
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1rem] bg-primary animate-pulse" />
                      <div className="w-16 h-16 rounded-[1rem] bg-primary animate-float" />
                      <span className="text-xs font-black uppercase tracking-widest opacity-30">Active Signal States</span>
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
