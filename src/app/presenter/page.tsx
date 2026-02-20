"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, AppTheme } from "@/app/types/poll";
import { Zap, ArrowLeft, Sparkles, Plus } from "lucide-react";

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
      <div className="min-h-screen bg-[#f3f3f1] p-6 text-foreground presenter-ui">
        <div className="max-w-4xl mx-auto space-y-12 py-10">
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
    <div className="min-h-screen bg-[#f3f3f1] p-6 flex flex-col items-center justify-center text-foreground presenter-ui">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="bg-foreground w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto animate-float">
          <Zap className="text-white h-12 w-12" />
        </div>
        <div className="space-y-4">
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-none">POPPULSE*</h1>
          <p className="text-xl font-black opacity-40 uppercase tracking-[0.3em]">Command The Vibe.</p>
        </div>

        <Card className="border-8 border-foreground rounded-[4rem] overflow-hidden bg-white">
          <CardHeader className="bg-foreground/5 pb-10 pt-10 border-b-8 border-foreground">
            <CardTitle className="text-4xl font-black uppercase tracking-tighter">READY?</CardTitle>
            <CardDescription className="text-foreground font-bold uppercase text-[10px] tracking-[0.4em] mt-2 opacity-50">Zero lag. Max engagement.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-4">
            <Button 
              className="w-full h-24 text-2xl font-black rounded-[2rem] bg-foreground text-white hover:opacity-90 transition-all uppercase tracking-tighter" 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-3 h-8 w-8" /> CREATE PULSE
            </Button>
            <Button variant="outline" className="w-full h-20 text-sm font-black rounded-[1.5rem] border-4 border-foreground/10 text-foreground hover:bg-foreground hover:text-white uppercase tracking-[0.3em] transition-all">
              SESSION HISTORY
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
