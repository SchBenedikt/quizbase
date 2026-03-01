
import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://quizbase.app'),
  title: {
    default: 'Quizbase — Live Polls, Quizzes & Audience Interaction',
    template: '%s | Quizbase',
  },
  description: 'Free alternative to Mentimeter and Kahoot. Run live polls, interactive quizzes, word clouds, star ratings and more — no app download required. Join with a 6-digit code.',
  keywords: [
    'live polling', 'interactive quiz', 'audience engagement', 'real-time survey',
    'mentimeter alternative', 'kahoot alternative', 'live presentation tool',
    'word cloud', 'interactive presentation', 'classroom quiz', 'team building',
  ],
  authors: [{ name: 'Quizbase' }],
  creator: 'Quizbase',
  openGraph: {
    title: 'Quizbase — Live Polls, Quizzes & Audience Interaction',
    description: 'Free Mentimeter & Kahoot alternative. Run interactive polls, quizzes, and word clouds in real time — join with a 6-digit code, no download needed.',
    type: 'website',
    url: 'https://quizbase.app',
    siteName: 'Quizbase',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Quizbase — Live Interaction Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quizbase — Live Polls, Quizzes & Audience Interaction',
    description: 'Free Mentimeter & Kahoot alternative. Real-time polls, quizzes, word clouds — join with a 6-digit code.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://quizbase.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Quizbase',
  url: 'https://quizbase.app',
  description: 'Free live polling and quiz platform. Create interactive surveys, quizzes, word clouds, and audience polls. Join with a 6-digit code — no download required.',
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-primary-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
              <LanguageProvider>
                {children}
                <Toaster />
              </LanguageProvider>
            </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
