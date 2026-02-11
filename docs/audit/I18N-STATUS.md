# 🌍 Internationalisation - Statut et Roadmap

> Dernière mise à jour : 2026-02-03

## Langues Supportées

### Couverture Complète (100%)

| Langue | Code | Clés | Statut |
|--------|------|------|--------|
| 🇫🇷 Français | `fr` | ~3500 | ✅ Référence |
| 🇬🇧 Anglais | `en` | ~3500 | ✅ Complet |

### Couverture Partielle (70-95%)

| Langue | Code | Couverture | Sections Complètes |
|--------|------|------------|-------------------|
| 🇩🇪 Allemand | `de` | ~95% | UI core, navigation, errors |
| 🇪🇸 Espagnol | `es` | ~95% | UI core, navigation, errors |
| 🇮🇹 Italien | `it` | ~90% | UI core, navigation |
| 🇳🇱 Néerlandais | `nl` | ~90% | UI core, navigation |
| 🇵🇹 Portugais | `pt` | ~85% | UI core |

### En Développement (50-70%)

| Langue | Code | Couverture | Notes |
|--------|------|------------|-------|
| 🇷🇺 Russe | `ru` | ~70% | Cyrillique OK |
| 🇨🇳 Chinois | `zh` | ~65% | Simplifié |
| 🇮🇳 Hindi | `hi` | ~60% | Devanagari OK |
| 🇧🇩 Bengali | `bn` | ~55% | Script Bengali OK |

### Langues RTL (Right-to-Left)

| Langue | Code | Couverture | Support RTL |
|--------|------|------------|-------------|
| 🇸🇦 Arabe | `ar` | ~50% | ⚠️ Partiel |
| 🇵🇰 Ourdou | `ur` | ~45% | ⚠️ Partiel |

## Support RTL - État Actuel

### Implémenté

- ✅ Fichiers de traduction `ar.json` et `ur.json` présents
- ✅ Détection automatique de la langue via `i18next-browser-languagedetector`
- ✅ Attribut `dir="rtl"` conditionnel sur `<html>`

### À Améliorer

- ⚠️ Certains composants UI nécessitent des ajustements RTL
- ⚠️ Icônes directionnelles (flèches) à inverser
- ⚠️ Layouts Flexbox à vérifier (`flex-row-reverse`)

### Configuration RTL

```typescript
// src/i18n.ts
const RTL_LANGUAGES = ['ar', 'ur', 'he', 'fa'];

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});
```

## Système de Fallback

```
Langue demandée → Si clé manquante → Anglais → Si clé manquante → Français
```

Exemple : Un utilisateur Hindi verra :
1. Traduction Hindi si disponible
2. Sinon traduction Anglaise
3. Sinon clé Française (référence)

## Tests i18n

### CI/CD Automatisé

```bash
# Vérification des clés dupliquées
node scripts/check-duplicate-keys.js

# Vérification des patterns de traduction
node scripts/check-translation-patterns.js

# Vérification des clés manquantes
node scripts/check-translation-keys.js

# Rapport de couverture
node scripts/generate-i18n-coverage.js
```

### Tolérance de Test

| Langue | Tolérance clés manquantes |
|--------|---------------------------|
| FR, EN | 0% (doit être 100%) |
| DE, ES, IT, NL, PT | 25% max |
| RU, ZH, HI, BN | 50% max |
| AR, UR | 75% max |

## Roadmap i18n

### Q1 2026 (En cours)
- [ ] Compléter DE, ES, IT, NL à 100%
- [ ] Améliorer support RTL pour AR
- [ ] Ajouter tests visuels RTL

### Q2 2026
- [ ] Atteindre 90%+ sur RU, ZH, HI
- [ ] Compléter UR à 70%+
- [ ] Ajouter Japonais (ja)

### Q3 2026
- [ ] Validation par locuteurs natifs
- [ ] Support dialectes (es-MX, pt-BR)
- [ ] Hébreu (he) - RTL

## Contribution

Pour ajouter/améliorer une traduction :

1. Copier `src/locales/en.json` comme base
2. Traduire les valeurs (pas les clés)
3. Lancer `node scripts/check-translation-keys.js`
4. Soumettre une PR

### Conventions

- Utiliser le vouvoiement formel
- Respecter la ponctuation locale
- Conserver les variables `{{variable}}`
- Ne pas traduire les noms propres (System Compass, Exit Keys)
