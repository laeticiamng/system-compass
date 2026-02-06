

# Audit Beta Testeur v25 -- Derniers residus

## Constat

Les audits v22-v24 ont corrige la quasi-totalite du jargon. Cet audit final identifie **2 residus visibles** par l'utilisateur.

---

## 2 corrections restantes

### 1. Page Ressources -- titre module "Exit Keys"

| Fichier | Ligne | Texte actuel | Correction |
|---------|-------|-------------|------------|
| `src/lib/module-completion.ts` | 50 | `title: 'Exit Keys'` | `title: 'Strategies'` |

Ce titre est affiche tel quel sur la page `/resources` (ligne 326 de Resources.tsx : `module.title`). Un utilisateur voit "Exit Keys" sans comprendre de quoi il s'agit.

### 2. CountryMusicPlayer -- tooltip "systeme de vie"

| Fichier | Ligne | Texte actuel | Correction |
|---------|-------|-------------|------------|
| `src/components/CountryMusicPlayer.tsx` | 302 | `'La musique représente le système de vie de ce pays. Elle incarne le rythme, les tensions et les opportunités du système.'` | `'La musique représente l\'ambiance de ce pays. Elle incarne le rythme, les tensions et les opportunités de la vie locale.'` |

Le terme "systeme de vie" et "du systeme" est du jargon interne. "Ambiance" et "vie locale" sont immediats.

---

## Ce qui est valide (aucune correction)

- Landing page, QuickTest, Dashboard, Pricing, Navigation, Shortcuts, DeleteAccount, Email : tous corriges dans v22-v24
- MentionsLegales : "Exit Keys" en marque deposee -- usage legal, pas de modification
- Commentaires de code, variables, tests : non visibles, pas corriges

---

## Details techniques

### Etape 1 : Corriger module-completion.ts ligne 50
Remplacer `title: 'Exit Keys'` par `title: 'Stratégies'`.

### Etape 2 : Corriger CountryMusicPlayer.tsx ligne 302
Remplacer le fallback tooltip par un texte sans jargon "systeme".

### Verification
2 fichiers modifies, 0 changement de logique/securite/base de donnees.

