import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Sign In - Create & Manage Polls | Quizbase',
  description: 'Sign in to Quizbase to create live polls, interactive quizzes, and manage your sessions. Free account with advanced features and analytics.',
  keywords: [
    'sign in', 'login', 'create polls', 'manage quizzes',
    'quizbase account', 'host sessions', 'analytics dashboard',
    'user account', 'session management', 'poll creator'
  ],
  openGraph: {
    title: 'Sign In - Quizbase',
    description: 'Sign in to create and manage your interactive polls and quizzes.',
    url: 'https://quizbase.xn--schchner-2za.de/login',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Quizbase Sign In' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In - Quizbase',
    description: 'Create and manage interactive polls and quizzes with Quizbase.',
  },
  alternates: {
    canonical: 'https://quizbase.xn--schchner-2za.de/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
