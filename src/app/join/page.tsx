"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowRight, Sparkles, Activity, ShieldCheck, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (code.length >= 6) {
      router.push(`/p/${code.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-body selection:bg-primary selection:text-primary-foreground">
      {/* Background Studio Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full relative z-10 space-y-12">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 border-foreground/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm mb-4">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Studio Signal Active</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase leading-none text-foreground">
            Portal.
          </h1>
          <p className="text-lg md:text-xl font-bold opacity-40 uppercase tracking-widest max-w-sm mx-auto leading-tight">
            Synchronize with the high-stakes pulse.
          </p>
        </header>

        <Card className="border-4 border-foreground rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)]">
          <CardContent className="p-12 md:p-16 space-y-12">
            <div className="space-y-4 text-center">
              <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 block mb-8">
                Enter 6-Digit Session Identifier
              </label>
              <div className="relative">
                <Input 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="000000"
                  maxLength={6}
                  className="text-7xl md:text-9xl font-black text-center h-40 border-none bg-transparent focus-visible:ring-0 uppercase tracking-tighter placeholder:opacity-5 text-primary shadow-none p-0"
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[200px] h-1 bg-foreground/5 rounded-full" />
              </div>
            </div>
            
            <div className="grid gap-6">
              <Button 
                disabled={code.length < 6}
                onClick={handleJoin}
                className="w-full h-24 text-2xl font-black rounded-[1.5rem] bg-foreground text-background border-4 border-foreground hover:bg-transparent hover:text-foreground transition-all group shadow-none"
              >
                JOIN SESSION <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-30">
                  <ShieldCheck className="h-4 w-4" /> Secure Channel
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-30">
                  <Globe className="h-4 w-4" /> Instant Sync
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-30">
                  <Zap className="h-4 w-4 fill-current" /> Zero Barrier
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <footer className="text-center space-y-4 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Registration. Instant Participation.</p>
          <div className="w-12 h-1 bg-foreground/10 mx-auto rounded-full" />
        </footer>
      </div>
    </div>
  );
}
