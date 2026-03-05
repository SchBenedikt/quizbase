import StatsView from './_view';

export function generateStaticParams() {
  return [{ sessionId: '_' }];
}

export default function StatsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  return <StatsView params={params} />;
}
