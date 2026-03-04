

## Audit Complet — System Compass : Etat actuel et manques pour etre revolutionnaire

### Ce qui existe (socle solide, ~85%)

70+ routes, 44 pays en base, i18n FR/EN, SEO/GEO complet (llms.txt, JSON-LD, sitemap multilingue, hreflang), design system dark mode premium, PWA, modules avances (Exit Keys, Latent, Irreversa, OVI, TraceOS), simulateur fiscal, comparateur multi-pays, jeu de simulation, gamification, marketplace d'experts, intelligence financiere IA, onboarding interactif avec confetti.

---

### TIER 1 — Bugs actuels

| # | Probleme | Impact | Statut |
|---|----------|--------|--------|
| **B1** | Page /countries : skeletons visibles 2-3s avant affichage | Mineur — les cartes finissent par se charger, mais l'experience initiale est degradee (flash de skeletons). Le chargement DB async est lent. | A AMELIORER |
| **B2** | Disclaimer "Outil educatif" chevauche les stats hero sur mobile (390px) | La barre de stats "44 / 13 / 6" est masquee par le banner. Le CTA primaire n'est plus bloque mais le chevauchement reste present. | ✅ FIXE — pointer-events-none + auto sur le contenu |
| **B3** | Widget en bas a gauche (gamification/shortcuts) visible sur mobile pour tous les visiteurs | Distraction visuelle sur la landing. Devrait etre conditionnel (apres Quick Test) ou masque sur mobile. | ✅ FIXE — hidden md:block + conditionnel quick-test |
| **B4** | Textes hero en anglais sur la route /fr/countries | "Explore the rules of each system" au lieu du francais. Les traductions `countries.heroTitle1/2` ne sont pas definies en FR. | ✅ FIXE — cles i18n ajoutees |

---

### TIER 2 — Manques fonctionnels pour etre revolutionnaire

| # | Feature | Pourquoi c'est decisif | Statut |
|---|---------|------------------------|--------|
| **F1** | **Timeline d'expatriation interactive (page dediee)** | Parcours visuel "J-180 → Jour J → J+90" avec checklists et reversibilite. | ✅ FAIT — /expatriation-timeline |
| **F2** | **Checklist administrative par pays** | Visa, banque, assurance, logement — 6 categories, 40+ taches, progression par pays. | ✅ FAIT — /checklist |
| **F3** | **Comparaison "avant/apres" chiffree** | Le simulateur fiscal existe mais manque un resume visuel "France vs Suisse" avec delta net mensuel anime. | A FAIRE |
| **F4** | **Alertes reglementaires temps reel** | `useLiveCountryIntel` est cable mais pas exploite dans un flux d'alertes push. | A FAIRE |
| **F5** | **Mode collaboration / famille** | Zero partage de profil entre conjoints. | A FAIRE |
| **F6** | **Social proof reel** | Section temoignages existe mais donnees statiques. Il faut des reviews verifies reels. | A FAIRE |

---

### TIER 3 — Manques UX/Design

| # | Probleme | Recommandation |
|---|----------|----------------|
| **U1** | Navigation surchargee (sidebar + header + breadcrumbs + widget) | Simplifier : un systeme de nav primaire. Masquer sidebar icons sur mobile. |
| **U2** | Pas de "wow moment" interactif sur le hero | Le globe SVG tourne mais n'est pas interactif. Une mini-demo animee convertirait mieux. |
| **U3** | 70+ routes sans hierarchie claire | Grouper en 4 parcours : Decouvrir → Analyser → Planifier → Agir. |
| **U4** | Traductions manquantes (hero /countries en anglais sur /fr) | ✅ FIXE |

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
