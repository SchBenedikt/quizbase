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
    <div className="min-h-screen bg-background p-6 flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="bg-primary w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
            <Zap className="text-white h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black font-headline text-accent">PulsePoll</h1>
          <p className="text-muted-foreground font-medium">Join a presentation instantly</p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-md">
          <CardContent className="p-10 space-y-8">
            <div className="space-y-4 text-center">
              <label className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Session Code</label>
              <Input 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                maxLength={6}
                className="text-5xl font-black text-center h-24 border-none bg-secondary/20 focus-visible:ring-primary rounded-[1.5rem] uppercase tracking-widest placeholder:opacity-30"
              />
            </div>
            
            <Button 
              disabled={code.length < 6}
              onClick={handleJoin}
              className="w-full h-20 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 group transition-all"
            >
              Join Session <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-primary" /> Dynamic Real-time Feedback
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground">By joining, you agree to participate anonymously in this PulsePoll session.</p>
      </div>
    </div>
  );
}