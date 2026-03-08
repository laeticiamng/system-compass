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
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const descriptions: Record<string, string> = {
    fr: 'Plateforme d\'intelligence décisionnelle pour la relocalisation internationale. Analyse systémique de 80+ pays : fiscalité, visas, coût de la vie, structures de pouvoir. Approche unique par profils compatibles plutôt que classements génériques.',
    en: 'Decision intelligence platform for international relocation. Systemic analysis of 80+ countries: taxation, visas, cost of living, power structures. Unique approach by compatible profiles rather than generic rankings.',
  };

  const slogans: Record<string, string> = {
    fr: 'Comparez les systèmes, pas les clichés.',
    en: 'Compare systems, not stereotypes.',
  };

  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'System Compass',
      alternateName: 'System Compass - Intelligence Expatriation',
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

  const schemaData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'System Compass',
    url: `${SITE_CONFIG.productionUrl}/${lang}`,
    description: 'Application web d\'aide à la décision pour l\'expatriation. Compare 80+ pays sur la fiscalité, les visas, le coût de la vie et la qualité de vie. Test de profil gratuit en 2 minutes.',
    applicationCategory: 'LifestyleApplication',
    applicationSubCategory: 'Expatriation & Relocation',
    operatingSystem: 'Web',
    inLanguage: ['fr', 'en'],
    isAccessibleForFree: true,
    featureList: [
      'Comparaison de 80+ pays',
      'Test de profil expatrié en 2 minutes',
      'Simulateur fiscal international',
      'Clés de sortie personnalisées',
      'Intelligence terrain en temps réel',
      'Marketplace d\'experts en expatriation',
      'Export PDF des analyses',
    ],
    screenshot: `${SITE_CONFIG.productionUrl}/og-image.png`,
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        name: 'Gratuit',
        description: 'Test rapide, exploration pays, comparaison basique',
      },
      {
        '@type': 'Offer',
        price: '9.90',
        priceCurrency: 'EUR',
        name: 'Premium',
        description: 'Tous les outils avancés, clés de sortie, simulateur fiscal, intelligence live',
        billingPeriod: 'P1M',
      },
      {
        '@type': 'Offer',
        price: '29.90',
        priceCurrency: 'EUR',
        name: 'Pro',
        description: 'Dossiers illimités, exports PDF, marketplace d\'experts',
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

// Service schema — localized provider URL
export function ServiceJsonLd() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Intelligence décisionnelle pour l\'expatriation',
      provider: {
        '@type': 'Organization',
        name: 'System Compass',
        url: `${SITE_CONFIG.productionUrl}/${lang}`,
      },
      description: 'Analyse systémique de 80+ pays pour planifier votre expatriation. Comparaison fiscale, visas, coût de la vie, sécurité. Approche par compatibilité de profil.',
      serviceType: 'Aide à la décision expatriation',
      areaServed: 'Worldwide',
      audience: {
        '@type': 'Audience',
        audienceType: 'Expatriés potentiels, digital nomads, entrepreneurs internationaux, familles en relocalisation',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Outils System Compass',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Comparaison multi-pays',
              description: 'Comparez jusqu\'à 4 pays sur fiscalité, visas, coût de la vie, qualité de vie',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Test de profil expatrié',
              description: 'Quiz de 2 minutes pour identifier vos pays compatibles',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Simulateur fiscal international',
              description: 'Calcul comparatif d\'impôts entre pays d\'origine et destination',
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
