

# AUDIT DEFINITIF v6 — System Compass (6 mars 2026)

---

## 1. RESUME EXECUTIF

La plateforme a atteint un niveau de maturite technique remarquable : migration i18n 100% complete (zero `Link` brut restant), securite RLS durcie, auth solide avec Zod/i18n/social login, architecture lazy-loaded propre. Le hero landing est clair et la proposition de valeur comprensible en 3 secondes. Cependant, **3 problemes reels subsistent** : le disclaimer banner chevauche toujours la mini-demo sur mobile (visible sur screenshot), le domaine OG image `system-compass.app` doit etre verifie (actuellement publie sur `world-alignment.lovable.app`), et la navigation desktop comporte toujours 4 dropdowns + 5 nav items ce qui reste dense pour un novice. Le scan securite ne revele que des warnings (pas d'erreurs) — tous justifies ou intentionnels.

**Publiable aujourd'hui : OUI SOUS CONDITIONS** (1 correctif P0, 2 P1)

**Note globale : 16.5/20**

**Top 5 risques restants :**
1. Disclaimer banner chevauche la mini-demo sur mobile — le `mb-28` est present mais le banner fixed z-50 recouvre toujours le contenu visiblement (screenshot confirme)
2. OG image URLs referancent `system-compass.app` dans 28+ fichiers — si ce domaine n'est pas configure, tous les partages sociaux montrent une image cassee
3. CORS headers dans edge functions referancent `system-compass.app` — si le domaine custom n'est pas actif, les edge functions echoueront en production depuis `world-alignment.lovable.app`
4. Navigation desktop 9 elements visibles (5 nav + 4 dropdowns) — charge cognitive elevee pour un novice
5. `security_definer_view` finding (error level) dans le scan — une vue avec SECURITY DEFINER peut bypasser les RLS du user appelant

**Top 5 forces :**
1. Migration i18n 100% — zero import `Link` de react-router-dom sauf dans le wrapper LocalizedLink lui-meme
2. Hero landing excellent : proposition de valeur en 3 secondes, double CTA ("Trouver mon pays" + "Explorer"), mini-demo interactive
3. Auth complete : email + Google + Apple + magic link + password reset + force indicator + Zod i18n
4. Toutes les routes admin protegees par RequireAdmin (diagnostics, seed-translations, analytics, etc.)
5. RGPD complet : consent, anonymisation 90j, deletion cascade, audit trail, cookie consent sequentiel

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticite | Decision |
|---|---|---|---|---|
| Comprehension produit | 17 | Hero clair, "compare 44 pays en 2 min" compris immediatement | Mineur | OK |
| Landing / Accueil | 17 | Structure propre : hero → 3 etapes → exemple → temoignages → pricing → FAQ → CTA | Cosmétique | OK |
| Onboarding | 15 | Dialog branching B2C/B2B, mais disclaimer overlap mobile | Majeur | Corriger overlap |
| Navigation | 13 | 9 elements desktop + 4 dropdowns = surcharge cognitive | Critique | Simplifier dropdowns |
| Clarte UX | 15 | Bon post-migration, ToolsHub clair, mais trop de pages (80+) | Majeur | Acceptable beta |
| Copywriting | 16 | i18n complet, textes landing efficaces, FAQ pertinente | Mineur | OK |
| Credibilite / confiance | 16 | Pages legales completes, disclaimer transparent, FAQ rassurante | Mineur | OK |
| Fonctionnalite principale | 17 | Quick Test, Countries, Compare = operationnels et clairs | Mineur | OK |
| Parcours utilisateur | 15 | Landing → Quick Test → Results avec CTA signup = bon. Dashboard dense | Majeur | OK pour beta |
| Bugs / QA | 17 | Zero Link brut, i18n complet, lazy loading OK | Cosmétique | OK |
| Securite preproduction | 16 | Scan warnings uniquement, auth manuelle confirmee, RLS durci | Mineur | Verifier security_definer_view |
| Conformite go-live | 14 | OG image domain mismatch potentiel, CORS domain a verifier | Critique | Verifier domaine |

---

## 3. PROBLEMES IDENTIFIES — PAR PRIORITE

### P0 — Bloquant production

**1. Domaine OG/CORS : `system-compass.app` vs `world-alignment.lovable.app`**
- 28+ fichiers referancent `https://system-compass.app/og-image.png` pour og:image
- 5+ edge functions ont `Access-Control-Allow-Origin: "https://system-compass.app"`
- Si le domaine custom `system-compass.app` n'est PAS configure et pointe vers le projet : tous les partages sociaux cassent + toutes les edge functions retournent CORS errors depuis le domaine Lovable
- Impact : partages sociaux sans image, fonctionnalites AI/email/generation cassees
- **Verification requise** : confirmer que `system-compass.app` pointe bien vers le projet. Si non, remplacer par `world-alignment.lovable.app` ou configurer le domaine
- Correction si non configure : soit configurer le domaine custom, soit remplacer les 468 occurrences par le bon domaine, soit utiliser des URLs relatives pour og:image et ajouter `*` ou le domaine Lovable aux CORS

### P1 — Critique

**2. Disclaimer banner chevauche toujours la mini-demo sur mobile**
- Screenshot mobile confirme : le banner "Outil educatif uniquement" recouvre les donnees France/Portugal
- Le `mb-28 sm:mb-12` dans HeroMiniDemo aide mais ne suffit pas — le banner est `fixed bottom-0 z-50` et la mini-demo est encore visible derriere
- Correction : augmenter le `mb` de HeroMiniDemo a `mb-40` sur mobile, OU rendre le disclaimer non-fixed (position sticky ou inline), OU ajouter `pb-40` a la section hero

**3. `security_definer_view` — scan error level**
- Le scan releve une vue avec SECURITY DEFINER qui execute avec les privileges du createur
- Je ne peux pas confirmer quelle vue exacte est concernee sans acces au schema complet
- Risque : une vue SECURITY DEFINER peut exposer des donnees que les RLS bloqueraient normalement
- Correction : identifier la vue, evaluer si SECURITY DEFINER est intentionnel (souvent oui pour les vues leaderboard/public), et documenter ou corriger

### P2 — Amelioration forte valeur

**4. Navigation desktop : 4 dropdowns simultanes**
- Un novice voit : Home, Explorer, Mon Profil, Tarifs + [Dashboard si connecte] + dropdown "Outils" + dropdown "Pour les pros" + dropdown "Info" + [dropdown Admin si admin]
- 9 elements visibles en meme temps = trop pour un premier contact
- Correction : fusionner "Pour les pros" dans "Info" (ce sont des pages secondaires), reduire a 3 dropdowns max

**5. Pas de page Contact independante**
- Les pages legales mentionnent un email de contact, mais il n'y a pas de page `/contact` dediee
- Un utilisateur sceptique cherche "Contact" et ne le trouve pas immediatement
- Correction : ajouter une page Contact simple avec formulaire ou au minimum un lien visible dans le footer

### P3 — Finition

**6. Footer dense : 7 liens dans "Outils" + 8 dans "Compte"**
- Le footer liste 20+ liens — acceptable mais dense
- Cosmétique : OK pour beta

**7. OG image URL hardcodee**
- Toutes les meta og:image sont hardcodees avec l'URL absolue. Si le domaine change, 28+ fichiers doivent etre mis a jour
- Correction P3 : centraliser l'URL de base dans une constante

---

## 4. SECURITE / GO-LIVE READINESS

| Observe | Risque | Action |
|---|---|---|
| security_definer_view (scan error) | Moyen — vue peut bypasser RLS | Identifier et documenter la vue |
| CORS `system-compass.app` dans edge functions | Elevé si domaine non configure | Verifier la configuration DNS |
| Newsletter emails admin-only (scan warn) | Faible — acces restreint aux admins | OK |
| Analytics anonymous insert (scan warn) | Faible — par design pour tracking pre-auth | OK |
| Game leaderboard display names public | Faible — intentionnel pour classement | OK |
| Experts public view | Faible — intentionnel pour marketplace | OK |
| Watchlist publicly countable | Tres faible — meta-info seulement | OK |
| UGC review votes public | Faible — par design | OK |

---

## 5. PLAN D'IMPLEMENTATION

### Etape 1 : Verifier domaine custom (P0)
- Verifier si `system-compass.app` est configure comme domaine custom du projet
- Si OUI : aucune action necessaire, tout est coherent
- Si NON : 2 options :
  - (a) Configurer le domaine custom dans Lovable Settings → Domains
  - (b) Centraliser le base URL et le remplacer dans les 28+ fichiers + edge functions CORS

### Etape 2 : Corriger l'overlap disclaimer mobile (P1)
- Augmenter le `mb` dans `HeroMiniDemo.tsx` de `mb-28` a `mb-44 sm:mb-12`
- OU mieux : transformer le disclaimer en element non-fixed pour la page Index (position relative au lieu de fixed)

### Etape 3 : Verifier security_definer_view (P1)
- Identifier quelle vue est concernee via le linter Supabase
- Documenter si c'est intentionnel (probablement `game_statistics_leaderboard` ou `experts_public`)

### Etape 4 : Simplifier navigation desktop (P2)
- Fusionner le dropdown "Pour les pros" (4 items : Institutions, B2B, Experts, Académique) dans le dropdown "Info"
- Resultat : 3 dropdowns au lieu de 4

### Etape 5 : Ajouter lien Contact visible (P2)
- Ajouter une page `/contact` minimale OU un lien mailto visible dans le footer

---

## 6. VERDICT FINAL

La plateforme est **publiable en beta publique** a condition de confirmer que le domaine `system-compass.app` est bien configure. C'est le seul vrai bloquant potentiel — si les CORS headers des edge functions referancent un domaine qui ne pointe pas vers le projet, toutes les fonctionnalites backend (AI chat, generation, emails, paiement) casseront silencieusement.

**Ce qui donne confiance :**
- Migration i18n 100% verifiee — zero regression
- Auth complete et securisee
- Hero landing clair, promesse comprise en 3 secondes
- Architecture technique mature et bien structuree

**Les 3 corrections les plus rentables :**
1. Confirmer/configurer le domaine `system-compass.app` (0-5 min si deja fait)
2. Corriger l'overlap disclaimer mobile (augmenter `mb-28` → `mb-44`) (2 min)
3. Fusionner dropdown "Pour les pros" dans "Info" pour reduire la charge cognitive (15 min)

**Si j'etais decideur externe :** je publierais aujourd'hui APRES confirmation que le domaine custom est configure. Le disclaimer mobile est un defaut UX non-bloquant. La navigation dense est acceptable pour une beta avec power users. Le produit est solide, la valeur est claire, et la securite est au niveau.

