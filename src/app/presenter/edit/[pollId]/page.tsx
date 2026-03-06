import EditPollPage from './_view';

export const dynamic = 'force-dynamic';

export default async function EditPollPageWrapper({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params;
  return <EditPollPage pollId={pollId} />;
}

export function generateStaticParams() {
  return [{ pollId: '_' }];
}
