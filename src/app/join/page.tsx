"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowRight, Activity, ShieldCheck, Globe } from "lucide-react";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (code.length >= 6) {
      router.push(`/p/${code.toUpperCase()}`);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8f8f7] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 md:p-8 font-body selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Background Studio Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full relative z-10 space-y-8 flex flex-col items-center">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border-2 border-foreground/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Studio Signal Active</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none text-foreground">
              Portal.
            </h1>
            <p className="text-xs md:text-sm font-bold opacity-40 uppercase tracking-widest leading-tight">
              Synchronize with the high-stakes pulse.
            </p>
          </div>
        </header>

        <Card className="w-full border-4 border-foreground rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] transition-all">
          <CardContent className="p-8 md:p-12 space-y-10">
            <div className="space-y-4 text-center">
              <label className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 block">
                Enter 6-Digit Session Identifier
              </label>
              <div className="relative">
                <Input 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="text-7xl md:text-8xl font-black text-center h-24 md:h-32 border-none bg-transparent focus-visible:ring-0 uppercase tracking-tighter placeholder:opacity-5 text-primary shadow-none p-0"
                />
                <div className="w-full h-1 bg-foreground/5 rounded-full mt-2" />
              </div>
            </div>
            
            <div className="grid gap-6">
              <Button 
                disabled={code.length < 6}
                onClick={handleJoin}
                className="w-full h-20 text-xl font-black rounded-[1.25rem] bg-foreground text-background border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all group shadow-none"
              >
                JOIN SESSION <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              <div className="flex items-center justify-center gap-8 pt-2">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-30">
                  <ShieldCheck className="h-3 w-3" /> Secure
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-30">
                  <Globe className="h-3 w-3" /> Instant
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-30">
                  <Zap className="h-3 w-3 fill-current" /> Zero Barrier
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <footer className="text-center opacity-30 mt-4">
          <p className="text-[8px] font-black uppercase tracking-[0.4em]">No Registration Required. Instant Participation.</p>
        </footer>
      </div>
    </div>
  );
}
