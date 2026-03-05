
import type { Metadata } from 'next';
import './globals.css';

export const runtime = 'edge';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthManager } from '@/components/auth/AuthManager';

export const metadata: Metadata = {
  metadataBase: new URL('https://quizbase.xn--schchner-2za.de'),
  title: {
    default: 'Quizbase — Free Live Polls & Interactive Quizzes | No Download Required',
    template: '%s | Quizbase',
  },
  description: 'Create and run live polls, interactive quizzes, word clouds, and audience engagement tools in real-time. Free alternative to Mentimeter and Kahoot. Join instantly with a 6-digit code - no app download needed.',
  keywords: [
    'live polls', 'interactive quizzes', 'audience engagement', 'real-time surveys',
    'mentimeter alternative', 'kahoot alternative', 'live presentation software',
    'word cloud generator', 'interactive classroom tools', 'team building activities',
    'audience response system', 'live voting', 'quiz maker', 'polling software',
    'virtual engagement', 'online quizzes', 'classroom polling', 'meeting polls'
  ],
  authors: [{ name: 'Quizbase Team', url: 'https://quizbase.xn--schchner-2za.de' }],
  creator: 'Quizbase',
  publisher: 'Quizbase',
  category: 'Education',
  classification: 'Educational Software',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    title: 'Quizbase — Free Live Polls & Interactive Quizzes',
    description: 'Create engaging live polls, quizzes, and word clouds. Join instantly with a 6-digit code - no download required. Perfect for classrooms, meetings, and events.',
    type: 'website',
    url: 'https://quizbase.xn--schchner-2za.de',
    siteName: 'Quizbase',
    locale: 'en_US',
    images: [
      { 
        url: '/og-image.png', 
        width: 1200, 
        height: 630, 
        alt: 'Quizbase — Create Live Polls and Interactive Quizzes',
        type: 'image/png'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quizbase — Free Live Polls & Interactive Quizzes',
    description: 'Create engaging live polls and quizzes. Join instantly with a 6-digit code - no download needed.',
    images: ['/og-image.png'],
    creator: '@quizbase',
    site: '@quizbase',
  },
  alternates: {
    canonical: 'https://quizbase.xn--schchner-2za.de',
    languages: {
      'en': 'https://quizbase.xn--schchner-2za.de',
      'de': 'https://quizbase.xn--schchner-2za.de',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: { 
      index: true, 
      follow: true, 
      'max-video-preview': -1, 
      'max-image-preview': 'large', 
      'max-snippet': -1
    },
  },
  verification: {
    google: 'verification-code-here',
    yandex: 'verification-code-here',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Quizbase',
  url: 'https://quizbase.xn--schchner-2za.de',
  description: 'Free live polling and quiz platform. Create interactive surveys, quizzes, word clouds, and audience polls. Join with a 6-digit code — no download required.',
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '1.0',
  author: {
    '@type': 'Organization',
    name: 'Quizbase',
    url: 'https://quizbase.xn--schchner-2za.de'
  },
  offers: { 
    '@type': 'Offer', 
    price: '0', 
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: '2024-01-01'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1'
  },
  featureList: [
    'Live Polling',
    'Interactive Quizzes', 
    'Word Cloud Generation',
    'Real-time Results',
    'Mobile-friendly',
    'No Download Required',
    '6-digit Join Codes',
    'Multiple Question Types'
  ],
  screenshot: 'https://quizbase.xn--schchner-2za.de/og-image.png',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Quizbase',
              url: 'https://quizbase.xn--schchner-2za.de',
              description: 'Free live polling and quiz platform for interactive audience engagement',
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Is Quizbase really free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! Quizbase is completely free to use. No hidden costs, no premium tiers.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do participants need to download an app?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No! Participants can join using any web browser. Just enter the 6-digit code.',
                  },
                },
              ],
            })
          }}
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
                <AuthManager />
                {children}
                <Toaster />
              </LanguageProvider>
            </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
