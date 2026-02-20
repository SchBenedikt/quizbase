import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Layout, BarChart3, Sparkles, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-poll');

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary">
      {/* Navigation */}
      <header className="px-6 py-8 max-w-7xl mx-auto w-full">
        <nav className="bg-white rounded-full px-8 py-4 flex items-center justify-between shadow-xl shadow-primary/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-headline tracking-tighter">PulsePoll*</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm">
            <Link href="#" className="hover:opacity-70 transition-opacity">Products</Link>
            <Link href="#" className="hover:opacity-70 transition-opacity">Templates</Link>
            <Link href="#" className="hover:opacity-70 transition-opacity">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="rounded-full px-6 font-bold bg-secondary/20">
              <Link href="/join">Log in</Link>
            </Button>
            <Button asChild className="rounded-full px-8 font-bold shadow-xl shadow-primary/20 bg-primary text-primary-foreground">
              <Link href="/presenter">Sign up free</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
              A poll for <br />
              <span className="text-primary/90">everyone.</span>
            </h1>
            <p className="text-xl font-bold max-w-lg leading-relaxed opacity-90">
              Join millions using PulsePoll for their presentations. One link to help you share everything you create and ask from your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="flex-grow bg-white rounded-2xl px-6 py-2 flex items-center shadow-sm border-2 border-transparent focus-within:border-primary/20 transition-all">
                <span className="font-bold opacity-40 mr-1">pulse.ee/</span>
                <Input 
                  placeholder="yourname" 
                  className="border-none bg-transparent focus-visible:ring-0 text-lg font-bold p-0 placeholder:opacity-30"
                />
              </div>
              <Button size="lg" className="h-16 px-10 rounded-full text-lg font-black shadow-2xl shadow-primary/30 group">
                Claim your Pulse <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/pulse1/800/1000"} 
                alt="PulsePoll Interaction"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5]"
                data-ai-hint="presentation interactive"
              />
              <div className="absolute bottom-8 left-8 right-8 text-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-white font-bold tracking-tight">Real-time feedback for creators & speakers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - More expressive cards */}
        <section className="bg-primary py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-6">
              <h2 className="text-5xl md:text-7xl font-black text-background leading-none">Designed for Impact.</h2>
              <p className="text-background/70 text-xl font-bold max-w-2xl mx-auto">Transform boring slides into vibrant conversations.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: Layout, title: "Bold Layouts", desc: "Expressive designs that command attention." },
                { icon: BarChart3, title: "Live Pulse", desc: "Animated charts that react to every vote." },
                { icon: Sparkles, title: "AI Genius", desc: "Refine questions with our smart assistant." },
              ].map((f, i) => (
                <div key={i} className="bg-background p-12 rounded-[3rem] space-y-6 hover:scale-105 transition-transform cursor-default group">
                  <div className="bg-primary text-background w-16 h-16 rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <f.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-black">{f.title}</h3>
                  <p className="text-lg font-bold opacity-70 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-12 font-bold">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black tracking-tighter">PulsePoll*</span>
        </div>
        <div className="flex flex-wrap justify-center gap-10 text-sm uppercase tracking-widest">
          <Link href="#" className="hover:underline">Terms</Link>
          <Link href="#" className="hover:underline">Privacy</Link>
          <Link href="#" className="hover:underline">Cookies</Link>
          <Link href="#" className="hover:underline">Contact</Link>
        </div>
        <p className="text-sm opacity-60 italic">Built for the expressive era.</p>
      </footer>
    </div>
  );
}