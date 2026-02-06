

# Audit C-Suite v3 — Constat et Corrections

## Etat actuel apres les corrections v2

| Element | Statut |
|---------|--------|
| Suppression de compte RGPD | OK - DeleteAccountSection fonctionnel |
| Faux temoignages Index.tsx | OK - TestimonialsSection utilisee |
| Faux noms (5 fichiers) | OK - Remplaces par "Membre Beta", "Client verifie", etc. |
| Toasts SecuritySettings i18n | OK - Utilise t() |

## Problemes restants detectes

### 1. SecuritySettings.tsx — 20+ chaines FR hardcodees (Design / CPO)
Les toasts utilisent `t()`, mais tout le reste de l'interface (titres de cartes, descriptions, labels, conseils de securite) est encore en francais dur. Exemples :
- "Mot de passe" (ligne 87)
- "Gerez la securite de votre mot de passe" (ligne 89)
- "Authentification a deux facteurs" (ligne 138)
- "Conseils de securite" (ligne 219)
- 15+ autres chaines

### 2. DiscussionThread.tsx — Reference residuelle a "Jean-Pierre" (CMO)
Ligne 52 : le contenu d'un commentaire mentionne encore "Meme experience que Jean-Pierre" alors que l'auteur a ete anonymise. Incoherence.

### 3. Index.tsx — 40+ chaines FR hardcodees (CPO / Design)
La landing page entiere n'utilise pas `t()` malgre l'import de `useTranslation`. Chaque texte visible est en francais dur. C'est un chantier i18n majeur.

---

## Plan de corrections

### Correction 1 : SecuritySettings i18n complet
Passer toutes les chaines restantes par `t()` avec fallback FR :
- Titres de cartes (Mot de passe, 2FA, Alertes, Conseils)
- Descriptions
- Labels et textes de boutons
- Liste des conseils de securite

### Correction 2 : DiscussionThread nettoyage
Remplacer "Meme experience que Jean-Pierre" par "Meme experience ici" ou un equivalent sans nom propre.

### Correction 3 : Index.tsx i18n (chantier majeur)
Passer les ~40 chaines de la landing page par `t()` avec fallback FR :
- Hero (titre, sous-titre, badge, CTAs)
- Section "Comment ca marche" (3 etapes)
- Section "Exemple fiche pays"
- Section Pricing (plans Free et Premium)
- CTA final

---

## Details techniques

**SecuritySettings.tsx** : Ajouter ~20 appels `t()` pour les CardTitle, CardDescription, Label, et textes statiques. La structure du composant reste inchangee.

**DiscussionThread.tsx** : Modification d'une seule ligne (52) — remplacement du contenu texte.

**Index.tsx** : Remplacement systematique de chaque chaine par `t('landing.xxx', 'Texte FR')`. L'import `useTranslation` est deja present (ligne 8), et `_t` est declare mais non utilise (ligne 34) — il suffit de renommer `_t` en `t` et de l'utiliser.
