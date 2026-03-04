

## Audit Complet — System Compass : Etat actuel et manques pour etre revolutionnaire

### Ce qui existe (socle solide, ~85%)

70+ routes, 44 pays en base, i18n FR/EN, SEO/GEO complet (llms.txt, JSON-LD, sitemap multilingue, hreflang), design system dark mode premium, PWA, modules avances (Exit Keys, Latent, Irreversa, OVI, TraceOS), simulateur fiscal, comparateur multi-pays, jeu de simulation, gamification, marketplace d'experts, intelligence financiere IA, onboarding interactif avec confetti.

---

### TIER 1 — Bugs actuels

| # | Probleme | Impact | Statut |
|---|----------|--------|--------|
| **B1** | Page /countries : skeletons visibles 2-3s avant affichage | Mineur — les cartes finissent par se charger, mais l'experience initiale est degradee (flash de skeletons). Le chargement DB async est lent. | A AMELIORER |
| **B2** | Disclaimer "Outil educatif" chevauche les stats hero sur mobile (390px) | La barre de stats "44 / 13 / 6" est masquee par le banner. Le CTA primaire n'est plus bloque mais le chevauchement reste present. | A FIXER |
| **B3** | Widget en bas a gauche (gamification/shortcuts) visible sur mobile pour tous les visiteurs | Distraction visuelle sur la landing. Devrait etre conditionnel (apres Quick Test) ou masque sur mobile. | A FIXER |
| **B4** | Textes hero en anglais sur la route /fr/countries | "Explore the rules of each system" au lieu du francais. Les traductions `countries.heroTitle1/2` ne sont pas definies en FR. | A FIXER |

---

### TIER 2 — Manques fonctionnels pour etre revolutionnaire

| # | Feature | Pourquoi c'est decisif | Effort |
|---|---------|------------------------|--------|
| **F1** | **Timeline d'expatriation interactive (page dediee)** | `expatriation-timeline-data.ts` + `ExpatTimeline.tsx` existent dans le module Irreversa mais ne sont pas exposes en page autonome. Un parcours visuel "J-180 → Jour J → J+90" serait unique. | 2-3j |
| **F2** | **Checklist administrative par pays** | `checklist-storage.ts` existe avec load/save, mais aucune checklist specifique par pays (visa, banque, assurance, logement). C'est le #1 besoin concret. | 2-3j |
| **F3** | **Comparaison "avant/apres" chiffree** | Le simulateur fiscal existe mais manque un resume visuel "France vs Suisse" avec delta net mensuel anime. | 1-2j |
| **F4** | **Alertes reglementaires temps reel** | `useLiveCountryIntel` est cable (Perplexity/Firecrawl) mais pas exploite dans un flux d'alertes push. "Portugal NHR supprime" envoye aux utilisateurs concernes = game changer. | 2-3j |
| **F5** | **Mode collaboration / famille** | Zero partage de profil entre conjoints. Expatriation = decision familiale. Un espace partage serait differenciant. | 3-5j |
| **F6** | **Social proof reel** | Section temoignages existe mais donnees statiques supprimees par choix de transparence. Il faut des reviews verifies reels. | 2-3j |

---

### TIER 3 — Manques UX/Design

| # | Probleme | Recommandation |
|---|----------|----------------|
| **U1** | Navigation surchargee (sidebar + header + breadcrumbs + widget) | Simplifier : un systeme de nav primaire. Masquer sidebar icons sur mobile. |
| **U2** | Pas de "wow moment" interactif sur le hero | Le globe SVG tourne mais n'est pas interactif. Une mini-demo animee (comparaison 2 pays en 5s) convertirait mieux. |
| **U3** | 70+ routes sans hierarchie claire | Grouper en 4 parcours : Decouvrir → Analyser → Planifier → Agir. |
| **U4** | Traductions manquantes (hero /countries en anglais sur /fr) | Completer les cles i18n manquantes. Warnings visibles dans la console. |

---

### TIER 4 — Manques strategiques

| # | Levier | Statut | Ce qu'il faut |
|---|--------|--------|---------------|
| **S1** | API publique | Aucune | REST/GraphQL pour agences relocation, banques expat. Revenus B2B. |
| **S2** | Contenu utilisateur | Community existe (mock) | Activer reviews pays par expatries reels. Network effect. |
| **S3** | PWA offline reelle | PWA declaree, offline limite | Quick Test + fiches pays 100% offline. |
| **S4** | Webhooks B2B | `useTraceOSWebhooks` existe | Documenter et exposer pour cabinets relocation. |
| **S5** | Changelog public | Aucun | `/changelog` avec mises a jour data = confiance. |

---

### TIER 5 — Donnees et credibilite

| # | Manque | Impact |
|---|--------|--------|
| **D1** | 44 pays sur 195 (+ 15 "extended") | Couvrir 80+ pays minimum. |
| **D2** | Donnees non sourcees dans les fiches | Ajouter source + date sur chaque chiffre. |

---

### Resume executif

```text
Plateforme existante :  ████████████████████░░░░  85%

Bugs actuels (Tier 1)   :   4 items  →  1-2 jours
Features cles (Tier 2)  :   6 items  →  2-3 semaines
Polish UX (Tier 3)      :   4 items  →  1 semaine
Strategie (Tier 4)      :   5 items  →  1-3 mois
Donnees (Tier 5)        :   2 items  →  continu

TOP 3 actions pour impact maximum :
1. Fixer le disclaimer mobile + traductions FR /countries (B2, B4)
2. Creer la page Timeline d'expatriation (F1) — asset unique
3. Checklist administrative par pays (F2) — valeur concrete #1
```

