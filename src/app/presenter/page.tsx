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
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-16 w-16 border-4 border-primary">
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <div className="bg-primary/10 p-4 rounded-[2rem] border-4 border-primary/20">
              <Sparkles className="text-primary h-8 w-8" />
            </div>
            <h1 className="text-5xl font-black font-headline uppercase tracking-tighter">New Pulse</h1>
          </div>
          
          <div className="space-y-4">
            <label htmlFor="title" className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Session Name</label>
            <Input 
              id="title"
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. STRATEGY 2025"
              className="text-4xl font-black h-24 border-4 border-primary bg-white/10 rounded-[2.5rem] px-8 focus-visible:ring-0 uppercase placeholder:opacity-10"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-primary">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="bg-primary w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-primary animate-float">
          <Zap className="text-background h-12 w-12" />
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl font-black font-headline uppercase tracking-tighter">Presenter.</h1>
          <p className="text-xl font-bold opacity-70 uppercase tracking-widest">Command the room.</p>
        </div>

        <Card className="border-4 border-primary rounded-[4rem] overflow-hidden bg-white/10">
          <CardHeader className="bg-primary/10 pb-12 pt-12 border-b-4 border-primary">
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Ready?</CardTitle>
            <CardDescription className="text-primary font-bold uppercase text-xs tracking-widest opacity-60">Create a session in seconds.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-4">
            <Button 
              className="w-full h-24 text-2xl font-black rounded-[2.5rem] bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter" 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-3 h-8 w-8" /> New Pulse
            </Button>
            <Button variant="outline" className="w-full h-20 text-lg font-black rounded-[2rem] border-4 border-primary/20 text-primary hover:bg-primary hover:text-background uppercase tracking-widest transition-all">
              History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}