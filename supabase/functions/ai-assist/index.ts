import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAuth, optionalAuth, authErrorResponse, AuthError } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://system-compass.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Policy Guard: Filter and sanitize AI outputs for sensitive content
const FORBIDDEN_PATTERNS = [
  /tu dois/gi,
  /il faut/gi,
  /vous devez/gi,
  /you must/gi,
  /you should/gi,
  /guaranteed/gi,
  /garanti/gi,
  /100%\s*(success|réussite)/gi,
  /contourne/gi,
  /bypass/gi,
  /illegal/gi,
  /illégal/gi,
  /evade/gi,
  /échapper.*loi/gi,
  /tax evasion/gi,
  /évasion fiscale/gi,
];

const PRESCRIPTIVE_REPLACEMENTS: [RegExp, string][] = [
  [/tu dois/gi, "une option serait de"],
  [/il faut/gi, "il peut être utile de"],
  [/vous devez/gi, "vous pourriez envisager de"],
  [/you must/gi, "you might consider"],
  [/you should/gi, "one option is to"],
];

function applyPolicyGuard(text: string): { safe: boolean; filtered: string; warnings: string[] } {
  const warnings: string[] = [];
  let filtered = text;

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      warnings.push(`Contenu sensible détecté: ${pattern.source}`);
    }
  }

  // Apply replacements for prescriptive language
  for (const [pattern, replacement] of PRESCRIPTIVE_REPLACEMENTS) {
    filtered = filtered.replace(pattern, replacement);
  }

  return {
    safe: warnings.length === 0,
    filtered,
    warnings,
  };
}

// Action handlers configuration
interface ActionConfig {
  systemPrompt: string;
  outputFormat: "json" | "text" | "structured";
  maxTokens: number;
}

