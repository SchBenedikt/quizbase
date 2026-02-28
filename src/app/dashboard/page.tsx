"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BarChart3, Edit2, Trash2, Search, Loader2, Sparkles, Calendar, Play, Compass, Lock, History, ExternalLink, Copy } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, getDocs, serverTimestamp, updateDoc, where, limit } from "firebase/firestore";
import { deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const surveysQuery = useMemoFirebase(() => {
    if (!user || !user.uid || isUserLoading) return null;
    return query(collection(db, `users/${user.uid}/surveys`), orderBy("createdAt", "desc"));
  }, [user, db, isUserLoading]);

  const { data: surveys, isLoading: surveysLoading } = useCollection(surveysQuery);

  // Past sessions query (last 20)
  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !user.uid || isUserLoading) return null;
    return query(collection(db, "sessions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(20));
  }, [user, db, isUserLoading]);
  const { data: pastSessions } = useCollection<{ id: string; title: string; code: string; createdAt: any; isQuiz?: boolean; status?: string }>(sessionsQuery);

  const handleDeleteSurvey = (surveyId: string) => {
    if (!user) return;
    const surveyRef = doc(db, `users/${user.uid}/surveys/${surveyId}`);
    deleteDocumentNonBlocking(surveyRef);
    toast({ title: "Survey deleted", description: "The presentation has been removed." });
  };

  const togglePublic = (surveyId: string, currentStatus: boolean) => {
    if (!user) return;
    const surveyRef = doc(db, `users/${user.uid}/surveys/${surveyId}`);
    updateDoc(surveyRef, { isPublic: !currentStatus });
    toast({ 
      title: !currentStatus ? "Published to Library" : "Moved to Private", 
      description: !currentStatus ? "Anyone can now discover this survey." : "Only you can see this survey now." 
    });
  };

  const handleLaunchExisting = async (survey: any) => {
    if (!user) return;
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
      const sessionData = {
        id: sessionRef.id,
        pollId: survey.id,
        userId: user.uid,
        title: survey.title || "Untitled presentation",
        code,
        status: "active",
        currentQuestionId: "lobby",
        isStarted: false,
        createdAt: serverTimestamp(),
        theme: survey.theme || 'orange',
        customColor: survey.customColor || null,
        isQuiz: survey.isQuiz || false,
        showResultsToParticipants: true
      };

      setDocumentNonBlocking(sessionRef, sessionData, { merge: true });
      router.push(`/presenter/${sessionRef.id}`);
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: sessionRef.path,
        operation: 'create'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const surveyId = Math.random().toString(36).substr(2, 9);
    router.push(`/presenter/edit/${surveyId}`);
  };

  const handleDuplicateSurvey = async (survey: any) => {
    if (!user) return;
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      const newSurveyRef = doc(db, `users/${user.uid}/surveys/${newId}`);
      setDocumentNonBlocking(newSurveyRef, {
        title: `${survey.title || "Untitled"} (Copy)`,
        isPublic: false,
        isQuiz: survey.isQuiz || false,
        shuffleQuestions: survey.shuffleQuestions || false,
        theme: survey.theme || 'orange',
        customColor: survey.customColor || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const questionsSnap = await getDocs(
        query(collection(db, `users/${user.uid}/surveys/${survey.id}/questions`), orderBy("order", "asc"))
      );
      for (const qDoc of questionsSnap.docs) {
        const qData = qDoc.data();
        const newQId = Math.random().toString(36).substr(2, 9);
        const newQRef = doc(db, `users/${user.uid}/surveys/${newId}/questions/${newQId}`);
        setDocumentNonBlocking(newQRef, { ...qData, id: newQId }, { merge: true });
      }

      toast({ title: "Survey duplicated", description: `"${survey.title || "Untitled"}" has been copied.` });
    } catch {
      toast({ title: "Duplicate failed", description: "Could not duplicate the survey." });
    }
  };

  const filteredSurveys = surveys?.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isUserLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#f8f8f7] dark:bg-background flex flex-col font-body selection:bg-primary selection:text-primary-foreground">
      <Header variant="minimal" />
      
      <main className="flex-1 studio-container py-28 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">{t.dashboard.title}</h1>
            <p className="text-base opacity-70">{t.dashboard.subtitle}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
              <Input 
                placeholder={t.dashboard.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-lg border bg-card focus-visible:ring-1 focus-visible:ring-primary font-medium text-base w-full shadow-none"
              />
            </div>
            <Button 
              onClick={handleCreateNew}
              className="h-10 px-5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all uppercase tracking-wider shrink-0 w-full sm:w-auto shadow-none"
            >
              <Plus className="mr-2 h-4 w-4" /> {t.dashboard.newSurvey}
            </Button>
          </div>
        </div>

        {/* ── Quick stats strip ── */}
        {(surveys || pastSessions) && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Surveys", value: surveys?.length ?? 0, icon: BarChart3 },
              { label: "Sessions", value: pastSessions?.length ?? 0, icon: Play },
              { label: "Latest Session", value: pastSessions?.[0]?.title ? pastSessions[0].title.slice(0, 18) + (pastSessions[0].title.length > 18 ? "…" : "") : "—", icon: Calendar },
            ].map((item, i) => (
              <div key={i} className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3 shadow-none">
                <item.icon className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium truncate">{item.label}</p>
                  <p className="text-sm font-bold truncate tabular-nums">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {surveysLoading ? (
          <div className="py-32 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto opacity-20" /></div>
        ) : !filteredSurveys || filteredSurveys.length === 0 ? (
          <div className="py-32 text-center border border-dashed rounded-xl bg-card/50 space-y-3 border-foreground/10 shadow-none">
             <Sparkles className="h-8 w-8 mx-auto opacity-10" />
             <p className="text-sm font-medium opacity-60 uppercase tracking-widest">{t.dashboard.noSurveys}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSurveys.map((survey) => (
              <article key={survey.id} className="bg-card p-5 rounded-xl border border-foreground/8 flex flex-col gap-4 group hover:border-primary/30 transition-all h-full relative shadow-none">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-foreground/8 shrink-0 bg-muted/50 group-hover:bg-primary/10 transition-colors shadow-none">
                       <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => togglePublic(survey.id, !!survey.isPublic)}
                       className={cn("h-7 w-7 rounded-md transition-colors shadow-none", survey.isPublic ? "text-primary" : "text-muted-foreground")}
                       title={survey.isPublic ? t.dashboard.public : t.dashboard.private}
                     >
                       {survey.isPublic ? <Compass className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                     </Button>
                  </div>
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={() => handleDeleteSurvey(survey.id)}
                     className="h-7 w-7 rounded-md hover:text-destructive hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100 shadow-none"
                     aria-label={`Delete ${survey.title || "Untitled Survey"}`}
                   >
                     <Trash2 className="h-3.5 w-3.5" />
                   </Button>
                </div>
                
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold tracking-tight leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {survey.title || "Untitled presentation"}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time className="text-xs font-medium uppercase tracking-wider">
                      {mounted && survey.createdAt ? new Date(survey.createdAt.seconds * 1000).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Draft"}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-foreground/5">
                   <Button 
                     variant="default"
                     onClick={() => handleLaunchExisting(survey)}
                     disabled={loading}
                     className="flex-1 h-9 rounded-lg font-semibold text-sm shadow-none"
                   >
                     <Play className="mr-1.5 h-3 w-3 fill-current" /> {t.dashboard.launch}
                   </Button>
                   <Button 
                     variant="outline" 
                     onClick={() => handleDuplicateSurvey(survey)}
                     className="h-9 w-9 rounded-lg border border-foreground/10 flex items-center justify-center shadow-none p-0"
                     aria-label={`Duplicate ${survey.title || "Untitled Survey"}`}
                   >
                     <Copy className="h-3.5 w-3.5" />
                   </Button>
                   <Button 
                     variant="outline" 
                     onClick={() => router.push(`/presenter/edit/${survey.id}`)}
                     className="h-9 w-9 rounded-lg border border-foreground/10 flex items-center justify-center shadow-none p-0"
                     aria-label={`Edit ${survey.title || "Untitled Survey"}`}
                   >
                     <Edit2 className="h-3.5 w-3.5" />
                   </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Past Sessions ── */}
        {pastSessions && pastSessions.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Past Sessions</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold">{pastSessions.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {pastSessions.map((session) => (
                <div key={session.id} className="bg-card rounded-xl border border-foreground/8 p-4 flex flex-col gap-3 hover:border-primary/30 transition-all shadow-none group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{session.title || "Untitled Session"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded font-bold">{session.code}</span>
                        {session.isQuiz ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Quiz</span>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Survey</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{mounted && session.createdAt ? new Date(session.createdAt.seconds * 1000).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 rounded-lg gap-1.5 text-xs font-semibold shadow-none"
                    onClick={() => router.push(`/presenter/${session.id}/stats`)}
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> View Analytics
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
