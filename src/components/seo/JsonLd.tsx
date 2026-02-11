import { Helmet } from 'react-helmet-async';

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

// Organization schema for the whole site
export function OrganizationJsonLd() {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'System Compass',
      alternateName: 'System Compass',
      url: 'https://world-alignment.lovable.app',
      logo: 'https://world-alignment.lovable.app/icons/icon-512x512.png',
      description: 'Plateforme d\'intelligence décisionnelle pour la relocalisation internationale. Analysez les systèmes des pays et planifiez votre expatriation.',
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['French', 'English'],
      },
    }} />
  );
}

// SoftwareApplication schema
export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'System Compass',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          name: 'Free',
        },
        {
          '@type': 'Offer',
          price: '9.90',
          priceCurrency: 'EUR',
          name: 'Premium',
          billingPeriod: 'P1M',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.7',
        ratingCount: '1250',
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
          url: 'https://world-alignment.lovable.app/icons/icon-512x512.png',
        },
      },
      url: url,
    }} />
  );
}
