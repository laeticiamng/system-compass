

# AUDIT TECHNIQUE — Module Healthcare Professional Track

## 1. RÉSUMÉ EXÉCUTIF

**État global** : Le module Healthcare est fonctionnel en termes de rendu et de structure, mais présente des **problèmes critiques de données factices, de persistance absente et d'incohérences SEO/routing**. Le module est dans un état **démonstratif**, pas production-ready.

**Verdict go-live : NON EN L'ÉTAT**

### Top 5 P0
1. **Community tab = données 100% mockées** — Les profils de "confrères" sont hardcodés (MOCK_PEERS). Le bouton "Demander conseil" ne fait que modifier un state local. Aucune donnée persistée, aucun backend. C'est une fausse fonctionnalité.
2. **Procedural Updates = données 100% hardcodées** — La fonction `getUpdatesForCountry()` retourne des données statiques in-code, pas de la base. Les dates sont inventées (2026). Pas de système de notification réel.
3. **Tax Calculator = simulation simpliste sans avertissement suffisant** — Les taux sont approximatifs et hardcodés. L'utilisateur peut comparer un pays avec lui-même sans avertissement. Les devises ne sont pas converties (CHF vs EUR comparé directement).
4. **Document checklist limitée** — Seule la combinaison `general_medicine` + `eu` existe en base pour les 4 pays. Choisir une autre spécialité affiche "Pas de checklist disponible" sans explication claire que c'est une limitation de données.
5. **`healthcare` absent de LEGACY_ROUTE_SEGMENTS** — L'accès direct à `/healthcare` (sans préfixe langue) affiche une 404 au lieu de rediriger vers `/:lang/healthcare`.

### Top 5 P1
1. **Checklist progress stocké uniquement en localStorage** — Le progrès de la checklist documents n'est pas lié au compte utilisateur. Perdu au changement de navigateur/appareil.
2. **Aucun lien vers /healthcare dans la navigation principale** — Le module n'est accessible que par URL directe. Pas dans le Header, pas dans le sidebar, pas dans le dashboard.
3. **Community "Demander conseil" sans authentification** — Le CTA fonctionne sans être connecté. Aucune vérification d'identité avant d'envoyer une "demande".
4. **i18n incomplète** — Plusieurs labels dans HealthcareCommunity et HealthcareTaxCalculator sont en français hardcodé (filtres spécialités, régions, MOCK_PEERS).
5. **Pas de lien entre le profil "healthcare" choisi à l'onboarding et l'adaptation réelle de la plateforme** — Choisir "Professionnel de santé" à l'onboarding ne modifie pas la navigation ni le dashboard.

---

## 2. TABLEAU D'AUDIT

| Priorité | Domaine | Localisation | Problème | Risque | Recommandation | Faisable immédiatement ? |
|----------|---------|-------------|----------|--------|----------------|-------------------------|
| P0 | UX/Data | HealthcareCommunity.tsx | Données 100% mockées (MOCK_PEERS). "Demander conseil" = noop | Fausse fonctionnalité en production | Soit masquer l'onglet Community, soit ajouter un banner "Bientôt disponible" | Oui (banner) |
| P0 | UX/Data | HealthcareProceduralUpdates.tsx | Données hardcodées dans getUpdatesForCountry(), pas de backend | Contenu figé, aucune mise à jour réelle | Soit migrer vers DB, soit ajouter disclaimer "Données indicatives" | Oui (disclaimer) |
| P0 | UX/Data | HealthcareTaxCalculator.tsx | Taux hardcodés, pas de conversion de devise, comparaison même pays possible | Calculs trompeurs | Bloquer comparaison même pays, renforcer le disclaimer | Oui |
| P0 | Data | healthcare_document_checklists | Seule la combinaison general_medicine/eu existe | 80% des sélections retournent "pas de checklist" | Indiquer clairement les combinaisons disponibles | Oui |
| P0 | Routing | LEGACY_ROUTE_SEGMENTS | `healthcare` manquant | 404 sur /healthcare sans préfixe langue | Ajouter à la liste | Oui |
| P1 | Persistence | HealthcareDocumentChecklist.tsx | Progrès en localStorage seulement | Perte de données cross-device | Migrer vers Supabase si user authentifié | Non (migration DB) |
| P1 | Navigation | Header/Sidebar | Aucun lien vers /healthcare | Page inaccessible sans URL directe | Ajouter entrée navigation | Oui |
| P1 | Auth | HealthcareCommunity.tsx | "Demander conseil" sans vérification auth | Action fantôme sans conséquence | Requérir authentification | Oui |
| P1 | i18n | HealthcareCommunity.tsx | SPECIALTIES, REGIONS, MOCK_PEERS labels hardcodés en français | Cassé en multilingue | Wrapper t() sur tous les labels | Oui |
| P1 | UX | HealthcareTaxCalculator.tsx | Grille 3 colonnes sur mobile = illisible | UX mobile dégradée | Passer en stack vertical sur mobile | Oui |
| P2 | SEO | Healthcare.tsx | Pas de og:image spécifique, meta description fixe | SEO sous-optimal | Ajouter PageMeta dédié | Oui |
| P2 | Data | healthcare_country_data | 4 pays seulement, pas de fallback IA | Couverture limitée | Ajouter message "X pays en cours d'ajout" | Oui |
| P2 | Security | healthcare tables | RLS = public read only, pas de write policy | Pas d'admin write possible via API | Ajouter policy admin write | Non (décision produit) |
| P2 | UX | HealthcareDocumentChecklist | Changer specialty/origin ne reset pas le checked state | Progrès affiché incohérent | Reset checked quand les filtres changent | Oui |
| P3 | UX | HealthcareTaxCalculator | Net difference banner hardcode "/mois" sans i18n | Non traduit | Passer par t() | Oui |
| P3 | A11y | Healthcare.tsx | TabsTrigger avec span hidden sm:inline = pas de label accessible sur mobile | Icônes sans texte alternatif | Ajouter aria-label | Oui |

