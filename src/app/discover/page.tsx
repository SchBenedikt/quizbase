
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Compass, Play, User, Calendar, BarChart3, Trophy, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, where, orderBy, doc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";

const CATEGORIES = ['All', 'Quiz', 'Survey'];

export default function DiscoverPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const publicSurveysQuery = useMemoFirebase(() => {
    return query(
      collectionGroup(db, "surveys"), 
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
  }, [db]);

  const { data: surveys, isLoading } = useCollection(publicSurveysQuery);

  const handleLaunch = async (survey: any) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Log in to host a session." });
      router.push("/login");
      return;
    }
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
      const qCol = collection(db, `users/${survey.userId}/surveys/${survey.id}/questions`);
      const qSnap = await getDocs(query(qCol, orderBy("order", "asc")));

      setDocumentNonBlocking(sessionRef, {
        id: sessionRef.id,
        pollId: survey.id,
        userId: user.uid,
        title: survey.title || "Session",
        code,
        status: "active",
        currentQuestionId: "lobby",
        isStarted: false,
        createdAt: serverTimestamp(),
        theme: survey.theme || 'orange',
        customColor: survey.customColor || null,
        isQuiz: survey.isQuiz || false,
        showResultsToParticipants: true
      }, { merge: true });
      router.push(`/presenter/${sessionRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Launch Failed", description: error?.message || "Could not start session." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = surveys?.filter(s => {
    const matchText = s.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = category === 'All' || (category === 'Quiz' ? s.isQuiz : !s.isQuiz);
    return matchText && matchCat;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <Header variant="minimal" />
      
      <main className="flex-1 studio-container pt-28 pb-16 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            Browse and host public surveys and quizzes created by the Quizbase community.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-4 rounded-lg border bg-card focus-visible:ring-1 focus-visible:ring-primary font-medium shadow-none"
            />
          </div>
          <div className="flex items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "h-10 px-4 rounded-lg text-xs font-semibold border transition-all shadow-none",
                  category === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-foreground/10 text-foreground/60 hover:border-foreground/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="py-32 text-center"><Loader2 className="h-7 w-7 animate-spin mx-auto opacity-20" /></div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="py-32 text-center border border-dashed rounded-xl bg-card/50 space-y-3">
            <Sparkles className="h-8 w-8 mx-auto opacity-10" />
            <p className="text-sm font-medium opacity-40">No surveys found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((survey: any) => (
              <article key={survey.id} className="bg-card p-5 rounded-xl border flex flex-col gap-4 group hover:border-primary/30 transition-all shadow-none">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center border bg-muted/50 group-hover:bg-primary/10 transition-colors shrink-0">
                    {survey.isQuiz
                      ? <Trophy className="h-4 w-4 text-primary" />
                      : <BarChart3 className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full",
                    survey.isQuiz ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {survey.isQuiz ? "Quiz" : "Survey"}
                  </span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {survey.title || "Public Interaction"}
                  </h3>
                  <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">Community Host</span>
                    </div>
                    {survey.createdAt?.seconds && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{new Date(survey.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => handleLaunch(survey)}
                  disabled={loading}
                  className="w-full h-9 rounded-lg font-semibold text-xs gap-2 shadow-none"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Host Session
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
