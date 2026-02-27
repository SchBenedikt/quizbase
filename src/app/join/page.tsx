"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowRight, ShieldCheck, Globe } from "lucide-react";

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
      {/* Background subtle gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-sm w-full relative z-10 space-y-6 flex flex-col items-center">
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Join Session
          </h1>
          <p className="text-sm text-foreground/40">Enter your 6-digit session code</p>
        </header>

        <Card className="w-full border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-none transition-all">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3 text-center">
              <div className="relative">
                <Input 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="text-5xl md:text-6xl font-black text-center h-20 border-none bg-transparent focus-visible:ring-0 uppercase tracking-widest placeholder:opacity-10 text-primary shadow-none p-0"
                />
                <div className="w-full h-0.5 bg-foreground/10 rounded-full mt-2" />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Button 
                disabled={code.length < 6}
                onClick={handleJoin}
                className="w-full h-12 font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all group shadow-none"
              >
                Join Session <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="flex items-center justify-center gap-6 pt-1">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider opacity-30">
                  <ShieldCheck className="h-3 w-3" /> Secure
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider opacity-30">
                  <Globe className="h-3 w-3" /> Instant
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider opacity-30">
                  <Zap className="h-3 w-3 fill-current" /> Zero Barrier
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
