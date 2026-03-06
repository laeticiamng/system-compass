import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin-only: require authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: roleData } = await supabaseAuth
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Proceed with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting translations seeding (admin authorized)...');

    const body = await req.json().catch(() => ({}));
    const { seedAll = false, languages = ['bn', 'ru'] } = body;

    // Bengali translations
    const bnTranslations = {
      "common": {
        "appName": "পিরামিড কম্পাস",
        "tagline": "বাস্তব বিশ্ব সিস্টেমের জন্য সিদ্ধান্ত সিমুলেটর",
        "yes": "হ্যাঁ",
        "no": "না",
        "back": "ফিরে যান",
        "next": "পরবর্তী",
        "save": "সংরক্ষণ",
        "cancel": "বাতিল",
        "loading": "লোড হচ্ছে...",
        "country": "দেশ",
        "delete": "মুছুন",
        "confirm": "নিশ্চিত করুন",
        "edit": "সম্পাদনা",
        "close": "বন্ধ",
        "view": "দেখুন"
      }
    };

    // Russian translations
    const ruTranslations = {
      "common": {
        "appName": "Пирамидный Компас",
        "tagline": "Симулятор решений для реальных систем",
        "yes": "Да",
        "no": "Нет",
        "back": "Назад",
        "next": "Далее",
        "save": "Сохранить",
        "cancel": "Отмена",
        "loading": "Загрузка...",
        "country": "Страна",
        "delete": "Удалить",
        "confirm": "Подтвердить",
        "edit": "Редактировать",
        "close": "Закрыть",
        "view": "Просмотр"
      }
    };

    const translationsToSeed: Record<string, object> = {};
    if (languages.includes('bn') || seedAll) translationsToSeed['bn'] = bnTranslations;
    if (languages.includes('ru') || seedAll) translationsToSeed['ru'] = ruTranslations;

    const results: { language: string; status: string }[] = [];

    for (const [lang, data] of Object.entries(translationsToSeed)) {
      console.log(`Seeding ${lang} translations...`);
      const { error } = await supabase
        .from('ui_translations')
        .upsert({
          language: lang,
          namespace: 'translation',
          translations: data,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'language,namespace' });

      results.push({ language: lang, status: error ? 'error: ' + error.message : 'success' });
    }

    return new Response(
      JSON.stringify({ message: `Seeded ${results.filter(r => r.status === 'success').length} translation sets`, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Seed translations error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
