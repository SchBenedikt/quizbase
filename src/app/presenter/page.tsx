"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { Zap, ArrowLeft, Sparkles, Plus } from "lucide-react";

export default function PresenterPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartSession = async (questions: PollQuestion[]) => {
    if (!sessionTitle) {
      alert("Please enter a session title");
      return;
    }

    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionId = Math.random().toString(36).substring(2, 12);

    router.push(`/presenter/${sessionId}?code=${code}&title=${encodeURIComponent(sessionTitle)}`);
    setLoading(false);
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background p-6 text-primary">
        <div className="max-w-5xl mx-auto space-y-16 py-12">
          <div className="flex items-center gap-8">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-20 w-20 border-4 border-primary shadow-none">
              <ArrowLeft className="h-10 w-10" />
            </Button>
            <div className="bg-primary/10 p-6 rounded-[2.5rem] border-4 border-primary/20">
              <Sparkles className="text-primary h-10 w-10" />
            </div>
            <h1 className="text-7xl font-black font-headline uppercase tracking-tighter">NEW PULSE.</h1>
          </div>
          
          <div className="space-y-6">
            <label htmlFor="title" className="text-xs font-black uppercase tracking-[0.5em] opacity-40 ml-4">SESSION IDENTITY</label>
            <Input 
              id="title"
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="E.G. GLOBAL KEYNOTE 2025"
              className="text-5xl font-black h-32 border-8 border-primary bg-white/10 rounded-[3.5rem] px-12 focus-visible:ring-0 uppercase placeholder:opacity-10 shadow-none leading-none"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-primary">
      <div className="max-w-lg w-full text-center space-y-16">
        <div className="bg-primary w-32 h-32 rounded-[4rem] flex items-center justify-center mx-auto border-4 border-primary animate-float">
          <Zap className="text-background h-16 w-16" />
        </div>
        <div className="space-y-6">
          <h1 className="text-8xl font-black font-headline uppercase tracking-tighter leading-none">POP <br /> PULSE.</h1>
          <p className="text-2xl font-bold opacity-70 uppercase tracking-[0.3em]">Command The Vibe.</p>
        </div>

        <Card className="border-8 border-primary rounded-[5rem] overflow-hidden bg-white/10 shadow-none">
          <CardHeader className="bg-primary/10 pb-16 pt-16 border-b-8 border-primary">
            <CardTitle className="text-5xl font-black uppercase tracking-tighter">READY?</CardTitle>
            <CardDescription className="text-primary font-bold uppercase text-xs tracking-[0.4em] mt-4 opacity-50">Zero lag. Maximum impact.</CardDescription>
          </CardHeader>
          <CardContent className="p-12 space-y-6">
            <Button 
              className="w-full h-28 text-3xl font-black rounded-[3rem] bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter shadow-none" 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-4 h-10 w-10" /> CREATE PULSE
            </Button>
            <Button variant="outline" className="w-full h-24 text-xl font-black rounded-[2.5rem] border-4 border-primary/20 text-primary hover:bg-primary hover:text-background uppercase tracking-[0.3em] transition-all shadow-none">
              VIEW HISTORY
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
