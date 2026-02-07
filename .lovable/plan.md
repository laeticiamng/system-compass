

# Audit Beta-Testeur Non-Technique v3 (Post-Corrections Access Model)

## 1) Test "3 secondes"
- **En 3 secondes, je crois que cette plateforme sert a** : comparer des pays pour s'expatrier
- **Public cible** : francophones envisageant l'expatriation
- **Confusions possibles** : (1) Cabinet de conseil payant, (2) Blog voyage premium
- **Note clarte** : 9/10 -- Hero, CTAs et FAQ sont clairs

## 2) Parcours utilisateur

| Etape | Essaye | Resultat | Ressenti | Blocage | Attendu |
|---|---|---|---|---|---|
| Home | Arrivee | Hero clair, 2 CTAs | Bien guide | Aucun | OK |
| Quick Test | Clic CTA | Quiz interactif | Positif | Aucun | OK |
| Countries | Explorer pays | Liste 38+ pays | Attractif | Aucun | OK |
| Fiche pays - Apercu | Clic France, onglet Apercu | Contenu gratuit, badge vert | Clair | Aucun | OK |
| Fiche pays - Details | Onglet Details | Contenu gratuit, badge vert | Bien | Aucun | OK |
| Fiche pays - Analyse | Onglet Analyse | Paywall Premium | Logique | Aucun | OK |
| Fiche pays - Gouvernance | Onglet Gouvernance | Paywall Premium | Logique | Aucun | OK |
| Fiche pays - Mon Projet | Onglet Mon Projet | Paywall Premium | Logique | Aucun | OK |
| Pricing | Visite | 3 plans | **Incohérence** : tableau montre "Details par pays" = Premium, mais c'est gratuit dans l'app | Confusion |
| Navigation | Retour | Fluide | Aucun | OK |

## 3) Audit confiance : 8/10

**Positif** : Design premium, legal, FAQ, badges confiance, onglets clairs, pas de faux temoignages

**Problemes de confiance detectes** :
1. **Incoherence pricing vs acces reel** : Le tableau comparatif Pricing montre "Details par pays" comme Premium-only (X pour Gratuit), mais l'onglet est maintenant gratuit dans l'app. Cela casse la confiance si l'utilisateur voit les deux.
2. **"TraceOS" dans le tableau pricing** : Toujours present en jargon technique (ligne 416 de Pricing.tsx)
3. **"Module Latent" et "Module Irreversa"** dans le tableau pricing : Jargon interne sans explication
4. **SUBSCRIPTION_TIERS features** (useSubscription.tsx) : La liste "free" dit "3 pays accessibles" mais la landing dit "38 pays disponibles" -- incoherence
5. **Navigation "TraceOS"** dans le Header (advancedItems ligne 88) : Label "TraceOS" reste du jargon

## 4) Audit comprehension
- Premier clic evident : OUI
- Apres premier clic : OUI
- Perdu : Nulle part
- **Phrases/copies problematiques restantes** :
  1. "TraceOS" (pricing table, header nav)
  2. "Module Latent" / "Module Irreversa" (pricing table)
  3. "3 pays accessibles" vs "38 pays disponibles" (incoherence free tier)
  4. "Details par pays" marque Premium dans le tableau alors que c'est gratuit

## 5) Audit visuel
- Premium : Coherent, animations fluides
- Cheap : Rien
- Trop charge : Rien
- Manque : Rien de critique
- Mobile : OK

## 6) Problemes restants

| Probleme | Ou | Gravite | Impact | Suggestion |
|---|---|---|---|---|
| Tableau pricing incoherent avec acces reel | Pricing.tsx lignes 409-411 | **Majeur** | Utilisateur croit que Details est payant, mais c'est gratuit | Mettre `free: true` pour Details par pays, Profils, Surprises |
| "TraceOS" jargon | Pricing.tsx ligne 416 + Header.tsx ligne 88 | Moyen | Jargon technique | Renommer en "Suivi institutionnel" |
| "Module Latent" / "Module Irreversa" jargon | Pricing.tsx lignes 414-415 | Moyen | Incomprehensible | Renommer : "Analyse des risques caches" / "Points de non-retour" |
| Free tier "3 pays" vs "38 pays" incoherence | useSubscription.tsx ligne 31 vs Index.tsx ligne 330 | Moyen | Confusion | Harmoniser : "Apercu de base des 38 pays" |
| Analyse/Gouvernance/Projet = Premium dans tableau mais pas affiche | Pricing.tsx | Moyen | Le tableau ne montre pas que Intelligence, Gouvernance et Projet sont Premium | Ajouter lignes : Analyse systeme, Gouvernance, Analyse projet = Premium |

