

# Audit Beta-Testeur Non-Technique (Post-Corrections v2)

## 1) Test "3 secondes"
- **En 3 secondes, je crois que cette plateforme sert a** : comparer des pays pour s'expatrier
- **Public cible** : francophones envisageant l'expatriation
- **Confusions possibles** : (1) Cabinet de conseil en relocation payant, (2) Blog voyage premium
- **Note clarte** : 9/10 -- Hero et CTAs sont clairs et efficaces

## 2) Parcours utilisateur

| Etape | Essaye | Resultat | Ressenti | Blocage | Attendu |
|---|---|---|---|---|---|
| Home | Arrivee | Hero clair, 2 CTAs | Bien guide | Aucun | OK |
| Quick Test | Clic CTA | Quiz interactif | Positif | Aucun | OK |
| Countries | Explorer | Liste 38+ pays | Attractif | Aucun | OK |
| Fiche pays | Clic France | Onglets renommes (Apercu, Details...) | Bien | Badge "Tronc commun" encore present | Un terme clair |
| Pricing | Visite | 3 plans | Jargon "Tronc commun pyramide", "TraceOS, Intel" | Termes simples |
| Navigation | Retour | Fluide | Aucun | OK |

## 3) Audit confiance : 8.5/10

**Positif** : Design premium, legal, pas de faux temoignages, onglets clairs, FAQ ajoutee

**Jargon residuel a corriger** :
- Badge "Tronc commun -- Acces gratuit" sur la fiche pays (CountryTroncSection)
- "Tronc commun pyramide" dans le tableau pricing (Pricing.tsx)
- "Variantes pays specifiques" dans le pricing
- "Modules avances (TraceOS, Intel)" dans le plan Pro (Index.tsx)
- "Intelligence Tags Comparison" dans le comparateur (TagsRadarCompare, TagsCompareTable)
- Traductions fr.json : tabs "Tronc commun", "Variante pays", badge "Tronc commun"

## 4) Audit comprehension
- Premier clic evident : OUI
- Apres premier clic : OUI
- Perdu : Nulle part sur le parcours principal
- **Phrases floues restantes** :
  1. "Tronc commun -- Acces gratuit" (badge vert sur fiche pays)
  2. "Tronc commun pyramide" (pricing)
  3. "TraceOS, Intel" (pricing Pro)
  4. "Intelligence Tags" (comparateur)

## 5) Audit visuel
- Premium : Tout est coherent
- Cheap : Rien
- Trop charge : Rien de bloquant
- Manque : Rien de critique
- Mobile : OK

## 6) Problemes restants

| Probleme | Ou | Gravite | Impact | Suggestion |
|---|---|---|---|---|
| Badge "Tronc commun" | CountryTroncSection | Moyen | Jargon residuel | "Apercu -- Acces gratuit" |
| "Tronc commun pyramide" dans pricing | Pricing.tsx + Index.tsx | Moyen | Confusion | "Analyse de base" |
| "TraceOS, Intel" dans Pro pricing | Index.tsx | Moyen | Jargon | "Modules avances" |
| "Intelligence Tags" dans comparateur | TagsRadarCompare.tsx | Mineur | Jargon anglais | "Indicateurs par pays" |
| Traductions fr.json avec jargon | fr.json | Moyen | Incoherence | Mettre a jour les cles |

## 7) Top 5 ameliorations (tout est P1/P2 desormais)

1. **Renommer le badge "Tronc commun"** dans CountryTroncSection -> "Apercu -- Acces gratuit"
2. **Renommer "Tronc commun pyramide"** dans Pricing -> "Analyse de base"
3. **Renommer "TraceOS, Intel"** dans Pro pricing -> "Modules avances"
4. **Renommer "Intelligence Tags"** dans comparateur -> "Indicateurs par pays"
5. **Mettre a jour fr.json** pour les cles de traduction correspondantes

## 8) Verdict final
- **Publiable** : OUI (aucun P0 restant)
- **Hero** : "Tu veux t'expatrier ? Compare les pays avant de partir." (deja OK)
- **CTA** : "Trouver mon pays ideal -- gratuit" (deja OK)

---

## Plan de corrections techniques

### 1. CountryTroncSection.tsx (ligne 50)
- Changer le fallback du badge : "Tronc commun -- Acces gratuit" -> "Apercu -- Acces gratuit"

### 2. Index.tsx (ligne 417)
- Changer "Modules avances (TraceOS, Intel)" -> "Modules avances"

### 3. Pricing.tsx (ligne 408)
- "Tronc commun pyramide" -> "Analyse de base"
- "Variantes pays specifiques" -> "Details par pays"

### 4. fr.json - Mettre a jour les cles suivantes :
- `countryDetail.tabs.tronc` : "Tronc commun" -> "Apercu"
- `countryDetail.tabs.variant` : "Variante pays" -> "Details"
- `countryDetail.tronc.badge` : "Tronc commun -- Acces gratuit" -> "Apercu -- Acces gratuit"
- `pricing.feature.pyramidCommon` : "Tronc commun pyramide" -> "Analyse de base"
- `pricing.feature.countryVariants` : "Variantes pays specifiques" -> "Details par pays"

### 5. TagsRadarCompare.tsx / TagsCompareTable.tsx
- "Intelligence Tags Comparison" -> "Comparaison des indicateurs"
- "Intelligence Tags Table" -> "Tableau des indicateurs"

