"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { PollQuestion } from "@/app/types/poll";
import { Header } from "@/components/layout/Header";
import { PollEditor } from "@/components/poll/PollEditor";
import { useUser, useFirestore } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function EditPollPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = use(params);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const [poll, setPoll] = useState<any>(null);
  const [questions, setQuestions] = useState<PollQuestion[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user || !pollId) return;
    const uid = user.uid;

    async function fetchData() {
      try {
        const pollRef = doc(db, `users/${uid}/surveys/${pollId}`);
        const pollDoc = await getDoc(pollRef);

        if (!pollDoc.exists()) {
          setNotFound(true);
          setDataLoading(false);
          return;
        }

        setPoll(pollDoc.data());

        const questionsQuery = query(
          collection(db, `users/${uid}/surveys/${pollId}/questions`),
          orderBy("order", "asc")
        );
        const questionsSnapshot = await getDocs(questionsQuery);
        setQuestions(questionsSnapshot.docs.map((d) => d.data() as PollQuestion));
        setDataLoading(false);
      } catch (err) {
        console.error("Error loading poll:", err);
        setError(true);
        setDataLoading(false);
      }
    }

    fetchData();
  }, [user, pollId, db]);

  if (isUserLoading || (user && dataLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (notFound) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Poll not found</h2>
          <p className="text-muted-foreground">The poll you&apos;re trying to edit doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error loading poll</h2>
          <p className="text-muted-foreground">There was an error loading this poll. Please try again.</p>
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
