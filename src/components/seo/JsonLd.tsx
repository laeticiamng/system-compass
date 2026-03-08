import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAggregateRating } from '@/hooks/useAggregateRating';
import { SITE_CONFIG } from '@/config/site';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}

// Organization schema — GEO-optimized with localized URL and description
export function OrganizationJsonLd() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const descriptions: Record<string, string> = {
    fr: 'Plateforme de comparaison de pays pour l\'expatriation. Analyse de 80+ pays : fiscalité, visas, coût de la vie, qualité de vie. Trouvez le pays qui correspond à votre profil.',
    en: 'Country comparison platform for expatriation. Analysis of 80+ countries: taxation, visas, cost of living, quality of life. Find the country that fits your profile.',
  };

  const slogans: Record<string, string> = {
    fr: 'Compare les pays avant de partir.',
    en: 'Compare countries before you go.',
  };

  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Compass',
      alternateName: 'Compass - Compare les pays avant de partir',
      url: `${SITE_CONFIG.productionUrl}/${lang}`,
      logo: `${SITE_CONFIG.productionUrl}/icons/icon-512x512.png`,
      description: descriptions[lang] || descriptions.en,
      slogan: slogans[lang] || slogans.en,
      foundingDate: '2025',
      areaServed: 'Worldwide',
      knowsAbout: lang === 'fr' ? [
        'Expatriation',
        'Relocalisation internationale',
        'Fiscalité internationale',
        'Digital nomad visas',
        'Coût de la vie par pays',
        'Qualité de vie expatrié',
        'Mobilité internationale',
        'Optimisation fiscale légale',
        'Immigration',
        'Comparaison de pays',
      ] : [
        'Expatriation',
        'International relocation',
        'International taxation',
        'Digital nomad visas',
        'Cost of living by country',
        'Expat quality of life',
        'International mobility',
        'Legal tax optimization',
        'Immigration',
        'Country comparison',
      ],
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['French', 'English'],
      },
    }} />
  );
}

// SoftwareApplication schema — with real AggregateRating and localized URL
export function SoftwareApplicationJsonLd() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const { data: rating } = useAggregateRating();

  const isFr = lang === 'fr';

  const schemaData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Compass',
    url: `${SITE_CONFIG.productionUrl}/${lang}`,
    description: isFr
      ? 'Application web d\'aide à la décision pour l\'expatriation. Compare 80+ pays sur la fiscalité, les visas, le coût de la vie et la qualité de vie. Test de profil gratuit en 2 minutes.'
      : 'Web application for expatriation decision-making. Compare 80+ countries on taxation, visas, cost of living and quality of life. Free 2-minute profile test.',
    applicationCategory: 'LifestyleApplication',
    applicationSubCategory: 'Expatriation & Relocation',
    operatingSystem: 'Web',
    inLanguage: ['fr', 'en'],
    isAccessibleForFree: true,
    featureList: isFr ? [
      'Comparaison de 80+ pays',
      'Test de profil expatrié en 2 minutes',
      'Simulateur fiscal international',
      'Clés de sortie personnalisées',
      'Intelligence terrain en temps réel',
      'Marketplace d\'experts en expatriation',
      'Export PDF des analyses',
    ] : [
      'Comparison of 80+ countries',
      '2-minute expat profile test',
      'International tax simulator',
      'Personalized exit keys',
      'Real-time ground intelligence',
      'Expatriation expert marketplace',
      'PDF export of analyses',
    ],
    screenshot: `${SITE_CONFIG.productionUrl}/og-image.png`,
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        name: isFr ? 'Gratuit' : 'Free',
        description: isFr ? 'Test rapide, exploration pays, comparaison basique' : 'Quick test, country exploration, basic comparison',
      },
      {
        '@type': 'Offer',
        price: '9.90',
        priceCurrency: 'EUR',
        name: 'Premium',
        description: isFr ? 'Tous les outils avancés, clés de sortie, simulateur fiscal, intelligence live' : 'All advanced tools, exit keys, tax simulator, live intelligence',
        billingPeriod: 'P1M',
      },
      {
        '@type': 'Offer',
        price: '29.90',
        priceCurrency: 'EUR',
        name: 'Pro',
        description: isFr ? 'Dossiers illimités, exports PDF, marketplace d\'experts' : 'Unlimited reports, PDF exports, expert marketplace',
        billingPeriod: 'P1M',
      },
    ],
  };

  if (rating && rating.reviewCount > 0) {
    schemaData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.ratingValue,
      bestRating: 5,
      worstRating: 1,
      reviewCount: rating.reviewCount,
    };
  }

  return <JsonLd data={schemaData} />;
}

// Service schema — localized provider URL and content
export function ServiceJsonLd() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isFr = lang === 'fr';

  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: isFr ? 'Intelligence décisionnelle pour l\'expatriation' : 'Decision intelligence for expatriation',
      provider: {
        '@type': 'Organization',
        name: 'Compass',
        url: `${SITE_CONFIG.productionUrl}/${lang}`,
      },
      description: isFr
        ? 'Analyse systémique de 80+ pays pour planifier votre expatriation. Comparaison fiscale, visas, coût de la vie, sécurité. Approche par compatibilité de profil.'
        : 'Systemic analysis of 80+ countries to plan your expatriation. Tax comparison, visas, cost of living, safety. Profile compatibility approach.',
      serviceType: isFr ? 'Aide à la décision expatriation' : 'Expatriation decision support',
      areaServed: 'Worldwide',
      audience: {
        '@type': 'Audience',
        audienceType: isFr
          ? 'Expatriés potentiels, digital nomads, entrepreneurs internationaux, familles en relocalisation'
          : 'Potential expats, digital nomads, international entrepreneurs, relocating families',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr ? 'Outils System Compass' : 'System Compass Tools',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Comparaison multi-pays' : 'Multi-country comparison',
              description: isFr ? 'Comparez jusqu\'à 4 pays sur fiscalité, visas, coût de la vie, qualité de vie' : 'Compare up to 4 countries on taxation, visas, cost of living, quality of life',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Test de profil expatrié' : 'Expat profile test',
              description: isFr ? 'Quiz de 2 minutes pour identifier vos pays compatibles' : '2-minute quiz to identify your compatible countries',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Simulateur fiscal international' : 'International tax simulator',
              description: isFr ? 'Calcul comparatif d\'impôts entre pays d\'origine et destination' : 'Comparative tax calculation between origin and destination countries',
            },
          },
        ],
      },
    }} />
  );
}

// FAQ Page schema
export function FAQPageJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }} />
  );
}

// BreadcrumbList schema
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }} />
  );
}

// BlogPosting schema
export function BlogPostingJsonLd({ title, description, datePublished, author, url }: {
  title: string;
  description: string;
  datePublished: string;
  author: string;
  url: string;
}) {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: description,
      datePublished: datePublished,
      author: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'System Compass',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_CONFIG.productionUrl}/icons/icon-512x512.png`,
        },
      },
      url: url,
    }} />
  );
}

// WebSite schema with localized SearchAction
export function WebSiteJsonLd() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'System Compass',
      url: `${SITE_CONFIG.productionUrl}/${lang}`,
      description: 'Plateforme d\'intelligence décisionnelle pour la relocalisation internationale. Compare 80+ pays pour ton expatriation.',
      inLanguage: ['fr', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_CONFIG.productionUrl}/${lang}/countries?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }} />
  );
}
