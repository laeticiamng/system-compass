

## Audit de non-régression SEO/GEO — 8 tickets (baseline confirmée)

Les 8 tickets ont déjà été audités et validés lors de la session précédente. Aucune modification de code n'est requise.

### Statut par ticket

| # | Item | Fichier | Statut | Preuve |
|---|------|---------|--------|--------|
| T1 | `llms.txt` statique | `index.html:17` | ✅ | `<link rel="alternate" type="text/plain" href="/llms.txt">` dans `<head>` |
| T2 | Meta description ≤160 chars | `index.html:13` | ✅ | 155 caractères, wording aligné branding |
| T3 | OG image 1200×630 | `index.html:24-26` | ✅ | `og:image` + `og:image:width` + `og:image:height` déclarés |
| T4 | Hreflang cohérent | `HreflangTags.tsx` | ✅ | `SUPPORTED_LANGUAGES` + `x-default` → `/en` |
| T5 | AggregateRating réel | `JsonLd.tsx:114` | ✅ | Conditionné `reviewCount > 0`, hook `useAggregateRating` |
| T6 | Sitemap lastmod ISO | `sitemap.xml` | ✅ | `<lastmod>2026-03-01</lastmod>` sur toutes URLs |
| T7 | Routes publiques only | `sitemap.xml` | ✅ | 1006 lignes, aucune route admin/protégée |
| T8 | JSON-LD URLs localisées | `JsonLd.tsx` | ✅ | Tous schemas via `${BASE_URL}/${lang}` |

### Point d'attention hors scope

10 URLs blog fantômes dans le sitemap (lignes 926-985) retournent "Article non trouvé" — nettoyage recommandé en P3.

### Conclusion

Aucune action corrective. Cette baseline sert de référence pour tous les audits SEO/GEO futurs.

