
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Compass, Play, User, Calendar, BarChart3, Trophy, Sparkles, Eye, Share2, ExternalLink, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, where, orderBy, doc, collection, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DiscoverPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);

  const CATEGORIES = [
    { key: "all", label: t.discover.all },
    { key: "quiz", label: t.discover.quiz },
    { key: "survey", label: t.discover.survey },
  ];

  const publicSurveysQuery = useMemoFirebase(() => {
    return query(
      collectionGroup(db, "surveys"), 
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
  }, [db]);

  const { data: surveys, isLoading } = useCollection(publicSurveysQuery);

  // Load survey questions for preview
  const loadSurveyQuestions = async (survey: any) => {
    try {
      const questionsQuery = query(
        collection(db, `users/${survey.userId}/surveys/${survey.id}/questions`),
        orderBy("order", "asc")
      );
      const questionsSnapshot = await getDocs(questionsQuery);
      const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSurveyQuestions(questions);
    } catch (error) {
      console.error("Failed to load questions:", error);
      setSurveyQuestions([]);
    }
  };

  // Handle survey preview
  const handlePreview = async (survey: any) => {
    setSelectedSurvey(survey);
    setPreviewOpen(true);
    await loadSurveyQuestions(survey);
  };

  // Handle survey sharing
  const handleShare = async (survey: any) => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/discover/${survey.userId}/${survey.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Survey link copied to clipboard" });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({ title: "Copy failed", description: "Could not copy link to clipboard", variant: "destructive" });
    }
  };

  // Increment session count when launching
  const incrementSessionCount = async (survey: any) => {
    try {
      const surveyRef = doc(db, `users/${survey.userId}/surveys/${survey.id}`);
      await updateDoc(surveyRef, {
        sessionCount: (survey.sessionCount || 0) + 1,
        lastUsedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to increment session count:", error);
    }
  };

  const handleLaunch = async (survey: any) => {
    if (!user) {
      toast({ title: t.auth.signIn, description: "Log in to host a session." });
      router.push("/login");
      return;
    }
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
      const qCol = collection(db, `users/${survey.userId}/surveys/${survey.id}/questions`);
      // Prefetch questions to validate they exist before launching
      await getDocs(query(qCol, orderBy("order", "asc")));

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
      
      // Increment session count
      await incrementSessionCount(survey);
      
      router.push(`/presenter/${sessionRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: t.profile.launchFailed, description: error?.message || "Could not start session." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = surveys?.filter(s => {
    const matchText = s.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = category === 'all' || (category === 'quiz' ? s.isQuiz : !s.isQuiz);
    return matchText && matchCat;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <Header variant="minimal" />
      
      <main className="flex-1 container mx-auto px-6 pt-28 pb-16 space-y-10 max-w-screen-2xl">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t.discover.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            {t.discover.subtitle}
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t.discover.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-4 rounded-lg border bg-card focus-visible:ring-1 focus-visible:ring-primary font-medium shadow-none"
            />
          </div>
          <div className="flex items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={cn(
                  "h-10 px-4 rounded-lg text-xs font-semibold border transition-all shadow-none",
                  category === cat.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-foreground/10 text-foreground/60 hover:border-foreground/30"
                )}
              >
                {cat.label}
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
            <p className="text-sm font-medium opacity-40">{t.discover.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((survey: any) => (
              <article key={survey.id} className="bg-card p-5 rounded-xl border flex flex-col gap-4 group hover:border-primary/30 transition-all shadow-none cursor-pointer" onClick={() => handlePreview(survey)}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center border bg-muted/50 group-hover:bg-primary/10 transition-colors shrink-0">
                    {survey.isQuiz
                      ? <Trophy className="h-4 w-4 text-primary" />
                      : <BarChart3 className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full",
                      survey.isQuiz ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {survey.isQuiz ? t.discover.quiz : t.discover.survey}
                    </span>
                    {survey.sessionCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-2 py-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {survey.sessionCount}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {survey.title || "Public Interaction"}
                  </h3>
                  <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{t.discover.communityHost}</span>
                    </div>
                    {survey.createdAt?.seconds && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{new Date(survey.createdAt.seconds * 1000).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {survey.sessionCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Play className="h-3 w-3 shrink-0" />
                        <span>Hosted {survey.sessionCount} time{survey.sessionCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    onClick={() => handlePreview(survey)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-lg font-semibold text-xs gap-2 shadow-none"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button 
                    onClick={() => handleShare(survey)}
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 rounded-lg font-semibold text-xs gap-2 shadow-none"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    onClick={() => handleLaunch(survey)}
                    disabled={loading}
                    className="flex-1 h-9 rounded-lg font-semibold text-xs gap-2 shadow-none"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> {t.discover.hostSession}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Survey Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedSurvey?.isQuiz ? (
                <Trophy className="h-5 w-5 text-primary" />
              ) : (
                <BarChart3 className="h-5 w-5 text-primary" />
              )}
              {selectedSurvey?.title || "Survey Preview"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSurvey && (
            <div className="space-y-6">
              {/* Survey Info */}
              <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
                <Badge variant={selectedSurvey.isQuiz ? "default" : "secondary"}>
                  {selectedSurvey.isQuiz ? "Quiz" : "Survey"}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{t.discover.communityHost}</span>
                </div>
                {selectedSurvey.createdAt?.seconds && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedSurvey.createdAt.seconds * 1000).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {selectedSurvey.sessionCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Play className="h-4 w-4" />
                    <span>Hosted {selectedSurvey.sessionCount} time{selectedSurvey.sessionCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>{surveyQuestions.length} question{surveyQuestions.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Questions</h3>
                {surveyQuestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Loading questions...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {surveyQuestions.map((question, index) => (
                      <div key={question.id} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h4 className="font-medium leading-tight">{question.question}</h4>
                              {question.description && (
                                <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                              )}
                            </div>
                            
                            {question.options && (
                              <div className="space-y-2">
                                {question.options.map((option: string, optIndex: number) => (
                                  <div key={optIndex} className="flex items-center gap-2 text-sm">
                                    <div className="w-5 h-5 rounded border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground">
                                      {String.fromCharCode(65 + optIndex)}
                                    </div>
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {question.type === 'text' && (
                              <div className="text-sm text-muted-foreground italic">
                                Open text response
                              </div>
                            )}
                            
                            {question.type === 'wordcloud' && (
                              <div className="text-sm text-muted-foreground italic">
                                Word cloud response
                              </div>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {question.timeLimit && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{question.timeLimit}s</span>
                                </div>
                              )}
                              {question.isDoublePoints && (
                                <Badge variant="outline" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Double Points
                                </Badge>
                              )}
                              {question.required && (
                                <Badge variant="secondary" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => handleShare(selectedSurvey)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Share2 className="h-4 w-4" /> Share Survey
                </Button>
                <Button 
                  onClick={() => {
                    setPreviewOpen(false);
                    handleLaunch(selectedSurvey);
                  }}
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  <Play className="h-4 w-4" /> {t.discover.hostSession}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
