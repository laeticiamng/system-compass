

## Plan : Mise a jour geopolitique complete (mars 2026)

Ce plan couvre la mise a jour de toutes les donnees geopolitiques avec les conflits actuels et leurs consequences.

### Zones a modifier

**1. Alertes reglementaires (`src/pages/RegulatoryAlerts.tsx`)**
Remplacer les 7 alertes mock datees de 2024 par ~15 alertes a jour couvrant :
- **Guerre Russie-Ukraine** : sanctions renforcees UE/US, gel d'actifs, impact sur les expats en Europe de l'Est, hausse des couts energetiques, consequences sur les visas russes/ukrainiens
- **Conflit Israel-Gaza/Moyen-Orient** : impact securitaire sur Israel, Liban, Jordanie, alertes voyage, consequences sur Dubai/EAU, perturbations Mer Rouge et commerce mondial
- **Tensions Taiwan/Chine** : risque pour les expats en Asie-Pacifique, impact sur les chaines d'approvisionnement, consequences pour les visas taiwanais
- **Soudan / Sahel** : coups d'Etat au Mali/Burkina/Niger, retrait de presences etrangeres, risques pour les expats en Afrique de l'Ouest
- **Myanmar** : guerre civile, sanctions, consequences pour les pays voisins (Thailande, Inde)
- Ajout de la categorie `'geopolitics'` aux filtres

**2. Analyse geopolitique academique (`src/components/academic/GeopoliticalAnalysis.tsx`)**
Mettre a jour les donnees mock :
- `mockGeopoliticalRisks` : ajouter les conflits actifs (Ukraine, Moyen-Orient, Sahel, Myanmar, tensions Chine-Taiwan) avec probabilites et impacts recalibres pour 2026
- `mockPowerIndices` : ajuster les scores France (hausse defense post-Ukraine, baisse stabilite politique)
- `mockInstitutionalIndicators` : mettre a jour les annees (2025-2026)

**3. Donnees pays en seed (`src/lib/countries-seed.ts`, `expansion-countries.ts`, `additional-countries.ts`)**
Mettre a jour les champs `risks` (safety, volatility) pour les pays directement impactes par des conflits :
- Ukraine, Israel, Myanmar, Soudan : safety et volatility a 80-95
- Pays voisins (Pologne, Jordanie, Liban, Thailande, Tchad) : ajustements de +10-20 sur safety/volatility
- Mettre a jour les `visa.notes` pour refleter les restrictions actuelles

**4. Changelog (`src/pages/Changelog.tsx`)**
Ajouter une entree `v7.3.0` "Mise a jour geopolitique mars 2026" documentant toutes les modifications

### Details techniques

- Aucun changement de schema DB requis — toutes les modifications sont dans le code frontend (donnees seed et mock)
- Ajout du filtre `geopolitics` dans les categories d'alertes reglementaires
- ~4 fichiers modifies, aucun fichier cree
- Les donnees DB seront mises a jour via la prochaine synchronisation seed → DB

### Volume estime

- 15 nouvelles alertes geopolitiques avec sources
- 8-10 risques geopolitiques mis a jour dans le module academique
- 15-20 pays avec scores de risques ajustes
- 1 entree changelog

