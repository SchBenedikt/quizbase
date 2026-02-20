"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (code.length >= 6) {
      router.push(`/p/${code.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center overflow-hidden text-primary">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10 space-y-12">
        <div className="text-center space-y-6">
          <div className="bg-primary w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 rotate-3">
            <Zap className="text-background h-12 w-12" />
          </div>
          <h1 className="text-5xl font-black font-headline tracking-tighter">Enter the Pulse.</h1>
          <p className="text-xl font-bold opacity-80">Type the 6-digit code to join the live session.</p>
        </div>

        <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white">
          <CardContent className="p-12 space-y-10">
            <div className="space-y-4 text-center">
              <Input 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC-DEF"
                maxLength={6}
                className="text-6xl font-black text-center h-32 border-none bg-background/30 focus-visible:ring-primary rounded-[2rem] uppercase tracking-tighter placeholder:opacity-10"
              />
            </div>
            
            <Button 
              disabled={code.length < 6}
              onClick={handleJoin}
              className="w-full h-24 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/30 group transition-all"
            >
              Join Presentation <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.2em] opacity-40">
              <Sparkles className="h-4 w-4" /> Real-time active
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm font-bold opacity-40">Join anonymously. Be heard instantly.</p>
      </div>
    </div>
  );
}