"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Zap, ArrowLeft, Plus, History } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function PresenterPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartSession = async (questions: PollQuestion[], theme: AppTheme) => {
    if (!sessionTitle) {
      alert("Please enter a session title");
      return;
    }

    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionId = Math.random().toString(36).substring(2, 12);

    router.push(`/presenter/${sessionId}?code=${code}&title=${encodeURIComponent(sessionTitle)}&theme=${theme}`);
    setLoading(false);
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#f3f3f1] presenter-ui">
        <Header variant="minimal" />
        <div className="max-w-4xl mx-auto px-6 space-y-12 py-10 pb-40">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full h-16 w-16 border-4 border-foreground">
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <h1 className="text-5xl font-black uppercase tracking-tighter">NEW SESSION</h1>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-4">TITLE</label>
            <Input 
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value.toUpperCase())}
              placeholder="E.G. Q4 STRATEGY SYNC"
              className="text-4xl font-black h-24 border-8 border-foreground bg-white rounded-[2rem] px-10 focus-visible:ring-0 uppercase placeholder:opacity-10"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f1] presenter-ui flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none">COMMAND<br />CENTER.</h1>
            <p className="text-xl font-black opacity-40 uppercase tracking-[0.3em]">Welcome back, Presenter.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <Card 
               className="border-8 border-foreground rounded-[4rem] bg-primary group hover:bg-foreground transition-all cursor-pointer overflow-hidden"
               onClick={() => setIsCreating(true)}
             >
                <CardContent className="p-12 space-y-8 flex flex-col h-full">
                  <div className="bg-background w-20 h-20 rounded-[2rem] flex items-center justify-center">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black text-background uppercase tracking-tighter">NEW PULSE</h3>
                    <p className="text-background/60 font-black text-[10px] uppercase tracking-[0.3em]">Start a live interactive session</p>
                  </div>
                </CardContent>
             </Card>

             <Card className="border-8 border-foreground rounded-[4rem] bg-white hover:bg-muted/10 transition-all cursor-pointer overflow-hidden">
                <CardContent className="p-12 space-y-8 flex flex-col h-full">
                  <div className="bg-foreground w-20 h-20 rounded-[2rem] flex items-center justify-center">
                    <History className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black text-foreground uppercase tracking-tighter">HISTORY</h3>
                    <p className="text-foreground/40 font-black text-[10px] uppercase tracking-[0.3em]">Access previous session data</p>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Card className="border-8 border-foreground rounded-[4rem] bg-white h-fit sticky top-12">
             <CardContent className="p-10 space-y-8">
                <h4 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-foreground pb-4">STATISTICS</h4>
                <div className="space-y-6">
                  {[
                    { label: "Total Sessions", val: "14" },
                    { label: "Participants Engaged", val: "1,204" },
                    { label: "Vibes Captured", val: "8.4K" }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-end border-b-2 border-foreground/5 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</span>
                      <span className="text-2xl font-black">{stat.val}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 p-6 rounded-[2rem] border-4 border-primary/10">
                   <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Pro Tip</p>
                   <p className="text-xs font-bold uppercase leading-tight">Use Word Clouds for quick audience sentiment checks!</p>
                </div>
             </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}