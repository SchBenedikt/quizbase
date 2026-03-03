import { redirect } from "next/navigation";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/server-auth";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase-admin/firestore";
import { PollQuestion } from "@/app/types/poll";
import { Header } from "@/components/layout/Header";
import { PollEditor } from "@/components/poll/PollEditor";

export default async function EditPollPage({ params }: { params: Promise<{ pollId: string }> }) {
  const resolvedParams = await params;
  const pollId = resolvedParams.pollId;
  
  // Check authentication on server
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  
  const db = getAdminFirestore();
  
  try {
    // Fetch poll data
    const pollRef = doc(db, `users/${session.uid}/surveys/${pollId}`);
    const pollDoc = await getDoc(pollRef);
    
    if (!pollDoc.exists()) {
      return (
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Poll not found</h2>
            <p className="text-muted-foreground">The poll you're trying to edit doesn't exist.</p>
          </div>
        </div>
      );
    }
    
    const poll = pollDoc.data();
    
    // Fetch questions
    const questionsQuery = query(
      collection(db, `users/${session.uid}/surveys/${pollId}/questions`), 
      orderBy("order", "asc")
    );
    const questionsSnapshot = await getDocs(questionsQuery);
    const initialQuestions = questionsSnapshot.docs.map(doc => doc.data() as PollQuestion);
    
    return (
      <>
        <Header variant="minimal" />
        <PollEditor 
          initialPoll={poll}
          initialQuestions={initialQuestions}
          pollId={pollId}
        />
      </>
    );
    
  } catch (error) {
    console.error('Error loading poll:', error);
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error loading poll</h2>
          <p className="text-muted-foreground">There was an error loading this poll. Please try again.</p>
        </div>
      </div>
    );
  }
}
