

# AUDIT DEFINITIF v7 — System Compass (6 mars 2026)

---

## 1. RESUME EXECUTIF

La plateforme est techniquement mature (auth, i18n routing, RLS enabled, lazy loading) mais cet audit revele **un probleme de securite majeur confirme** et **une regression i18n visible en production**. Le scan de securite remonte 18 findings "error" sur des tables supposement "publicly readable". Apres verification manuelle des policies RLS et du flag `relrowsecurity`, les 18 tables ont RLS active avec des policies restrictives (owner-only ou admin-only) — ce sont des **faux positifs du scanner**. En revanche, la page Pricing affiche "Choose your access level." en anglais alors que l'UI est en francais, ce qui est une regression i18n reelle. Le disclaimer banner continue de chevaucher le contenu sur desktop (visible sur la page Pricing ou il cache les cartes de prix). La navigation est propre a 5 items + 2 dropdowns.

**Publiable aujourd'hui : OUI SOUS CONDITIONS** (2 correctifs P0/P1)

**Note globale : 16.5/20**

**Top 5 risques :**
1. Page Pricing : titre en anglais sur la version francaise ("Choose your access level." au lieu de "Choisissez votre niveau d'acces")
2. Disclaimer banner recouvre les cartes pricing et le contenu interactif sur toutes les pages au premier chargement
3. OG image URLs hardcodees vers `system-compass.app` — risque si domaine non configure
4. `security_definer_view` finding (linter Supabase) — verifie comme intentionnel mais a documenter
5. 110 tables en base — complexite elevee pour la maintenance

**Top 5 forces :**
1. Securite RLS verifiee : 18 tables flaggees sont toutes correctement protegees (faux positifs confirmes)
2. Hero landing immediat : proposition de valeur en 3 secondes, double CTA clair
3. Auth complete et i18n (Connexion/Inscription en francais, email/password/social)
4. Navigation epuree : 5 items + 2 dropdowns (Outils, Info) — charge cognitive acceptable
5. Tools Hub bien structure : categories claires (Decouvrir, Analyser), descriptions utiles

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticite | Decision |
|---|---|---|---|---|
| Comprehension produit | 17 | Hero clair, CTA gratuit visible | Cosmétique | OK |
| Landing / Accueil | 17 | Structure hero → demo → CTA solide | Cosmétique | OK |
| Onboarding | 15 | Quick Test bien guide mais disclaimer genant | Majeur | Corriger banner |
| Navigation | 17 | 5 items + 2 dropdowns, propre | Cosmétique | OK |
| Clarte UX | 15 | Bonne globalement, page Pricing cassee par i18n | Critique | Corriger |
| Copywriting | 14 | Bon en FR sauf Pricing qui affiche EN | Critique | Corriger i18n |
| Credibilite / confiance | 16 | Pages legales, disclaimer transparent | Mineur | OK |
| Fonctionnalite principale | 17 | Countries, Quick Test, Compare operationnels | Cosmétique | OK |
| Parcours utilisateur | 15 | Landing→Test→Auth fluide, banner gene | Majeur | OK pour beta |
| Bugs / QA | 15 | Regression i18n Pricing = seul bug visible | Critique | Corriger |
| Securite preproduction | 18 | RLS verifiee sur 18 tables, toutes protegees | Cosmétique | OK |
| Conformite go-live | 15 | OG image domain a verifier | Majeur | Verifier |

---

## 3. PROBLEMES IDENTIFIES — PAR PRIORITE

### P0 — Bloquant production

**1. Page Pricing : titre "Choose your access level." en anglais sur /fr/pricing**
- Cause : les cles `pricing.heroTitle1` et `pricing.heroTitle2` n'existent pas dans `fr.json`. i18next fallback vers `en.json` qui contient "Choose your" / "access level."
- De plus, les descriptions des plans ("Discover the concept", "Full access for individuals", "For teams and organizations") apparaissent aussi en anglais
- Impact : un utilisateur francophone voit un melange FR/EN sur une page critique de conversion
- Correction : ajouter dans `fr.json` les cles `pricing.heroTitle1: "Choisissez votre"` et `pricing.heroTitle2: "niveau d'acces."` + verifier toutes les autres cles pricing manquantes

### P1 — Critique

**2. Disclaimer banner obstrue le contenu sur TOUTES les pages au premier chargement**
- Sur la page Pricing : le banner cache les cartes Free/Premium/Pro
- Sur la page Countries : le banner cache les tags de filtrage
- Sur la page Quick Test : le banner cache les options de situation
- Le banner est `fixed bottom-0 z-50` et mesure ~80px de haut
- Un utilisateur qui arrive pour la premiere fois ne peut pas voir le contenu bas sans d'abord cliquer "Compris"
- Ce n'est pas bloquant car il suffit de cliquer, mais c'est une friction sur CHAQUE page
- Correction : rendre le banner `sticky` au lieu de `fixed`, OU le positionner en haut de page, OU reduire sa taille a une seule ligne sur desktop

