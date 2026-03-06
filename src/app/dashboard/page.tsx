"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BarChart3, Edit2, Trash2, Search, Loader2, Sparkles, Calendar, Play, Compass, Lock, History, ExternalLink, Copy, CheckSquare, Square } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SurveyIcon } from "@/components/ui/IconPicker";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, getDocs, serverTimestamp, updateDoc, setDoc, getDoc, where, limit } from "firebase/firestore";
import { deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [authStableTimer, setAuthStableTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Auth state stability detection - prevent premature redirects during Firebase auth resets
  useEffect(() => {
    setMounted(true);
    
    // Clear any existing timer
    if (authStableTimer) {
      clearTimeout(authStableTimer);
      setAuthStableTimer(null);
    }
    
    // Only redirect if auth state is stable and user is genuinely not authenticated
    if (!isUserLoading && !user) {
      // Wait 1 second to ensure auth state has stabilized after potential reset
      const timer = setTimeout(() => {
        // Check one more time - if still no user, then redirect
        if (!user) {
          router.push("/login");
        }
      }, 1000);
      setAuthStableTimer(timer);
    }
  }, [user, isUserLoading, router]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (authStableTimer) {
        clearTimeout(authStableTimer);
      }
    };
  }, [authStableTimer]);

  const surveysQuery = useMemoFirebase(() => {
    if (!user || !user.uid || isUserLoading) return null;
    console.log('[Dashboard] Creating surveys query for user:', user.uid);
    const queryRef = query(collection(db, `users/${user.uid}/surveys`), orderBy("createdAt", "desc"));
    console.log('[Dashboard] Survey query path:', `users/${user.uid}/surveys`);
    return queryRef;
  }, [user, db, isUserLoading]);

  const { data: surveys, isLoading: surveysLoading } = useCollection(surveysQuery);

  // Debug survey data
  useEffect(() => {
    console.log('[Dashboard] Survey data update:', {
      surveys: surveys,
      isLoading: surveysLoading,
      count: surveys?.length || 0,
      userId: user?.uid
    });
  }, [surveys, surveysLoading, user]);

  // Past sessions query (last 50 for potential expansion)
  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !user.uid || isUserLoading) return null;
    return query(collection(db, "sessions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
  }, [user, db, isUserLoading]);
  const { data: pastSessions } = useCollection<{ id: string; title: string; code: string; createdAt: any; isQuiz?: boolean; status?: string }>(sessionsQuery);

  // Calculate displayed sessions based on showAllSessions state
  const displayedSessions = showAllSessions ? pastSessions : pastSessions?.slice(0, 5);

  const handleDeleteSurvey = (surveyId: string) => {
    if (!user) return;
    const surveyRef = doc(db, `users/${user.uid}/surveys/${surveyId}`);
    deleteDocumentNonBlocking(surveyRef);
    toast({ title: "Survey deleted", description: "The presentation has been removed." });
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      // Delete the session document
      const sessionRef = doc(db, "sessions", sessionId);
      await deleteDocumentNonBlocking(sessionRef);
      
      // Delete all related subcollections
      const subcollections = ["responses", "participants", "reactions"];
      for (const subcollection of subcollections) {
        const subcollectionRef = collection(db, `sessions/${sessionId}/${subcollection}`);
        const snapshot = await getDocs(subcollectionRef);
        snapshot.docs.forEach(doc => deleteDocumentNonBlocking(doc.ref));
      }
      
      toast({ title: "Session deleted", description: "The session and all its data have been removed." });
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast({ title: "Delete failed", description: "Could not delete the session. Please try again.", variant: "destructive" });
    }
  };

  const handleBulkDeleteSessions = async () => {
    if (!user || selectedSessions.length === 0) return;
    try {
      for (const sessionId of selectedSessions) {
        // Delete the session document
        const sessionRef = doc(db, "sessions", sessionId);
        await deleteDocumentNonBlocking(sessionRef);
        
        // Delete all related subcollections
        const subcollections = ["responses", "participants", "reactions"];
        for (const subcollection of subcollections) {
          const subcollectionRef = collection(db, `sessions/${sessionId}/${subcollection}`);
          const snapshot = await getDocs(subcollectionRef);
          snapshot.docs.forEach(doc => deleteDocumentNonBlocking(doc.ref));
        }
      }
      
      setSelectedSessions([]);
      toast({ title: "Sessions deleted", description: `${selectedSessions.length} session(s) and all their data have been removed.` });
    } catch (error) {
      console.error("Failed to bulk delete sessions:", error);
      toast({ title: "Delete failed", description: "Could not delete some sessions. Please try again.", variant: "destructive" });
    }
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const toggleAllSessionsSelection = () => {
    if (selectedSessions.length === displayedSessions?.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(displayedSessions?.map(s => s.id) || []);
    }
  };

  // Update selected sessions when displayed sessions change
  useEffect(() => {
    if (displayedSessions) {
      setSelectedSessions(prev => prev.filter(id => displayedSessions.some(s => s.id === id)));
    }
  }, [displayedSessions]);

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

      console.log('[Dashboard] Creating session for survey:', { surveyId: survey.id, isPublic: survey.isPublic, sessionId: sessionRef.id });
      
      // Use blocking setDoc to ensure session is created before redirecting
      await setDoc(sessionRef, sessionData);
      
      // Verify session was created successfully
      const sessionDoc = await getDoc(sessionRef);
      if (!sessionDoc.exists()) {
        throw new Error('Session creation failed - document not found after creation');
      }
      
      console.log('[Dashboard] Session created successfully:', sessionRef.id);
      router.push(`/presenter/${sessionRef.id}`);
    } catch (e: any) {
      console.error('[Dashboard] Failed to create session:', e);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: sessionRef.path,
        operation: 'create'
      }));
      toast({ 
        title: "Failed to launch survey", 
        description: "Could not create session. Please try again.",
        variant: "destructive"
      });
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
        userId: user.uid, // Add userId field to comply with security rules
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sessionCount: 0, // Initialize session count
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
    <div className="min-h-screen bg-background font-sans">
      <Header variant="minimal" />
      <div className="container mx-auto px-6 pt-20 pb-8 max-w-screen-2xl">
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your surveys and track performance</p>
            </div>
            <Button 
              onClick={handleCreateNew}
              className="h-10 px-6 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-2 h-4 w-4" /> New Survey
            </Button>
          </div>
        </div>

        {/* ── Quick stats ── */}
        {(surveys || pastSessions) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Surveys", value: surveys?.length ?? 0, icon: BarChart3 },
              { label: "Total Sessions", value: pastSessions?.length ?? 0, icon: Play },
              { label: "Latest Session", value: pastSessions?.[0]?.title ? pastSessions[0].title.slice(0, 20) + (pastSessions[0].title.length > 20 ? "..." : "") : "—", icon: Calendar },
            ].map((item, i) => (
              <div key={i} className="bg-card border rounded-lg p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-semibold text-foreground truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search ── */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search surveys..."
              className="pl-10 h-10 rounded-md border bg-background"
            />
          </div>
        </div>

        {/* ── Surveys Grid ── */}
        {surveysLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : !filteredSurveys || filteredSurveys.length === 0 ? (
          <div className="py-20 text-center border border-dashed rounded-lg bg-muted/20">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No surveys yet</h3>
            <p className="text-muted-foreground mb-6">Create your first survey to get started</p>
            <Button 
              onClick={handleCreateNew}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Survey
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {filteredSurveys.map((survey) => (
              <div key={survey.id} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                       <SurveyIcon iconName={survey.icon} className="h-4 w-4 text-foreground" />
                    </div>
                    <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => togglePublic(survey.id, !!survey.isPublic)}
                       className="h-6 w-6 hover:bg-muted"
                       title={survey.isPublic ? "Public" : "Private"}
                     >
                       {survey.isPublic ? <Compass className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                     </Button>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDuplicateSurvey(survey)}
                      className="h-6 w-6 hover:bg-muted"
                      title="Duplicate"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => handleDeleteSurvey(survey.id)}
                       className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                       title="Delete"
                     >
                       <Trash2 className="h-3 w-3" />
                     </Button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {survey.title || "Untitled Survey"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      {survey.isQuiz ? "Quiz" : "Survey"}
                    </span>
                    {survey.shuffleQuestions && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        Shuffled
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => router.push(`/presenter/edit/${survey.id}`)}
                  >
                    <Edit2 className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex-1 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => handleLaunchExisting(survey)}
                  >
                    <Play className="mr-1 h-3 w-3" /> Launch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Past Sessions ── */}
        {pastSessions && pastSessions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Recent Sessions</h2>
                <p className="text-sm text-muted-foreground">Your latest survey sessions</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedSessions.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete {selectedSessions.length} selected
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSessions(pastSessions?.map(s => s.id) || []);
                  }}
                  className="h-8 text-xs"
                  disabled={!pastSessions || pastSessions.length === 0}
                >
                  <CheckSquare className="mr-1 h-3 w-3" /> Select all
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSessions([])}
                  className="h-8 text-xs"
                  disabled={selectedSessions.length === 0}
                >
                  Clear selection
                </Button>
                {pastSessions && pastSessions.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedSessions(pastSessions.map(s => s.id));
                      setBulkDeleteDialogOpen(true);
                    }}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete all
                  </Button>
                )}
                {pastSessions.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllSessions(!showAllSessions)}
                    className="text-muted-foreground hover:text-foreground h-8 text-xs"
                  >
                    {showAllSessions ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
            </div>
            {displayedSessions && displayedSessions.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  checked={selectedSessions.length === displayedSessions.length && displayedSessions.length > 0}
                  onCheckedChange={toggleAllSessionsSelection}
                  className="h-4 w-4"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedSessions.length === displayedSessions.length && displayedSessions.length > 0
                    ? "Deselect all"
                    : "Select all"}
                </span>
                {selectedSessions.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedSessions.length} selected)
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedSessions?.map((session) => (
                <div key={session.id} className={cn("bg-card border rounded-lg p-4 hover:shadow-md transition-shadow relative", selectedSessions.includes(session.id) && "ring-2 ring-primary")}>
                  <div className="absolute top-3 left-3">
                    <Checkbox
                      checked={selectedSessions.includes(session.id)}
                      onCheckedChange={() => toggleSessionSelection(session.id)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1 ml-8">
                      <p className="font-medium text-foreground truncate mb-1">{session.title || "Untitled Session"}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{session.code}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {session.isQuiz ? "Quiz" : "Survey"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-muted"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${session.code}`).then(() => toast({ title: "Link copied", description: `Session code: ${session.code}` }))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          setSessionToDelete(session.id);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => router.push(`/p/${session.code}`)}
                    >
                      <Play className="mr-1 h-3 w-3" /> Join
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => router.push(`/presenter/${session.id}/stats`)}
                    >
                      <BarChart3 className="mr-1 h-3 w-3" /> Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Single Session Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone and will remove all session data including responses, participants, and reactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (sessionToDelete) {
                  handleDeleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Sessions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSessions.length} selected session(s)? This action cannot be undone and will remove all session data including responses, participants, and reactions for each session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteSessions}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedSessions.length} Session(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
