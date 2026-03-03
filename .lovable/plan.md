

## Audit de non-régression — 8 tickets SEO/GEO

Tous les 8 tickets sont confirmés résolus. Aucune modification requise.

### Résultats par ticket

| Ticket | Fichier | Statut | Preuve |
|--------|---------|--------|--------|
| **T1** llms.txt statique | `index.html:17` | ✅ | `<link rel="alternate" type="text/plain" href="/llms.txt">` dans `<head>` statique |
| **T2** Meta description | `index.html:13` | ✅ | 155 chars, wording "Intelligence décisionnelle pour l'expatriation" |
| **T3** OG image 1200x630 | `index.html:24-26` | ✅ | `og-image.png` + `og:image:width=1200` + `og:image:height=630` |
| **T4** Hreflang cohérent | `HreflangTags.tsx` | ✅ | Alternates via `SUPPORTED_LANGUAGES`, `x-default` vers `/en` (l.21) |
| **T5** AggregateRating réel | `JsonLd.tsx:114` | ✅ | Conditionné à `rating.reviewCount > 0` — aucune donnée fictive |
| **T6** Sitemap lastmod | `sitemap.xml:11` | ✅ | `<lastmod>2026-03-01</lastmod>` ISO-8601 sur toutes les URLs |
| **T7** Sitemap complet | `sitemap.xml` | ✅ | 1006 lignes, hreflang bidirectionnels fr/en, aucune route admin |
| **T8** JSON-LD URLs localisées | `JsonLd.tsx` | ✅ | Organization, WebSite, Service, SoftwareApplication tous localisés via `${BASE_URL}/${lang}` |

### Seul point d'attention identifié (hors scope tickets)

10 URLs de blog individuel dans le sitemap (lignes 926-985) pointent vers des articles non encore créés ("Article non trouvé"). Ce n'est pas un ticket existant, mais un nettoyage recommandé.

### Conclusion

Ces 8 tickets constituent désormais la baseline de non-régression SEO. Aucune action corrective nécessaire.

