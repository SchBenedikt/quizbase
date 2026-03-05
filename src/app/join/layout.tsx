import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Live Poll - Enter Code | Quizbase',
  description: 'Join a live poll, quiz, or interactive session instantly with a 6-digit code. No download required - works on any device with a web browser.',
  keywords: [
    'join poll', 'enter code', 'live session', '6-digit code',
    'join quiz', 'participate poll', 'audience response', 'live voting',
    'mobile polling', 'instant join', 'no download required'
  ],
  openGraph: {
    title: 'Join Live Poll - Quizbase',
    description: 'Join any live poll or quiz instantly with a 6-digit code.',
    url: 'https://quizbase.xn--schchner-2za.de/join',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Join Quizbase Session' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Live Poll - Quizbase',
    description: 'Join live polls and quizzes instantly with a 6-digit code.',
  },
  alternates: {
    canonical: 'https://quizbase.xn--schchner-2za.de/join',
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
