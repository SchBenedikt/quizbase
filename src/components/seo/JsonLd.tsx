'use client';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Quizbase',
    url: 'https://quizbase.app',
    logo: 'https://quizbase.app/logo.png',
    description: 'Free live polling and quiz platform for interactive audience engagement',
    sameAs: [
      'https://twitter.com/quizbase',
      'https://github.com/quizbase',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://quizbase.app/support',
    },
  };

  return <JsonLd data={organizationData} />;
}

export function WebApplicationJsonLd() {
  const appData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Quizbase',
    url: 'https://quizbase.app',
    description: 'Free live polling and quiz platform. Create interactive surveys, quizzes, word clouds, and audience polls.',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    author: {
      '@type': 'Organization',
      name: 'Quizbase',
      url: 'https://quizbase.app'
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
    screenshot: 'https://quizbase.app/og-image.png',
  };

  return <JsonLd data={appData} />;
}

export function FAQJsonLd() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Quizbase really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Quizbase is completely free to use. No hidden costs, no premium tiers - all features are available for everyone.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do participants need to download an app?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No! Participants can join using any web browser on their phone, tablet, or computer. Just enter the 6-digit code.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many people can join a session?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Quizbase supports unlimited participants. Whether you have 10 or 10,000 people, everyone can join and participate.',
        },
      },
      {
        '@type': 'Question',
        name: 'What question types are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Quizbase offers 9 different question types: Multiple Choice, True/False, Star Rating, Open Text, Word Cloud, Slider, Scale, Ranking, and Guess the Number.',
        },
      },
    ],
  };

  return <JsonLd data={faqData} />;
}
