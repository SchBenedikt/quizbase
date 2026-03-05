import EditPollView from './_view';

export function generateStaticParams() {
  return [{ pollId: '_' }];
}

export default function EditPollPage({ params }: { params: Promise<{ pollId: string }> }) {
  return <EditPollView params={params} />;
}
