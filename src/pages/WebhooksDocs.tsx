/**
 * Webhooks B2B Documentation Page (S4)
 * Documents webhook endpoints for relocation agencies and B2B partners
 */

import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Webhook, Shield, Zap, Clock, Code, Copy, CheckCircle2, 
  AlertTriangle, ArrowRight, Globe, Bell, FileText 
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const WEBHOOK_EVENTS = [
  {
    category: 'Country Updates',
    icon: Globe,
    events: [
      {
        name: 'country.data_updated',
        description: 'Déclenché quand les données d\'un pays sont mises à jour (fiscalité, visa, risques)',
        payload: `{
  "event": "country.data_updated",
  "timestamp": "2026-03-04T14:30:00Z",
  "data": {
    "country_id": "switzerland",
    "country_name": "Suisse",
    "change_type": "fiscal_update",
    "fields_changed": ["tax_brackets", "special_regimes"],
    "summary": "Mise à jour des tranches d'imposition 2026",
    "severity": "medium",
    "source_url": "https://www.admin.ch/..."
  }
}`,
      },
      {
        name: 'country.alert_created',
        description: 'Nouvelle alerte réglementaire détectée pour un pays',
        payload: `{
  "event": "country.alert_created",
  "timestamp": "2026-03-04T09:15:00Z",
  "data": {
    "alert_id": "alert_abc123",
    "country_id": "portugal",
    "severity": "critical",
    "title": "Fin du régime NHR",
    "description": "Le Portugal supprime le régime fiscal NHR...",
    "effective_date": "2026-04-01",
    "action_required": true
  }
}`,
      },
    ],
  },
  {
    category: 'Case Management',
    icon: FileText,
    events: [
      {
        name: 'case.milestone_reached',
        description: 'Un jalon a été atteint dans un dossier d\'expatriation',
        payload: `{
  "event": "case.milestone_reached",
  "timestamp": "2026-03-04T11:00:00Z",
  "data": {
    "case_id": "case_xyz789",
    "milestone": "visa_approved",
    "country_id": "canada",
    "client_id": "client_456",
    "next_steps": ["book_flight", "open_bank_account"],
    "completion_percentage": 65
  }
}`,
      },
      {
        name: 'case.risk_detected',
        description: 'Un risque a été identifié dans le processus d\'expatriation',
        payload: `{
  "event": "case.risk_detected",
  "timestamp": "2026-03-04T16:45:00Z",
  "data": {
    "case_id": "case_xyz789",
    "risk_type": "fiscal_residency_conflict",
    "severity": "high",
    "description": "Double résidence fiscale détectée...",
    "recommendation": "Consulter un fiscaliste avant le départ"
  }
}`,
      },
    ],
  },
  {
    category: 'Notifications',
    icon: Bell,
    events: [
      {
        name: 'watchlist.country_changed',
        description: 'Un pays de la watchlist a subi des changements significatifs',
        payload: `{
  "event": "watchlist.country_changed",
  "timestamp": "2026-03-04T08:00:00Z",
  "data": {
    "watchlist_id": "wl_123",
    "country_id": "thailand",
    "changes_count": 3,
    "most_critical": "visa_policy_change",
    "summary": "Nouveau visa LTR disponible pour les remote workers"
  }
}`,
      },
    ],
  },
];

const SECURITY_FEATURES = [
  { title: 'Signature HMAC-SHA256', description: 'Chaque payload est signé avec votre clé secrète', icon: Shield },
  { title: 'Retry automatique', description: '3 tentatives avec backoff exponentiel (10s, 60s, 300s)', icon: Clock },
  { title: 'Idempotence', description: 'Chaque événement a un ID unique pour éviter les doublons', icon: CheckCircle2 },
  { title: 'TLS obligatoire', description: 'Les endpoints doivent être HTTPS', icon: Zap },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-muted/50 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
      </button>
      <pre className="bg-muted/30 border border-border rounded-lg p-4 overflow-x-auto text-xs sm:text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function WebhooksDocs() {

  return (
    <>
      <Helmet>
        <title>Webhooks API — Compass B2B</title>
        <meta name="description" content="Documentation des webhooks B2B pour cabinets de relocation et partenaires. Recevez les alertes pays en temps réel." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 gap-2">
              <Webhook className="w-3.5 h-3.5" />
              B2B Integration
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="block text-foreground">Webhooks</span>
              <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                temps réel pour vos systèmes
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Intégrez les alertes réglementaires et mises à jour pays directement dans vos outils de gestion de dossiers.
            </p>
          </motion.div>

          {/* Quick Start */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Start
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Enregistrez votre endpoint</h3>
                    <CodeBlock code={`curl -X POST https://api.systemcompass.io/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-system.com/webhooks/compass",
    "events": ["country.data_updated", "country.alert_created"],
    "secret": "whsec_your_signing_secret"
  }'`} />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Vérifiez la signature</h3>
                    <CodeBlock code={`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`} />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Répondez 200 OK</h3>
                    <p className="text-sm text-muted-foreground">
                      Retournez un code HTTP 2xx dans les 30 secondes. En cas d'échec, nous réessayons automatiquement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Security */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Sécurité
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SECURITY_FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Events Reference */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Événements disponibles
            </h2>

            <Tabs defaultValue={WEBHOOK_EVENTS[0].category} className="space-y-6">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0">
                {WEBHOOK_EVENTS.map((cat) => (
                  <TabsTrigger
                    key={cat.category}
                    value={cat.category}
                    className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {WEBHOOK_EVENTS.map((cat) => (
                <TabsContent key={cat.category} value={cat.category} className="space-y-6">
                  {cat.events.map((event) => (
                    <Card key={event.name}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <code className="text-primary font-mono text-sm">{event.name}</code>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-normal text-muted-foreground">{event.description}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">Exemple de payload :</p>
                        <CodeBlock code={event.payload} />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center glass-card rounded-xl p-8"
          >
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Accès Beta</h3>
            <p className="text-muted-foreground mb-4">
              Les webhooks sont disponibles en beta pour les partenaires B2B sur le plan Pro/Enterprise.
            </p>
            <Badge variant="outline" className="gap-2">
              <a href="/pricing" className="flex items-center gap-1">
                Voir les plans <ArrowRight className="w-3 h-3" />
              </a>
            </Badge>
          </motion.div>
        </div>
      </div>
    </>
  );
}
