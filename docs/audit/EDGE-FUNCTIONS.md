# ⚡ Edge Functions

> 35 fonctions déployées | Dernière mise à jour : 2026-02-03

## Catalogue des Fonctions

### 🤖 IA & Génération

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `ai-assist` | Assistant IA contextuel multi-modules | ✅ JWT | 10/min |
| `generate-country-profile` | Génération profil pays complet via GPT-4 | ✅ JWT | 5/min |
| `generate-country-intelligence` | Intelligence pays approfondie | ✅ JWT | 5/min |
| `generate-country-variants` | Variantes et trajectoires | ✅ JWT | 5/min |
| `destination-insights` | Insights personnalisés (streaming) | ✅ JWT | 10/min |

### 🌍 Batch Processing

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `batch-generate-countries` | Génération multi-pays en parallèle | ✅ Admin | 1/min |
| `batch-complete-countries` | Complétion données manquantes | ✅ Admin | 1/min |
| `batch-financial-intel` | Intel financier par batch | ✅ Admin | 1/min |
| `batch-terrain-realities` | Réalités terrain par batch | ✅ Admin | 1/min |
| `batch-translate-countries` | Traduction par batch | ✅ Admin | 1/min |
| `batch-generate-translations` | Génération traductions IA | ✅ Admin | 1/min |

### 🌐 Traductions

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `generate-translations` | Traduction JSON via IA | ✅ JWT | 20/min |
| `generate-country-translations` | Traduction profil pays complet | ✅ JWT | 5/min |
| `translate-intelligence` | Traduction country_intelligence | ✅ JWT | 5/min |
| `translate-variants` | Traduction country_variants | ✅ JWT | 5/min |
| `sync-all-translations` | Sync toutes les traductions | ✅ Admin | 1/min |
| `seed-translations` | Seed initial traductions | ✅ Admin | 1/min |

### 💳 Abonnements (Stripe)

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `create-checkout` | Création session Stripe Checkout | ✅ JWT | 10/min |
| `check-subscription` | Vérification statut abonnement | ✅ JWT | 30/min |
| `customer-portal` | Lien portail client Stripe | ✅ JWT | 10/min |

### 📊 TraceOS

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `traceos-webhooks` | Déclenchement webhooks TraceOS | ✅ JWT | 100/min |
| `traceos-auto-export` | Export automatique données | ✅ JWT | 5/min |
| `traceos-email-alerts` | Alertes email échéances | ✅ JWT | 10/min |

### 🎵 Média

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `generate-country-music` | Génération musique via Suno AI | ✅ JWT | 3/min |
| `music-task-status` | Statut tâche génération | ✅ JWT | 30/min |
| `elevenlabs-tts` | Text-to-Speech ElevenLabs | ✅ JWT | 10/min |

### 🔍 Intel & Recherche

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `financial-intel` | Intelligence financière pays | ✅ JWT | 5/min |
| `terrain-realities` | Réalités terrain locales | ✅ JWT | 5/min |
| `gov-intel-generate` | Gouvernance et acteurs | ✅ JWT | 5/min |
| `perplexity-search` | Recherche web augmentée | ✅ JWT | 10/min |
| `firecrawl-scrape` | Scraping intelligent | ✅ JWT | 5/min |

### 📧 Notifications

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `dashboard-reminders` | Rappels échéances dashboard | Cron | 1/min |
| `i18n-coverage-slack` | Rapport couverture i18n → Slack | Cron | 1/min |

### 🛠️ Administration

| Fonction | Description | Auth | Rate Limit |
|----------|-------------|------|------------|
| `seed-countries` | Seed initial pays | ✅ Admin | 1/min |
| `complete-country-data` | Complétion données pays | ✅ Admin | 5/min |

## Structure Type d'une Edge Function

```typescript
// supabase/functions/example/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Auth Check (si requis)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // 4. Parse Body
    const { param1, param2 } = await req.json();

    // 5. Business Logic
    const result = await processLogic(param1, param2);

    // 6. Logging
    console.log(`[example] Processed: ${JSON.stringify(result)}`);

    // 7. Response
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[example] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

## Secrets Requis par Fonction

| Fonction | Secrets |
|----------|---------|
| `ai-assist` | OPENAI_API_KEY |
| `generate-country-*` | OPENAI_API_KEY |
| `create-checkout` | STRIPE_SECRET_KEY |
| `check-subscription` | STRIPE_SECRET_KEY |
| `customer-portal` | STRIPE_SECRET_KEY |
| `generate-country-music` | SUNO_API_KEY |
| `elevenlabs-tts` | ELEVENLABS_API_KEY |
| `perplexity-search` | PERPLEXITY_API_KEY |
| `firecrawl-scrape` | FIRECRAWL_API_KEY |
| `*-email-*` | RESEND_API_KEY |

## Appeler une Edge Function

```typescript
// Depuis le frontend
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke('ai-assist', {
  body: {
    action: 'next_logical_step',
    context: { module: 'dashboard', progress: 75 }
  }
});

if (error) {
  console.error('Edge function error:', error);
}
```

## Monitoring

Les logs sont disponibles via :
```bash
# Depuis Lovable
supabase--edge-function-logs function_name="ai-assist"
```

## Tests

```bash
# Test local d'une edge function
supabase functions serve ai-assist --env-file .env.local

# Test via curl
supabase--curl_edge_functions path="/ai-assist" method="POST" body='{"action":"test"}'
```
