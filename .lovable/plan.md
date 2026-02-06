

# Audit C-Suite v19 -- Corrections finales et reactivation des modules

## Statut global

| Role | Verdict | Detail |
|------|---------|--------|
| CEO | OK | Positionnement clair. Test 3 secondes = PASSE (v17). |
| CISO | OK | RLS actif. Pas de nouveau risque. |
| DPO | OK | GDPR, cookie consent OK. |
| CDO | OK | Analytics coherent. |
| COO | OK | i18n 100% wrappee. |
| Head of Design | OK | Mobile OK. Timeline non-cliquable. Jargon supprime. |
| Beta testeur | 2 BUGS | Prix incoherent sur 2 pages (9,99 au lieu de 9,90). |

## Bug 1 : Prix incoherent entre pages

Le prix Premium a ete mis a jour a 9,90 euros sur la landing page et dans useSubscription, mais 2 fichiers affichent encore **9,99 euros** :

| Fichier | Texte actuel | Correction |
|---------|-------------|------------|
| `src/pages/Pricing.tsx` (ligne 73) | `'9,99€'` | `'9,90€'` |
| `src/pages/CGV.tsx` (ligne 72) | `9,99 € / mois` | `9,90 € / mois` |

## Bug 2 : Feature "Exit Keys personnalisees" dans useSubscription

Le texte `'Exit Keys personnalisées'` dans la liste des features du tier premium (useSubscription.tsx ligne 42) utilise encore le jargon supprime en v17.

**Correction** : `'Recommandations personnalisées'`

## Reactivation des modules masques

13 routes sont actuellement commentees dans `src/routes/index.tsx`. Parmi elles, 9 n'ont pas d'export dans `LazyRoutes.tsx`.

### Etape 1 : Ajouter les exports manquants dans LazyRoutes.tsx

Les pages suivantes existent mais n'ont pas de lazy export :
- `B2BSolutions.tsx` -> `LazyB2BSolutions`
- `LatentModule.tsx` -> `LazyLatentModule`
- `IrreversaModule.tsx` -> `LazyIrreversaModule`
- `PartnerIntegrations.tsx` -> `LazyPartnerIntegrations`
- `Community.tsx` -> `LazyCommunity`
- `SeedTranslations.tsx` -> `LazySeedTranslations`
- `AdminGenerateTranslations.tsx` -> `LazyAdminGenerateTranslations`
- `AdminDatabaseTranslations.tsx` -> `LazyAdminDatabaseTranslations`
- `AdminTranslationsSync.tsx` -> `LazyAdminTranslationsSync`

### Etape 2 : Decommenter les routes dans index.tsx

Decommenter toutes les routes masquees :
- `/partners` (coreRoutes)
- `/errors-illusions` (planningRoutes) 
- `/personas` (learningRoutes)
- `/b2b` (proRoutes)
- `/latent` (proRoutes)
- `/irreversa` (proRoutes)
- `/ovi` (proRoutes)
- `/experts` dans communityRoutes (deja actif dans contentRoutes, supprimer le doublon commente)
- `/partner-services` (communityRoutes)
- `/community` (communityRoutes)
- `/academic` (contentRoutes)
- Routes admin : `/admin/generate-translations`, `/admin/database-translations`, `/admin/translations-sync`, `/seed-translations`

### Etape 3 : Supprimer les redirects devenus inutiles

Les redirects suivants redirigent vers des alternatives car les routes etaient masquees. Ils doivent etre supprimes car les routes reelles sont reactivees :
- `/errors-illusions` redirect (la route directe existe maintenant)
- `/partners` redirect
- `/b2b` redirect
- `/community` redirect
- `/partner-services` redirect
- `/academic` redirect
- `/personas` redirect
- `/latent` redirect
- `/irreversa` redirect
- `/ovi` redirect

## Resume des fichiers modifies

| Fichier | Modifications |
|---------|--------------|
| `src/pages/Pricing.tsx` | Prix 9,99 -> 9,90 |
| `src/pages/CGV.tsx` | Prix 9,99 -> 9,90 |
| `src/hooks/useSubscription.tsx` | "Exit Keys personnalisees" -> "Recommandations personnalisees" |
| `src/routes/LazyRoutes.tsx` | +9 exports lazy manquants |
| `src/routes/index.tsx` | Decommenter 13 routes, supprimer 10 redirects obsoletes |

