
# Audit Critique Pre-Publication v29 -- Corrections finales

## Synthese Executive

Apres les audits v22-v28, la landing page, l'onboarding et la navigation principale sont propres. La securite est validee (RLS A+, tous les error-level findings resolus). La conformite RGPD est en place.

**Dernier blocage identifie** : ~20 fallbacks hardcodes "Cles de Sortie" / "Exit Key" restent visibles dans les pages internes (dashboard, detail pays, detail erreur, gamification, GDPR export, resources, subscription success, about). Ces termes s'affichent a l'ecran quand la traduction i18n est absente ou incomplete.

---

## Audits specialises -- Verdicts

| Role | Verdict | Blocage |
|------|---------|---------|
| **Marketing** | PRET | Landing page, CTA, pricing -- tout est clair et premium |
| **CEO** | PRET | Comprehension 3s, Hero optimise, funnel coherent |
| **CISO** | PRET | RLS A+, 0 error-level finding, secrets proteges |
| **DPO** | PRET | RGPD conforme (anonymisation, consentement, pages legales) |
| **CDO** | PRET | KPI tracking en place, fausses stats non affichees |
| **COO** | PRET | 749 tests, Edge Functions deployes, i18n 13 langues |
| **Head of Design** | PRET | Premium, responsive, design system coherent |
| **Beta testeur** | BLOQUE | Jargon "Cles de Sortie" visible dans pages internes |

---

## Corrections restantes (toutes P1 -- jargon visible par l'utilisateur)

### Fichiers avec fallbacks hardcodes a corriger

| # | Fichier | Ligne | Fallback actuel | Correction |
|---|---------|-------|----------------|------------|
| 1 | `src/components/CountryExitKeys.tsx` | 80, 95, 116 | `'Clés de Sortie'` | `'Stratégies'` |
| 2 | `src/components/dashboard/DashboardExitKeysWidget.tsx` | 39, 58, 82 | `'Mes Clés de Sortie'` | `'Mes Stratégies'` |
| 3 | `src/components/dashboard/DashboardExitKeysWidget.tsx` | 64 | `"clés de sortie"` | `"stratégies"` |
| 4 | `src/components/dashboard/DashboardExitKeysWidget.tsx` | 69 | `'Explorer les clés'` | `'Explorer les stratégies'` |
| 5 | `src/components/dashboard/CountryProgressTracker.tsx` | 94 | `'Exit Key actif'` | `'Stratégie active'` |
| 6 | `src/pages/ErrorsAndIllusions.tsx` | 377 | `'Explorer les clés de sortie associées'` | `'Explorer les stratégies associées'` |
| 7 | `src/pages/ErrorsAndIllusions.tsx` | 381 | `'Voir les clés de sortie'` | `'Voir les stratégies'` |
| 8 | `src/pages/ExitKeys.tsx` | 351 | `'Assistant Clés de Sortie'` | `'Assistant Stratégies'` |
| 9 | `src/pages/ExitKeys.tsx` | 960 | `'Vos Clés de Sortie'` | `'Vos Stratégies'` |
| 10 | `src/pages/About.tsx` | 281 | `'Clés de Sortie'` (via t avec fallback) | `'Stratégies'` |
| 11 | `src/pages/Resources.tsx` | 376 | `'Clés de Sortie'` | `'Stratégies'` |
| 12 | `src/pages/SubscriptionSuccess.tsx` | 66 | `"Clés de sortie"` | `"Stratégies"` |
| 13 | `src/pages/UniversalErrorDetail.tsx` | 181 | `'Clés de sortie possibles'` | `'Stratégies possibles'` |
| 14 | `src/components/gdpr/GDPRExportButton.tsx` | 40 | `'Clés de sortie'` | `'Stratégies'` |
| 15 | `src/lib/gamification-system.ts` | 157 | `'Créez votre première Exit Key personnalisée'` | `'Créez votre première stratégie personnalisée'` |

---

## Ce qui est deja valide (ne pas toucher)

