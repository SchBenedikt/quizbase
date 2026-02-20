import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, Layout, BarChart3, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-poll');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Zap className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold font-headline tracking-tighter text-accent">PulsePoll</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/join" className="text-sm font-medium hover:text-primary transition-colors">Join Session</Link>
          <Button asChild className="rounded-full px-6 font-semibold shadow-md shadow-primary/10">
            <Link href="/presenter">Create Poll</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-primary shadow-sm border border-primary/10 uppercase tracking-widest">
              <Sparkles className="h-3 w-3" /> Real-time Interaction Redefined
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-accent font-headline">
              Capture the <span className="text-primary underline decoration-indigo-200 underline-offset-8">Pulse</span> of Your Audience
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Create vibrant, real-time polls and quizzes. Engage your participants instantly with dynamic visualizations and AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20">
                <Link href="/presenter">Get Started for Free</Link>
              </Button>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-border shadow-sm">
                <Input 
                  placeholder="Enter 6-digit code" 
                  className="border-none bg-transparent focus-visible:ring-0 w-32 font-bold tracking-widest uppercase"
                />
                <Button variant="ghost" className="rounded-full hover:bg-secondary font-bold">Join</Button>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white animate-float">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/pulse1/800/600"} 
                alt="PulsePoll Dashboard"
                width={800}
                height={600}
                className="object-cover"
                data-ai-hint="presentation software"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-white/50 py-24 px-6 border-y border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-bold text-accent font-headline">Built for Modern Presenters</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to transform passive listeners into active participants.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Layout, title: "Dynamic Layouts", desc: "Craft stunning polls from Multiple Choice to Word Clouds with ease." },
                { icon: BarChart3, title: "Live Visualization", desc: "Watch results stream in instantly with beautiful, animated charts." },
                { icon: Sparkles, title: "AI Assistant", desc: "Let our AI refine your questions for maximum engagement and clarity." },
                { icon: MessageSquare, title: "Open Feedback", desc: "Collect deep qualitative insights through simple open-text responses." },
                { icon: ShieldCheck, title: "Anonymous Voting", desc: "Ensure honest feedback with privacy-first, zero-login voting." },
                { icon: Zap, title: "Instant Setup", desc: "Go live in seconds with unique shareable codes and direct links." },
              ].map((f, i) => (
                <Card key={i} className="border-none bg-white shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group">
                  <CardContent className="p-8 space-y-4">
                    <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-colors">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-accent">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 max-w-7xl mx-auto w-full border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-bold text-accent">PulsePoll</span>
        </div>
        <p className="text-sm">© 2024 PulsePoll. Designed with Material You Expressive principles.</p>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="#">Terms</Link>
          <Link href="#">Privacy</Link>
          <Link href="#">Support</Link>
        </div>
      </footer>
    </div>
  );
}