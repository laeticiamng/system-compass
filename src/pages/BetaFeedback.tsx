import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Lightbulb, TrendingUp, MessageSquare, Send, CheckCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const feedbackSchema = z.object({
  title: z.string().trim().min(5, 'Minimum 5 caractères').max(200),
  description: z.string().trim().min(10, 'Minimum 10 caractères').max(5000),
  feedback_type: z.enum(['bug', 'feature', 'improvement', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

const typeConfig = {
  bug: { icon: Bug, label: 'Bug', color: 'text-red-500', bg: 'bg-red-500/10' },
  feature: { icon: Lightbulb, label: 'Fonctionnalité', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  improvement: { icon: TrendingUp, label: 'Amélioration', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  other: { icon: MessageSquare, label: 'Autre', color: 'text-muted-foreground', bg: 'bg-muted/30' },
};

export default function BetaFeedback() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    feedback_type: 'bug' as const,
    priority: 'medium' as const,
  });
  const [myFeedback, setMyFeedback] = useState<Array<{
    id: string; title: string; feedback_type: string; status: string; priority: string; created_at: string;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadMyFeedback = async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from('beta_feedback')
      .select('id, title, feedback_type, status, priority, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setMyFeedback(data);
    setLoadingHistory(false);
  };

  const handleSubmit = async () => {
    const result = feedbackSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!user) {
      toast.error('Vous devez être connecté pour soumettre un retour.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('beta_feedback').insert({
      ...result.data,
      user_id: user.id,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });

    if (error) {
      toast.error('Erreur lors de l\'envoi. Réessayez.');
      console.debug('Feedback submit error:', error.message);
    } else {
      setSubmitted(true);
      setForm({ title: '', description: '', feedback_type: 'bug', priority: 'medium' });
      toast.success('Merci pour votre retour !');
      setTimeout(() => setSubmitted(false), 3000);
    }
    setSubmitting(false);
  };

  const statusLabels: Record<string, string> = {
    new: 'Nouveau', acknowledged: 'Reçu', in_progress: 'En cours', resolved: 'Résolu', wont_fix: 'Décliné',
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Helmet><title>Beta Feedback — System Compass</title></Helmet>
        <Bug className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">{t('feedback.loginRequired', 'Connexion requise')}</h1>
        <p className="text-muted-foreground">{t('feedback.loginDesc', 'Connectez-vous pour soumettre un retour beta.')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Helmet><title>Beta Feedback — System Compass</title></Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bug className="w-8 h-8 text-primary" />
          {t('feedback.title', 'Beta Feedback')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('feedback.subtitle', 'Aidez-nous à améliorer System Compass. Chaque retour compte.')}
        </p>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit" className="gap-2"><Send className="w-4 h-4" />Soumettre</TabsTrigger>
          <TabsTrigger value="history" className="gap-2" onClick={loadMyFeedback}><MessageSquare className="w-4 h-4" />Mes retours</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          {submitted ? (
            <Card className="border-green-500/30">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Merci !</h2>
                <p className="text-muted-foreground">Votre retour a été enregistré. Nous le traiterons rapidement.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('feedback.newFeedback', 'Nouveau retour')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Type selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.entries(typeConfig) as Array<[keyof typeof typeConfig, typeof typeConfig[keyof typeof typeConfig]]>).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setForm(f => ({ ...f, feedback_type: key }))}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          form.feedback_type === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-1 ${cfg.color}`} />
                        <span className="text-sm font-medium">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Résumez votre retour en une phrase"
                    maxLength={200}
                  />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="desc">Description *</Label>
                  <Textarea
                    id="desc"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Décrivez le problème ou la suggestion en détail. Pour un bug : étapes pour reproduire, comportement attendu vs observé."
                    rows={6}
                    maxLength={5000}
                  />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{form.description.length}/5000</p>
                </div>

                {/* Priority */}
                <div>
                  <Label>Priorité</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as typeof f.priority }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible — cosmétique</SelectItem>
                      <SelectItem value="medium">Moyenne — gênant</SelectItem>
                      <SelectItem value="high">Haute — bloquant partiellement</SelectItem>
                      <SelectItem value="critical">Critique — empêche l'utilisation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Screenshot hint */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>Astuce : faites une capture d'écran et collez l'URL dans la description.</span>
                </div>

                <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Envoi en cours...' : 'Envoyer le retour'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          {loadingHistory ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : myFeedback.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun retour soumis pour le moment.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {myFeedback.map(fb => (
                <Card key={fb.id}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{fb.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant="outline">{typeConfig[fb.feedback_type as keyof typeof typeConfig]?.label || fb.feedback_type}</Badge>
                      <Badge variant="secondary">{statusLabels[fb.status] || fb.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
