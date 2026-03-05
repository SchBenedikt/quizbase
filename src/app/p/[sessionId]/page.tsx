import ParticipantView from './_view';

export function generateStaticParams() {
  return [{ sessionId: '_' }];
}

export default function ParticipantPage({ params }: { params: Promise<{ sessionId: string }> }) {
  return <ParticipantView params={params} />;
}
