# 🔒 Rapport de Sécurité

> Dernière analyse : 2026-02-03

## Résumé

| Domaine | Statut | Notes |
|---------|--------|-------|
| RLS (Row Level Security) | ✅ Actif | 57/57 tables protégées |
| Authentification | ✅ Sécurisé | JWT + refresh tokens |
| Edge Functions | ✅ Validé | CORS + auth headers |
| Secrets | ✅ Protégés | Aucune exposition client |
| Input Validation | ✅ Zod | Schemas stricts |

## Row Level Security (RLS)

### Tables Protégées (57 tables)

```
ai_activity_log              ✅ RLS enabled
ai_usage_metering            ✅ RLS enabled
analytics_daily_stats_secure ✅ RLS enabled
analytics_events             ✅ RLS enabled
analytics_sessions           ✅ RLS enabled
b2b_usage_metering           ✅ RLS enabled
case_delays_reality          ✅ RLS enabled
case_governance_actors       ✅ RLS enabled
case_governance_partners     ✅ RLS enabled
case_intermediation_patterns ✅ RLS enabled
challenge_progress           ✅ RLS enabled
countries                    ✅ RLS enabled
country_generation_batches   ✅ RLS enabled
country_generation_jobs      ✅ RLS enabled
country_governance           ✅ RLS enabled
country_intelligence         ✅ RLS enabled
country_intelligence_translations ✅ RLS enabled
country_tags                 ✅ RLS enabled
country_variants             ✅ RLS enabled
country_variants_translations ✅ RLS enabled
dashboard_progress           ✅ RLS enabled
event_registrations          ✅ RLS enabled
exit_keys_history            ✅ RLS enabled
financial_intel_country_snapshots ✅ RLS enabled
financial_intel_generation_runs ✅ RLS enabled
game_statistics              ✅ RLS enabled
gamification_progress        ✅ RLS enabled
generated_translations       ✅ RLS enabled
generation_notifications     ✅ RLS enabled
gov_intel_runs               ✅ RLS enabled
i18n_coverage_alerts         ✅ RLS enabled
irreversa_audit_log          ✅ RLS enabled
irreversa_thresholds         ✅ RLS enabled
irreversa_witnesses          ✅ RLS enabled
latent_zone_history          ✅ RLS enabled
latent_zone_tensions         ✅ RLS enabled
latent_zones                 ✅ RLS enabled
music_cache                  ✅ RLS enabled
music_generation_tasks       ✅ RLS enabled
ovi_intel_cache              ✅ RLS enabled
ovi_intel_runs               ✅ RLS enabled
profiles                     ✅ RLS enabled
push_subscriptions           ✅ RLS enabled
scenario_game_sessions       ✅ RLS enabled
subscription_plans           ✅ RLS enabled
subscribers                  ✅ RLS enabled
traceos_approvals            ✅ RLS enabled
traceos_decisions            ✅ RLS enabled
traceos_exports              ✅ RLS enabled
traceos_tags                 ✅ RLS enabled
traceos_webhooks             ✅ RLS enabled
translation_jobs             ✅ RLS enabled
user_favorites               ✅ RLS enabled
user_preferences             ✅ RLS enabled
user_roles                   ✅ RLS enabled
workspace_cases              ✅ RLS enabled
workspace_milestones         ✅ RLS enabled
```

### Patterns RLS Utilisés

1. **Isolation utilisateur** : `auth.uid() = user_id`
2. **Lecture publique** : `true` pour SELECT sur tables publiques
3. **Admin only** : `has_role(auth.uid(), 'admin')`
4. **Workspace scope** : `workspace_id IN (SELECT ... FROM user_workspaces)`

## Authentification

### Flow Sécurisé

```
1. User → Supabase Auth (email/password ou OAuth)
2. Supabase → JWT signé (access_token + refresh_token)
3. Client → Store tokens (localStorage avec encryption)
4. Client → API requests avec Authorization header
5. Edge Functions → Validate JWT claims
```

### Configuration Auth

- Auto-confirm email : **Désactivé** (validation email requise)
- Anonymous users : **Désactivé**
- Session duration : 1 heure (auto-refresh)
- Refresh token : 30 jours

## Edge Functions

### Headers CORS

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ...',
}
```

### Validation JWT

```javascript
// Pattern appliqué dans toutes les edge functions protégées
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: corsHeaders,
  });
}
```

## Secrets

### Liste des Secrets (côté serveur uniquement)

| Secret | Usage | Exposition |
|--------|-------|------------|
| OPENAI_API_KEY | AI Assist | ❌ Serveur only |
| STRIPE_SECRET_KEY | Paiements | ❌ Serveur only |
| RESEND_API_KEY | Emails | ❌ Serveur only |
| SUNO_API_KEY | Génération musique | ❌ Serveur only |
| PERPLEXITY_API_KEY | Recherche web | ❌ Serveur only |
| FIRECRAWL_API_KEY | Scraping | ❌ Serveur only |
| ELEVENLABS_API_KEY | TTS | ❌ Serveur only |

### Variables Publiques (autorisées côté client)

- `VITE_SUPABASE_URL` - URL du projet
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Clé anon publique

## Input Validation

### Schemas Zod

```typescript
// Exemple de validation stricte
const userInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
  message: z.string().max(5000),
});
```

### Sanitization XSS

```typescript
// Toutes les entrées utilisateur sont sanitizées
import DOMPurify from 'dompurify';
const safeHtml = DOMPurify.sanitize(userInput);
```

## Recommandations

1. **Audit régulier** : Exécuter `supabase--linter` mensuellement
2. **Rotation secrets** : Tous les 90 jours
3. **Logs d'audit** : Activer `ai_activity_log` pour traçabilité
4. **Pen testing** : Prévoir test d'intrusion avant scaling
