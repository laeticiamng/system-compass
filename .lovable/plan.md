

# AUDIT DEFINITIF v5 — System Compass (6 mars 2026)

---

## 1. RESUME EXECUTIF

La plateforme est globalement solide avec un hero landing clair, une auth complete, et la majorite des correctifs des audits v2-v4 en place. Cependant, **4 fichiers importent encore `Link` de react-router-dom** (NotFound, Partners, Pricing, AdminGenerateTranslations), le scan de securite revele **5 findings "error"** (newsletter emails exposees, event registrations, consultations, experts), et le **disclaimer banner chevauche toujours le mini-demo sur mobile** malgre le `pb-24` ajoute precedemment. Le header contient une navigation desktop avec **8 entrees visibles + 3 dropdowns** ce qui reste dense.

**Publiable aujourd'hui : OUI SOUS CONDITIONS** (3 correctifs obligatoires)

**Note globale : 16/20**

**Top 5 risques restants :**
1. `NotFound.tsx` importe `Link` de react-router-dom — les liens 404 cassent le prefixe i18n
2. `Pricing.tsx` et `Partners.tsx` importent `Link` de react-router-dom — meme probleme
3. Newsletter subscriptions emails lisibles par tout utilisateur authentifie (finding securite error)
4. Event registrations guest data accessible aux utilisateurs authentifies (finding securite error)
5. Disclaimer banner mobile chevauche toujours le mini-demo (z-index/overlap non resolu)

**Top 5 forces :**
1. Auth solide : Zod i18n, password strength, social login, magic link, password reset
2. Hero landing excellent : proposition de valeur en 3 secondes, CTA "gratuit" clair
3. Routes admin toutes protegees par RequireAdmin (seed-translations, diagnostics inclus)
4. Architecture i18n mature : LanguageRouter, LocalizedLink, useLocalizedNavigate
5. RGPD complet : consent, anonymisation 90j, deletion cascade, audit trail

---

## 2. PROBLEMES IDENTIFIES — PAR PRIORITE

### P0 — Bloquant production

**1. `NotFound.tsx` importe `Link` de react-router-dom au lieu de `LocalizedLink`**
- Ligne 1 : `import { Link, useLocation } from "react-router-dom"`
- Impact : Tous les liens de la page 404 (accueil, pays, test) ignorent le prefixe langue
- Correction : Remplacer par `import { LocalizedLink as Link } from '@/components/i18n'` + garder `useLocation` de react-router-dom

**2. `Pricing.tsx` importe `Link` de react-router-dom**
- Ligne 11 : `import { Link } from "react-router-dom"`
- Correction : Remplacer par `import { LocalizedLink as Link } from '@/components/i18n'`

**3. `Partners.tsx` importe `Link` de react-router-dom**
- Ligne 15 : `import { Link } from "react-router-dom"`
- Correction : Idem

**4. `AdminGenerateTranslations.tsx` importe `Link` de react-router-dom**
- Ligne 29 : `import { Link } from "react-router-dom"`
- Correction : Idem

### P1 — Critique securite

**5. Newsletter emails exposees aux utilisateurs authentifies**
- Finding securite : la policy RLS `Authenticated users can view newsletter subscriptions` permet a tout user connecte de lire les emails des abonnes newsletter
- Correction : Restreindre le SELECT aux admins uniquement via migration SQL

**6. Event registrations guest data accessible**
- Les guest_name et guest_email sont lisibles par les utilisateurs authentifies
- Correction : Restreindre le SELECT aux propriétaires de l'inscription ou admins

**7. Consultations exposent les relations user-expert**
- Correction : Restreindre aux participants directs (user_id et expert_id) + admins

### P2 — UX

**8. Disclaimer banner mobile chevauche toujours le mini-demo**
- Le `pb-24` ajoute precedemment ne suffit pas car le banner est `fixed bottom-0` avec z-50
- Le banner utilise `pointer-events-none` sur le wrapper mais `pointer-events-auto` sur le contenu
- La mini-demo France/Portugal est partiellement cachee
- Correction : Ajouter `mb-24` au container de la mini-demo (`HeroMiniDemo`) ou reduire la hauteur du banner sur mobile

**9. Header desktop : "Tools" apparait 2 fois**
- A la fois comme item nav (`/tools`) ET comme dropdown trigger ("Outils" avec chevron)
- Un utilisateur voit "Tools" puis "Outils" avec dropdown — confusion
- Correction : Retirer l'item nav "Outils" des `navItems` puisque le dropdown exists deja

---

## 3. PLAN D'IMPLEMENTATION

### Etape 1 : Migration Link restantes (4 fichiers)
- `NotFound.tsx` : `import { LocalizedLink as Link } from '@/components/i18n'` + separer `useLocation` import
- `Pricing.tsx` : remplacer import Link
- `Partners.tsx` : remplacer import Link
- `AdminGenerateTranslations.tsx` : remplacer import Link

### Etape 2 : Securite RLS (3 migrations SQL)
- Newsletter : DROP la policy permissive pour authenticated, garder uniquement admin
- Event registrations : restreindre SELECT aux owner (user_id = auth.uid() OR guest_email match) + admins
- Consultations : restreindre SELECT aux participants (user_id = auth.uid() OR expert in relation)

### Etape 3 : UX fixes
- Retirer l'item "Outils" duplique du `navItems` array dans Header.tsx (le dropdown suffit)
- Ajouter du spacing suffisant entre le mini-demo et le bas du viewport pour le disclaimer mobile

### Etape 4 : Header navigation dedup
- Retirer `{ href: '/tools', ... }` de navItems ligne 59 du Header

