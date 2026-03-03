import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Live Polls & Interactive Quizzes - Quizbase',
  description: 'Explore and join live polls, quizzes, and interactive sessions created by the Quizbase community. Find engaging content for education, meetings, and events.',
  keywords: [
    'discover polls', 'find quizzes', 'live sessions', 'community polls',
    'interactive content', 'educational quizzes', 'meeting polls', 'event engagement',
    'public polls', 'join live sessions', 'quizbase community'
  ],
  openGraph: {
    title: 'Discover Live Polls & Interactive Quizzes',
    description: 'Explore and join engaging live polls and quizzes created by our community.',
    url: 'https://links.xn--schchner-2za.de/discover',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Discover Quizbase Sessions' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Live Polls & Quizzes',
    description: 'Find and join engaging live sessions on Quizbase.',
  },
  alternates: {
    canonical: 'https://links.xn--schchner-2za.de/discover',
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