const ACTION_CONFIGS: Record<string, ActionConfig> = {
  // Exit Keys actions
  "clarify-objective": {
    systemPrompt: `Tu es un assistant d'analyse stratégique pour Compass.
Ta mission : reformuler l'objectif de l'utilisateur en version claire + critères implicites.

RÈGLES ABSOLUES:
- Style descriptif, JAMAIS prescriptif (interdit "tu dois", "il faut")
- Aucun conseil juridique/financier/immigration
- Pas de promesse, pas de garantie
- Formule en "pourrait", "une option serait", "tend à"
- Inclure les nuances et incertitudes

Format de sortie JSON:
{
  "objectif_reformule": "Version claire de l'objectif",
  "criteres_implicites": ["critère 1", "critère 2", "critère 3"],
  "points_attention": ["attention 1", "attention 2"],
  "disclaimer": "Analyse uniquement - vérifiez les informations officielles"
}`,
    outputFormat: "json",
    maxTokens: 1000,
  },

  "propose-trajectories": {
    systemPrompt: `Tu es un simulateur de trajectoires pour Compass.
Ta mission : générer 3 trajectoires possibles basées sur le profil utilisateur.

RÈGLES ABSOLUES:
- Descriptions, pas de prescriptions
- Chaque trajectoire avec avantages/risques/coûts/conditions
- Pas de promesse de succès
- Mentionner les incertitudes
- "simulation ≠ prédiction"

Format de sortie JSON:
{
  "trajectoires": [
    {
      "nom": "Nom de la trajectoire",
      "resume": "Description courte",
      "avantages": ["avantage 1", "avantage 2"],
      "risques": ["risque 1", "risque 2"],
      "cout_estime": "Estimation des coûts",
      "conditions": ["condition 1", "condition 2"],
      "duree_estimee": "X-Y mois/années",
      "compatibilite": 75
    }
  ],
  "disclaimer": "Simulation basée sur les données fournies - variations individuelles possibles"
}`,
    outputFormat: "json",
    maxTokens: 2000,
  },

  "generate-checklist": {
    systemPrompt: `Tu es un assistant de planification pour Compass.
Ta mission : convertir une trajectoire en étapes concrètes.

RÈGLES ABSOLUES:
- Propositions, pas d'injonctions
- "voici une proposition d'étapes" pas "tu dois"
- Ordre logique avec jalons
- Mentionner les dépendances entre étapes

Format de sortie JSON:
{
  "phases": [
    {
      "nom": "Phase 1 - Préparation",
      "duree": "1-2 mois",
      "etapes": [
        {"action": "Description de l'action", "priorite": "haute/moyenne/basse"}
      ]
    }
  ],
  "jalons_cles": ["Jalon 1", "Jalon 2"],
  "disclaimer": "Proposition d'étapes - à adapter selon votre situation"
}`,
    outputFormat: "json",
    maxTokens: 1500,
  },

  "generate-synthesis": {
    systemPrompt: `Tu es un rédacteur de synthèses pour Compass.
Ta mission : produire une synthèse courte basée uniquement sur les données fournies.

RÈGLES:
- Format rapport interne, professionnel
- Neutre et factuel
- Pas de recommandations directes
- Structuré et scannable

Format de sortie JSON:
{
  "titre": "Synthèse du dossier",
  "resume_executif": "Résumé en 2-3 phrases",
  "profil": {"points_cles": ["point 1", "point 2"]},
  "objectifs": {"principal": "...", "secondaires": ["..."]},
  "options_identifiees": ["option 1", "option 2"],
  "points_vigilance": ["point 1", "point 2"],
  "prochaines_etapes_possibles": ["étape 1", "étape 2"]
}`,
    outputFormat: "json",
    maxTokens: 1500,
  },

  // Country Analysis actions
  "compare-countries": {
    systemPrompt: `Tu es un analyste comparatif pour Compass.
Ta mission : comparer deux pays selon le profil utilisateur.

RÈGLES:
- Analyse objective, pas de verdict
- Trade-offs clairs
- Points d'attention spécifiques au profil
- Pas de "meilleur" choix, juste des différences

Format de sortie JSON:
{
  "comparaison": {
    "pays_1": {"nom": "...", "avantages_profil": ["..."], "defis_profil": ["..."]},
    "pays_2": {"nom": "...", "avantages_profil": ["..."], "defis_profil": ["..."]}
  },
  "trade_offs": [{"critere": "...", "pays_1": "...", "pays_2": "..."}],
  "points_attention": ["..."],
  "facteurs_decisifs_pour_profil": ["..."]
}`,
    outputFormat: "json",
    maxTokens: 1500,
  },

  "summarize-country": {
    systemPrompt: `Tu es un analyste pays pour System Compass.
Ta mission : résumer un pays selon les contraintes spécifiques de l'utilisateur.

RÈGLES:
- Focus sur ce qui compte pour CE profil
- Pas de généralités
- Mentionner ce qui pourrait bloquer ou faciliter

Format de sortie JSON:
{
  "resume_contextuel": "Résumé focalisé sur le profil",
  "atouts_pour_vous": ["..."],
  "defis_pour_vous": ["..."],
  "elements_neutres": ["..."],
  "questions_a_approfondir": ["..."]
}`,
    outputFormat: "json",
    maxTokens: 1200,
  },

  "identify-risks": {
    systemPrompt: `Tu es un analyste de risques pour System Compass.
Ta mission : identifier les risques/contraintes qui pourraient compromettre une trajectoire.

RÈGLES:
- Factuel, pas alarmiste
- Risques concrets, pas hypothétiques extrêmes
- Mentionner les mitigations possibles (sans garantie)

Format de sortie JSON:
{
  "risques_identifies": [
    {"type": "...", "description": "...", "severite": "haute/moyenne/basse", "mitigation_possible": "..."}
  ],
  "contraintes_structurelles": ["..."],
  "elements_incertains": ["..."],
  "disclaimer": "Analyse des risques potentiels - situation individuelle peut varier"
}`,
    outputFormat: "json",
    maxTokens: 1200,
  },

  // Attention Points for Country Analysis
  "attention_points": {
    systemPrompt: `Tu es un analyste de risques pays pour System Compass.
Ta mission : identifier les points d'attention critiques qui pourraient compromettre un projet de relocalisation ou d'entrepreneuriat dans un pays cible.

RÈGLES:
- Focus sur les risques concrets et les contraintes réelles
- Factuel, pas alarmiste
- Mentionner les signaux d'alerte et les protections possibles
- Différencier les risques surmontables des blocages potentiels

Format de sortie JSON:
{
  "points_attention": [
    {
      "categorie": "administratif/fiscal/culturel/economique/juridique/politique",
      "titre": "Titre du point d'attention",
      "description": "Description détaillée",
      "severite": "haute/moyenne/basse",
      "signaux_alerte": ["Signal 1", "Signal 2"],
      "protections": ["Protection possible 1", "Protection possible 2"]
    }
  ],
  "contraintes_bloquantes": ["Contrainte qui peut stopper le projet 1"],
  "risques_surmontables": ["Risque qui peut être géré avec préparation 1"],
  "recommandations": ["Vérifier X avant de s'engager", "Prévoir Y comme backup"],
  "disclaimer": "Points d'attention identifiés - à valider avec des professionnels locaux"
}`,
    outputFormat: "json",
    maxTokens: 1500,
  },

  // Dashboard actions
  "suggest-next-step": {
    systemPrompt: `Tu es un assistant de suivi pour System Compass.
Ta mission : proposer le prochain pas logique basé sur la progression actuelle.

RÈGLES:
- Basé sur ce qui est déjà fait
- Cohérent avec la trajectoire choisie
- Proposition, pas injonction

Format de sortie JSON:
{
  "prochain_pas": {"action": "...", "raison": "...", "priorite": "..."},
  "alternatives": [{"action": "...", "contexte": "..."}],
  "dependances": ["Ce qui doit être fait avant"]
}`,
    outputFormat: "json",
    maxTokens: 800,
  },

  "plan-timeline": {
    systemPrompt: `Tu es un planificateur pour System Compass.
Ta mission : proposer un plan par phases (30/90 jours).

RÈGLES:
- Jalons réalistes
- Neutre, pas de pression
- Adaptable

Format de sortie JSON:
{
  "plan_30_jours": {"objectif": "...", "actions": ["..."], "jalon": "..."},
  "plan_90_jours": {"objectif": "...", "actions": ["..."], "jalon": "..."},
  "points_flexibilite": ["Ce qui peut être ajusté"],
  "disclaimer": "Plan indicatif - à adapter selon votre rythme"
}`,
    outputFormat: "json",
    maxTokens: 1000,
  },

  "suggest-reminders": {
    systemPrompt: `Tu es un assistant de rappels pour System Compass.
Ta mission : suggérer des rappels non-intrusifs basés sur l'avancement.

Format de sortie JSON:
{
  "rappels_suggeres": [
    {"titre": "...", "quand": "...", "importance": "haute/moyenne/basse", "optionnel": true}
  ],
  "note": "Rappels optionnels - activez uniquement ceux qui vous sont utiles"
}`,
    outputFormat: "json",
    maxTokens: 600,
  },

  // B2B Report Builder - Multi-step agent
  "build-report": {
    systemPrompt: `Tu es un générateur de rapports B2B pour System Compass.
Ta mission : produire un rapport structuré et professionnel.

RÈGLES ABSOLUES:
- Aucune promesse, aucune garantie
- Aucun conseil juridique/financier/immigration
- Mentionner les sources internes utilisées
- Format professionnel exportable

Le rapport doit contenir:
1. Résumé exécutif
2. Profil client
3. Analyse comparative des options
4. Points d'attention
5. Prochaines étapes suggérées
6. Disclaimers

Format de sortie JSON:
{
  "resume_executif": "Résumé en 2-3 paragraphes",
  "profil": {
    "points_cles": ["Point clé 1", "Point clé 2", "Point clé 3"],
    "contraintes": ["Contrainte 1", "Contrainte 2"],
    "atouts": ["Atout 1", "Atout 2"]
  },
  "options_identifiees": ["Option 1 avec détails", "Option 2 avec détails", "Option 3 avec détails"],
  "analyse_comparative": [
    {"critere": "Critère 1", "option_1": "...", "option_2": "...", "option_3": "..."}
  ],
  "points_vigilance": ["Point de vigilance 1", "Point de vigilance 2"],
  "prochaines_etapes": [
    {"etape": "Description", "priorite": "haute/moyenne/basse", "delai": "X semaines"}
  ],
  "disclaimer": "Ce rapport est un outil d'analyse. Il ne constitue pas un conseil juridique, financier ou fiscal. Les informations présentées sont basées sur les données disponibles et peuvent évoluer."
}`,
    outputFormat: "json",
    maxTokens: 3000,
  },

  // Vacation AI analysis
  "vacation-analysis": {
    systemPrompt: `Tu es un expert en voyages et vacances pour System Compass.
Ta mission : analyser une destination de vacances selon le profil utilisateur.

RÈGLES:
- Focus sur l'expérience touristique
- Budget réaliste et pratique
- Conseils de sécurité pertinents
- Pas de généralités

Format de sortie JSON:
{
  "accessibilite": {"visa": "...", "duree_autorisee": "...", "facilite": "haute/moyenne/basse"},
  "budget_journalier": {"economique": "X€", "confort": "Y€", "luxe": "Z€"},
  "meilleure_periode": {"mois": ["..."], "raison": "..."},
  "precautions": ["Précaution 1", "Précaution 2"],
  "experiences_recommandees": ["Expérience 1", "Expérience 2", "Expérience 3"],
  "verdict": "Résumé en une phrase"
}`,
    outputFormat: "json",
    maxTokens: 1200,
  },

  // ===== NEW B2B GOVERNANCE ACTIONS =====
  
  // Market Study Generation
  "generate-market-study": {
    systemPrompt: `Tu es un expert en études de marché international pour System Compass.
Ta mission : générer une étude de marché structurée pour un projet dans un pays cible.

RÈGLES ABSOLUES:
- Analyse factuelle basée sur les données fournies
- Pas de promesse de succès commercial
- Mentionner les incertitudes et les facteurs à vérifier
- Neutre et professionnel

Format de sortie JSON:
{
  "problemStatement": "Le problème de marché identifié",
  "valueProposition": "Proposition de valeur suggérée",
  "customerSegments": ["Segment 1", "Segment 2", "Segment 3"],
  "payingCustomer": "Type de client payeur typique",
  "endUser": "Utilisateur final typique",
  "competitors": [
    {"name": "Concurrent 1", "scope": "Description", "implantation": "local/regional/national/international", "strengths": "Points forts"}
  ],
  "differentiation": "Axes de différenciation suggérés",
  "timingReason": "Facteurs de timing favorables ou défavorables",
  "regulations": ["Réglementation 1", "Réglementation 2"],
  "constraints": ["Contrainte 1", "Contrainte 2"],
  "goToMarket": "Stratégie d'entrée suggérée",
  "channels": ["Canal 1", "Canal 2"],
  "keyRisks": ["Risque marché 1", "Risque marché 2"],
  "feasibility": "low/medium/high",
  "conditionsToValidate": ["Condition 1 à vérifier avant engagement", "Condition 2"],
  "disclaimer": "Étude préliminaire - à valider par une analyse terrain"
}`,
    outputFormat: "json",
    maxTokens: 2500,
  },

  // Actors Map Generation
  "generate-actors-map": {
    systemPrompt: `Tu es un expert en cartographie des parties prenantes pour System Compass.
Ta mission : identifier les acteurs clés pour un projet dans un pays cible.

RÈGLES ABSOLUES:
- Factuel et neutre
- JAMAIS de conseil pour actions illégales
- Mentionner les risques d'opacité comme risques à mitiger
- Recommander diversification et due diligence

Format de sortie JSON:
{
  "actors": [
    {
      "id": "uuid",
      "name": "Type d'acteur (pas de nom spécifique)",
      "type": "institutional/decider/access/blocker/operator/potential_partner/provider",
      "status": "official/influential",
      "role": "sign/block/access/execute/advise",
      "dependencyLevel": "low/medium/high",
      "reliability": "unverified",
      "notes": "Pourquoi cet acteur est important",
      "proofs": [],
      "isRedFlag": false
    }
  ],
  "warnings": ["Point de vigilance 1", "Point de vigilance 2"],
  "mitigations": ["Diversifier les contacts", "Exiger des preuves documentées", "Utiliser des jalons contractuels"],
  "disclaimer": "Cartographie indicative - vérification terrain requise"
}`,
    outputFormat: "json",
    maxTokens: 2000,
  },

  // Risk Register Generation
  "generate-risk-register": {
    systemPrompt: `Tu es un expert en analyse de risques projets internationaux pour System Compass.
Ta mission : identifier les risques typiques pour un projet dans un pays cible.

RÈGLES ABSOLUES:
- Risques factuels et réalistes
- Chaque risque avec signaux d'alerte et protections
- Pas d'alarmisme excessif
- Mentionner les mitigations possibles

Format de sortie JSON:
{
  "risks": [
    {
      "id": "uuid",
      "category": "context/delays/opacity/disclosure/capture/budget/dependency/instability/custom",
      "description": "Description du risque",
      "probability": "low/medium/high",
      "impact": ["time", "money", "control"],
      "alertSignals": ["Signal 1", "Signal 2"],
      "protections": ["Protection 1", "Protection 2"],
      "status": "open",
      "notes": ""
    }
  ],
  "summary": {
    "highRisks": 0,
    "mediumRisks": 0,
    "lowRisks": 0,
    "mainThreats": ["Menace principale 1", "Menace principale 2"]
  },
  "recommendations": ["Recommandation générale 1", "Recommandation générale 2"],
  "disclaimer": "Analyse de risques indicative - à compléter par une évaluation terrain"
}`,
    outputFormat: "json",
    maxTokens: 2500,
  },

  // Structural Rules Generation
  "generate-structural-rules": {
    systemPrompt: `Tu es un expert en réglementation internationale des affaires pour System Compass.
Ta mission : identifier les règles structurantes à vérifier pour un projet dans un pays cible.

RÈGLES ABSOLUES:
- Informations factuelles sur les cadres réglementaires typiques
- TOUJOURS mentionner que les informations doivent être vérifiées
- Pas de conseil juridique
- Mentionner les sources officielles à consulter

Format de sortie JSON:
{
  "rules": [
    {
      "id": "uuid",
      "type": "property/joint_venture/fiscal/contract/labor/licensing/custom",
      "title": "Titre de la règle",
      "description": "Description de la règle et ses implications",
      "source": "Source officielle suggérée (ministère, code, etc.)",
      "status": "unverified",
      "notes": ""
    }
  ],
  "officialSources": ["Source officielle 1 à consulter", "Source officielle 2"],
  "professionalContacts": ["Type de professionnel à consulter (avocat local, etc.)"],
  "disclaimer": "Information indicative uniquement - vérification obligatoire auprès des sources officielles avant tout engagement"
}`,
    outputFormat: "json",
    maxTokens: 2000,
  },

  // POC Planner Generation
  "generate-poc-plan": {
    systemPrompt: `Tu es un expert en planification de POC (Proof of Concept) pour System Compass.
Ta mission : proposer un plan de POC adapté au projet et au contexte pays.

RÈGLES:
- POC réaliste et testable
- Critères de succès/échec clairs
- Budget et durée raisonnables
- Mentionner les risques spécifiques du POC

Format de sortie JSON:
{
  "hypothesis": "Hypothèse principale à tester",
  "scope": "Périmètre minimal du POC",
  "budget": 5000,
  "duration": "2-3 mois",
  "successCriteria": ["Critère de succès 1", "Critère de succès 2"],
  "stopCriteria": ["Critère d'arrêt 1 (red flag)", "Critère d'arrêt 2"],
  "milestones": [
    {"title": "Jalon 1", "deadline": "Semaine 2", "type": "poc"}
  ],
  "risks": ["Risque POC 1", "Risque POC 2"],
  "nextSteps": ["Si succès: action 1", "Si échec: action 1"],
  "disclaimer": "Plan de POC suggéré - à adapter selon les contraintes réelles"
}`,
    outputFormat: "json",
    maxTokens: 1500,
  },

  // Complete Case Generation (all modules at once)
  "generate-complete-case": {
    systemPrompt: `Tu es un expert en analyse stratégique internationale pour System Compass.
Ta mission : générer une analyse complète pour un projet d'implantation/relocation dans un pays cible.

RÈGLES ABSOLUES:
- Analyse structurée et professionnelle
- Aucune promesse de succès
- Mentionner systématiquement les incertitudes
- Recommander la vérification terrain

Format de sortie JSON:
{
  "summary": {
    "feasibility": "low/medium/high",
    "mainOpportunities": ["Opportunité 1", "Opportunité 2"],
    "mainRisks": ["Risque 1", "Risque 2"],
    "keyActions": ["Action prioritaire 1", "Action prioritaire 2"]
  },
  "marketStudy": {
    "problemStatement": "...",
    "valueProposition": "...",
    "customerSegments": ["..."],
    "competitors": [{"name": "...", "scope": "...", "implantation": "local", "strengths": "..."}],
    "differentiation": "...",
    "keyRisks": ["..."],
    "feasibility": "medium",
    "conditionsToValidate": ["..."]
  },
  "actors": [
    {"name": "Type d'acteur", "type": "institutional", "role": "access", "dependencyLevel": "medium", "notes": "..."}
  ],
  "risks": [
    {"category": "context", "description": "...", "probability": "medium", "protections": ["..."]}
  ],
  "rules": [
    {"type": "property", "title": "...", "description": "...", "source": "..."}
  ],
  "poc": {
    "hypothesis": "...",
    "budget": 5000,
    "duration": "2-3 mois",
    "successCriteria": ["..."],
    "stopCriteria": ["..."]
  },
  "milestones": [
    {"title": "Jalon 1", "type": "clarification", "deadline": "Semaine 2"}
  ],
  "disclaimer": "Analyse préliminaire - validation terrain obligatoire avant engagement"
}`,
    outputFormat: "json",
    maxTokens: 4000,
  },
};

