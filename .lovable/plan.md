

# Plan : Rendre le module Healthcare visible depuis la Homepage et la Navigation

## Constat

Le module Healthcare (`/healthcare`) existe avec 5 onglets fonctionnels (Procédures, Simulateur fiscal, Communauté, Alertes, Checklist documents) mais il est **totalement invisible** :
- Aucune mention sur la homepage
- Aucun lien dans le Header (nav principale ni dropdown Outils)
- Aucun lien dans le menu mobile
- Pas de parcours utilisateur dédié dans la section `UserJourneys`

## Changements prévus

### 1. Homepage — Ajout d'un parcours "Professionnel de Santé" dans UserJourneys

Ajouter un 4e parcours dans `src/components/landing/UserJourneys.tsx` :
- Icone : `Stethoscope`
- Titre : "Professionnel de Santé"
- Description : "Reconnaissance de diplôme, autorisation d'exercer, simulateur fiscal transfrontalier et checklist documents personnalisée."
- Route : `/healthcare`
- Couleur : vert (emerald) pour se distinguer des 3 existants
- Grid passe de `md:grid-cols-3` à `md:grid-cols-4` (ou 2x2 sur mobile)

### 2. Homepage — Section dédiée Healthcare avant le CTA final

Ajouter une section spécifique entre les témoignages et le pricing (ou entre pricing et FAQ) dans `src/pages/Index.tsx` avec :
- Titre : "Vous êtes professionnel de santé ?"
- Sous-titre : "Parcours dédié : reconnaissance de diplôme, protection sociale, simulateur fiscal transfrontalier"
- 4 badges visuels (MEBEKO, CNOM, Simulateur, Checklist)
- CTA "Découvrir le parcours santé" → `/healthcare`

### 3. Header — Lien Healthcare dans le dropdown Outils

Ajouter dans `toolsItems` de `src/components/Header.tsx` :
```
{ href: '/healthcare', label: t('nav.healthcare', 'Parcours Santé'), icon: Stethoscope }
```

### 4. Homepage — Section "Fonctionnalités clés" enrichie

Dans la section FAQ, ajouter une question dédiée :
- "Compass est-il adapté aux professionnels de santé ?" → réponse mentionnant les 5 fonctionnalités healthcare.

## Détails techniques

- Import `Stethoscope` de lucide-react dans les fichiers concernés
- Toutes les chaînes passent par `t()` pour l'i18n
- Les animations reprennent le pattern framer-motion existant (`whileInView`)
- Aucun changement backend ou DB requis

