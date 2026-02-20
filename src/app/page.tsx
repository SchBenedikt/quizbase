import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Layout, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-poll');

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary">
      {/* Navigation */}
      <header className="px-6 py-8 max-w-7xl mx-auto w-full">
        <nav className="bg-white/10 border-4 border-primary rounded-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black font-headline tracking-tighter uppercase">PulsePoll*</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest">
            <Link href="#" className="hover:opacity-70 transition-opacity">Products</Link>
            <Link href="#" className="hover:opacity-70 transition-opacity">Templates</Link>
            <Link href="#" className="hover:opacity-70 transition-opacity">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="rounded-full px-6 font-black uppercase text-xs hover:bg-primary hover:text-background">
              <Link href="/join">Log in</Link>
            </Button>
            <Button asChild className="rounded-full px-8 font-black uppercase text-xs bg-primary text-background hover:bg-primary/90">
              <Link href="/presenter">Sign up</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <h1 className="text-7xl md:text-[9rem] font-black leading-[0.85] tracking-tighter uppercase">
              The <br />
              Pulse <br />
              <span className="opacity-40 italic">Live.</span>
            </h1>
            <p className="text-2xl font-bold max-w-lg leading-tight">
              Instant feedback for the modern era. Transform any presentation into a high-octane conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex-grow bg-white/20 rounded-[2rem] px-8 py-2 flex items-center border-4 border-primary transition-all">
                <span className="font-black opacity-40 mr-1">pulse.ee/</span>
                <Input 
                  placeholder="yourname" 
                  className="border-none bg-transparent focus-visible:ring-0 text-xl font-black p-0 placeholder:opacity-30 uppercase"
                />
              </div>
              <Button size="lg" className="h-20 px-12 rounded-[2rem] text-xl font-black bg-primary text-background group border-4 border-primary hover:bg-transparent hover:text-primary transition-all">
                Claim Pulse <ArrowRight className="ml-2 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[4rem] overflow-hidden border-8 border-primary transform lg:-rotate-2">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/pulse1/800/1000"} 
                alt="PulsePoll Interaction"
                width={800}
                height={1000}
                className="object-cover aspect-[4/5] grayscale contrast-125"
                data-ai-hint="presentation interactive"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-primary py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-6">
              <h2 className="text-6xl md:text-9xl font-black text-background leading-none uppercase tracking-tighter">Impactful.</h2>
              <p className="text-background/80 text-2xl font-bold max-w-2xl mx-auto">Bold tools for creators who want to be heard.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Layout, title: "Bold Layouts", desc: "Minimalist, high-contrast designs." },
                { icon: BarChart3, title: "Live Pulse", desc: "Animated data visualization." },
                { icon: Sparkles, title: "AI Refiner", desc: "Smart question suggestions." },
              ].map((f, i) => (
                <div key={i} className="bg-background border-4 border-background p-12 rounded-[4rem] space-y-6 hover:bg-transparent hover:border-background group transition-all cursor-default">
                  <div className="bg-primary text-background w-20 h-20 rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-transform border-4 border-primary">
                    <f.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-4xl font-black uppercase text-primary group-hover:text-background">{f.title}</h3>
                  <p className="text-xl font-bold text-primary opacity-70 group-hover:text-background group-hover:opacity-100">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 max-w-7xl mx-auto w-full border-t-4 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-12 font-black">
        <div className="flex items-center gap-2">
          <span className="text-4xl tracking-tighter uppercase">PulsePoll*</span>
        </div>
        <div className="flex flex-wrap justify-center gap-10 text-xs uppercase tracking-[0.3em]">
          <Link href="#" className="hover:underline">Terms</Link>
          <Link href="#" className="hover:underline">Privacy</Link>
          <Link href="#" className="hover:underline">Contact</Link>
        </div>
        <p className="text-sm opacity-40 uppercase tracking-widest italic">Est. 2024</p>
      </footer>
    </div>
  );
}