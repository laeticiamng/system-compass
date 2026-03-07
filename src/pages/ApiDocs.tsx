/**
 * ApiDocs - Public API documentation for B2B integrations
 * S1: REST API docs for relocation agencies, banks, and partners
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code, Globe, Shield, Zap, Key, Copy, Check,
  ChevronRight, Server, Database, Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/countries',
    description: 'Liste tous les pays avec données de base',
    params: 'region, limit, offset',
    response: '{ countries: Country[], total: number }',
    category: 'Countries',
  },
  {
    method: 'GET',
    path: '/api/v1/countries/:id',
    description: 'Fiche complète d\'un pays (fiscalité, visa, risques, qualité de vie)',
    params: 'fields, lang',
    response: '{ country: CountryDetail }',
    category: 'Countries',
  },
  {
    method: 'GET',
    path: '/api/v1/countries/:id/intelligence',
    description: 'Intelligence avancée : pouvoir, hiérarchies, stratégies adaptatives',
    params: 'lang, sections',
    response: '{ intelligence: CountryIntelligence }',
    category: 'Countries',
  },
  {
    method: 'POST',
    path: '/api/v1/compare',
    description: 'Compare jusqu\'à 4 pays sur tous les critères',
    params: 'country_ids[], metrics[]',
    response: '{ comparison: ComparisonResult }',
    category: 'Analysis',
  },
  {
    method: 'POST',
    path: '/api/v1/fiscal/simulate',
    description: 'Simulation fiscale entre pays d\'origine et destination',
    params: 'income, family_status, origin, destination',
    response: '{ simulation: FiscalResult }',
    category: 'Fiscal',
  },
  {
    method: 'GET',
    path: '/api/v1/fiscal/conventions/:countryA/:countryB',
    description: 'Convention de double imposition entre deux pays',
    params: 'income_type',
    response: '{ convention: ConventionDetail }',
    category: 'Fiscal',
  },
  {
    method: 'POST',
    path: '/api/v1/profile/match',
    description: 'Matching profil-pays basé sur les préférences utilisateur',
    params: 'profile, priorities[], budget',
    response: '{ matches: MatchResult[] }',
    category: 'Analysis',
  },
  {
    method: 'GET',
    path: '/api/v1/alerts',
    description: 'Alertes réglementaires en temps réel',
    params: 'country, category, severity, since',
    response: '{ alerts: Alert[], total: number }',
    category: 'Alerts',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '0€',
    period: '/mois',
    description: 'Découverte et prototypage',
    features: ['100 requêtes/jour', '5 pays', 'Données de base', 'Support email'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '199€',
    period: '/mois',
    description: 'Agences relocation & cabinets conseil',
    features: ['10 000 requêtes/jour', '80+ pays', 'Intelligence complète', 'Fiscal simulator API', 'Webhooks temps réel', 'Support dédié'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description: 'Banques, assureurs, grands groupes',
    features: ['Illimité', 'SLA 99.9%', 'API dédiée', 'White-label', 'Data on-premise', 'Account manager'],
    highlight: false,
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/20 text-emerald-400',
  POST: 'bg-blue-500/20 text-blue-400',
  PUT: 'bg-amber-500/20 text-amber-400',
  DELETE: 'bg-red-500/20 text-red-400',
};

export default function ApiDocs() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    toast.success('Copié !');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const categories = ['all', ...new Set(API_ENDPOINTS.map(e => e.category))];
  const filtered = selectedCategory === 'all'
    ? API_ENDPOINTS
    : API_ENDPOINTS.filter(e => e.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Code className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">API System Compass</h1>
            <p className="text-muted-foreground">
              Intégrez l'intelligence pays dans vos applications B2B
            </p>
          </div>
        </div>

        {/* Key features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Globe, label: '80+ pays', desc: 'Données complètes' },
            { icon: Zap, label: '<100ms', desc: 'Latence moyenne' },
            { icon: Shield, label: '99.9% SLA', desc: 'Haute disponibilité' },
            { icon: Lock, label: 'OAuth 2.0', desc: 'Sécurité enterprise' },
          ].map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-3 text-center">
                  <feat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-bold">{feat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick start */}
      <Card className="border-primary/30">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Quick Start
          </h2>
          <div className="relative">
            <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto font-mono">
              <code>{`curl -X GET "https://api.system-compass.app/v1/countries/portugal" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"

# Response
{
  "country": {
    "id": "portugal",
    "name": "Portugal",
    "region": "europe",
    "pyramid_type": "network-state",
    "visa": { "nomad_digital": true, "d7": true },
    "fiscal": { "income_tax_max": 48, "special_regimes": ["IFICI"] },
    "quality_of_life": { "score": 82, "climate": 9.1, "safety": 81 }
  }
}`}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard('curl -X GET "https://api.system-compass.app/v1/countries/portugal"')}
            >
              {copiedPath ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Endpoints
          </h2>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'Tous' : cat}
              </Button>
            ))}
          </div>
        </div>

        {filtered.map((endpoint, i) => (
          <motion.div
            key={endpoint.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={cn("font-mono text-xs", methodColors[endpoint.method])} variant="secondary">
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono font-medium flex-1">{endpoint.path}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.path)}
                  >
                    {copiedPath === endpoint.path ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span><strong>Params:</strong> {endpoint.params}</span>
                  <span><strong>Response:</strong> <code className="bg-muted px-1 rounded">{endpoint.response}</code></span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pricing */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-lg text-center flex items-center justify-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Plans API
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className={cn(
                "h-full",
                plan.highlight && "border-primary/50 shadow-lg shadow-primary/10"
              )}>
                <CardContent className="p-6 space-y-4">
                  {plan.highlight && (
                    <Badge className="bg-primary/20 text-primary">Recommandé</Badge>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    {plan.price === 'Sur mesure' ? 'Nous contacter' : 'Obtenir une clé API'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
