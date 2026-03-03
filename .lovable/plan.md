

## Audit SEO/GEO - Analyse des 8 tickets

### Statut actuel (deja resolu)

| Ticket | Description | Statut |
|--------|-------------|--------|
| 1 | llms.txt dans HTML statique | FAIT - ligne 17 de index.html |
| 2 | Meta description optimisee | FAIT - 155 caracteres, positionnement "intelligence decisionnelle" |
| 3 | og:image 1200x630 | FAIT - image generee + meta og:image:width/height |
| 5 | AggregateRating fictif | FAIT - hook dynamique useAggregateRating, omis si 0 avis |
| 6 | lastmod au sitemap | FAIT - toutes les URLs ont lastmod ISO 8601 |

### Travail restant (3 tickets)

---

#### Ticket 4 - Coherence hreflang

**Probleme** : `HreflangTags.tsx` genere des balises pour les 13 langues supportees (en, zh, hi, es, ar, pt, fr, de, ja, ru, ko, it, ur). Le routing `/:lang/*` les supporte toutes. Le sitemap ne liste que fr/en.

**Action** : Le sitemap doit rester fr/en (les seules langues avec contenu traduit complet). Les hreflang dynamiques pour 13 langues sont valides car le routing fonctionne. Pas de 404. Aucun changement requis.

---

#### Ticket 7 - Routes manquantes au sitemap

**Probleme** : Plusieurs pages publiques crawlables absentes du sitemap.

Routes publiques manquantes identifiees (comparaison routes/index.tsx vs sitemap.xml) :

- `/become-expert` - page publique d'inscription expert
- `/tools/fiscal-calculator` - calculateur fiscal avance
- `/tools/fiscal-simulator` - simulateur fiscal
- `/tools/matcher` - matcher pays
- `/trace` - journal de trace
- `/fiscal/special-regimes` - regimes speciaux
- `/pyramid-types` (variante en/ manquante)
- `/world-map` (variante en/ manquante)
- `/compare` (variante en/ manquante)
- `/profile-test` (variante en/ manquante)
- `/profile-matcher` (variante en/ manquante)
- `/life-trajectory` (variante en/ manquante)
- `/fiscal-calculator` (variante en/ manquante)
- Plusieurs pages intermediaires sans variante en/ dans le sitemap

Routes a exclure (internes/admin/auth-protegees) : `dashboard`, `usage`, `settings/*`, `admin/*`, `diagnostics`, `seed-translations`, `subscription-success`, `consultation/*/success`

**Action** : Ajouter les routes publiques manquantes avec variantes fr/en et hreflang bidirectionnels. Ajouter les variantes en/ manquantes pour les pages existantes.

---

#### Ticket 8 - JSON-LD URLs sans prefixe langue

**Probleme** : Les schemas JSON-LD dans `JsonLd.tsx` utilisent des URLs hardcodees sans prefixe langue :
- `url: 'https://system-compass.app'` (Organization)
- `url: 'https://system-compass.app'` (Service provider)
- `url: 'https://system-compass.app'` (WebSite)
- `urlTemplate` du SearchAction sans prefixe langue

Ces URLs pointent vers la racine qui redirige, pas vers une page de contenu. Pour la coherence avec les canonical dynamiques (`/fr/`, `/en/`), les URLs JSON-LD devraient pointer vers la version localisee.

**Action** : Rendre les URLs JSON-LD dynamiques en utilisant la langue courante via `useTranslation` / `i18n.language`. Les schemas Organization et WebSite utiliseront `https://system-compass.app/{lang}` et le SearchAction utilisera le template localise.

---

### Plan d'implementation

1. **Sitemap complet** (`public/sitemap.xml`) - Ajouter ~15 URLs manquantes avec variantes fr/en et hreflang. Ajouter les variantes en/ pour les pages qui n'ont que fr/.

2. **JSON-LD localise** (`src/components/seo/JsonLd.tsx`) - Injecter la langue courante dans les URLs des schemas Organization, Service, WebSite et SoftwareApplication.

