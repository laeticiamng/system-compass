

# Audit Beta Testeur v24 -- Derniers residus visibles

## Constat

Les corrections v22 et v23 ont elimine les jargons principaux. Cet audit final identifie **4 residus visibles par l'utilisateur** qui n'ont pas encore ete corriges.

---

## 4 corrections restantes

### 1. QuickTest subtitle -- jargon "systeme"

| Fichier | Ligne | Texte actuel | Correction |
|---------|-------|-------------|------------|
| `src/pages/QuickTest.tsx` | 274 | `'En 60 secondes, découvre le système qui ressemble à ta situation'` | `'En 60 secondes, découvre le pays qui correspond à ta situation'` |

Un beta testeur qui lit "le systeme" ne comprend pas de quoi il s'agit. "Le pays" est concret et immediat.

### 2. DeleteAccountSection -- jargon "Exit Keys"

| Fichier | Ligne | Texte actuel | Correction |
|---------|-------|-------------|------------|
| `src/components/auth/DeleteAccountSection.tsx` | 104 | `'Supprimer vos Exit Keys et comparaisons'` | `'Supprimer vos stratégies et comparaisons'` |

Visible dans la modale de suppression de compte.

### 3. Email de confirmation -- jargon "Exit Keys"

| Fichier | Ligne | Texte actuel | Correction |
|---------|-------|-------------|------------|
| `supabase/functions/send-email/_templates/confirmation-email.tsx` | 88 | `'🔑 <strong>Exit Keys</strong> — Débloquez vos stratégies de mobilité personnalisées'` | `'🔑 <strong>Stratégies</strong> — Débloquez vos stratégies de mobilité personnalisées'` |

Visible dans l'email envoye aux nouveaux inscrits.

### 4. MentionsLegales -- OK (pas de correction)

"Exit Keys" dans MentionsLegales est une reference de marque deposee -- usage legal correct, pas de modification.

---

## Ce qui est valide (aucune correction)

- **Landing page** : "Tu veux t'expatrier ? Compare les pays" -- clair en < 3 secondes
- **CTA principal** : "Trouver mon pays ideal -- gratuit" -- immediat
- **QuickTest titre** : "Decouvre ton profil expatrie" -- corrige v23
- **QuickTest resultats** : "Ton profil" + "Vos recommandations personnalisees" -- pas de jargon
- **Pricing** : 3 colonnes coherentes avec CheckCircle verts uniformes
- **Navigation/Shortcuts** : "Strategies" partout, plus de "Exit Keys"
- **Commentaires code / noms de variables** : non visibles par l'utilisateur, pas corriges

---

## Details techniques

### Etape 1 : Corriger QuickTest.tsx ligne 274
Remplacer le fallback `'En 60 secondes, découvre le système qui ressemble à ta situation'` par `'En 60 secondes, découvre le pays qui correspond à ta situation'`.

### Etape 2 : Corriger DeleteAccountSection.tsx ligne 104
Remplacer `'Supprimer vos Exit Keys et comparaisons'` par `'Supprimer vos stratégies et comparaisons'`.

### Etape 3 : Corriger confirmation-email.tsx ligne 88
Remplacer `Exit Keys` par `Stratégies` dans le texte de l'email.

### Verification
3 fichiers modifies, 0 changement de logique/securite/base de donnees.

