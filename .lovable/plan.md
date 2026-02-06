

# Audit C-Suite v16 -- Corrections finales pre-publication

## Statut des corrections precedentes (v1-v15)

| Correction | Statut |
|-----------|--------|
| 40 corrections i18n UI (v1-v13) | RESOLU |
| 785 toast messages dans 37 fichiers (v14 batch 1-3) | RESOLU |
| 8 fichiers oublies v15 | RESOLU |

## Synthese par role

- **CEO** : Plateforme prete. Les derniers fichiers identifies ci-dessous sont la derniere passe avant publication.
- **CISO** : Linter Supabase = 1 warning mineur (extensions in public). Scan securite = 15 findings, tous mitiges par RLS existant. Aucun risque reel. Les findings doivent etre marques comme ignores/contextuels pour nettoyer le rapport.
- **DPO** : Conforme. RLS actif sur toutes les tables sensibles. Anonymisation GDPR active.
- **CDO** : Pipeline analytics coherent. Pas de regression.
- **COO** : 3 hooks restants avec toasts FR non-wrappés identifies.
- **Head of Design** : Apres cette correction, 100% des feedbacks utilisateur seront traduisibles.
- **Beta testeur** : Les hooks Experts, ExpertReviews et Consultations affichent encore des toasts FR durs. 2 composants partenaires aussi.

## Corrections a effectuer

### Partie 1 : i18n -- 5 fichiers restants (~21 toasts)

**useExpertReviews.ts** (~9 toasts) :
- "Vous devez etre connecte pour laisser un avis"
- "La note doit etre entre 1 et 5"
- "Votre avis doit contenir au moins 20 caracteres"
- "Avis soumis pour verification", "Erreur lors de la soumission"
- "Vous devez etre connecte pour voter", "Vous avez deja vote", "Merci pour votre vote", "Erreur lors du vote"
- "Avis supprime", "Impossible de supprimer l'avis"

**useExpertsDb.ts** (~4 toasts) :
- "Statut de verification mis a jour", "Erreur lors de la mise a jour"
- "Statut mis a jour", "Erreur lors de la mise a jour"

**useConsultations.ts** (~6 toasts) :
- "Demande de consultation envoyee", "Erreur lors de la demande"
- "Statut mis a jour", "Erreur lors de la mise a jour"
- "Consultation annulee", "Erreur lors de l'annulation"

**PartnerCostCalculator.tsx** (~1 toast) :
- "Redirection vers {{name}}" + description dynamique

**InsuranceComparator.tsx** (~1 toast) :
- "Redirection vers {{provider}}" + description dynamique

### Hors perimetre (inchange)

- `AdminDatabaseTranslations.tsx` / `AdminCountryGenerator.tsx` : pages admin internes, impact marginal
- `TerrainRealitiesPdfExport.tsx` : toast EN "Export failed" -- acceptable
- `MultiplayerLobby.tsx` : toast simule pour demo ("ExpatExplorer a rejoint le lobby") -- impact nul

### Partie 2 : Securite -- Marquer les 14 findings comme ignores/contextuels

Les 14 findings du scan de securite sont tous mitiges par les RLS existants. Ils doivent etre marques comme ignores avec une justification precise pour chacun :

| Finding | Niveau | Justification |
|---------|--------|---------------|
| Expert data public | ERROR | Protege par vue `experts_public` avec `security_invoker`. Stripe IDs non exposes via la vue. |
| User profile data | ERROR | RLS `auth.uid() = id` actif. Pas de bypass possible sans session valide. |
| Payment information | ERROR | RLS `auth.uid() = user_id` actif. Stripe customer IDs accessibles uniquement par le proprietaire. |
| Consultation details | ERROR | RLS owner + expert. Meeting URLs protegees. |
| Newsletter emails | WARN | Rate limiting actif (trigger `check_newsletter_rate_limit`). Admin-only SELECT. |
| Event registrations | WARN | Rate limiting actif (trigger `check_event_registration_limit`). 5/24h max. |
| Expert reviews | WARN | Moderation active (statut `pending`). RLS owner-only pour modification. |
| Analytics sessions | WARN | RLS owner + admin. Session IDs non predictibles. |
| AI activity log | WARN | RLS owner-only. Donnees operationnelles, pas de PII. |
| User cases | WARN | RLS owner-only. Pas d'acces externe possible. |
| Budget lines | WARN | RLS owner-only via jointure case. Pas d'acces externe. |
| Push subscriptions | INFO | RLS owner-only. Endpoints non enumerables. |
| Gamification | INFO | RLS owner-only. Donnees non sensibles. |
| TraceOS decisions | INFO | RLS owner-only. Archivage automatique actif. |

## Details techniques

### i18n (meme patron que v14-v15)
1. Ajouter `import { useTranslation } from 'react-i18next';`
2. Declarer `const { t } = useTranslation();`
3. Wrapper chaque toast avec `t('cle.i18n', 'Fallback FR')`

### Securite
Utiliser l'outil `manage_security_finding` avec operation `update` et `ignore: true` + `ignore_reason` pour chaque finding.

