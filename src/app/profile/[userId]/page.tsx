"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, BarChart3, Play, Lock, Compass } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { doc, collection, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => doc(db, "users", userId), [db, userId]);
  const { data: profileUser, isLoading: profileLoading } = useDoc<{ name?: string; bio?: string; username?: string }>(userRef);

  const surveysQuery = useMemoFirebase(() =>
    query(collection(db, `users/${userId}/surveys`), where("isPublic", "==", true), orderBy("createdAt", "desc")),
    [db, userId]
  );
  const { data: surveys, isLoading: surveysLoading } = useCollection(surveysQuery);

  const handleLaunch = async (survey: any) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Log in to host a session." });
      router.push("/login");
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionRef = doc(collection(db, "sessions"));
    try {
      const qSnap = await getDocs(query(collection(db, `users/${userId}/surveys/${survey.id}/questions`), orderBy("order", "asc")));
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
        theme: survey.theme || "orange",
        customColor: survey.customColor || null,
        isQuiz: survey.isQuiz || false,
        showResultsToParticipants: true,
      }, { merge: true });
      router.push(`/presenter/${sessionRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Launch failed", description: error?.message || "Could not start session." });
    }
  };

  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin opacity-20" />
    </div>
  );

  const displayName = profileUser?.name || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Header variant="minimal" />

      <main className="flex-1 studio-container py-28 pb-16 space-y-10">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl h-10 w-10 border shadow-none">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Profile hero */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-2xl border bg-card shadow-none">
          <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shrink-0 select-none">
            {initials}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            {profileUser?.username && (
              <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
            )}
            {profileUser?.bio && (
              <p className="text-sm text-foreground/70 max-w-lg mt-2">{profileUser.bio}</p>
            )}
          </div>
        </div>

        {/* Public surveys */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Public Surveys</h2>
          </div>

          {surveysLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto opacity-20" /></div>
          ) : !surveys || surveys.length === 0 ? (
            <div className="py-20 text-center border border-dashed rounded-xl space-y-2">
              <Lock className="h-6 w-6 mx-auto opacity-20" />
              <p className="text-sm font-medium opacity-40">No public surveys yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {surveys.map((survey: any) => (
                <article key={survey.id} className="bg-card p-5 rounded-xl border flex flex-col gap-4 group hover:border-primary/30 transition-all shadow-none">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {survey.title || "Untitled survey"}
                    </h3>
                    {survey.isQuiz && (
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Quiz</span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleLaunch(survey)}
                    className="w-full h-9 rounded-lg text-xs font-semibold gap-2 shadow-none"
                  >
                    <Play className="h-3 w-3 fill-current" /> Host Session
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
