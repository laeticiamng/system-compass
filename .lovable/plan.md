

## Audit SEO/GEO - Bilan des 8 tickets

Tous les 8 tickets sont resolus. Aucune modification necessaire.

### Verification fichier par fichier

**index.html**

| Ticket | Statut | Preuve |
|--------|--------|--------|
| SEO-1 (llms.txt statique) | FAIT | Ligne 17 : `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM information" />` |
| SEO-2 (meta description) | FAIT | Ligne 13 : 155 chars, wording "Intelligence decisionnelle pour l'expatriation" |
| SEO-3 (og:image 1200x630) | FAIT | Lignes 24-26 : `og-image.png` + `og:image:width=1200` + `og:image:height=630` |

**src/components/seo/HreflangTags.tsx**

| Ticket | Statut | Preuve |
|--------|--------|--------|
| SEO-4 (hreflang valides) | FAIT | Genere des alternates pour toutes les langues supportees via `SUPPORTED_LANGUAGES`. Le routing `/:lang/*` sert toutes ces routes (pas de 404). `x-default` pointe vers `/en`. |

**public/sitemap.xml**

| Ticket | Statut | Preuve |
|--------|--------|--------|
| SEO-5 (lastmod) | FAIT | Toutes les URLs ont `<lastmod>2026-03-01</lastmod>` ISO-8601 |
| SEO-6 (routes manquantes) | FAIT | 1006 lignes, inclut : `/become-expert`, `/tools/fiscal-calculator`, `/tools/fiscal-simulator`, `/tools/matcher`, `/trace`, `/fiscal/special-regimes`, `/privacy`, `/partners`, toutes avec variantes fr/en et hreflang bidirectionnels |

**src/components/seo/JsonLd.tsx**

| Ticket | Statut | Preuve |
|--------|--------|--------|
| SEO-7 (AggregateRating) | FAIT | Lignes 114-122 : conditionne a `rating.reviewCount > 0` via `useAggregateRating()` hook. Aucune donnee fictive. |
| SEO-8 (URLs localisees) | FAIT | Organization (l.32), SoftwareApplication (l.70), Service (l.140), WebSite (l.259) : tous utilisent `` ${BASE_URL}/${lang} ``. SearchAction template localise (l.266). |

### Conclusion

Aucune action requise. Les 8 tickets sont des tickets de non-regression desormais. L'ensemble canonical/og:url/hreflang/JSON-LD est coherent avec la strategie i18n `/${lang}/`.

