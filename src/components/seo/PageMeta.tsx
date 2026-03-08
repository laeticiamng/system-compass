/**
 * Reusable Page Meta component for OG/Twitter tags
 * Uses centralized SITE_CONFIG to avoid hardcoded domains
 */
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';

interface PageMetaProps {
  title: string;
  description: string;
  image?: string;
  type?: string;
}

export function PageMeta({ title, description, image, type = 'website' }: PageMetaProps) {
  const ogImage = image || SITE_CONFIG.ogImageUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
