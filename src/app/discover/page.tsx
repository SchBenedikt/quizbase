
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Sparkles, Globe, Play, User, Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, where, orderBy, doc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export default function DiscoverPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      toast({ title: "Authentication Required", description: "Log in to host a public survey session." });
      router.push("/login");
      return;
    }
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
      const qCol = collection(db, `users/${survey.userId}/surveys/${survey.id}/questions`);
      const qSnap = await getDocs(query(qCol, orderBy("order", "asc")));
      const firstQId = qSnap.docs[0]?.id || null;

      const sessionData = {
        id: sessionRef.id,
        pollId: survey.id,
        userId: user.uid,
        title: survey.title || "Public Session",
        code,
        status: "active",
        currentQuestionId: firstQId,
        createdAt: serverTimestamp(),
        theme: survey.theme || 'orange',
        customColor: survey.customColor || null,
        showResultsToParticipants: true
      };

      setDocumentNonBlocking(sessionRef, sessionData, { merge: true });
      router.push(`/presenter/${sessionRef.id}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Launch Failed", description: "Could not start session." });
    } finally {
      setLoading(false);
    }
  };

  const filteredSurveys = surveys?.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f8f8f7] dark:bg-background flex flex-col font-body">
      <Header variant="minimal" />
      
      <main className="flex-1 studio-container py-32 space-y-12">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border-2 border-primary/10 bg-primary/5">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Public Signal Hub</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Discover.</h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest max-w-lg">
            Explore and host high-stakes interactions created by the Quizbase community.
          </p>
        </header>

        <div className="relative max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20" />
          <Input 
            placeholder="FIND A SURVEY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-16 pl-14 pr-6 rounded-[1.5rem] border-2 bg-card focus-visible:ring-2 font-black text-lg uppercase tracking-tight shadow-sm"
          />
        </div>

        {isLoading ? (
          <div className="py-40 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
        ) : !filteredSurveys || filteredSurveys.length === 0 ? (
          <div className="py-40 text-center border-2 border-dashed rounded-[3rem] bg-card/50 space-y-6 border-foreground/5">
             <Sparkles className="h-12 w-12 mx-auto opacity-10" />
             <p className="text-xs font-black uppercase opacity-20 tracking-[0.4em]">No public signals found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredSurveys.map((survey) => (
              <article key={survey.id} className="bg-card p-8 rounded-[2rem] border-4 border-foreground/5 flex flex-col gap-8 group hover:border-primary/40 transition-all h-full relative shadow-[10px_10px_0px_0px_rgba(0,0,0,0.03)]">
                <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center border-2 border-foreground/5 shrink-0 bg-muted/50 group-hover:bg-primary/10 transition-colors">
                   <Globe className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-black tracking-tight leading-tight uppercase group-hover:text-primary transition-colors">
                    {survey.title || "Public Interaction"}
                  </h3>
                  <div className="flex flex-col gap-2 opacity-40 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      <span>By Community Host</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(survey.createdAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Button 
                   onClick={() => handleLaunch(survey)}
                   disabled={loading}
                   className="w-full h-14 rounded-[1rem] font-black uppercase text-xs tracking-widest gap-3 shadow-none bg-foreground text-background hover:bg-primary hover:text-white transition-all"
                >
                  <Play className="h-4 w-4 fill-current" /> Host Session
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
