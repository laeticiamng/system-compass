import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting translations seeding...');

    // Get request body with translations data
    const body = await req.json().catch(() => ({}));
    const { translations, namespace = 'translation', clearExisting = false } = body;

    if (!translations || typeof translations !== 'object') {
      return new Response(
        JSON.stringify({ 
          error: 'Missing translations object in request body',
          usage: 'POST with { translations: { en: {...}, fr: {...} }, namespace: "translation" }'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (clearExisting) {
      console.log(`Clearing existing translations for namespace: ${namespace}...`);
      const { error: deleteError } = await supabase
        .from('ui_translations')
        .delete()
        .eq('namespace', namespace);
      
      if (deleteError) {
        console.error('Error clearing translations:', deleteError);
      }
    }

    const results: { language: string; namespace: string; status: string }[] = [];

    // Seed translations for each language
    for (const [lang, data] of Object.entries(translations)) {
      if (!data || typeof data !== 'object' || Object.keys(data as object).length === 0) {
        console.log(`Skipping ${lang} - no data available`);
        results.push({ language: lang, namespace, status: 'skipped: no data' });
        continue;
      }

      console.log(`Seeding ${lang} ${namespace} translations...`);
      
      const { error } = await supabase
        .from('ui_translations')
        .upsert({
          language: lang,
          namespace: namespace,
          translations: data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'language,namespace',
        });

      if (error) {
        console.error(`Error seeding ${lang}:`, error);
        results.push({ language: lang, namespace, status: 'error: ' + error.message });
      } else {
        results.push({ language: lang, namespace, status: 'success' });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status.startsWith('error')).length;

    console.log(`Seeding complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        message: `Seeded ${successCount} translation sets for namespace '${namespace}'`,
        successCount,
        errorCount,
        results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Seed translations error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
