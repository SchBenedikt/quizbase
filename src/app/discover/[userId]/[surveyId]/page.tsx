"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, query, orderBy, collection, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { 
  Search, Loader2, Compass, Play, User, Calendar, BarChart3, Trophy, 
  Sparkles, Eye, Share2, ExternalLink, Clock, ArrowLeft, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

export default function SurveySharePage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [survey, setSurvey] = useState<any>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);
  const [surveyLoading, setSurveyLoading] = useState(true);

  const userId = params.userId as string;
  const surveyId = params.surveyId as string;

  // Load survey data
  const surveyRef = useMemoFirebase(() => {
    if (!userId || !surveyId) return null;
    return doc(db, `users/${userId}/surveys/${surveyId}`);
  }, [db, userId, surveyId]);

  const { data: surveyData } = useDoc(surveyRef);

  // Load survey questions
  const loadSurveyQuestions = async () => {
    if (!userId || !surveyId) return;
    try {
      const questionsQuery = query(
        collection(db, `users/${userId}/surveys/${surveyId}/questions`),
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

  // Increment session count when launching
  const incrementSessionCount = async () => {
    if (!surveyRef || !survey) return;
    try {
      await updateDoc(surveyRef, {
        sessionCount: (survey.sessionCount || 0) + 1,
        lastUsedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to increment session count:", error);
    }
  };

  // Handle survey launch
  const handleLaunch = async () => {
    if (!user) {
      toast({ title: t.auth.signIn, description: "Log in to host a session." });
      router.push("/login");
      return;
    }
    if (!survey) return;

    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    
    try {
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
      await incrementSessionCount();
      
      router.push(`/presenter/${sessionRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Launch failed", description: error?.message || "Could not start session." });
    } finally {
      setLoading(false);
    }
  };

  // Handle share link copy
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Survey link copied to clipboard" });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({ title: "Copy failed", description: "Could not copy link to clipboard", variant: "destructive" });
    }
  };

  // Load survey data when it changes
  useEffect(() => {
    if (surveyData) {
      setSurvey(surveyData);
      setSurveyLoading(false);
      loadSurveyQuestions();
    }
  }, [surveyData]);

  // Check if survey exists and is public
  useEffect(() => {
    if (!surveyLoading && (!survey || !survey.isPublic)) {
      router.push("/discover");
    }
  }, [survey, surveyLoading, router]);

  if (surveyLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-body">
        <Header variant="minimal" />
        <main className="flex-1 container mx-auto px-6 pt-28 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Loading survey...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!survey || !survey.isPublic) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-body">
        <Header variant="minimal" />
        <main className="flex-1 container mx-auto px-6 pt-28 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Survey not found</h2>
            <p className="text-muted-foreground mb-4">This survey may not exist or may not be public.</p>
            <Button onClick={() => router.push("/discover")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Discover
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <Header variant="minimal" />
      
      <main className="flex-1 container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push("/discover")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Button>

        {/* Survey Header */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-muted/50">
              {survey.isQuiz ? (
                <Trophy className="h-6 w-6 text-primary" />
              ) : (
                <BarChart3 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {survey.title || "Public Survey"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <Badge variant={survey.isQuiz ? "default" : "secondary"}>
                  {survey.isQuiz ? "Quiz" : "Survey"}
                </Badge>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{t.discover.communityHost}</span>
                </div>
                {survey.createdAt?.seconds && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(survey.createdAt.seconds * 1000).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {survey.sessionCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    <span>Hosted {survey.sessionCount} time{survey.sessionCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>{surveyQuestions.length} question{surveyQuestions.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleShare}
              variant="outline"
              className="gap-2"
            >
              <Copy className="h-4 w-4" /> Copy Link
            </Button>
            <Button 
              onClick={handleLaunch}
              disabled={loading}
              className="gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> {t.discover.hostSession}
            </Button>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions</h2>
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
                          <h3 className="font-medium leading-tight">{question.question}</h3>
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
        </div>
      </main>
    </div>
  );
}
