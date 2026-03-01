
# Audit SEO/GEO - Correction des problemes critiques et hauts

## Contexte
L'audit a revele 6 categories de problemes. Voici le plan de correction complet.

---

## 1. `index.html` - Lien statique `llms.txt` + meta optimisees (CRITIQUE)

**Probleme** : Les crawlers non-JS (GPTBot, ClaudeBot) ne trouvent pas `llms.txt` car le lien est uniquement dans le composant React `<Helmet>` de Index.tsx.

**Corrections** :
- Ajouter `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM information" />` dans le `<head>` statique de `index.html`
- Mettre a jour la meta description avec un positionnement plus autoritaire ("intelligence decisionnelle", "approche systemique")

---

## 2. og:image 1200x630 (HAUT)

**Probleme** : L'og:image actuelle est l'icone 512x512, trop petite pour le partage social optimal.

**Corrections** :
- Creer un composant ou une reference a une image `og-image.png` de 1200x630 dans `public/`
- Mettre a jour `index.html` avec les bonnes dimensions : `og:image:width=1200`, `og:image:height=630`
- Mettre a jour `og:image` URL vers `/og-image.png`

> Note : L'image physique devra etre fournie par l'utilisateur ou generee. Le code referencera `og-image.png`.

---

## 3. Helmet sur toutes les pages publiques (HAUT)

**Probleme** : 9 pages publiques n'ont pas de `<Helmet>` (pas de title, description, canonical, og:tags).

Pages actuellement AVEC Helmet (9) : Index, Pricing, Blog, BlogArticle, ToolsHub, Countries, Auth, ThematicPaths, About, Privacy

Pages SANS Helmet a corriger :
| Page | Route | Title propose |
|------|-------|---------------|
| Disclaimer | `/disclaimer` | Avertissement - System Compass |
| CGV | `/cgv` | Conditions Generales de Vente - System Compass |
| MentionsLegales | `/mentions-legales` | Mentions Legales - System Compass |
| QuickTest | `/quick-test` | Test Rapide d'Expatriation - System Compass |
| Partners | `/partners` | Programme Partenaires - System Compass |
| ExitKeys | `/exit-keys` | Cles de Sortie - System Compass |
| CompareUnified | `/compare` | Comparateur de Pays - System Compass |
| ProfileMatcher | `/profile-matcher` | Matching Pays-Profil - System Compass |
| FiscalCalculator | `/fiscal-calculator` | Simulateur Fiscal - System Compass |

**Pour chaque page** : ajouter `<Helmet>` avec title, meta description, canonical URL, og:title, og:description.

---

## 4. Sitemap - Routes manquantes + lastmod (HAUT)

**Probleme** : Le sitemap ne contient pas certaines routes publiques et n'a aucun `<lastmod>`.

**Corrections** :
- Ajouter les routes manquantes : `/privacy`, `/partners`, `/thematic-paths` (deja present), `/tools/*`
- Ajouter `<lastmod>2026-03-01</lastmod>` sur toutes les URLs
- Retirer les routes dynamiques non-crawlables (`/country/:id`) ou ajouter les plus populaires en statique

---

## 5. Correction des hreflang (HAUT)

**Probleme** : `HreflangTags.tsx` genere des liens vers `/en/about`, `/en/pricing` etc. qui n'existent pas dans le routeur. Cela penalise le SEO.

**Corrections** :
- Option retenue : Supprimer les hreflang vers `/en/*` puisque le routeur ne gere pas de routes prefixees `/en/`. Garder uniquement `hreflang="fr"` et `hreflang="x-default"` pointant vers la meme URL.
- Quand un vrai routeur i18n sera implemente, reactiver les hreflang en.

---

## 6. AggregateRating fictif (MOYEN)

**Probleme** : Le JSON-LD `SoftwareApplicationJsonLd` contient un `aggregateRating` avec `ratingValue: 4.7, ratingCount: 1250` qui est fictif. Google penalise les donnees structurees inventees.

**Correction** : Supprimer le bloc `aggregateRating` de `JsonLd.tsx`.

---

## Details techniques - Fichiers modifies

| Fichier | Modifications |
|---------|--------------|
| `index.html` | Ajouter lien llms.txt, og:image 1200x630, meta description optimisee |
| `src/components/seo/HreflangTags.tsx` | Retirer hreflang "en", garder "fr" + "x-default" |
| `src/components/seo/JsonLd.tsx` | Supprimer aggregateRating fictif |
| `public/sitemap.xml` | Ajouter routes manquantes + lastmod sur toutes les URLs |
| `src/pages/Disclaimer.tsx` | Ajouter Helmet complet |
| `src/pages/CGV.tsx` | Ajouter Helmet complet |
| `src/pages/MentionsLegales.tsx` | Ajouter Helmet complet |
| `src/pages/QuickTest.tsx` | Ajouter Helmet complet |
| `src/pages/Partners.tsx` | Ajouter Helmet complet |

Optionnellement (pages lazy-loaded importantes) :
| `src/pages/ExitKeys.tsx` | Ajouter Helmet |
| `src/pages/CompareUnified.tsx` | Ajouter Helmet |
| `src/pages/ProfileMatcher.tsx` | Ajouter Helmet |
| `src/pages/FiscalCalculator.tsx` | Ajouter Helmet |

---

## Ordre d'execution

1. `index.html` (critique - statique)
2. `HreflangTags.tsx` (critique - penalite SEO)
3. `JsonLd.tsx` (moyen - penalite donnees structurees)
4. `sitemap.xml` (haut - couverture crawl)
5. Pages sans Helmet (haut - 9 pages en batch)
