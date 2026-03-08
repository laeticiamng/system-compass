# API Documentation — Compass

Documentation complète des Edge Functions et de l'architecture.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (React Query)
- **Backend**: Lovable Cloud (Supabase)
- **i18n**: i18next (10+ languages)

### Performance Optimizations

**Code Splitting (Lazy Loading)**
- Heavy routes are lazy-loaded via `src/routes/LazyRoutes.tsx`
- Eager: Index, Auth, About, Pricing
- Lazy: Countries, Game, Dashboard, Admin

**Query Caching**
- `staleTime`: 5 minutes
- `gcTime`: 30 minutes
- `refetchOnWindowFocus`: false

---

## Table des matières

1. [Authentification](#authentification)
2. [Abonnements](#abonnements)
3. [IA et Génération](#ia-et-génération)
4. [TraceOS](#traceos)
5. [Internationalization](#internationalization)
6. [Notifications](#notifications)

---

## Authentification

Toutes les Edge Functions utilisent l'authentification JWT via le header `Authorization: Bearer <token>`.

```typescript
const { data: { session } } = await supabase.auth.getSession();
const response = await supabase.functions.invoke('function-name', {
  body: { ... },
  headers: {
    Authorization: `Bearer ${session?.access_token}`
  }
});
```

---

## Abonnements

### `create-checkout`

Crée une session de paiement Stripe pour un abonnement.

**Endpoint:** `POST /functions/v1/create-checkout`

**Body:**
```json
{
  "tier": "premium" | "pro"
}
```

**Réponse:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Exemple:**
```typescript
const { data, error } = await supabase.functions.invoke('create-checkout', {
  body: { tier: 'premium' }
});

if (data?.url) {
  window.location.href = data.url;
}
```

---

### `check-subscription`

Vérifie le statut d'abonnement de l'utilisateur connecté.

**Endpoint:** `POST /functions/v1/check-subscription`

**Body:** aucun

**Réponse:**
```json
{
  "subscribed": true,
  "tier": "premium" | "pro" | "free",
  "subscription_end": "2025-01-01T00:00:00Z"
}
```

**Exemple:**
```typescript
const { data } = await supabase.functions.invoke('check-subscription');
console.log(`Tier actuel: ${data.tier}`);
```

---

### `customer-portal`

Génère un lien vers le portail client Stripe pour gérer l'abonnement.

**Endpoint:** `POST /functions/v1/customer-portal`

**Réponse:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

---

## IA et Génération

### `ai-assist`

Assistant IA pour les différents modules de l'application.

**Endpoint:** `POST /functions/v1/ai-assist`

**Body:**
```json
{
  "action": "next_logical_step" | "plan_30_90" | "analyze_decision" | "...",
  "context": {
    "module": "dashboard" | "exit-keys" | "ovi" | "...",
    "progress": { ... },
    "profile": { ... }
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "response": "Suggestion détaillée de l'IA...",
  "suggestions": ["Action 1", "Action 2"]
}
```

**Actions disponibles:**
- `next_logical_step` - Suggère la prochaine étape logique
- `plan_30_90` - Génère un plan sur 30/90 jours
- `soft_reminders` - Génère des rappels personnalisés
- `analyze_decision` - Analyse une décision
- `generate_alternatives` - Génère des alternatives

---

### `generate-country-profile`

Génère un profil pays complet via GPT-4.

**Endpoint:** `POST /functions/v1/generate-country-profile`

**Body:**
```json
{
  "country": {
    "id": "portugal",
    "name": "Portugal",
    "iso2": "PT",
    "region": "europe-west",
    "primaryPyramid": "network"
  },
  "jobId": "uuid-optional"
}
```

**Réponse:**
```json
{
  "success": true,
  "countryId": "portugal",
  "confidence_score": 0.85,
  "specificity_score": 0.78
}
```

---

### `batch-generate-countries`

Lance la génération de plusieurs pays en parallèle.

**Endpoint:** `POST /functions/v1/batch-generate-countries`

**Body:**
```json
{
  "batchName": "European Countries Q1",
  "countries": [
    { "id": "portugal", "name": "Portugal", "iso2": "PT", "region": "europe-west", "primaryPyramid": "network" }
  ],
  "concurrency": 2
}
```

**Réponse:**
```json
{
  "success": true,
  "batchId": "uuid",
  "jobCount": 5
}
```

---

### `destination-insights`

Génère des insights personnalisés pour une destination.

**Endpoint:** `POST /functions/v1/destination-insights`

**Body:**
```json
{
  "destination": "portugal",
  "nationality": "FR",
  "aspiration": "retirement",
  "mode": "vacation" | "relocation",
  "currentCountry": "france"
}
```

**Réponse:** Stream de texte

---

### `generate-country-music`

Génère une musique d'ambiance pour un pays via Suno AI.

**Endpoint:** `POST /functions/v1/generate-country-music`

**Body:**
```json
{
  "countryId": "portugal",
  "pyramidType": "network"
}
```

**Réponse:**
```json
{
  "audio_url": "https://...",
  "stream_url": "https://...",
  "cached": false
}
```

---

## TraceOS

### `traceos-webhooks`

Déclenche des webhooks pour les événements TraceOS.

**Endpoint:** `POST /functions/v1/traceos-webhooks`

**Body:**
```json
{
  "event": "decision_created" | "decision_approved" | "deadline_approaching",
  "webhookId": "uuid-optional",
  "userId": "uuid-optional",
  "payload": {
    "decision_id": "uuid",
    "decision_title": "...",
    "status": "pending"
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "triggered": 3,
  "successful": 3,
  "failed": 0
}
```

---

### `traceos-auto-export`

Exporte automatiquement les données TraceOS.

**Endpoint:** `POST /functions/v1/traceos-auto-export`

**Body:**
```json
{
  "userId": "uuid-optional",
  "scheduled": false
}
```

**Réponse:**
```json
{
  "success": true,
  "filename": "traceos-export-2025-01-10.json",
  "signedUrl": "https://...",
  "summary": {
    "decisions": 15,
    "tags": 8,
    "approvals": 23
  }
}
```

---

### `traceos-email-alerts`

Envoie des alertes email pour les décisions en attente.

**Endpoint:** `POST /functions/v1/traceos-email-alerts`

**Body:**
```json
{
  "user_email": "user@example.com",
  "user_name": "John Doe"
}
```

**Réponse:**
```json
{
  "success": true,
  "alertsSent": 3
}
```

---

## Internationalization

### `generate-translations`

Traduit du contenu JSON vers une langue cible.

**Endpoint:** `POST /functions/v1/generate-translations`

**Body:**
```json
{
  "sourceText": { "key": "value" },
  "sourceLang": "fr",
  "targetLang": "en",
  "context": "Application UI translations"
}
```

**Réponse:**
```json
{
  "translatedText": { "key": "translated value" }
}
```

---

### `generate-country-translations`

Traduit un profil pays complet.

**Endpoint:** `POST /functions/v1/generate-country-translations`

**Body:**
```json
{
  "countryId": "portugal",
  "sourceCountry": { "name": "Portugal", "region": "...", ... },
  "targetLang": "de"
}
```

---

### `i18n-coverage-slack`

Envoie un rapport de couverture i18n vers Slack.

**Endpoint:** `POST /functions/v1/i18n-coverage-slack`

**Body:**
```json
{
  "totalCoverage": 94.5,
  "languages": {
    "fr": { "coverage": 100, "missing": 0 },
    "en": { "coverage": 98, "missing": 5 }
  },
  "threshold": 90,
  "missingKeys": ["key1", "key2"]
}
```

---

## Notifications

### `dashboard-reminders`

Envoie des rappels pour les échéances du dashboard.

**Endpoint:** `POST /functions/v1/dashboard-reminders`

**Body:**
```json
{
  "userId": "uuid-optional",
  "checkAll": false
}
```

**Réponse:**
```json
{
  "success": true,
  "processed": 12,
  "emailsSent": 5,
  "summary": {
    "totalDeadlines": 12,
    "urgentCount": 3,
    "usersNotified": 5
  }
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide - paramètres manquants ou incorrects |
| 401 | Non authentifié - token JWT manquant ou invalide |
| 403 | Non autorisé - accès refusé |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes - rate limiting |
| 500 | Erreur serveur interne |

## Rate Limiting

- **Fonctions IA:** 10 requêtes/minute par utilisateur
- **Génération pays:** 5 requêtes/minute
- **Webhooks:** 100 requêtes/minute
- **Autres:** 60 requêtes/minute

## Support

Pour toute question technique, consultez:
- [Documentation Lovable](https://docs.lovable.dev)
- [GitHub Issues](https://github.com/lovable/boussole-strategique/issues)
