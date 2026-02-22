"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BarChart3, Edit2, Trash2, Search, Loader2, Sparkles, Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const surveysQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/surveys`), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: surveys, isLoading: surveysLoading } = useCollection(surveysQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleDeleteSurvey = (surveyId: string) => {
    if (!user) return;
    const surveyRef = doc(db, `users/${user.uid}/surveys/${surveyId}`);
    deleteDocumentNonBlocking(surveyRef);
    toast({ title: "Survey Deleted", description: "The presentation has been removed." });
  };

  const handleLaunchExisting = async (survey: any) => {
    if (!user) return;
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
      const qCol = collection(db, `users/${user.uid}/surveys/${survey.id}/questions`);
      const qSnap = await getDocs(query(qCol, orderBy("order", "asc")));
      const firstQId = qSnap.docs[0]?.id || null;

      await setDoc(sessionRef, {
        id: sessionRef.id,
        pollId: survey.id,
        userId: user.uid,
        title: survey.title || "Untitled Presentation",
        code,
        status: "active",
        currentQuestionId: firstQId,
        createdAt: serverTimestamp(),
        theme: survey.theme || 'orange',
        customColor: survey.customColor || null,
        showResultsToParticipants: true
      });

      router.push(`/presenter/${sessionRef.id}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Launch Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const surveyId = Math.random().toString(36).substr(2, 9);
    router.push(`/presenter/edit/${surveyId}`);
  };

  const filteredSurveys = surveys?.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isUserLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-primary selection:text-primary-foreground">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-32 space-y-10">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
            <Input 
              placeholder="SEARCH YOUR SURVEYS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-16 pl-16 pr-8 rounded-[1.5rem] border-2 bg-card focus-visible:ring-0 font-black text-lg uppercase tracking-tight border-foreground/10 w-full"
            />
          </div>
          <Button 
            size="lg" 
            onClick={handleCreateNew}
            className="h-16 px-10 rounded-[1.5rem] text-sm font-black bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-widest shrink-0 w-full md:w-auto"
          >
            <Plus className="mr-3 h-5 w-5" /> NEW SURVEY
          </Button>
        </div>

        {surveysLoading ? (
          <div className="py-40 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto opacity-10" /></div>
        ) : !filteredSurveys || filteredSurveys.length === 0 ? (
          <div className="py-40 text-center border-2 border-dashed rounded-[1.5rem] bg-muted/20 space-y-6 border-foreground/10">
             <Sparkles className="h-12 w-12 mx-auto opacity-10" />
             <p className="text-xs font-black uppercase opacity-30 tracking-[0.5em]">No surveys found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSurveys.map((survey) => (
              <article key={survey.id} className="bg-card p-6 rounded-[1.5rem] border-2 border-foreground/10 flex flex-col gap-5 group hover:border-primary transition-all h-full relative">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-[0.75rem] flex items-center justify-center border-2 border-foreground/10 shrink-0 bg-muted group-hover:bg-primary/10 transition-colors">
                     <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <Button 
                     variant="ghost" 
                     size="icon"
                     onClick={() => handleDeleteSurvey(survey.id)}
                     className="h-9 w-9 rounded-[0.75rem] hover:text-destructive hover:bg-destructive/5 transition-colors"
                     aria-label={`Delete ${survey.title || "Untitled Survey"}`}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-black tracking-tight uppercase leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {survey.title || "Untitled Survey"}
                  </h3>
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="h-4 w-4" />
                    <time className="text-sm font-black uppercase tracking-wider">
                      {new Date(survey.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-5 border-t-2 border-foreground/10">
                   <Button 
                     variant="ghost" 
                     onClick={() => handleLaunchExisting(survey)}
                     disabled={loading}
                     className="flex-1 h-11 rounded-[1rem] font-black uppercase text-[10px] tracking-widest hover:bg-foreground hover:text-background transition-all"
                   >
                     Launch
                   </Button>
                   <Button 
                     variant="ghost" 
                     onClick={() => router.push(`/presenter/edit/${survey.id}`)}
                     className="h-11 w-11 rounded-[1rem] hover:bg-muted border-2 border-transparent hover:border-foreground/10 flex items-center justify-center"
                     aria-label={`Edit ${survey.title || "Untitled Survey"}`}
                   >
                     <Edit2 className="h-3.5 w-3.5" />
                   </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
