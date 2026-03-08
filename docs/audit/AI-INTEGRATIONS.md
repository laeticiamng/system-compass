# 🤖 Intégrations IA - Limites et Fallbacks

> Dernière mise à jour : 2026-02-03

## Vue d'ensemble

Compass utilise plusieurs services IA externes. Ce document décrit leurs limites et les stratégies de fallback.

## Modèles Utilisés

### Lovable AI (Intégré - Sans clé requise)

| Modèle | Usage | Fallback |
|--------|-------|----------|
| `google/gemini-2.5-flash` | Génération rapide, classifications | Données statiques pré-générées |
| `openai/gpt-5-mini` | Analyses complexes | Cache 24h + fallback Gemini |

**Avantage** : Ces modèles sont inclus dans Lovable Cloud, aucune clé API requise.

### Services Externes (Clés requises)

| Service | Usage | Clé Requise | Fallback |
|---------|-------|-------------|----------|
| OpenAI GPT-4/5 | Génération profils pays approfondis | `OPENAI_API_KEY` | Lovable AI models |
| ElevenLabs | Guides audio TTS | `ELEVENLABS_API_KEY` | Mode texte uniquement |
| Suno AI | Musique générée par pays | `SUNO_API_KEY` | Playlist Spotify externe |
| Perplexity | Recherche augmentée | `PERPLEXITY_API_KEY` | Recherche web standard |
| Firecrawl | Scraping intelligent | `FIRECRAWL_API_KEY` | Données statiques |

## Stratégies de Fallback

### 1. Cache Intelligent

```typescript
// Exemple de stratégie de cache
const CACHE_CONFIG = {
  country_profiles: { ttl: '7d', fallback: 'static_json' },
  financial_intel: { ttl: '24h', fallback: 'cached_data' },
  translations: { ttl: '30d', fallback: 'source_lang' }
};
```

### 2. Dégradation Gracieuse

Quand un service IA est indisponible :

1. **Niveau 1** : Utiliser le cache existant
2. **Niveau 2** : Basculer vers un modèle alternatif (Lovable AI)
3. **Niveau 3** : Afficher les données statiques pré-générées
4. **Niveau 4** : Message utilisateur avec action alternative

### 3. Mode Hors-Ligne

Les fonctionnalités suivantes restent disponibles sans connexion :

- ✅ Navigation dans les profils pays (données pré-chargées)
- ✅ Comparateur de pays (calculs locaux)
- ✅ Dashboard Exit Keys (stockage local)
- ✅ Jeu de simulation (logique client-side)
- ❌ Génération IA en temps réel
- ❌ Recherche augmentée
- ❌ Génération audio/musique

## Coûts et Quotas

### Estimation Mensuelle (Usage Moyen)

| Service | Coût Estimé | Quota Inclus |
|---------|-------------|--------------|
| Lovable AI | Inclus | Illimité |
| OpenAI | ~$50-200 | Selon usage |
| ElevenLabs | ~$22-99 | 100k-500k chars |
| Suno | ~$10-30 | 500-2000 générations |

### Gestion des Quotas

```typescript
// ai_usage_metering table tracks:
- ai_tokens_used
- ai_actions_count
- quota_limit
- alert_70_sent / alert_90_sent / alert_100_sent
```

## Configuration Recommandée

### Minimum Viable (Gratuit)
- Lovable AI uniquement
- Données pré-générées pour 195 pays
- Traductions FR/EN complètes

### Standard
- + OpenAI pour génération dynamique
- + Cache 7 jours

### Premium
- + ElevenLabs pour audio
- + Suno pour musique
- + Perplexity pour recherche temps réel

## Tests Sans Clés API

Pour les contributeurs sans accès aux services payants :

```bash
# Mode développement avec mocks
VITE_AI_MOCK_MODE=true npm run dev

# Les edge functions retournent des données de test
# Aucune clé API requise
```

## Monitoring

Les métriques IA sont trackées dans :
- `ai_activity_log` : Chaque appel IA
- `ai_usage_metering` : Quotas mensuels
- Edge function logs : Erreurs et latences
