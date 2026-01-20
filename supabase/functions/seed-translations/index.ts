import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bengali translations
const bnTranslations = {
  "common": {
    "appName": "পিরামিড কম্পাস",
    "tagline": "বাস্তব বিশ্ব সিস্টেমের জন্য সিদ্ধান্ত সিমুলেটর",
    "positioningLine": "বিশ্লেষণ এবং সিমুলেশন টুল। আপনি সিদ্ধান্ত নিন, আমরা আলো দেখাই।",
    "disclaimer": "আইনি, আর্থিক বা চিকিৎসা পরামর্শ নয়। আপনি আপনার সিদ্ধান্তের জন্য দায়ী।",
    "yes": "হ্যাঁ",
    "no": "না",
    "back": "ফিরে যান",
    "next": "পরবর্তী",
    "years": "বছর",
    "save": "সংরক্ষণ",
    "cancel": "বাতিল",
    "loading": "লোড হচ্ছে...",
    "country": "দেশ",
    "delete": "মুছুন",
    "confirm": "নিশ্চিত করুন",
    "edit": "সম্পাদনা",
    "close": "বন্ধ",
    "view": "দেখুন"
  },
  "hero": {
    "badge": "বিশ্লেষণ সিমুলেটর",
    "title1": "ব্যয়বহুল ভুল এড়িয়ে চলুন",
    "titleHighlight": "প্রতিশ্রুতি দেওয়ার আগে",
    "subtitle": "সিস্টেমের প্রকৃত নিয়ম বুঝুন। সিদ্ধান্ত নেওয়ার আগে পরিণতি সিমুলেট করুন।",
    "discoverProfile": "আমার গতিপথ সিমুলেট করুন",
    "exploreCountries": "সিস্টেম বিশ্লেষণ করুন",
    "quickTest": "দ্রুত পরীক্ষা (৬০ সেকেন্ড)"
  },
  "footer": {
    "explore": "অন্বেষণ",
    "tools": "সরঞ্জাম",
    "account": "অ্যাকাউন্ট",
    "disclaimer": "বিশ্লেষণ এবং সিমুলেশন টুল। কোনো আইনি, আর্থিক বা চিকিৎসা পরামর্শ নয়।",
    "defaultCountry": "ডিফল্ট দেশ",
    "selectDefaultCountry": "ডিফল্ট দেশ নির্বাচন করুন"
  },
  "cta": {
    "viewAllKeys": "সব এক্সিট কী দেখুন",
    "educationalMode": "শিক্ষামূলক মোড (কাল্পনিক চরিত্র)"
  }
};

// Russian translations
const ruTranslations = {
  "common": {
    "appName": "Пирамидный Компас",
    "tagline": "Симулятор решений для реальных систем",
    "positioningLine": "Инструмент анализа и моделирования. Вы решаете, мы освещаем.",
    "disclaimer": "Не является юридической, финансовой или медицинской консультацией. Вы несёте ответственность за свои решения.",
    "yes": "Да",
    "no": "Нет",
    "back": "Назад",
    "next": "Далее",
    "years": "лет",
    "save": "Сохранить",
    "cancel": "Отмена",
    "loading": "Загрузка...",
    "country": "Страна",
    "delete": "Удалить",
    "confirm": "Подтвердить",
    "edit": "Редактировать",
    "close": "Закрыть",
    "view": "Просмотр"
  },
  "hero": {
    "badge": "Симулятор анализа",
    "title1": "Избегайте дорогостоящих ошибок",
    "titleHighlight": "до принятия обязательств",
    "subtitle": "Поймите реальные правила системы. Симулируйте последствия перед принятием решения.",
    "discoverProfile": "Симулировать мою траекторию",
    "exploreCountries": "Анализировать системы",
    "quickTest": "Быстрый тест (60 сек)"
  },
  "footer": {
    "explore": "Исследовать",
    "tools": "Инструменты",
    "account": "Аккаунт",
    "disclaimer": "Инструмент анализа и моделирования. Без юридических, финансовых или медицинских советов.",
    "defaultCountry": "Страна по умолчанию",
    "selectDefaultCountry": "Выбрать страну по умолчанию"
  },
  "cta": {
    "viewAllKeys": "Посмотреть все ключи выхода",
    "educationalMode": "Образовательный режим (вымышленный персонаж)"
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting translations seeding for bn and ru...');

    const body = await req.json().catch(() => ({}));
    const { seedAll = false, languages = ['bn', 'ru'] } = body;

    const translationsToSeed: Record<string, object> = {};
    
    if (languages.includes('bn') || seedAll) {
      translationsToSeed['bn'] = bnTranslations;
    }
    if (languages.includes('ru') || seedAll) {
      translationsToSeed['ru'] = ruTranslations;
    }

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
        }, {
          onConflict: 'language,namespace',
        });

      if (error) {
        console.error(`Error seeding ${lang}:`, error);
        results.push({ language: lang, status: 'error: ' + error.message });
      } else {
        results.push({ language: lang, status: 'success' });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;

    return new Response(
      JSON.stringify({
        message: `Seeded ${successCount} translation sets`,
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
