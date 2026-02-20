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
    <div className="min-h-screen bg-background p-6 flex items-center justify-center text-primary">
      <div className="max-w-md w-full relative z-10 space-y-12">
        <div className="text-center space-y-6">
          <div className="bg-primary w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-primary rotate-6">
            <Zap className="text-background h-12 w-12" />
          </div>
          <h1 className="text-6xl font-black font-headline tracking-tighter uppercase">Join In.</h1>
          <p className="text-xl font-bold opacity-80 uppercase tracking-wide">Enter the 6-digit code</p>
        </div>

        <Card className="border-4 border-primary rounded-[4rem] overflow-hidden bg-white/10">
          <CardContent className="p-12 space-y-10">
            <div className="space-y-4 text-center">
              <Input 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="000000"
                maxLength={6}
                className="text-7xl font-black text-center h-32 border-none bg-transparent focus-visible:ring-0 uppercase tracking-tighter placeholder:opacity-10 text-primary"
              />
            </div>
            
            <Button 
              disabled={code.length < 6}
              onClick={handleJoin}
              className="w-full h-24 text-2xl font-black rounded-[2.5rem] bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all group"
            >
              Enter Pulse <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.3em] opacity-40">
              <Sparkles className="h-4 w-4" /> Live Connection
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm font-black uppercase opacity-40 tracking-widest">No account required. Join instantly.</p>
      </div>
    </div>
  );
}