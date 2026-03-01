
# Routing i18n complet avec prefixes de langue

## Vue d'ensemble

Implementer un systeme de routing avec prefixes de langue (`/fr/about`, `/en/about`, `/es/about`) pour que chaque page ait une URL distincte par langue. Cela permet des hreflang valides et un meilleur SEO multilingue.

## Architecture

```text
Avant:  /about           (langue via localStorage/cookie)
Apres:  /fr/about        (langue dans l'URL)
        /en/about
        /es/about
        /              -> redirect vers /{lang_detectee}/
```

## Fichiers a modifier/creer

### 1. Nouveau composant : `src/components/i18n/LanguageRouter.tsx`

Composant wrapper qui :
- Lit le parametre `:lang` de l'URL
- Synchronise i18next avec la langue de l'URL
- Redirige vers la langue detectee si le prefixe est absent ou invalide
- Rend les routes enfants

```text
<Route path="/:lang/*" element={<LanguageRouter />}>
  <Route path="" element={<Index />} />
  <Route path="about" element={<About />} />
  ...
</Route>
<Route path="/" element={<RedirectToLanguage />} />
```

### 2. Nouveau hook : `src/hooks/useLocalizedPath.ts`

Hook utilitaire :
- `useLocalizedPath()` retourne une fonction `localizedPath(path)` qui prefixe automatiquement la langue courante
- Exemple : `localizedPath('/about')` retourne `/fr/about`

### 3. Nouveau composant : `src/components/i18n/LocalizedLink.tsx`

Remplacement drop-in de `<Link>` de react-router :
- Prefixe automatiquement le chemin avec la langue courante
- API identique a `<Link>` : `<LocalizedLink to="/about">` genere `/fr/about`

### 4. Modification : `src/routes/index.tsx`

- Retirer les prefixes `/` de toutes les routes (garder `about` au lieu de `/about`)
- Restructurer pour fonctionner avec le routing imbrique sous `/:lang/*`
- Conserver les redirections legacy avec prefixe langue

### 5. Modification : `src/App.tsx`

- Remplacer le rendu plat des routes par un routing imbrique :
  - `<Route path="/" element={<RedirectToLanguage />} />`
  - `<Route path="/:lang/*" element={<LanguageRouter />}>`
  - Routes enfants imbriquees

### 6. Modification : `src/components/LanguageSwitcher.tsx`

- Au changement de langue, naviguer vers la meme page avec le nouveau prefixe de langue
- Exemple : sur `/fr/about`, cliquer sur EN navigue vers `/en/about`
- Utiliser `useNavigate` + `useLocation` pour reconstruire le chemin

### 7. Modification : `src/components/seo/HreflangTags.tsx`

- Generer un `<link rel="alternate">` pour chacune des 13 langues supportees
- Chaque lien pointe vers la version linguistique correspondante de la page courante
- Ajouter `x-default` pointant vers la version anglaise

### 8. Modification : `src/components/Header.tsx` et `src/components/Footer.tsx`

- Remplacer tous les `<Link to="/path">` par `<LocalizedLink to="/path">`
- Importer `LocalizedLink` au lieu de `Link` de react-router

### 9. Modification : `src/i18n.ts`

- Ajouter un detecteur de langue URL (`path` detector) en priorite maximale dans l'ordre de detection
- L'URL prime sur localStorage et le navigateur

### 10. Modification : `public/sitemap.xml`

- Ajouter les variantes de langue pour les pages principales (au minimum fr et en)
- Utiliser `<xhtml:link rel="alternate" hreflang="fr" href="..."/>` dans chaque `<url>`

### 11. Modification : Pages avec `<Helmet>` (toutes les pages publiques)

- Mettre a jour les URLs canoniques pour inclure le prefixe de langue
- Mettre a jour les `og:url` pour inclure le prefixe de langue
- Utiliser un hook pour generer dynamiquement l'URL canonique avec la langue courante

## Strategie de migration

### Compatibilite ascendante

- Les anciennes URLs sans prefixe (`/about`, `/countries`) redirigent automatiquement vers `/{lang_detectee}/about`
- Le composant `RedirectToLanguage` gere la detection initiale (localStorage > navigateur > defaut `fr`)

### Ordre d'execution

1. Creer `useLocalizedPath` hook et `LocalizedLink` composant
2. Creer `LanguageRouter` wrapper
3. Mettre a jour le routeur dans `App.tsx` et `routes/index.tsx`
4. Mettre a jour `LanguageSwitcher` pour naviguer avec prefixe
5. Mettre a jour `Header.tsx` et `Footer.tsx` (remplacer Link par LocalizedLink)
6. Mettre a jour `HreflangTags.tsx` pour generer les 13 alternates
7. Mettre a jour les Helmets avec URLs canoniques dynamiques
8. Ajouter le detecteur URL a `i18n.ts`
9. Mettre a jour le sitemap

## Risques et precautions

- **Volume de changements** : Tous les `<Link>` du projet doivent etre remplaces par `<LocalizedLink>`. Un grep systematique sera fait pour ne rien oublier.
- **Redirections legacy** : Les anciennes URLs continueront de fonctionner via redirect 302.
- **SEO** : Les redirections preservent le juice SEO. Les nouvelles URLs canoniques evitent le contenu duplique.
- **Performance** : Aucun impact - le prefixe est un simple parametre de route React Router.

## Details techniques

### LanguageRouter (pseudo-code)

```text
function LanguageRouter() {
  const { lang } = useParams()
  const { i18n } = useTranslation()
  
  // Valider que lang est supporte
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    return <Navigate to={`/${i18n.language}${location.pathname}`} />
  }
  
  // Synchroniser i18n avec l'URL
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang])
  
  return <Outlet />
}
```

### LocalizedLink (pseudo-code)

```text
function LocalizedLink({ to, ...props }) {
  const { i18n } = useTranslation()
  const localTo = `/${i18n.language}${to}`
  return <Link to={localTo} {...props} />
}
```

## Fichiers impactes : ~15-20 fichiers

| Fichier | Action |
|---------|--------|
| `src/components/i18n/LanguageRouter.tsx` | Creer |
| `src/components/i18n/LocalizedLink.tsx` | Creer |
| `src/hooks/useLocalizedPath.ts` | Creer |
| `src/App.tsx` | Modifier (routing imbrique) |
| `src/routes/index.tsx` | Modifier (retirer / prefixes) |
| `src/components/LanguageSwitcher.tsx` | Modifier (naviguer avec prefixe) |
| `src/components/seo/HreflangTags.tsx` | Modifier (13 alternates) |
| `src/components/Header.tsx` | Modifier (LocalizedLink) |
| `src/components/Footer.tsx` | Modifier (LocalizedLink) |
| `src/components/navigation/AppSidebar.tsx` | Modifier (LocalizedLink) |
| `src/i18n.ts` | Modifier (detecteur URL) |
| `public/sitemap.xml` | Modifier (variantes langues) |
| Pages avec Helmet (30+) | Modifier (canonical dynamique) |