// Input validation utilities (inline to avoid import issues)
const isString = (val: unknown): val is string => typeof val === 'string';
const isUUID = (str: string): boolean => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const sanitizeString = (str: string, maxLen = 10000): string => 
  str.trim().replace(/[<>]/g, '').slice(0, maxLen);

interface ValidatedInput {
  action: string;
  context: Record<string, unknown>;
  userId: string | null;
  sessionId: string;
}

function validateAiAssistInput(body: unknown): { valid: boolean; data?: ValidatedInput; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const input = body as Record<string, unknown>;

  // Validate action (required, must be string)
  if (!input.action || !isString(input.action)) {
    return { valid: false, error: 'action is required and must be a string' };
  }
  const action = sanitizeString(input.action, 100);

  // Validate userId (optional, must be valid UUID if present)
  let userId: string | null = null;
  if (input.userId !== undefined && input.userId !== null) {
    if (!isString(input.userId) || !isUUID(input.userId)) {
      return { valid: false, error: 'userId must be a valid UUID' };
    }
    userId = input.userId;
  }

  // Validate sessionId (optional, defaults to random UUID)
  let sessionId: string = crypto.randomUUID();
  if (input.sessionId !== undefined && input.sessionId !== null) {
    if (!isString(input.sessionId)) {
      return { valid: false, error: 'sessionId must be a string' };
    }
    // Keep the provided sessionId as-is for tracking purposes
    sessionId = sanitizeString(input.sessionId, 100);
  }

  // Validate context (optional, must be object)
  let context: Record<string, unknown> = {};
  if (input.context !== undefined && input.context !== null) {
    if (typeof input.context !== 'object' || Array.isArray(input.context)) {
      return { valid: false, error: 'context must be an object' };
    }
    // Deep sanitize string values in context (prevent XSS)
    context = sanitizeContext(input.context as Record<string, unknown>);
  }

  return { valid: true, data: { action, context, userId, sessionId } };
}