- Landing page (Index.tsx) : titre, CTA, pricing, micro-texte, CheckCircle verts
- Onboarding dialog : jargon elimine, fallbacks FR
- Footer : "Strategies" comme fallback
- Navigation config (navigation.ts) : "Strategies", "comprendre les differences"
- TestimonialsSection : "analyses detaillees"
- Auth page : Zod, OAuth, password strength, loading/error states
- Securite : RLS, rate limiting, GDPR anonymisation, cookie consent
- CompareExitKeys, ExitKeysCatalog, PreventionFilter, IrreversaModule, LatentModule, PyramidQuiz : deja corriges en v28
- SocialProofBanner, DestinationQuests, SavedExitKeysPanel, ExitKeysPdfExport : deja corriges en v28

---

## Details techniques

### Etape 1 : CountryExitKeys.tsx (3 corrections)
- Lignes 80, 95, 116 : fallback `'Clés de Sortie'` -> `'Stratégies'`

### Etape 2 : DashboardExitKeysWidget.tsx (4 corrections)
- Lignes 39, 58, 82 : `'Mes Clés de Sortie'` -> `'Mes Stratégies'`
- Ligne 64 : `"clés de sortie"` -> `"stratégies"`
- Ligne 69 : `'Explorer les clés'` -> `'Explorer les stratégies'`

### Etape 3 : CountryProgressTracker.tsx (1 correction)
- Ligne 94 : `'Exit Key actif'` -> `'Stratégie active'`

### Etape 4 : ErrorsAndIllusions.tsx (2 corrections)
- Ligne 377 : `'Explorer les clés de sortie associées'` -> `'Explorer les stratégies associées'`
- Ligne 381 : `'Voir les clés de sortie'` -> `'Voir les stratégies'`

### Etape 5 : ExitKeys.tsx (2 corrections)
- Ligne 351 : `'Assistant Clés de Sortie'` -> `'Assistant Stratégies'`
- Ligne 960 : `'Vos Clés de Sortie'` -> `'Vos Stratégies'`

### Etape 6 : About.tsx (1 correction)
- Ligne 281 : fallback `'Clés de Sortie'` -> `'Stratégies'`

### Etape 7 : Resources.tsx (1 correction)
- Ligne 376 : fallback `'Clés de Sortie'` -> `'Stratégies'`

### Etape 8 : SubscriptionSuccess.tsx (1 correction)
- Ligne 66 : `"Clés de sortie"` -> `"Stratégies"`

### Etape 9 : UniversalErrorDetail.tsx (1 correction)
- Ligne 181 : `'Clés de sortie possibles'` -> `'Stratégies possibles'`

### Etape 10 : GDPRExportButton.tsx (1 correction)
- Ligne 40 : `'Clés de sortie'` -> `'Stratégies'`

### Etape 11 : gamification-system.ts (1 correction)
- Ligne 157 : `'Créez votre première Exit Key personnalisée'` -> `'Créez votre première stratégie personnalisée'`

### Verification
- 11 fichiers modifies
- ~18 corrections textuelles
- 0 changement de logique, securite ou base de donnees
- 0 risque de regression (texte et labels uniquement)
- Apres ces corrections : 0 occurrence de "Cles de Sortie" ou "Exit Key" visible par l'utilisateur final

---

## Checklist Publication Ready

- [x] 0 lien mort / 0 page 404 non geree
- [x] 0 bouton sans action
- [x] 0 chevauchement texte / UI cassee
- [x] 0 erreur console bloquante
- [x] Mobile-first impeccable
- [x] Etats UI : loading / empty / error / success
- [x] Securite : secrets proteges, RLS A+, validation Zod
- [x] RGPD : mentions legales, privacy policy, cookies, anonymisation
- [x] Tracking KPI : analytics hooks en place
- [ ] **Jargon interne elimine** : 18 corrections restantes (ce plan)

**Verdict apres application : READY TO PUBLISH = OUI**
