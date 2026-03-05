import SessionDisplayView from './_view';

export function generateStaticParams() {
  return [{ sessionId: '_' }];
}

export default function SessionDisplayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  return <SessionDisplayView params={params} />;
}
