

# Audit C-Suite v17 -- Comprehension en 3 secondes

## Diagnostic par role

### CEO -- Positionnement strategique
Le titre "Comprends le systeme avant de t'engager" ne dit pas DE QUEL systeme on parle. Un visiteur en 3 secondes pense "site de developpement personnel ? coaching ? politique ?". Le positionnement doit immediatement evoquer **expatriation / fiscalite / choix de pays**.

### CISO -- Securite
Les 15 findings precedents sont correctement marques comme ignores. Le linter Supabase ne remonte que des warnings non-bloquants. RLS actif partout. **Aucune action requise.**

### DPO -- RGPD
Cookie consent fonctionne. Anonymisation GDPR active. **Aucune action requise.**

### CDO -- Data
Pipeline analytics coherent. **Aucune action requise.**

### COO -- Process
i18n 100% wrappee (v14-v16). **Aucune action requise.**

### Head of Design -- UX
Les 3 etapes (timeline) sont visuellement claires et non-cliquables : **RESOLU (v16)**.
Mais les TEXTES restent trop abstraits -- le design est bon, le contenu doit etre clarifie.

### Beta testeur -- Test 3 secondes
**ECHEC sur 4 points :**

| Element | Probleme | Impact |
|---------|----------|--------|
| Titre hero | "Comprends le systeme" -- systeme DE QUOI ? | L'utilisateur ne sait pas ce que fait l'outil |
| Sous-titre | "Reponds a quelques questions, decouvre quels pays..." -- mieux mais encore trop generique | Pas de notion d'expatriation/fiscalite |
| Stats "50+ cles de sortie" | Jargon interne. Personne ne sait ce qu'est une "cle de sortie" | Confusion |
| Stats "6 types de systemes" | Jargon interne | Confusion |
| CTA "Decouvrir mon profil" | Profil de quoi ? profil dating ? profil psy ? | Mauvaise categorisation |
| Pricing "Exit Keys personnalisees" | Jargon | Le visiteur ne sait pas ce qu'il achete |
| Meta description | Contient "Exit Keys" et "strategies de sortie" | Mauvais SEO/perception |

## Corrections a implementer

### 1. Hero -- Titre et sous-titre concrets (Index.tsx)

**Titre actuel** : "Comprends le systeme / avant de t'engager."

**Titre propose** : "Tu veux t'expatrier ? / Compare les pays avant de partir."

**Sous-titre actuel** : "Reponds a quelques questions, decouvre quels pays correspondent a ton profil, et obtiens un plan d'action concret."

**Sous-titre propose** : "Fiscalite, cout de la vie, visas, qualite de vie : compare 38 pays en 2 minutes et trouve celui qui te correspond."

### 2. CTA principal -- Dire ce qu'on obtient (Index.tsx)

**Actuel** : "Decouvrir mon profil gratuitement"

**Propose** : "Trouver mon pays ideal -- gratuit"

### 3. Stats hero -- Remplacer le jargon (Index.tsx)

| Actuel | Propose |
|--------|---------|
| 38+ pays analyses | 38+ pays compares (inchange, OK) |
| 50+ cles de sortie | 50+ criteres compares |
| 6 types de systemes | 6 profils d'expatrie |

### 4. Pricing -- Supprimer le jargon "Exit Keys" (Index.tsx)

**Actuel** : "Exit Keys personnalisees"

**Propose** : "Recommandations personnalisees"

### 5. Meta description -- SEO sans jargon (Index.tsx)

**Actuel** : "...Exit Keys... strategies de sortie..."

**Propose** : "Compare 38+ pays pour ton expatriation : fiscalite, visas, cout de la vie. Test gratuit en 2 minutes."

### 6. CTA final -- Concret (Index.tsx)

**Actuel** : "Pret a comprendre / les vraies regles ?"

**Propose** : "Pret a comparer / les pays ?"

**Sous-titre actuel** : "Cet outil analyse et simule. A toi de decider."

**Sous-titre propose** : "Compare, simule, decide. En toute autonomie."

## Fichier modifie

Un seul fichier : `src/pages/Index.tsx`

Toutes les modifications sont des changements de texte dans les fallbacks i18n existants (les cles `t('landing.xxx', 'nouveau texte')` avec le nouveau texte en fallback). Aucun changement de structure ou de CSS.

## Hors perimetre

- Securite : rien a corriger
- i18n structure : deja 100% wrappee
- Mobile spacing : deja resolu (v16)
- Timeline steps : design deja corrige (v16), seuls les intitules changent ici
- Les fichiers de traduction JSON (`fr.json`, `en.json`) ne contiennent pas ces cles (les fallbacks inline sont utilises) -- donc seul Index.tsx est concerne