---

## 3. DÉTAIL PAR CATÉGORIE

### A. Frontend & Rendu
- **Fonctionne** : Page /healthcare se charge, onglets navigables, country selector opérationnel, skeletons de loading, états vides gérés.
- **Cassé** : Rien de bloquant côté rendu.
- **Douteux** : La grille 3 colonnes du TaxCalculator sur mobile est probablement illisible.

### B. QA Fonctionnelle
- **Fonctionne** : Sélection pays → affichage données DB (diploma, licensing, social protection, checklist). Filtres checklist specialty/origin fonctionnels.
- **Cassé** : Community "Demander conseil" = noop local. Procedural Updates = statiques.
- **Douteux** : Le checkbox state de la checklist ne se reset pas quand on change de specialty/country.

### C. Database & RLS
- **Fonctionne** : 4 pays seed en DB, RLS public read activé, foreign key vers countries.
- **Cassé** : Aucune write policy → impossible de mettre à jour les données via le client sans service role.
- **Non confirmé** : Pas de trigger de notification quand les données changent (bien que ProceduralUpdates l'annonce).

### D. Sécurité
- **Fonctionne** : Tables en lecture seule publique (choix architectural cohérent avec countries/translations).
- **Risque** : La communauté mockée pourrait donner l'impression d'un réseau réel — risque de réputation si mis en prod.

### E. i18n
- **Cassé** : SPECIALTIES labels, REGIONS labels, MOCK_PEERS data, "/mois" dans TaxCalculator, type labels dans ProceduralUpdates — tous hardcodés en français.

### F. SEO
- **Fonctionne** : Helmet avec title/description sur Healthcare.tsx.
- **Manquant** : og:image, hreflang pour /healthcare (géré globalement mais non testé spécifiquement), `healthcare` absent de LEGACY_ROUTE_SEGMENTS.

---

## 4. PLAN D'ACTION PRIORISÉ

### P0 — Corrections critiques (à implémenter immédiatement)
1. Ajouter `healthcare` (et autres routes manquantes) à `LEGACY_ROUTE_SEGMENTS`
2. Ajouter banner "Fonctionnalité en cours de développement" sur l'onglet Community
3. Ajouter disclaimer renforcé sur ProceduralUpdates ("Données indicatives, non mises à jour automatiquement")
4. Bloquer la comparaison d'un pays avec lui-même dans TaxCalculator
5. Clarifier les combinaisons disponibles dans la checklist documents

### P1 — Corrections rapides
6. Ajouter lien /healthcare dans la navigation (Header ou sidebar)
7. Fix responsive TaxCalculator (stack vertical mobile)
8. Reset checklist checked state quand specialty/country change
9. Ajouter aria-label sur les TabsTrigger pour l'accessibilité mobile
10. Wrapper i18n sur les labels hardcodés français

### P2 — Améliorations
11. Ajouter PageMeta avec og:image sur Healthcare.tsx
12. Envisager migration checklist progress vers Supabase
13. Ajouter write policies admin pour les tables healthcare

### P3 — Polish
14. i18n "/mois" et labels mineurs
15. Ajouter animation de transition entre les onglets

---

## 5. IMPLÉMENTATION IMMÉDIATE — Ce qui sera corrigé

Les corrections suivantes seront appliquées :

1. **LEGACY_ROUTE_SEGMENTS** : Ajouter `healthcare`, `contact`, `expat-reviews`, `changelog`, `regulatory-alerts`, `family-workspace`, `api`, `webhooks`, `fiscal-before-after`, `checklist`, `expatriation-timeline`
2. **HealthcareCommunity.tsx** : Ajouter un banner "Réseau en construction — fonctionnalité bientôt disponible" en haut, désactiver le CTA par défaut
3. **HealthcareProceduralUpdates.tsx** : Ajouter disclaimer "Données indicatives — dernière vérification manuelle"
4. **HealthcareTaxCalculator.tsx** : Empêcher la sélection du même pays pour les deux sélecteurs, améliorer responsive (grid-cols-1 sur mobile)
5. **HealthcareDocumentChecklist.tsx** : Reset du state `checked` quand `countryId` ou `specialty` change
6. **Healthcare.tsx** : Ajouter `aria-label` sur les TabsTrigger pour l'accessibilité mobile
7. **i18n** : Wrapper les labels hardcodés restants dans t()