## 7) Top 10 ameliorations (actionnables)

### P0 (bloquants)
1. **Corriger le tableau pricing** : "Details par pays", "Profils qui reussissent", "Ce qui surprend" doivent passer a `free: true` (coherence avec le code)
2. **Ajouter les features Premium manquantes au tableau** : "Analyse systeme", "Gouvernance & Terrain", "Analyse projet" = Premium

### P1 (conversion)
3. **Renommer "TraceOS"** dans Pricing et Header : "Suivi institutionnel"
4. **Renommer "Module Latent"** : "Analyse des risques caches"
5. **Renommer "Module Irreversa"** : "Points de non-retour"
6. **Harmoniser les features du free tier** dans useSubscription.tsx : remplacer "3 pays accessibles" par "Apercu de 38+ pays"
7. **Harmoniser features Premium** dans useSubscription.tsx pour reflechir le nouveau modele (Intelligence, Gouvernance, Projet)

### P2 (polish)
8. **Renommer le label nav "TraceOS"** dans Header advancedItems : "Institutions"
9. **Mettre a jour les features Premium dans SUBSCRIPTION_TIERS** pour reflechir : analyses avancees, gouvernance, projet perso
10. **Ajouter "Details par pays" dans la liste free de la landing** (Index.tsx) pour mettre en avant le contenu gratuit

## 8) Verdict final
- **Publiable** : OUI mais avec les corrections P0 (incoherence pricing critique)
- **Hero** : "Tu veux t'expatrier ? Compare les pays avant de partir." (deja OK)
- **CTA** : "Trouver mon pays ideal -- gratuit" (deja OK)

---

## Plan de corrections techniques

### 1. Pricing.tsx -- Corriger le tableau comparatif (lignes 405-416)
Mettre a jour pour refleter le vrai modele d'acces :
- "Details par pays" : `free: true`
- "Profils qui reussissent" : `free: true`
- "Ce qui surprend les nouveaux" : `free: true`
- Ajouter 3 nouvelles lignes : "Analyse systeme" (free: false, premium: true), "Gouvernance & Terrain" (free: false, premium: true), "Analyse projet" (free: false, premium: false, pro: true)
- Renommer "TraceOS" en "Suivi institutionnel"
- Renommer "Module Latent" en "Analyse des risques caches"
- Renommer "Module Irreversa" en "Points de non-retour"

### 2. useSubscription.tsx -- Harmoniser les features affichees (lignes 26-58)
- Free : "Apercu de 38+ pays", "Quiz de profil", "Details par pays"
- Premium : "Analyse systeme avancee", "Gouvernance & Terrain", "Comparaison illimitee", "Export PDF", "Calculateur fiscal"
- Pro : "Tout Premium inclus", "Analyse projet personnalisee", "Acces multi-utilisateurs", "Support dedie"

### 3. Header.tsx -- Renommer "TraceOS" (ligne 88)
- Changer le label de "TraceOS" a "Institutions"

### 4. Index.tsx -- Mettre a jour les features du plan gratuit (lignes 319-331)
- Remplacer "Analyse de base des pays" par "Details complets par pays"
- Ajouter "Profils qui reussissent" comme feature gratuite visible

### 5. fr.json -- Mettre a jour les cles de traduction
- `pricing.feature.countryVariants` : marquer comme gratuit dans le contexte
- Ajouter cles pour "Analyse systeme", "Gouvernance & Terrain"
- Renommer TraceOS, Module Latent, Module Irreversa

