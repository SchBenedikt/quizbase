"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { PollQuestion } from "@/app/types/poll";
import { Header } from "@/components/layout/Header";
import { PollEditor } from "@/components/poll/PollEditor";
import { useUser, useFirestore } from "@/firebase";
import { Loader2 } from "lucide-react";
import { useResolvedParam } from "@/hooks/use-resolved-param";

// Force dynamic rendering for this page
export default function EditPollPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId: rawPollId } = use(params);
  const pollId = useResolvedParam(rawPollId, 2);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  // Extended logging for debugging
  useEffect(() => {
    console.log('[EditPollPage] Component mounted');
    console.log('[EditPollPage] pollId:', pollId);
    console.log('[EditPollPage] user:', user?.uid);
    console.log('[EditPollPage] isUserLoading:', isUserLoading);
    console.log('[EditPollPage] db initialized:', !!db);
    console.log('[EditPollPage] window.location:', typeof window !== 'undefined' ? window.location.href : 'SSR');
  }, [pollId, user, isUserLoading, db]);

  const [poll, setPoll] = useState<any>(null);
  const [questions, setQuestions] = useState<PollQuestion[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [authStableTimer, setAuthStableTimer] = useState<NodeJS.Timeout | null>(null);

  // Auth state stability detection - prevent premature redirects during Firebase auth resets
  useEffect(() => {
    console.log('[EditPollPage] Auth state check:', { user: user?.uid, isUserLoading });
    
    // Clear any existing timer
    if (authStableTimer) {
      clearTimeout(authStableTimer);
      setAuthStableTimer(null);
    }
    
    // Only redirect if auth state is stable and user is genuinely not authenticated
    if (!isUserLoading && !user) {
      console.log('[EditPollPage] No user found, waiting for auth stability...');
      // Wait 1 second to ensure auth state has stabilized after potential reset
      const timer = setTimeout(() => {
        console.log('[EditPollPage] Auth stability timeout reached, checking again...');
        // Check one more time - if still no user, then redirect
        if (!user) {
          console.log('[EditPollPage] Confirmed no user after stability check, redirecting to login');
          router.replace("/login");
        } else {
          console.log('[EditPollPage] User found during stability check, staying on page');
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

  useEffect(() => {
    if (!user || !pollId) {
      console.log('[EditPollPage] Missing user or pollId, skipping fetch:', { hasUser: !!user, pollId });
      return;
    }
    const uid = user.uid;

    async function fetchData() {
      try {
        console.log('[EditPollPage] Fetching poll data:', { uid, pollId });
        const pollRef = doc(db, `users/${uid}/surveys/${pollId}`);
        console.log('[EditPollPage] Poll ref path:', pollRef.path);
        const pollDoc = await getDoc(pollRef);

        if (!pollDoc.exists()) {
          console.log('[EditPollPage] Poll not found:', pollId);
          setNotFound(true);
          setDataLoading(false);
          return;
        }

        console.log('[EditPollPage] Poll data loaded:', pollDoc.data());
        setPoll(pollDoc.data());

        const questionsQuery = query(
          collection(db, `users/${uid}/surveys/${pollId}/questions`),
          orderBy("order", "asc")
        );
        console.log('[EditPollPage] Fetching questions from:', `users/${uid}/surveys/${pollId}/questions`);
        const questionsSnapshot = await getDocs(questionsQuery);
        console.log('[EditPollPage] Questions loaded:', questionsSnapshot.docs.length);
        setQuestions(questionsSnapshot.docs.map((d) => d.data() as PollQuestion));
        setDataLoading(false);
      } catch (err) {
        console.error('[EditPollPage] Error loading poll:', err);
        console.error('[EditPollPage] Error details:', {
          name: (err as Error)?.name,
          message: (err as Error)?.message,
          stack: (err as Error)?.stack
        });
        setError(true);
        setDataLoading(false);
      }
    }

    fetchData();
  }, [user, pollId, db]);

  if (isUserLoading || (user && dataLoading) || authStableTimer) {
    console.log('[EditPollPage] Showing loading screen:', { isUserLoading, dataLoading, hasUser: !!user, hasAuthTimer: !!authStableTimer });
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            {isUserLoading ? 'Loading user...' : authStableTimer ? 'Verifying authentication...' : 'Loading poll data...'}
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    console.log('[EditPollPage] Showing not found error');
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Poll not found</h2>
          <p className="text-muted-foreground">The poll you&apos;re trying to edit doesn&apos;t exist.</p>
          <p className="text-xs text-muted-foreground mt-2">Poll ID: {pollId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('[EditPollPage] Showing error screen');
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error loading poll</h2>
          <p className="text-muted-foreground">There was an error loading this poll. Please try again.</p>
          <p className="text-xs text-muted-foreground mt-2">Check browser console for details.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header variant="minimal" />
      <PollEditor
        initialPoll={poll}
        initialQuestions={questions}
        pollId={pollId}
      />
    </>
  );
}
