import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal country seed data - will be populated from the static file
const countriesSeed = [
  {
    id: 'cameroon',
    name: 'Cameroon',
    name_local: 'Cameroun',
    iso2: 'CM',
    region: 'Central Africa',
    pyramid_type: 'PROBLEM_RENT',
    rule_of_gold: 'Never solve a visible problem. Never become indispensable. Never centralize.',
    pyramid: {
      top: 'Political elites and connected networks',
      institutions: 'State apparatus serving private interests',
      gatekeepers: 'Bureaucrats, middlemen, and informal brokers',
      valueCreators: 'Entrepreneurs, farmers, and informal workers',
      base: 'General population financing the system',
      realAsset: 'The problem itself — dysfunction is profitable',
    },
    risks: { legal: 75, safety: 65, corruption: 85, volatility: 60, bureaucracy: 80 },
    who_wins: ['Connected insiders with political access', 'Gatekeepers who control bottlenecks', 'Those who monetize dysfunction', 'International actors extracting resources'],
    who_loses: ['Competent people without connections', 'Transparent entrepreneurs', 'Anyone who solves problems publicly', 'The young and ambitious without networks'],
    playbook: {
      do: ['Stay invisible, build quietly', 'Diversify income streams', 'Build exportable skills', 'Create offshore options progressively', 'Network with diaspora'],
      dont: ['Publicly solve systemic problems', 'Become visibly successful without protection', 'Centralize assets or power', 'Trust formal institutions blindly', 'Moralize or criticize openly'],
      plan30Days: ['Secure documents and identity papers', 'Start emergency fund (even small)', 'Identify one exportable skill to develop', 'Map your current network value'],
      plan12Months: ['Develop secondary income source', 'Build international connections', 'Learn remote-work skills', 'Create first offshore account if possible'],
      plan5Years: ['Establish residence option abroad', 'Diversify assets geographically', 'Build reputation in international network', 'Create passive income streams'],
      planB: 'Focus on French-speaking destinations with easier visa access (Morocco, Senegal, France, Canada-Quebec). Build digital skills for remote work.',
    },
    snapshot: { gdpPerCapita: 1660, population: 28000000, passportRank: 91, corruptionIndex: 26, freedomIndex: 25 },
    visa: { workVisa: 'difficult', startupVisa: false, digitalNomadVisa: false, investmentVisa: false, citizenshipYears: 5, notes: 'Limited formal visa programs; informal connections often required' },
    cost_of_living: { index: 28, rentIndex: 12, groceriesIndex: 32, monthlyBudgetSingle: 450, monthlyBudgetFamily: 1200 },
    quality_of_life: { healthcareRank: 142, educationIndex: 0.52, safetyIndex: 42, environmentIndex: 48, workLifeBalance: 5, internetSpeed: 12 },
    natural_risks: { seismicRisk: 'low', tsunamiRisk: 'none', floodRisk: 'moderate', droughtRisk: 'moderate', cycloneRisk: 'none', volcanoRisk: 'moderate', extremeHeat: 'frequent', extremeCold: 'rare', climateNotes: 'Tropical climate with rainy and dry seasons. Mount Cameroon is an active volcano. Flooding common in rainy season.' },
    healthcare: { systemType: 'limited', qualityScore: 35, accessScore: 25, emergencyResponse: 'poor', specialistAccess: 'poor', chronicCareQuality: 'poor', costForExpats: 'low', insuranceRequired: true, notes: 'Healthcare infrastructure limited. Private clinics in major cities offer better care but at higher cost. Medical evacuation insurance strongly recommended.' },
    lgbtq_rights: { index: 25, sameSecMarriage: false, civilUnion: false, employmentProtection: false, safetyRating: 'dangerous', notes: 'Homosexuality criminalized; significant social stigma' },
    positive_points: {
      lifestyle: ['Strong family and community values', 'Vibrant social life', 'Diverse culinary traditions'],
      economy: ['Low cost of living', 'Emerging tech startup scene', 'Strategic position for Africa trade'],
      culture: ['Rich cultural diversity with 250+ ethnic groups', 'Bilingual (French/English)', 'Famous music scene (Makossa, Bikutsi)'],
      infrastructure: ['Good mobile phone coverage', 'Douala port - Central Africa hub'],
      opportunities: ['Untapped markets', 'Agricultural potential', 'Regional business gateway'],
      nature: ['Mount Cameroon (active volcano)', 'Beautiful beaches in Kribi', 'Diverse landscapes from rainforest to savanna'],
    },
    last_updated: '2024-12-15',
    sources: ['World Bank', 'Transparency International', 'Freedom House', 'Henley Passport Index', 'Numbeo'],
    data_version: 1,
  },
  {
    id: 'france',
    name: 'France',
    name_local: 'France',
    iso2: 'FR',
    region: 'Western Europe',
    pyramid_type: 'STABILITY_REDIS',
    rule_of_gold: 'The system protects stability, not explosion. Play the long game within the rules.',
    pyramid: {
      top: 'State institutions and social model',
      institutions: 'Heavy bureaucracy ensuring redistribution',
      gatekeepers: 'Diplomas, certifications, and procedures',
      valueCreators: 'Workers, entrepreneurs (constrained)',
      base: 'Taxpayers funding the social contract',
      realAsset: 'Stability and predictability',
    },
    risks: { legal: 20, safety: 25, corruption: 30, volatility: 25, bureaucracy: 75 },
    who_wins: ['Those who master the system rules', 'Public sector employees', 'Those with right diplomas and networks', 'Patient long-term planners'],
    who_loses: ['High ambition, low patience profiles', 'Outsiders without French credentials', 'Those seeking explosive growth', 'Non-conformists and innovators'],
    playbook: {
      do: ['Understand and use the system', 'Optimize tax structure legally', 'Build multiple income streams', 'Develop international options', 'Invest in quality of life'],
      dont: ['Depend on single income source', 'Ignore administrative requirements', 'Expect meritocracy alone to win', 'Burn bridges with institutions', 'Underestimate bureaucracy time'],
      plan30Days: ['Audit your current situation', 'Understand your tax bracket', 'Start automation savings', 'Research side income options'],
      plan12Months: ['Establish secondary revenue', 'Optimize your legal structure', 'Build transferable certifications', 'Create international portfolio'],
      plan5Years: ['Geographic diversification', 'Build location-independent income', 'Establish EU alternatives', 'Create wealth outside system reach'],
      planB: 'EU mobility is your advantage. Consider Portugal, Spain, or Netherlands for lower friction. Switzerland for higher ambition. Keep French benefits while building elsewhere.',
    },
    snapshot: { gdpPerCapita: 44850, population: 68000000, passportRank: 4, corruptionIndex: 71, freedomIndex: 89 },
    visa: { workVisa: 'moderate', startupVisa: true, digitalNomadVisa: false, investmentVisa: true, investmentMinimum: 300000, citizenshipYears: 5, notes: 'Talent Passport visa for skilled workers; EU citizens have free movement' },
    cost_of_living: { index: 74, rentIndex: 38, groceriesIndex: 78, monthlyBudgetSingle: 2200, monthlyBudgetFamily: 4500 },
    quality_of_life: { healthcareRank: 14, educationIndex: 0.81, safetyIndex: 52, environmentIndex: 78, workLifeBalance: 8, internetSpeed: 185 },
    natural_risks: { seismicRisk: 'low', tsunamiRisk: 'none', floodRisk: 'moderate', droughtRisk: 'low', cycloneRisk: 'none', volcanoRisk: 'none', extremeHeat: 'occasional', extremeCold: 'occasional', climateNotes: 'Temperate climate. Occasional flooding in southern regions. Heat waves becoming more frequent due to climate change.' },
    healthcare: { systemType: 'universal', qualityScore: 92, accessScore: 85, emergencyResponse: 'excellent', specialistAccess: 'good', chronicCareQuality: 'excellent', costForExpats: 'low', insuranceRequired: false, notes: 'World-renowned universal healthcare (Sécurité Sociale). Covered residents pay very little. Non-residents need private insurance initially.' },
    lgbtq_rights: { index: 85, sameSecMarriage: true, civilUnion: true, employmentProtection: true, safetyRating: 'safe', notes: 'Full legal equality; marriage since 2013' },
    positive_points: {
      lifestyle: ['35-hour work week', 'Exceptional work-life balance', '5 weeks paid vacation', 'World-class gastronomy'],
      economy: ['Strong social protections', 'Free education including university', 'Excellent public healthcare', 'Many multinational headquarters'],
      culture: ['World heritage sites (Paris, castles, cathedrals)', 'Art, fashion, and cinema capital', 'Rich literary and philosophical tradition'],
      infrastructure: ['TGV high-speed trains', 'Excellent public transport', 'Modern airports', 'Universal fiber internet'],
      opportunities: ['EU market access', 'Strong startup ecosystem in Paris', 'Research and innovation hubs'],
      nature: ['Mediterranean coast', 'Alps and Pyrenees', 'Varied landscapes from Normandy to Provence', 'Excellent wine regions'],
    },
    last_updated: '2024-12-15',
    sources: ['World Bank', 'Transparency International', 'Freedom House', 'Henley Passport Index', 'Numbeo'],
    data_version: 1,
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    name_local: 'Schweiz / Suisse',
    iso2: 'CH',
    region: 'Western Europe',
    pyramid_type: 'COMPETENCE_TRUST',
    rule_of_gold: 'Excellence + rules + reputation = security. No shortcuts, no approximations.',
    pyramid: {
      top: 'Trust, precision, and institutional reliability',
      institutions: 'Efficient, rule-based governance',
      gatekeepers: 'Quality standards and professional requirements',
      valueCreators: 'Highly skilled workers and entrepreneurs',
      base: 'Citizens invested in maintaining the system',
      realAsset: 'Competence and collective trust',
    },
    risks: { legal: 10, safety: 5, corruption: 15, volatility: 10, bureaucracy: 40 },
    who_wins: ['Highly competent specialists', 'Rule-followers with excellence', 'Long-term reputation builders', 'Those who value precision'],
    who_loses: ['Approximators and shortcuts-takers', 'Impatient disruptors', 'Those without recognized credentials', 'Cultural outsiders unwilling to adapt'],
    playbook: {
      do: ['Master your craft to excellence', 'Follow rules precisely', 'Build reputation over time', 'Integrate culturally', 'Invest in certifications'],
      dont: ['Take shortcuts ever', 'Cheat or bend rules', 'Oversell or exaggerate', 'Ignore local norms', 'Rush integration process'],
      plan30Days: ['Research credential recognition', 'Understand local professional standards', 'Start language learning seriously', 'Map integration requirements'],
      plan12Months: ['Achieve required certifications', 'Build professional network locally', 'Demonstrate consistent performance', 'Establish financial stability'],
      plan5Years: ['Achieve permanent residence/citizenship', 'Become reference in your field', 'Build long-term wealth', 'Integrate fully while keeping options'],
      planB: 'Other COMPETENCE_TRUST systems: Germany, Netherlands, Austria, Singapore. Build credentials that transfer across these systems.',
    },
    snapshot: { gdpPerCapita: 93260, population: 8800000, passportRank: 2, corruptionIndex: 82, freedomIndex: 96 },
    visa: { workVisa: 'difficult', startupVisa: false, digitalNomadVisa: false, investmentVisa: false, citizenshipYears: 10, notes: 'Very restrictive; quota system for non-EU citizens; high skill requirements' },
    cost_of_living: { index: 122, rentIndex: 62, groceriesIndex: 118, monthlyBudgetSingle: 4200, monthlyBudgetFamily: 8500 },
    quality_of_life: { healthcareRank: 5, educationIndex: 0.90, safetyIndex: 79, environmentIndex: 86, workLifeBalance: 7, internetSpeed: 220 },
    natural_risks: { seismicRisk: 'low', tsunamiRisk: 'none', floodRisk: 'low', droughtRisk: 'low', cycloneRisk: 'none', volcanoRisk: 'none', extremeHeat: 'rare', extremeCold: 'occasional', climateNotes: 'Alpine geography with avalanche risks in mountains. Very stable geology. Cold winters in alpine regions. Occasional flooding in valleys.' },
    healthcare: { systemType: 'universal', qualityScore: 98, accessScore: 95, emergencyResponse: 'excellent', specialistAccess: 'excellent', chronicCareQuality: 'excellent', costForExpats: 'high', insuranceRequired: true, notes: 'Among the best healthcare systems worldwide. Mandatory private insurance. Very expensive but excellent quality. All residents must have coverage.' },
    lgbtq_rights: { index: 72, sameSecMarriage: false, civilUnion: true, employmentProtection: true, safetyRating: 'safe', notes: 'Registered partnerships; strong legal protections' },
    positive_points: {
      lifestyle: ['Exceptional safety and security', 'Clean cities', 'Outstanding public services', 'World-class education'],
      economy: ['Highest salaries in Europe', 'Very low taxes', 'Strong banking sector', 'Innovation hub'],
      culture: ['Multicultural (4 national languages)', 'Rich heritage', 'Excellent museums and festivals'],
      infrastructure: ['World-class trains and roads', 'Efficient public transport', 'Best internet connectivity'],
      opportunities: ['Global finance and pharma hub', 'International organizations', 'Startup-friendly ecosystem'],
      nature: ['Alps skiing', 'Beautiful lakes (Geneva, Zurich)', 'Pristine hiking trails', 'Clean air and water'],
    },
    last_updated: '2024-12-15',
    sources: ['World Bank', 'Transparency International', 'Freedom House', 'Henley Passport Index', 'Numbeo'],
    data_version: 1,
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if already seeded
    const { count } = await supabase
      .from("countries")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ message: `Already seeded with ${count} countries`, count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert countries
    const { data, error } = await supabase
      .from("countries")
      .insert(countriesSeed)
      .select();

    if (error) {
      console.error("Error seeding countries:", error);
      throw error;
    }

    console.log(`Successfully seeded ${data?.length} countries`);

    return new Response(
      JSON.stringify({ 
        message: `Successfully seeded ${data?.length} countries`,
        count: data?.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