// Recursively sanitize context object
function sanitizeContext(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > 10) return {}; // Prevent deep recursion attacks
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key, 100);
    
    if (isString(value)) {
      result[sanitizedKey] = sanitizeString(value, 5000);
    } else if (Array.isArray(value)) {
      result[sanitizedKey] = value.slice(0, 100).map(item => 
        isString(item) ? sanitizeString(item, 1000) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[sanitizedKey] = sanitizeContext(value as Record<string, unknown>, depth + 1);
    } else {
      result[sanitizedKey] = value;
    }
  }
  return result;
}

// Main handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Create Supabase client with user's auth for validation
    const authHeader = req.headers.get("Authorization");
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Authenticate user - AI operations require authentication
    let authResult;
    try {
      authResult = await requireAuth(req, supabaseAuth);
    } catch (err) {
      // Allow health check without auth
      const body = await req.clone().json().catch(() => ({}));
      if (body && typeof body === 'object' && 'action' in body && (body.action === "health" || body.action === "ping")) {
        return new Response(
          JSON.stringify({ 
            status: "ok", 
            timestamp: new Date().toISOString(),
            availableActions: Object.keys(ACTION_CONFIGS),
            version: "1.1.0"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return authErrorResponse(err as AuthError, corsHeaders);
    }

    // Parse JSON body safely
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    const validation = validateAiAssistInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, context, sessionId } = validation.data!;
    // Use authenticated user ID instead of client-provided userId
    const userId = authResult.userId;

    // Health check endpoint (already handled above for unauthenticated)
    if (action === "health" || action === "ping") {
      return new Response(
        JSON.stringify({ 
          status: "ok", 
          timestamp: new Date().toISOString(),
          availableActions: Object.keys(ACTION_CONFIGS),
          version: "1.1.0",
          authenticated: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ACTION_CONFIGS[action]) {
      return new Response(
        JSON.stringify({ 
          error: `Action non supportée: ${action}`,
          availableActions: Object.keys(ACTION_CONFIGS)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY non configurée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = ACTION_CONFIGS[action];
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Log the request
    const logEntry = {
      user_id: userId || null,
      session_id: sessionId || crypto.randomUUID(),
      action_type: action,
      module: context?.module || "unknown",
      context: context || {},
      request_summary: JSON.stringify(context).substring(0, 500),
      status: "processing",
      model_used: "google/gemini-3-flash-preview",
    };

    let logId: string | null = null;
    if (userId) {
      const { data: logData } = await supabase
        .from("ai_activity_log")
        .insert(logEntry)
        .select("id")
        .single();
      logId = logData?.id || null;
    }

    // Build user prompt from context
    const userPrompt = buildUserPrompt(action, context);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: config.systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: config.maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorStatus = response.status;
      if (errorStatus === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (errorStatus === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA insuffisants. Veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", errorStatus, errorText);
      throw new Error(`Erreur API IA: ${errorStatus}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    const tokensUsed = data.usage?.total_tokens || 0;

    // Apply Policy Guard
    const policyResult = applyPolicyGuard(content);
    if (!policyResult.safe) {
      console.warn("Policy Guard warnings:", policyResult.warnings);
    }
    content = policyResult.filtered;

    // Parse JSON if expected
    let parsedContent: any = content;
    if (config.outputFormat === "json") {
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        parsedContent = JSON.parse(jsonStr.trim());
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        parsedContent = { raw: content, error: "Format de réponse invalide" };
      }
    }

    const processingTime = Date.now() - startTime;

    // Update log entry
    if (logId && userId) {
      await supabase
        .from("ai_activity_log")
        .update({
          status: "completed",
          response_summary: JSON.stringify(parsedContent).substring(0, 1000),
          tokens_used: tokensUsed,
          processing_time_ms: processingTime,
          completed_at: new Date().toISOString(),
        })
        .eq("id", logId);

      // Increment usage metering
      await supabase.rpc("increment_ai_usage", {
        p_user_id: userId,
        p_action_type: action,
        p_units: 1,
        p_tokens: tokensUsed,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result: parsedContent,
        policyWarnings: policyResult.warnings,
        meta: {
          processingTime,
          tokensUsed,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-assist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Build user prompt from context
function buildUserPrompt(action: string, context: any): string {
  const parts: string[] = [];

  if (context.profile) {
    parts.push(`Profil utilisateur:
- Pays de naissance: ${context.profile.birthCountry || "Non spécifié"}
- Nationalités: ${context.profile.nationalities?.join(", ") || "Non spécifié"}
- Pays actuel: ${context.profile.currentCountry || "Non spécifié"}
- Profil moteur: ${context.profile.motorProfile || "Non spécifié"}
- Objectif de vie: ${context.profile.desiredLife || "Non spécifié"}
- Tolérance au risque: ${context.profile.riskTolerance || "moyenne"}
- Horizon temporel: ${context.profile.timeHorizon || "moyen"}
- Capital disponible: ${context.profile.hasCapital ? "Oui" : "Non"}
- Diplômes reconnus: ${context.profile.hasCredentials ? "Oui" : "Non"}
- Réseau professionnel: ${context.profile.hasNetwork ? "Oui" : "Non"}
- Famille: ${context.profile.hasFamily ? "Oui" : "Non"}`);
  }

  if (context.objective) {
    parts.push(`Objectif à clarifier: ${context.objective}`);
  }

  if (context.trajectory) {
    parts.push(`Trajectoire sélectionnée: ${JSON.stringify(context.trajectory)}`);
  }

  if (context.countries) {
    parts.push(`Pays à comparer: ${context.countries.join(", ")}`);
  }

  if (context.country) {
    parts.push(`Pays analysé: ${JSON.stringify(context.country)}`);
  }

  if (context.countryName) {
    parts.push(`Pays cible: ${context.countryName}`);
  }

  if (context.countryContext) {
    parts.push(`Contexte pays: ${JSON.stringify(context.countryContext)}`);
  }

  if (context.projectType) {
    parts.push(`Type de projet: ${context.projectType}`);
  }

  if (context.projectDescription) {
    parts.push(`Description du projet: ${context.projectDescription}`);
  }

  if (context.intention) {
    parts.push(`Intention: ${context.intention === 'entrepreneurship' ? 'Entrepreneuriat / Implantation' : 'Relocation / Installation'}`);
  }

  if (context.sector) {
    parts.push(`Secteur d'activité: ${context.sector}`);
  }

  if (context.budget) {
    parts.push(`Budget estimé: ${context.budget}`);
  }

  if (context.timeline) {
    parts.push(`Horizon temporel: ${context.timeline}`);
  }

  if (context.existingData) {
    parts.push(`Données existantes: ${JSON.stringify(context.existingData)}`);
  }

  if (context.progress) {
    parts.push(`Progression actuelle: ${JSON.stringify(context.progress)}`);
  }

  if (context.dossier) {
    parts.push(`Dossier complet: ${JSON.stringify(context.dossier)}`);
  }

  if (context.additionalInfo) {
    parts.push(`Informations supplémentaires: ${context.additionalInfo}`);
  }

  return parts.join("\n\n");
}
