

# Audit complet -- Creation de compte (Beta Testeurs)

## 1. Etat actuel de la base utilisateurs

| Email | Display Name | Cree le | Email confirme | Derniere connexion | Provider |
|---|---|---|---|---|---|
| m.laeticia@hotmail.fr | Laeti | 8 jan 2026 | Oui (auto) | 6 fev 2026 | email |
| test-audit@example.com | Test Utilisateur | 6 fev 2026 | Oui (auto) | 6 fev 2026 | email |
| audit-beta-test@example.com | Audit Beta | 8 fev 2026 (test live) | Oui (auto) | 8 fev 2026 | email |

**Constat critique** : Seulement **1 vrai utilisateur** (Laeti) en 1 mois. Les 2 autres sont des comptes de test. L'adoption est quasi nulle.

## 2. Test live de la creation de compte

J'ai cree un compte en direct via le navigateur. Resultat :
- Le formulaire fonctionne techniquement (nom, email, mot de passe)
- Le password strength meter fonctionne
- Le compte est cree dans la base de donnees
- Le profil est bien cree dans la table `profiles`
- L'utilisateur est **immediatement redirige** vers la page d'accueil
- **Aucun message de succes** n'est affiche apres l'inscription

## 3. Problemes identifies

### P0 -- Bloquants potentiels

| # | Probleme | Impact | Detail |
|---|---|---|---|
| 1 | **Pas de message de confirmation apres inscription** | L'utilisateur ne sait pas si son compte a ete cree | Apres `signUp()` reussi, le code fait seulement `trackAccountCreated()` puis le `useEffect` redirige silencieusement vers `/`. L'utilisateur arrive sur la homepage sans aucun feedback. |
| 2 | **Auto-confirm active = pas d'email de bienvenue** | L'utilisateur s'inscrit mais ne recoit aucun email | Les emails sont auto-confirmes (`email_confirmed_at` = `created_at`). La fonction `send-email` n'a **aucun log** = elle n'est jamais appelee. Le webhook hook n'est probablement pas configure dans les settings d'authentification. |
| 3 | **Secret `SEND_EMAIL_HOOK_SECRET` absent des secrets** | Le webhook d'email ne peut pas fonctionner | La fonction `send-email` attend ce secret mais il n'est pas configure dans les secrets du projet. |
| 4 | **Aucun onboarding apres inscription** | Un nouvel utilisateur arrive sur la homepage sans savoir quoi faire | Pas de tutoriel, pas de redirection vers `/quick-test`, pas de welcome modal. |

### P1 -- UX/Conversion

| # | Probleme | Impact |
|---|---|---|
| 5 | **Redirection vers `/` au lieu de `/dashboard` ou `/quick-test`** | L'utilisateur inscrit atterrit sur la page marketing au lieu d'etre guide vers une action |
| 6 | **Pas de toast de bienvenue** | Aucun retour visuel que l'inscription a reussi |
| 7 | **`email_verified: false` dans identity_data** | Bien que `email_confirmed_at` soit set, le champ `email_verified` dans `identity_data` reste `false` -- incoherence potentielle |

### P2 -- Accessibilite

| # | Probleme | Impact |
|---|---|---|
| 8 | **Pas d'attribut `autocomplete` sur les inputs** | Warning console : les champs password n'ont pas `autocomplete="current-password"` ou `autocomplete="new-password"` |
| 9 | **Erreur CORS manifest.json** | Erreur console non bloquante mais visible liee au PWA manifest |

## 4. Analyse du flux d'inscription (code)

```text
Utilisateur clique "Inscription"
       |
       v
[Validation Zod: email + password + displayName]
       |
       v
[supabase.auth.signUp({ email, password, data: { display_name } })]
       |
       v
[Auto-confirm ON => compte immediatement actif]
       |
       v
[trackAccountCreated() -- analytics seulement]
       |                                         
       v                           MANQUANT:
[useEffect detecte user => navigate('/')]  - Pas de toast succes
       |                                  - Pas de redirection onboarding
       v                                  - Pas d'email de bienvenue
[Homepage marketing]                      - Pas de welcome modal
```

## 5. Plan de corrections

### Correction 1 : Ajouter un toast de bienvenue + rediriger vers le quick-test

**Fichier** : `src/pages/Auth.tsx`

Apres le `signUp` reussi (ligne 96), ajouter un toast de succes. Modifier le `useEffect` de redirection pour envoyer les **nouveaux** utilisateurs vers `/quick-test` au lieu de `/`.

Logique :
- Ajouter un state `isNewSignup` 
- Apres `signUp` reussi sans erreur, set `isNewSignup = true`
- Dans le `useEffect`, si `isNewSignup`, rediriger vers `/quick-test` avec un toast "Bienvenue ! Decouvrez votre profil d'expatrie."
- Sinon (login), rediriger vers `/dashboard`

### Correction 2 : Ajouter les attributs `autocomplete` aux inputs

**Fichier** : `src/pages/Auth.tsx`

- Input email : `autoComplete="email"`
- Input password (login) : `autoComplete="current-password"`
- Input password (signup) : `autoComplete="new-password"`
- Input displayName : `autoComplete="name"`

### Correction 3 : Rediriger les logins vers `/dashboard` au lieu de `/`

**Fichier** : `src/pages/Auth.tsx`

Modifier le `useEffect` : `navigate('/dashboard')` au lieu de `navigate('/')` pour que les utilisateurs connectes aillent directement vers leur tableau de bord.

### Correction 4 : Ajouter un message d'erreur plus clair pour les erreurs reseau

**Fichier** : `src/pages/Auth.tsx`

Le `catch` generique (ligne 100) affiche `auth.errors.generic` -- verifier que cette cle de traduction existe et est claire.

---

## Hors perimetre (necessite action manuelle)

- **Configurer le webhook `send-email`** : Le secret `SEND_EMAIL_HOOK_SECRET` doit etre ajoute et le hook configure dans les parametres d'authentification du backend. Cela sera signale apres implementation.
- **Desactiver l'auto-confirm si les emails de bienvenue doivent fonctionner** : A discuter selon la strategie souhaitee (auto-confirm = pas de friction, mais pas d'email).