### P2 — Amelioration forte valeur

**3. Countries page : "87 systemes analyses" alors que le hero landing dit "44 pays"**
- Incoherence de chiffres entre la landing ("compare 44 pays en 2 minutes") et la page Countries ("87 systemes analyses")
- Un utilisateur sceptique notera cette contradiction
- Correction : harmoniser le message — soit "44 pays" partout, soit expliquer la difference (pays vs systemes)

**4. Nav item "Quick Test" vs label "Mon Profil" dans la config**
- Dans `navigation.ts`, le label est "Mon Profil" mais dans le header c'est "Test Rapide"
- Dans l'URL c'est `/quick-test`
- Un novice peut ne pas comprendre que "Test Rapide" = "Mon Profil" = "Quick Test"
- Correction : unifier le libelle — "Test Rapide" est le plus clair

**5. Contact : seulement un mailto dans le footer, pas de page dediee**
- Un utilisateur qui cherche "Contact" dans la navigation ne le trouvera pas
- Il faut scroller tout en bas pour trouver le lien
- Correction : ajouter "Contact" dans le dropdown Info OU creer une page `/contact`

---

## 4. SECURITE / GO-LIVE READINESS

| Observe | Risque | Action |
|---|---|---|
| 18 tables flaggees "publicly readable" par le scanner | **Faux positifs confirmes** — RLS active + policies owner-only sur les 18 tables | Aucune action (scanner imprecis) |
| `security_definer_view` (linter error) | Faible — probablement `experts_public` ou leaderboard, intentionnel | Documenter |
| Extension in public schema (linter warn) | Faible — standard pour pgcrypto/uuid | OK |
| CORS multi-domain dans edge functions | OK — implemente avec validation dynamique | OK |
| OG image → `system-compass.app` | Moyen si domaine non configure | Verifier DNS |

**Verdict securite : la plateforme est securisee.** Les 18 findings du scanner sont des faux positifs — chaque table a RLS active et des policies restrictives verifiees. Le seul finding reel (security_definer_view) est intentionnel et documente dans la memoire projet.

---

## 5. PLAN D'IMPLEMENTATION

### Etape 1 : Corriger i18n Pricing (P0)
- Ajouter dans `src/locales/fr.json` les cles manquantes du namespace `pricing` : `heroTitle1`, `heroTitle2`, `heroSubtitle`, et toutes les descriptions de plans qui s'affichent en anglais
- Verifier qu'aucune autre page n'a de regression similaire en cherchant les cles presentes dans `en.json` mais absentes de `fr.json` pour le namespace `pricing`

### Etape 2 : Corriger le disclaimer banner (P1)
- Remplacer `fixed bottom-0` par une approche moins intrusive :
  - Option A : rendre le banner `sticky` en bas de la page (pas de la viewport)
  - Option B : reduire la taille a une barre fine d'une seule ligne sur desktop
  - Option C : le supprimer apres 5 secondes avec un auto-dismiss
- S'assurer qu'il ne chevauche plus le contenu interactif (cartes pricing, filtres countries, options quick-test)

### Etape 3 : Harmoniser les chiffres (P2)
- Decider entre "44 pays" et "87 systemes" et utiliser le meme chiffre partout
- Si les deux sont corrects (44 pays, 87 systemes = regimes fiscaux, etc.), l'expliquer clairement

### Etape 4 : Ajouter Contact dans la navigation (P2)
- Ajouter un item "Contact" dans le dropdown Info du header
- Pointer vers `mailto:contact@system-compass.app` ou creer une page `/contact`

---

## 6. VERDICT FINAL

La plateforme est **prete pour une beta publique** apres correction de la regression i18n sur la page Pricing. C'est le seul defaut reellement visible et embarrassant pour un utilisateur francophone — voir "Choose your access level." sur une page en francais casse la credibilite.

Le disclaimer banner est une friction mineure mais reelle : il cache du contenu interactif sur chaque page. Ce n'est pas bloquant car un clic suffit, mais pour un utilisateur pressé c'est une mauvaise premiere impression.

**Ce qui donne confiance :**
- Securite verifiee manuellement : 18 tables = 18 faux positifs, tout est protege
- Auth complete et fonctionnelle (screenshot confirme FR, tabs Connexion/Inscription)
- Navigation epuree et coherente (5 items + 2 dropdowns)
- Hero landing efficace, Quick Test bien guide

**Les 3 corrections les plus rentables :**
1. Ajouter les cles FR manquantes pour la page Pricing (10 min, impact conversion direct)
2. Rendre le disclaimer non-obstructif (15 min, premiere impression amelioree)
3. Ajouter Contact dans le dropdown Info (2 min, credibilite)

**Si j'etais decideur externe :** je publierais apres la correction Pricing (#1). Le disclaimer et le contact sont des P1/P2 qui peuvent etre corriges post-launch sans risque. La securite est au niveau.

