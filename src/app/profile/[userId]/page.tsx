import PublicProfileView from './_view';

export function generateStaticParams() {
  return [{ userId: '_' }];
}

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  return <PublicProfileView params={params} />;
}
