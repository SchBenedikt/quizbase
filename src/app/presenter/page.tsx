"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PollCreator } from "@/components/poll/PollCreator";
import { PollQuestion, PollSession } from "@/app/types/poll";
import { db } from "@/app/lib/db";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { Zap, ArrowLeft, Loader2, Sparkles } from "lucide-react";

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

    const session: PollSession = {
      id: sessionId,
      code,
      title: sessionTitle,
      questions,
      currentQuestionIndex: 0,
      status: 'active',
      createdAt: Date.now()
    };

    try {
      // In a real app, use doc(db, 'sessions', sessionId)
      // await setDoc(doc(db, "sessions", sessionId), session);
      // For this demo, we'll just navigate to the dashboard with local state or URL
      router.push(`/presenter/${sessionId}?code=${code}&title=${encodeURIComponent(sessionTitle)}`);
    } catch (e) {
      console.error("Error creating session", e);
    } finally {
      setLoading(false);
    }
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="bg-primary/10 p-2 rounded-xl">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-accent">New Presentation</h1>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold text-muted-foreground uppercase">Presentation Title</Label>
            <Input 
              id="title"
              value={sessionTitle} 
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Q4 Strategy Workshop"
              className="text-2xl font-bold h-16 border-none bg-white shadow-sm focus-visible:ring-primary rounded-2xl px-6"
            />
          </div>

          <PollCreator onSave={handleStartSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="bg-primary w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 animate-float">
          <Zap className="text-white h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-headline text-accent">Presenter Portal</h1>
          <p className="text-muted-foreground">Transform your meetings with interactive polling.</p>
        </div>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-secondary/30 pb-10 pt-10">
            <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
            <CardDescription>Create a new interactive session in seconds.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <Button 
              className="w-full h-16 text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95" 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-2 h-5 w-5" /> Create New Poll
            </Button>
            <Button variant="outline" className="w-full h-16 text-lg rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/5">
              View My History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, ...props }: any) {
  return <label {...props}>{children}</label>;
}

function Plus(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
}