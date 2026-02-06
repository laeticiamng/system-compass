

# Audit des 4 problemes UX signales -- Verification et corrections

## Statut de chaque probleme

| Probleme | Statut | Detail |
|----------|--------|--------|
| 1. Positionnement trop flou | PARTIELLEMENT RESOLU | Le hero a un titre et sous-titre concrets, mais le CTA "Decouvrir mon profil gratuitement" ne dit pas clairement CE QU'ON OBTIENT (une analyse de situation pays/fiscalite). |
| 2. Les 3 etapes pas assez explicites | PARTIELLEMENT RESOLU | Les descriptions sont meilleures, mais "pyramide" et "Exit Keys" restent du jargon incomprehensible pour un visiteur qui arrive pour la premiere fois. |
| 3. Les 3 etapes ressemblent a des boutons | NON RESOLU | Les Cards ont `hover:border-primary/30` et un style interactif. Rien n'est cliquable mais l'utilisateur croit que c'est cliquable. |
| 4. Mobile : espacement exit case | RESOLU | Les sections du bas ont un padding adequat (`py-20 md:py-32`). La separation est nette visuellement. |

## Corrections a implementer

### Correction 1 : Rendre le positionnement plus concret

Le sous-titre du hero sera reformule pour expliciter le resultat tangible :

**Avant** : "Analyse les regles reelles des pays et obtiens tes strategies de sortie personnalisees."

**Apres** : "Reponds a quelques questions, decouvre quels pays correspondent a ton profil, et obtiens un plan d'action concret." (via la cle i18n `landing.hero.subtitle`)

### Correction 2 : Rendre les 3 etapes comprehensibles sans jargon

Les titres et descriptions seront reformules :

**Etape 1** (inchange -- deja clair) :
- Titre : "Fais le test"
- Description : "2 minutes pour decouvrir ton profil et tes priorites de vie."

**Etape 2** :
- **Avant** : "Decouvre ta pyramide" / "Comprends quel type de systeme te correspond le mieux."
- **Apres** : "Analyse ton systeme" / "Decouvre comment fonctionne le systeme economique et fiscal de chaque pays."

**Etape 3** :
- **Avant** : "Obtiens tes Exit Keys" / "Strategies personnalisees pour tes decisions de vie."
- **Apres** : "Obtiens ton plan d'action" / "Recois des strategies concretes adaptees a ta situation et tes objectifs."

### Correction 3 : Transformer les 3 Cards en guide visuel (timeline) au lieu de boutons

Les `<Card>` avec hover interactif seront remplaces par un layout timeline vertical sans effet de survol, visuellement non-cliquable :

- Supprimer `hover:border-primary/30 transition-colors` des Cards
- Ajouter `pointer-events-none` pour enlever tout feedback interactif
- Ajouter une ligne verticale reliant les 3 etapes (trait vertical entre les numeros `01`, `02`, `03`)
- Les numeros deviennent des cercles connectes par une ligne, creant un effet "timeline/progression"

Cela transforme le bloc en guide informatif au lieu de 3 boutons.

### Correction 4 : Pas de correction necessaire

L'espacement mobile est deja adequat. Les sections utilisent `py-20 md:py-32` avec des separations visuelles claires (fond alterne `bg-muted/30`).

## Details techniques

Fichier modifie : `src/pages/Index.tsx`

### Changements i18n (cles modifiees)
- `landing.hero.subtitle` : nouveau texte plus concret
- `landing.howItWorks.step2Title` : "Analyse ton systeme"
- `landing.howItWorks.step2Description` : nouvelle description sans jargon
- `landing.howItWorks.step3Title` : "Obtiens ton plan d'action"
- `landing.howItWorks.step3Description` : nouvelle description concretes

### Changements CSS/JSX (section "Comment ca marche")
- Remplacement de la grille de 3 Cards par un layout timeline vertical sur mobile, horizontal sur desktop
- Suppression des hover effects interactifs sur les etapes
- Ajout d'une ligne connectrice entre les etapes (pseudo-element ou div decoratif)
- Les Cards deviennent des `<div>` simples avec `pointer-events-none` au lieu de Cards interactives

